import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  referralCode: text("referral_code"),
  referredBy: text("referred_by"), // Stores the referral code of who referred this user
  verificationCode: text("verification_code"),
  isVerified: boolean("is_verified").default(false),
  verificationExpiry: timestamp("verification_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  cincBalance: numeric("cinc_balance").notNull().default("0"), // User's CINC balance
  earningsBalance: numeric("earnings_balance").notNull().default("0"), // User's earnings (can be withdrawn)
  totalEarnings: numeric("total_earnings").notNull().default("0"), // Total earnings from referrals - Master Wallet
  monthlyEstimate: numeric("monthly_estimate").default("0"), // Monthly estimate for earnings
  isReferralActive: boolean("is_referral_active").default(false), // If they have made any purchases yet
  lastActivity: timestamp("last_activity"), // Last account purchase or renewal
  nextRewardDate: timestamp("next_reward_date"), // When 30-day cycle completes
  referralRewardClaimed: boolean("referral_reward_claimed").default(false), // Track if initial referral bonus is claimed
  // Transaction tracking fields for secure transfers
  lastTransactionId: text("last_transaction_id"), // ID of the last transaction
  lastTransactionTimestamp: timestamp("last_transaction_timestamp"), // When the last transaction occurred
  lastTransactionType: text("last_transaction_type"), // Type of the last transaction
  lastTransactionAmount: numeric("last_transaction_amount"), // Amount of the last transaction
});

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  purchaseFee: numeric("purchase_fee").notNull(),
  renewFee: numeric("renew_fee").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ipAccounts = pgTable("ip_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platformId: integer("platform_id").notNull(), // Reference to platforms table
  platform: text("platform").notNull(), // Platform name (Timewall, Timebucks, etc.)
  ipAddress: text("ip_address").notNull(),
  port: text("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  accountPassword: text("account_password"), // Password for the platform account
  methodPlatform: text("method_platform"), // Platform name for the attached method
  methodPassword: text("method_password"), // Password for the attached method
  expiryDate: timestamp("expiry_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  renewalDeadline: timestamp("renewal_deadline"), // For 7-day renewal period
  accountType: text("account_type").default("standard"), // Type of account: standard, premium, etc.
  status: text("status").default("active"), // Status: active, expired, etc.
  notes: text("notes"), // Optional notes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Account Purchase Request Schema
export const accountRequests = pgTable("account_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platformId: integer("platform_id"), // Reference to platforms table
  platform: text("platform").notNull(), // Timewall, Timebucks, etc.
  paymentMethod: text("payment_method").notNull(), // Easypaisa, JazzCash, LTC, CINC, etc.
  userPaymentNumber: text("user_payment_number"), // NULL for CINC payments
  accountHolderName: text("account_holder_name"), // NULL for CINC payments
  transactionId: text("transaction_id"), // NULL for CINC payments
  proofScreenshot: text("proof_screenshot"), // NULL for CINC payments
  paymentAmount: numeric("payment_amount"), // Amount paid (for CINC or manual payments)
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  requestDate: timestamp("request_date").notNull().defaultNow(),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"), // For admin notes or rejection reasons
  isCincPayment: boolean("is_cinc_payment").default(false), // Flag for CINC payments
});

// Support Chat Schema
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, resolved, closed
  issueType: text("issue_type").notNull(), // Account Issue, Payment Problem, etc.
  hasUnreadMessages: boolean("has_unread_messages").notNull().default(false),
  unreadCount: integer("unread_count").notNull().default(0), // Count of unread messages
  markedForDeletion: boolean("marked_for_deletion").default(false),
  deletionDate: timestamp("deletion_date"), // Will be set when ticket is closed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  senderId: integer("sender_id").notNull(), // userId or 0 for system
  content: text("content").notNull(),
  attachment: text("attachment"), // Path to attachment file if any
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Referral tracking table - stores all referral relationships
export const referralRelationships = pgTable("referral_relationships", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(), // The user who referred someone
  referredId: integer("referred_id").notNull(), // The user who was referred
  referralDate: timestamp("referral_date").notNull().defaultNow(),
  isActive: boolean("is_active").default(false), // Whether the referred user is active (made a purchase)
  hasBeenRewarded: boolean("has_been_rewarded").default(false), // Whether referrer got the reward
  activationDate: timestamp("activation_date"), // When the referral became active
  lastRenewalDate: timestamp("last_renewal_date"), // Track last renewal for 36-day cycle
  nextRewardDate: timestamp("next_reward_date"), // Next 30-day reward date
  gracePeriodEnds: timestamp("grace_period_ends"), // When the 36-day grace period ends
  isInactive: boolean("is_inactive").default(false), // If referral went inactive (36 days no activity)
  lastActiveDate: timestamp("last_active_date"), // Last date the referral was active
  isPendingRenewal: boolean("is_pending_renewal").default(false), // For referrals in grace period (30-36 days)
  lastWarningDate: timestamp("last_warning_date"), // Date when the last warning was issued for renewal
  renewalWarningCount: integer("renewal_warning_count").default(0), // Count of warnings issued
  deactivationDate: timestamp("deactivation_date"), // When the referral became inactive
  deactivationReason: text("deactivation_reason"), // Why the referral became inactive
  renewalAttempts: integer("renewal_attempts").default(0), // Count of renewal attempts
  lastUpdateAttempt: timestamp("last_update_attempt"), // Last time status update was attempted
  lastRenewalAttemptReason: text("last_renewal_attempt_reason"), // Reason for last renewal failure
  renewalHistory: text("renewal_history"), // JSON string of renewal history
});

// Define the referral milestone table
export const referralMilestones = pgTable("referral_milestones", {
  id: serial("id").primaryKey(),
  referralCount: integer("referral_count").notNull(), // Number of referrals to reach this milestone
  coinAmount: numeric("coin_amount").notNull(), // Base CINC reward for this milestone
  bonusAmount: numeric("bonus_amount").default("0"), // Optional bonus amount
  hasSpin: boolean("has_spin").default(false), // Whether this milestone includes a spin reward
  description: text("description").notNull(), // Description of the milestone
  isActive: boolean("is_active").default(true), // Whether this milestone is active
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  displayOrder: integer("display_order").notNull(), // For ordering in the UI
});

// Table for tracking claimed milestone rewards per user
export const userMilestones = pgTable("user_milestones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User who claimed the milestone
  milestoneId: integer("milestone_id").notNull(), // Reference to the milestone
  referralCount: integer("referral_count").notNull(), // Referral count when claimed
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  rewardId: integer("reward_id"), // Reference to the reward record
});

// Define the spin reward options table
export const spinRewards = pgTable("spin_rewards", {
  id: serial("id").primaryKey(),
  rewardValue: text("reward_value").notNull(), // Value (can be a number or string like "Coin Booster")
  probability: numeric("probability").notNull(), // Probability weight for this reward
  rewardType: text("reward_type").notNull(), // "coin", "booster", etc.
  displayText: text("display_text").notNull(), // Text to show in the UI
  color: text("color").notNull(), // Color for the UI
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User's last daily gift box claim time
export const userDailyGifts = pgTable("user_daily_gifts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  lastClaimTime: timestamp("last_claim_time").notNull(),
  nextAvailableTime: timestamp("next_available_time").notNull(),
  claimCount: integer("claim_count").default(0),
});

// User's claimed spin rewards
export const userSpins = pgTable("user_spins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  milestoneId: integer("milestone_id").notNull(),
  spinRewardId: integer("spin_reward_id").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  rewardId: integer("reward_id"), // Reference to the reward record
});

// Referral rewards tracking table
export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull(),
  rewardType: text("reward_type").notNull(), // 'initial', 'renewal', 'milestone', 'spin', 'bonus', 'daily_gift'
  rewardAmount: numeric("reward_amount").notNull(),
  rewardDate: timestamp("reward_date").notNull().defaultNow(), 
  rewardDescription: text("reward_description"), // Description of what triggered the reward
  isTransferredToEarnings: boolean("is_transferred_to_earnings").default(false),
  transferDate: timestamp("transfer_date"),
  metadata: text("metadata"), // JSON string for additional metadata
});

// Withdrawal requests table
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  requestAmount: numeric("request_amount").notNull(),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'completed'
  paymentMethod: text("payment_method").notNull(), // 'EasyPaisa', 'JazzCash', etc.
  accountNumber: text("account_number").notNull(),
  accountHolder: text("account_holder").notNull(),
  approvalDate: timestamp("approval_date"),
  completionDate: timestamp("completion_date"),
  rejectionReason: text("rejection_reason"),
  transactionId: text("transaction_id"), // External transaction ID for payment provider
  notes: text("notes"), // Additional notes
  adminId: integer("admin_id"), // ID of admin who processed the request
  previousBalance: numeric("previous_balance").notNull(), // User's balance before withdrawal
  newBalance: numeric("new_balance").notNull(), // User's balance after withdrawal
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  referralCode: true,
  referredBy: true,
  verificationCode: true,
  isVerified: true,
  verificationExpiry: true,
  cincBalance: true,
  earningsBalance: true,
  totalEarnings: true,
  isReferralActive: true,
  lastActivity: true,
  nextRewardDate: true,
  referralRewardClaimed: true,
  lastTransactionId: true,
  lastTransactionTimestamp: true,
  lastTransactionType: true,
  lastTransactionAmount: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).pick({
  name: true,
  purchaseFee: true,
  renewFee: true,
  isActive: true,
});

export const insertIpAccountSchema = createInsertSchema(ipAccounts).pick({
  userId: true,
  platformId: true,
  platform: true,
  ipAddress: true,
  port: true,
  username: true,
  password: true,
  accountPassword: true,
  methodPlatform: true,
  methodPassword: true,
  expiryDate: true,
  isActive: true,
  renewalDeadline: true,
  accountType: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountRequestSchema = createInsertSchema(accountRequests).omit({
  id: true,
  requestDate: true,
  approvalDate: true,
}).partial({
  userPaymentNumber: true,
  accountHolderName: true,
  transactionId: true,
  proofScreenshot: true,
  platformId: true,
  paymentAmount: true,
  notes: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  status: true,
  issueType: true,
  hasUnreadMessages: true,
  unreadCount: true,
  markedForDeletion: true,
  deletionDate: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).pick({
  ticketId: true,
  senderId: true,
  content: true,
  attachment: true,
});

export const insertReferralRelationshipSchema = createInsertSchema(referralRelationships).pick({
  referrerId: true,
  referredId: true,
  referralDate: true,
  isActive: true,
  hasBeenRewarded: true,
  activationDate: true,
  lastRenewalDate: true,
  nextRewardDate: true,
  gracePeriodEnds: true,
  isInactive: true,
  lastActiveDate: true,
  isPendingRenewal: true,
  lastWarningDate: true,
  renewalWarningCount: true,
  deactivationDate: true,
  deactivationReason: true,
  renewalAttempts: true,
  lastUpdateAttempt: true,
  lastRenewalAttemptReason: true,
  renewalHistory: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).pick({
  referrerId: true,
  referredId: true,
  rewardType: true,
  rewardAmount: true,
  rewardDate: true,
  rewardDescription: true,
  isTransferredToEarnings: true,
  transferDate: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;
export type InsertIpAccount = z.infer<typeof insertIpAccountSchema>;
export type IpAccount = typeof ipAccounts.$inferSelect;
export type InsertAccountRequest = z.infer<typeof insertAccountRequestSchema>;
export type AccountRequest = typeof accountRequests.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect & {
  // These fields are added by the API but not stored in the database
  lastMessage?: string;
  isUserLastMessage?: boolean;
};
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertReferralRelationship = z.infer<typeof insertReferralRelationshipSchema>;
export type ReferralRelationship = typeof referralRelationships.$inferSelect;
// Create insert schemas for new tables
export const insertReferralMilestoneSchema = createInsertSchema(referralMilestones).pick({
  referralCount: true,
  coinAmount: true,
  bonusAmount: true,
  hasSpin: true,
  description: true,
  isActive: true,
  displayOrder: true,
});

export const insertUserMilestoneSchema = createInsertSchema(userMilestones).pick({
  userId: true,
  milestoneId: true,
  referralCount: true,
  rewardId: true,
});

export const insertSpinRewardSchema = createInsertSchema(spinRewards).pick({
  rewardValue: true,
  probability: true,
  rewardType: true,
  displayText: true,
  color: true,
  isActive: true,
});

export const insertUserDailyGiftSchema = createInsertSchema(userDailyGifts).pick({
  userId: true,
  lastClaimTime: true,
  nextAvailableTime: true,
  claimCount: true,
});

export const insertUserSpinSchema = createInsertSchema(userSpins).pick({
  userId: true,
  milestoneId: true,
  spinRewardId: true,
  rewardId: true,
});

export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralMilestone = z.infer<typeof insertReferralMilestoneSchema>;
export type ReferralMilestone = typeof referralMilestones.$inferSelect;
export type InsertUserMilestone = z.infer<typeof insertUserMilestoneSchema>;
export type UserMilestone = typeof userMilestones.$inferSelect;
export type InsertSpinReward = z.infer<typeof insertSpinRewardSchema>;
export type SpinReward = typeof spinRewards.$inferSelect;
export type InsertUserDailyGift = z.infer<typeof insertUserDailyGiftSchema>;
export type UserDailyGift = typeof userDailyGifts.$inferSelect;
export type InsertUserSpin = z.infer<typeof insertUserSpinSchema>;
export type UserSpin = typeof userSpins.$inferSelect;

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  requestDate: true,
  approvalDate: true,
  completionDate: true,
  adminId: true,
}).partial({
  rejectionReason: true,
  transactionId: true,
  notes: true,
});

export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
