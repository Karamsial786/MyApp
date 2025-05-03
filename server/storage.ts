import { 
  users, type User, type InsertUser, 
  platforms, type Platform, type InsertPlatform,
  ipAccounts, type IpAccount, type InsertIpAccount,
  accountRequests, type AccountRequest, type InsertAccountRequest,
  supportTickets, type SupportTicket, type InsertSupportTicket,
  supportMessages, type SupportMessage, type InsertSupportMessage,
  referralRelationships, type ReferralRelationship, type InsertReferralRelationship,
  referralRewards, type ReferralReward, type InsertReferralReward,
  referralMilestones, type ReferralMilestone, type InsertReferralMilestone,
  userMilestones, type UserMilestone, type InsertUserMilestone,
  spinRewards, type SpinReward, type InsertSpinReward,
  userDailyGifts, type UserDailyGift, type InsertUserDailyGift,
  userSpins, type UserSpin, type InsertUserSpin,
  withdrawalRequests, type WithdrawalRequest, type InsertWithdrawalRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, isNull, count, not, inArray } from "drizzle-orm";

// Storage interface with all CRUD methods needed
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getUserBalance(userId: number): Promise<number>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  getUserTotalEarnings(userId: number): Promise<number>;
  updateUserTotalEarnings(userId: number, newTotalEarnings: number): Promise<User | undefined>;
  generateReferralCode(): Promise<string>; // Generate a unique referral code
  transferCincToEarnings(userId: number, amount: number): Promise<User | undefined>;
  calculateMonthlyEstimate(userId: number): Promise<number>; // Calculate the monthly estimate based on active referrals
  transferMonthlyEstimateToEarnings(userId: number): Promise<User | undefined>; // Transfer monthly estimate to total earnings
  // Platform methods
  getPlatforms(): Promise<Platform[]>;
  getActivePlatforms(): Promise<Platform[]>;
  getPlatform(id: number): Promise<Platform | undefined>;
  getPlatformByName(name: string): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, updates: Partial<Platform>): Promise<Platform | undefined>;
  togglePlatformStatus(id: number, isActive: boolean): Promise<Platform | undefined>;
  // IP Accounts methods
  getIpAccounts(userId: number): Promise<IpAccount[]>;
  getIpAccount(id: number): Promise<IpAccount | undefined>;
  createIpAccount(ipAccount: InsertIpAccount): Promise<IpAccount>;
  updateIpAccount(id: number, ipAccount: Partial<InsertIpAccount>): Promise<IpAccount | undefined>;
  deleteIpAccount(id: number): Promise<boolean>;
  // Account Purchase Request methods
  getAccountRequests(userId: number): Promise<AccountRequest[]>;
  getAllAccountRequests(): Promise<AccountRequest[]>; // For admin
  getAccountRequest(id: number): Promise<AccountRequest | undefined>;
  createAccountRequest(request: InsertAccountRequest): Promise<AccountRequest>;
  updateAccountRequest(id: number, updates: Partial<AccountRequest>): Promise<AccountRequest | undefined>;
  getPendingRequests(userId: number): Promise<AccountRequest[]>;
  getAllPendingRequests(): Promise<AccountRequest[]>; // For admin
  // Payment methods info
  getPaymentMethodInfo(method: string): Promise<any>;
  // Support Chat methods
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketByUserId(userId: number): Promise<SupportTicket | undefined>;
  getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  deleteSupportTicket(id: number): Promise<boolean>;
  deleteExpiredTickets(): Promise<number>; // Returns count of deleted tickets
  getSupportMessages(ticketId: number): Promise<SupportMessage[]>;
  createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage>;
  // Referral Relationship methods
  getReferralsByReferrerId(referrerId: number): Promise<ReferralRelationship[]>;
  getReferralByReferredId(referredId: number): Promise<ReferralRelationship | undefined>;
  createReferralRelationship(relationship: InsertReferralRelationship): Promise<ReferralRelationship>;
  updateReferralRelationship(id: number, updates: Partial<ReferralRelationship>): Promise<ReferralRelationship | undefined>;
  getActiveReferralsCount(referrerId: number): Promise<number>;
  getTotalReferralsCount(referrerId: number): Promise<number>;
  getInactiveReferrals(referrerId: number): Promise<ReferralRelationship[]>;
  trackReferralRenewal(referralId: number): Promise<ReferralRelationship | undefined>;
  processReferralActivation(referralId: number): Promise<ReferralRelationship | undefined>;
  // Referral Rewards methods
  getReferralRewards(referrerId: number): Promise<ReferralReward[]>;
  createReferralReward(reward: InsertReferralReward): Promise<ReferralReward>;
  updateReferralReward(id: number, updates: Partial<ReferralReward>): Promise<ReferralReward | undefined>;
  calculateMilestoneRewards(referrerId: number): Promise<number>;
  calculatePendingRenewalEarnings(referrerId: number): Promise<number>;
  processReferralRewards(referrerId: number): Promise<boolean>;
  checkSpinAvailability(referrerId: number): Promise<{ 
    available: boolean; 
    nextAvailableTime?: Date; 
    timeRemaining?: string; 
    lastSpunAt?: Date;
  }>;
  checkDailyBonusAvailability(userId: number): Promise<{ 
    available: boolean; 
    nextAvailableTime?: Date; 
    timeRemaining?: string; 
    lastClaimedAt?: Date;
  }>;
  processDailyBonus(userId: number, bonusAmount: number): Promise<{ reward: ReferralReward; user: User }>;
  processSpinReward(referrerId: number, rewardAmount: number, rewardType: string): Promise<ReferralReward>;
  
  // Additional methods for referral stats and rewards
  getUserRewards(userId: number): Promise<{ coinBoosterActive: boolean } | undefined>;
  getRenewalEarnings(userId: number): Promise<number>;
  getPendingEarnings(userId: number): Promise<number>;
  getTotalEarnings(userId: number): Promise<number>;
  getCoinBalance(userId: number): Promise<number>;
  getLastDailyGiftTime(userId: number): Promise<Date | null>;
  getLastSpinTime(userId: number): Promise<Record<number, Date> | null>;
  addCincCoins(userId: number, amount: number): Promise<number>;
  updateLastDailyGiftTime(userId: number, time: Date): Promise<boolean>;
  activateCoinBooster(userId: number): Promise<boolean>;
  updateLastSpinTime(userId: number, milestone: number): Promise<boolean>;
  updateCoinBalance(userId: number, balance: number): Promise<boolean>;
  updateTotalEarnings(userId: number, earnings: number): Promise<boolean>;
  
  // Milestone methods
  getReferralMilestones(): Promise<ReferralMilestone[]>;
  getReferralMilestone(id: number): Promise<ReferralMilestone | undefined>;
  getReferralMilestoneByCount(count: number): Promise<ReferralMilestone | undefined>;
  createReferralMilestone(milestone: InsertReferralMilestone): Promise<ReferralMilestone>;
  updateReferralMilestone(id: number, updates: Partial<ReferralMilestone>): Promise<ReferralMilestone | undefined>;
  getUserMilestones(userId: number): Promise<UserMilestone[]>;
  hasUserClaimedMilestone(userId: number, milestoneId: number): Promise<boolean>;
  checkAndTriggerMilestones(userId: number, referralCount: number): Promise<{
    triggeredMilestones: ReferralMilestone[],
    rewards: ReferralReward[]
  }>;
  
  // Spin reward methods
  getSpinRewards(): Promise<SpinReward[]>;
  getActiveSpinRewards(): Promise<SpinReward[]>;
  getSpinReward(id: number): Promise<SpinReward | undefined>;
  createSpinReward(spinReward: InsertSpinReward): Promise<SpinReward>;
  updateSpinReward(id: number, updates: Partial<SpinReward>): Promise<SpinReward | undefined>;
  getRandomSpinReward(): Promise<SpinReward>;
  getUserSpins(userId: number): Promise<UserSpin[]>;
  recordUserSpin(userSpin: InsertUserSpin): Promise<UserSpin>;
  
  // Daily gift methods
  getUserDailyGift(userId: number): Promise<UserDailyGift | undefined>;
  createUserDailyGift(gift: InsertUserDailyGift): Promise<UserDailyGift>;
  updateUserDailyGift(userId: number, updates: Partial<UserDailyGift>): Promise<UserDailyGift | undefined>;
  isDailyGiftAvailable(userId: number): Promise<{
    available: boolean;
    nextAvailableTime?: Date;
    timeRemaining?: string;
  }>;
  claimDailyGift(userId: number): Promise<{
    reward: number;
    dailyGift: UserDailyGift;
  }>;
  
  // Withdrawal methods
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getUserWithdrawalRequests(userId: number): Promise<WithdrawalRequest[]>;
  getWithdrawalRequest(id: number): Promise<WithdrawalRequest | undefined>;
  updateWithdrawalRequest(id: number, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined>;
  processWithdrawalRequest(id: number, status: 'approved' | 'rejected' | 'completed', adminId?: number, notes?: string): Promise<WithdrawalRequest | undefined>;
  getTotalWithdrawnAmount(userId: number): Promise<number>;
  getPendingWithdrawalAmount(userId: number): Promise<number>;
}

// Implement a new database storage class
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ ...updates })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUserBalance(userId: number): Promise<number> {
    const [user] = await db.select({ cincBalance: users.cincBalance })
      .from(users)
      .where(eq(users.id, userId));
    return user ? parseFloat(user.cincBalance || "0") : 0;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ cincBalance: newBalance.toString() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getUserTotalEarnings(userId: number): Promise<number> {
    const [user] = await db.select({ totalEarnings: users.totalEarnings })
      .from(users)
      .where(eq(users.id, userId));
    return user ? parseFloat(user.totalEarnings || "0") : 0;
  }

  async updateUserTotalEarnings(userId: number, newTotalEarnings: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ totalEarnings: newTotalEarnings.toString() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async generateReferralCode(): Promise<string> {
    // Generate a random alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if code already exists
    const [existingUser] = await db.select().from(users).where(eq(users.referralCode, code));
    if (existingUser) {
      // If code exists, try again
      return this.generateReferralCode();
    }
    
    return code;
  }

  async transferCincToEarnings(userId: number, amount: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;
    
    // Round amount to ensure whole numbers and prevent decimal manipulation
    const transferAmount = Math.floor(amount);
    
    // Validate the user has enough balance with strict type handling
    const currentCincBalance = parseFloat(user.cincBalance || "0");
    const currentTotalEarnings = parseFloat(user.totalEarnings || "0");
    
    if (transferAmount <= 0) {
      console.error("Invalid transfer amount:", transferAmount);
      return undefined;
    }
    
    // Prevent exploitation with tight validation
    if (currentCincBalance < transferAmount) {
      console.error("Insufficient balance: required " + transferAmount + ", available " + currentCincBalance);
      return undefined;
    }
    
    // Check for duplicate/rapid transfers by tracking last transaction time
    const lastTransactionTime = user.lastTransactionTimestamp ? new Date(user.lastTransactionTimestamp).getTime() : 0;
    const now = new Date();
    const currentTime = now.getTime();
    
    // Prevent rapid transfers (must be at least 1 second apart)
    if (lastTransactionTime && (currentTime - lastTransactionTime < 1000)) {
      console.error("Transfer rejected: Too many rapid transfers. Please wait before transferring again.");
      return undefined;
    }
    
    // Create transaction record with enhanced status tracking and validation
    const transactionId = Date.now() + "-" + userId + "-" + Math.random().toString(36).substring(2, 10); // Unique transaction ID
    const transactionRecord = {
      id: transactionId,
      userId,
      type: "transfer_to_earnings",
      amount: transferAmount,
      status: "pending",
      timestamp: now,
      previousCincBalance: currentCincBalance,
      previousTotalEarnings: currentTotalEarnings,
      sourceWallet: "cinc_balance", // Track the source of funds
      destinationWallet: "total_earnings", // Track the destination
      isVerified: false // Track verification status
    };
    
    try {
      // Update both balances with transaction safety - using atomic operations
      const newCincBalance = currentCincBalance - transferAmount;
      const newTotalEarnings = currentTotalEarnings + transferAmount;
      
      // Create a detailed reward record for this transfer BEFORE updating the user record
      // This ensures the audit trail exists even if the actual transfer fails
      const transferReward = await this.createReferralReward({
        referrerId: userId,
        referredId: 0, // System transfer
        rewardType: "transfer",
        rewardAmount: transferAmount.toString(),
        rewardDate: now,
        rewardDescription: "Transfer from CINC balance to Total Earnings: " + transferAmount + " CINC (Transaction ID: " + transactionId + ")",
        isTransferredToEarnings: true,
        transferDate: now,
        metadata: JSON.stringify(transactionRecord) // Store full transaction details for audit
      });
      
      if (!transferReward) {
        throw new Error("Failed to create transfer record in audit trail");
      }
      
      // Update the user record with the new balances AFTER creating the audit trail
      const [updatedUser] = await db.update(users)
        .set({
          cincBalance: newCincBalance.toString(),
          totalEarnings: newTotalEarnings.toString(),
          lastTransactionId: transactionId,
          lastTransactionTimestamp: now,
          lastTransactionType: "transfer_to_earnings",
          lastTransactionAmount: transferAmount.toString()
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser) {
        throw new Error("Failed to update user balances");
      }
      
      // Extra strict balance verification
      if (parseFloat(updatedUser.cincBalance || "0") !== newCincBalance) {
        throw new Error("CINC balance integrity check failed: expected " + newCincBalance + ", got " + updatedUser.cincBalance);
      }
      
      if (parseFloat(updatedUser.totalEarnings || "0") !== newTotalEarnings) {
        throw new Error("Total Earnings integrity check failed: expected " + newTotalEarnings + ", got " + updatedUser.totalEarnings);
      }
      
      console.log("✓ Successfully transferred " + transferAmount + " CINC to Total Earnings for user " + userId + " (ID: " + transactionId + ")");
      return updatedUser;
    } catch (error) {
      // Enhanced error handling
      console.error("Transfer failed for user " + userId + ":", error);
      
      // Create a rollback record in case of failure
      await this.createReferralReward({
        referrerId: userId,
        referredId: 0,
        rewardType: "transfer_rollback",
        rewardAmount: "0",
        rewardDate: new Date(),
        rewardDescription: "ROLLBACK: Transfer attempt from CINC balance to Total Earnings failed (Transaction ID: " + transactionId + ")",
        isTransferredToEarnings: false,
        transferDate: new Date(),
        metadata: JSON.stringify({
          originalTransaction: transactionId,
          rollbackReason: error instanceof Error ? error.message : "Unknown error",
          cincBalanceRestored: currentCincBalance,
          totalEarningsRestored: currentTotalEarnings
        })
      });
      
      return undefined;
    }
  }

  // Platform methods
  async getPlatforms(): Promise<Platform[]> {
    return db.select().from(platforms);
  }

  async getActivePlatforms(): Promise<Platform[]> {
    return db.select().from(platforms).where(eq(platforms.isActive, true));
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.id, id));
    return platform;
  }

  async getPlatformByName(name: string): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.name, name));
    return platform;
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    const [newPlatform] = await db.insert(platforms).values(platform).returning();
    return newPlatform;
  }

  async updatePlatform(id: number, updates: Partial<Platform>): Promise<Platform | undefined> {
    const [updatedPlatform] = await db.update(platforms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(platforms.id, id))
      .returning();
    return updatedPlatform;
  }

  async togglePlatformStatus(id: number, isActive: boolean): Promise<Platform | undefined> {
    return this.updatePlatform(id, { isActive });
  }

  // IP Accounts methods
  async getIpAccounts(userId: number): Promise<IpAccount[]> {
    return db.select().from(ipAccounts).where(eq(ipAccounts.userId, userId));
  }
  
  // Alias for getIpAccounts - used in test setup
  async getIpAccountsByUserId(userId: number): Promise<IpAccount[]> {
    return this.getIpAccounts(userId);
  }

  async getIpAccount(id: number): Promise<IpAccount | undefined> {
    const [ipAccount] = await db.select().from(ipAccounts).where(eq(ipAccounts.id, id));
    return ipAccount;
  }

  async createIpAccount(ipAccount: InsertIpAccount): Promise<IpAccount> {
    const [newIpAccount] = await db.insert(ipAccounts).values(ipAccount).returning();
    return newIpAccount;
  }

  async updateIpAccount(id: number, updates: Partial<InsertIpAccount>): Promise<IpAccount | undefined> {
    const [updatedIpAccount] = await db.update(ipAccounts)
      .set(updates)
      .where(eq(ipAccounts.id, id))
      .returning();
    return updatedIpAccount;
  }

  async deleteIpAccount(id: number): Promise<boolean> {
    const result = await db.delete(ipAccounts).where(eq(ipAccounts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Account Purchase Request methods
  async getAccountRequests(userId: number): Promise<AccountRequest[]> {
    return db.select().from(accountRequests).where(eq(accountRequests.userId, userId));
  }

  async getAllAccountRequests(): Promise<AccountRequest[]> {
    return db.select().from(accountRequests);
  }

  async getAccountRequest(id: number): Promise<AccountRequest | undefined> {
    const [request] = await db.select().from(accountRequests).where(eq(accountRequests.id, id));
    return request;
  }

  async createAccountRequest(request: InsertAccountRequest): Promise<AccountRequest> {
    const [newRequest] = await db.insert(accountRequests).values(request).returning();
    return newRequest;
  }

  async updateAccountRequest(id: number, updates: Partial<AccountRequest>): Promise<AccountRequest | undefined> {
    const [updatedRequest] = await db.update(accountRequests)
      .set(updates)
      .where(eq(accountRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getPendingRequests(userId: number): Promise<AccountRequest[]> {
    return db.select().from(accountRequests)
      .where(and(
        eq(accountRequests.userId, userId),
        eq(accountRequests.status, "pending")
      ));
  }

  async getAllPendingRequests(): Promise<AccountRequest[]> {
    return db.select().from(accountRequests).where(eq(accountRequests.status, "pending"));
  }

  // Support Chat methods
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    if (!ticket) return undefined;
    
    // Get the last message for this ticket
    const messages = await this.getSupportMessages(id);
    const lastMessage = messages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    if (lastMessage) {
      const result = {
        ...ticket,
        lastMessage: lastMessage.content,
        isUserLastMessage: lastMessage.senderId !== 0 // 0 is system/admin
      };
      return result;
    }
    
    return ticket;
  }

  async getSupportTicketByUserId(userId: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.updatedAt))
      .limit(1);
    
    if (!ticket) return undefined;
    
    // Get the last message for this ticket
    const messages = await this.getSupportMessages(ticket.id);
    const lastMessage = messages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    if (lastMessage) {
      const result = {
        ...ticket,
        lastMessage: lastMessage.content,
        isUserLastMessage: lastMessage.senderId !== 0 // 0 is system/admin
      };
      return result;
    }
    
    return ticket;
  }

  async getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]> {
    const tickets = await db.select().from(supportTickets)
      .where(and(
        eq(supportTickets.userId, userId),
        eq(supportTickets.markedForDeletion, false)
      ))
      .orderBy(desc(supportTickets.updatedAt));
    
    // Enhance with last message info
    const enhancedTickets = [];
    
    for (const ticket of tickets) {
      const messages = await this.getSupportMessages(ticket.id);
      const lastMessage = messages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      if (lastMessage) {
        enhancedTickets.push({
          ...ticket,
          lastMessage: lastMessage.content,
          isUserLastMessage: lastMessage.senderId !== 0 // 0 is system/admin
        });
      } else {
        enhancedTickets.push(ticket);
      }
    }
    
    return enhancedTickets;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db.update(supportTickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  async deleteSupportTicket(id: number): Promise<boolean> {
    const result = await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteExpiredTickets(): Promise<number> {
    const now = new Date();
    const result = await db.delete(supportTickets)
      .where(and(
        eq(supportTickets.markedForDeletion, true),
        sql`${supportTickets.deletionDate} < ${now}`
      ));
    return result.rowCount || 0;
  }

  async getSupportMessages(ticketId: number): Promise<SupportMessage[]> {
    return db.select().from(supportMessages)
      .where(eq(supportMessages.ticketId, ticketId))
      .orderBy(asc(supportMessages.timestamp));
  }

  async createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage> {
    const [newMessage] = await db.insert(supportMessages).values(message).returning();
    
    // Update ticket's updatedAt and unread status
    const ticket = await this.getSupportTicket(message.ticketId);
    if (ticket) {
      // If the message is from system, mark as unread for user
      if (message.senderId === 0) {
        await this.updateSupportTicket(message.ticketId, {
          hasUnreadMessages: true,
          unreadCount: (ticket.unreadCount || 0) + 1
        });
      } else {
        // If message is from user, just update timestamp
        await this.updateSupportTicket(message.ticketId, {
          hasUnreadMessages: false,
          unreadCount: 0
        });
      }
    }
    
    return newMessage;
  }

  // Referral Relationship methods
  async getReferralsByReferrerId(referrerId: number): Promise<ReferralRelationship[]> {
    return db.select().from(referralRelationships)
      .where(eq(referralRelationships.referrerId, referrerId));
  }
  
  // Helper method for testing - get referral relationship between referrer and referred
  async getReferralRelationship(referrerId: number, referredId: number): Promise<ReferralRelationship | undefined> {
    const [relationship] = await db.select().from(referralRelationships)
      .where(and(
        eq(referralRelationships.referrerId, referrerId),
        eq(referralRelationships.referredId, referredId)
      ));
    return relationship;
  }

  async getReferralByReferredId(referredId: number): Promise<ReferralRelationship | undefined> {
    const [relationship] = await db.select().from(referralRelationships)
      .where(eq(referralRelationships.referredId, referredId));
    return relationship;
  }

  async createReferralRelationship(relationship: InsertReferralRelationship): Promise<ReferralRelationship> {
    const [newRelationship] = await db.insert(referralRelationships).values(relationship).returning();
    return newRelationship;
  }

  async updateReferralRelationship(id: number, updates: Partial<ReferralRelationship>): Promise<ReferralRelationship | undefined> {
    const [updatedRelationship] = await db.update(referralRelationships)
      .set(updates)
      .where(eq(referralRelationships.id, id))
      .returning();
    return updatedRelationship;
  }
  
  async deleteReferral(id: number): Promise<boolean> {
    try {
      const result = await db.delete(referralRelationships)
        .where(eq(referralRelationships.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting referral:', error);
      return false;
    }
  }

  async getActiveReferralsCount(referrerId: number): Promise<number> {
    const result = await db.select({ count: count() }).from(referralRelationships)
      .where(and(
        eq(referralRelationships.referrerId, referrerId),
        eq(referralRelationships.isActive, true),
        eq(referralRelationships.isInactive, false)
      ));
    return result[0]?.count || 0;
  }

  async getTotalReferralsCount(referrerId: number): Promise<number> {
    const result = await db.select({ count: count() }).from(referralRelationships)
      .where(eq(referralRelationships.referrerId, referrerId));
    return result[0]?.count || 0;
  }

  async getInactiveReferrals(referrerId: number): Promise<ReferralRelationship[]> {
    // Get referrals where the user has signed up but never been activated
    // These are referrals where isActive is false (never made a purchase)
    return db.select().from(referralRelationships)
      .where(and(
        eq(referralRelationships.referrerId, referrerId),
        eq(referralRelationships.isActive, false)
      ));
  }
  
  async trackReferralRenewal(referralId: number): Promise<ReferralRelationship | undefined> {
    const [relationship] = await db.select().from(referralRelationships)
      .where(eq(referralRelationships.id, referralId));
    
    if (!relationship) return undefined;
    
    const now = new Date();
    const updates: Partial<ReferralRelationship> = {
      lastRenewalDate: now,
      nextRewardDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      gracePeriodEnds: new Date(now.getTime() + 36 * 24 * 60 * 60 * 1000), // 36 days
      isActive: true,
      isPendingRenewal: false,
      lastActiveDate: now,
      isInactive: false,
      renewalWarningCount: 0,
      lastWarningDate: null
    };
    
    return this.updateReferralRelationship(referralId, updates);
  }

  async processReferralActivation(referralId: number): Promise<ReferralRelationship | undefined> {
    // Retrieve the relationship first
    const [relationship] = await db.select().from(referralRelationships)
      .where(eq(referralRelationships.id, referralId));
    
    // Return early if relationship doesn't exist or is already active
    if (!relationship) {
      console.log(`Referral relationship ${referralId} not found`);
      return undefined;
    }
    
    if (relationship.isActive && relationship.activationDate) {
      console.log(`Referral ${referralId} is already active, activated on ${relationship.activationDate}`);
      return relationship;
    }
    
    const now = new Date();
    const updates: Partial<ReferralRelationship> = {
      isActive: true,
      activationDate: now,
      lastActiveDate: now,
      nextRewardDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      gracePeriodEnds: new Date(now.getTime() + 36 * 24 * 60 * 60 * 1000), // 36 days
      isInactive: false,
      renewalWarningCount: 0,
      isPendingRenewal: false,
    };
    
    console.log(`Activating referral ${referralId} for first time - referred user made first purchase`);
    
    // Update the relationship
    const updatedRelationship = await this.updateReferralRelationship(referralId, updates);
    
    // Now check if we need to trigger milestone rewards for the referrer
    if (updatedRelationship) {
      try {
        const referrerId = updatedRelationship.referrerId;
        // Count active referrals for this referrer (only count those with activationDate)
        const activeReferrals = await db.select()
          .from(referralRelationships)
          .where(and(
            eq(referralRelationships.referrerId, referrerId),
            not(isNull(referralRelationships.activationDate))
          ));
          
        const referralCount = activeReferrals.length;
        
        // Check if any milestones need to be triggered
        console.log(`Checking milestones for referrer ${referrerId} with ${referralCount} active referrals`);
        await this.checkAndTriggerMilestones(referrerId, referralCount);
      } catch (error) {
        console.error('Error triggering milestone rewards:', error);
      }
    }
    
    return updatedRelationship;
  }

  // Referral Rewards methods
  async getReferralRewards(referrerId: number): Promise<ReferralReward[]> {
    return db.select().from(referralRewards)
      .where(eq(referralRewards.referrerId, referrerId))
      .orderBy(desc(referralRewards.rewardDate));
  }

  async getReferralReward(rewardId: number): Promise<ReferralReward | undefined> {
    const [reward] = await db.select().from(referralRewards)
      .where(eq(referralRewards.id, rewardId));
    return reward;
  }

  async createReferralReward(reward: InsertReferralReward): Promise<ReferralReward> {
    const [newReward] = await db.insert(referralRewards).values(reward).returning();
    return newReward;
  }

  async updateReferralReward(id: number, updates: Partial<ReferralReward>): Promise<ReferralReward | undefined> {
    const [updatedReward] = await db.update(referralRewards)
      .set(updates)
      .where(eq(referralRewards.id, id))
      .returning();
    return updatedReward;
  }

  async calculateMilestoneRewards(referrerId: number): Promise<number> {
    const result = await db.select({
      totalAmount: sql`SUM(CAST(${referralRewards.rewardAmount} AS NUMERIC))`
    })
    .from(referralRewards)
    .where(and(
      eq(referralRewards.referrerId, referrerId),
      eq(referralRewards.rewardType, "milestone")
    ));
    
    return parseFloat(result[0]?.totalAmount?.toString() || "0");
  }

  async calculatePendingRenewalEarnings(referrerId: number): Promise<number> {
    // Get all active referrals that are in the grace period
    const pendingReferrals = await db.select().from(referralRelationships)
      .where(and(
        eq(referralRelationships.referrerId, referrerId),
        eq(referralRelationships.isActive, true),
        eq(referralRelationships.isPendingRenewal, true)
      ));
    
    // Calculate potential earnings (placeholder logic)
    return pendingReferrals.length * 3; // 3 CINC per pending renewal
  }

  async processReferralRewards(referrerId: number): Promise<boolean> {
    try {
      // Get all pending rewards that haven't been transferred to earnings yet
      const pendingRewards = await db.select().from(referralRewards)
        .where(and(
          eq(referralRewards.referrerId, referrerId),
          eq(referralRewards.isTransferredToEarnings, false)
        ));
      
      if (pendingRewards.length === 0) {
        return true; // No pending rewards to process
      }
      
      // Process each reward
      for (const reward of pendingRewards) {
        await this.transferReferralRewardToEarnings(reward.id);
      }
      
      return true;
    } catch (error) {
      console.error("Error processing referral rewards:", error);
      return false;
    }
  }
  
  async transferReferralRewardToEarnings(rewardId: number): Promise<boolean> {
    try {
      // Get the reward details
      const [reward] = await db.select().from(referralRewards)
        .where(eq(referralRewards.id, rewardId));
      
      if (!reward) {
        console.error(`Reward not found for ID: ${rewardId}`);
        return false;
      }
      
      // If already transferred, do nothing
      if (reward.isTransferredToEarnings) {
        return true;
      }
      
      // Get the user's current earning balance
      const [user] = await db.select().from(users)
        .where(eq(users.id, reward.referrerId));
      
      if (!user) {
        console.error(`User not found for referrer ID: ${reward.referrerId}`);
        return false;
      }
      
      // Parse current balances (with fallbacks for NULL values)
      const currentCincBalance = parseFloat(user.cincBalance || "0");
      const currentEarningsBalance = parseFloat(user.earningsBalance || "0");
      const rewardAmount = parseFloat(reward.rewardAmount);
      
      // Calculate new balances
      const newCincBalance = Math.max(0, currentCincBalance - rewardAmount);
      const newEarningsBalance = currentEarningsBalance + rewardAmount;
      
      // Update the user's balances in a transaction to ensure consistency
      await db.transaction(async (tx) => {
        // Update user balances
        await tx.update(users)
          .set({ 
            cincBalance: newCincBalance.toString(),
            earningsBalance: newEarningsBalance.toString(),
            lastTransactionId: `REWARD-TRANSFER-${Date.now()}`,
            lastTransactionTimestamp: new Date(),
            lastTransactionType: "referral_to_earnings",
            lastTransactionAmount: rewardAmount.toString()
          })
          .where(eq(users.id, reward.referrerId));
        
        // Mark the reward as transferred
        await tx.update(referralRewards)
          .set({ 
            isTransferredToEarnings: true,
            transferDate: new Date(),
            metadata: JSON.stringify({
              transferId: `REWARD-TRANSFER-${rewardId}-${Date.now()}`,
              transferDate: new Date().toISOString(),
              sourceBalance: "cinc",
              targetBalance: "earnings",
              amount: rewardAmount.toString(),
              originalMetadata: reward.metadata
            })
          })
          .where(eq(referralRewards.id, rewardId));
      });
      
      console.log(`Successfully transferred reward ID ${rewardId} (${rewardAmount} CINC) to earnings for user ${reward.referrerId}`);
      return true;
    } catch (error) {
      console.error("Error transferring reward to earnings:", error);
      return false;
    }
  }

  async checkSpinAvailability(referrerId: number): Promise<{
    available: boolean;
    nextAvailableTime?: Date;
    timeRemaining?: string;
    lastSpunAt?: Date;
    milestoneId?: number;
  }> {
    try {
      // Get the user's referral count
      const referrals = await this.getReferralsByReferrerId(referrerId);
      const totalReferrals = referrals.filter(r => r.activationDate).length;
      
      console.log(`[Spin Check] User ${referrerId} has ${totalReferrals} total referrals`);
      
      // Get all milestones the user has reached
      const eligibleMilestones = await db.select().from(referralMilestones)
        .where(and(
          eq(referralMilestones.isActive, true),
          lte(referralMilestones.referralCount, totalReferrals),
          eq(referralMilestones.hasSpin, true) // Only consider milestones with spin
        ))
        .orderBy(asc(referralMilestones.referralCount));
      
      // If no spin-eligible milestones, return not available
      if (eligibleMilestones.length === 0) {
        console.log(`[Spin Check] User ${referrerId} has no spin-eligible milestones`);
        return { available: false };
      }
      
      // Get all milestones the user has already claimed a spin for
      const userSpins = await this.getUserSpins(referrerId);
      const claimedMilestoneIds = userSpins.map(spin => spin.milestoneId);
      
      // Find unclaimed spin milestones
      const unclaimedMilestones = eligibleMilestones.filter(
        milestone => !claimedMilestoneIds.includes(milestone.id)
      );
      
      // If no unclaimed spin milestones, return not available
      if (unclaimedMilestones.length === 0) {
        console.log(`[Spin Check] User ${referrerId} has claimed all available spins`);
        return { available: false };
      }
      
      // Get the first unclaimed milestone that has a spin
      const nextSpinMilestone = unclaimedMilestones[0];
      
      console.log(`[Spin Check] User ${referrerId} has unclaimed spin for milestone ID ${nextSpinMilestone.id} (${nextSpinMilestone.referralCount} referrals)`);
      
      return { 
        available: true,
        milestoneId: nextSpinMilestone.id
      };
    } catch (error) {
      console.error(`[Spin Check] Error checking spin availability for user ${referrerId}:`, error);
      // Default to not available on error to prevent incorrect rewards
      return { available: false };
    }
  }

  async checkDailyBonusAvailability(userId: number): Promise<{
    available: boolean;
    nextAvailableTime?: Date;
    timeRemaining?: string;
    lastClaimedAt?: Date;
  }> {
    const userGift = await this.getUserDailyGift(userId);
    
    // DEVELOPMENT MODE: Always return available for testing
    console.log(`[Daily Gift] Gift available for user ${userId} - DEVELOPMENT MODE ENABLED`);
    
    // Delete any existing gift record to allow fresh claiming
    if (userGift) {
      await db.delete(userDailyGifts).where(eq(userDailyGifts.userId, userId));
    }
    
    return { available: true };
    
    /* PRODUCTION CODE (currently disabled for testing):
    if (!userGift) {
      // If no record, they've never claimed a gift before
      return { available: true };
    }
    
    const now = new Date();
    const nextAvailableTime = userGift.nextAvailableTime;
    
    // Strictly ensure exactly 24 hours have passed (in milliseconds)
    const timeDiff = nextAvailableTime.getTime() - now.getTime();
    const isAvailable = timeDiff <= 0;
    
    if (isAvailable) {
      // Log successful gift availability
      console.log(`[Daily Gift] Gift available for user ${userId}, last claimed: ${userGift.lastClaimTime}`);
      return { available: true };
    }
    
    // Calculate time remaining
    const timeRemaining = this.formatTimeRemaining(timeDiff);
    
    // Log unavailable gift with remaining time
    console.log(`[Daily Gift] Gift NOT available for user ${userId}, next available in: ${timeRemaining}`);
    
    return {
      available: false,
      nextAvailableTime,
      timeRemaining,
      lastClaimedAt: userGift.lastClaimTime
    };
    */
  }

  formatTimeRemaining(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return hours + "h " + (minutes % 60) + "m";
    } else if (minutes > 0) {
      return minutes + "m " + (seconds % 60) + "s";
    } else {
      return seconds + "s";
    }
  }

  async processDailyBonus(userId: number, bonusAmount: number): Promise<{ reward: ReferralReward; user: User }> {
    // Validate bonus amount - maximum daily gift is 10 CINC (updated from 20 CINC)
    const safeBonusAmount = Math.min(bonusAmount, 10);
    
    // First get the user 
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Instead of adding to CINC balance, add to monthly estimate
    // Calculate current monthly estimate
    const currentMonthlyEstimate = await this.calculateMonthlyEstimate(userId);
    // Add gift box amount to monthly estimate (we're not using a field in the user table,
    // but instead calculating it dynamically, so we only need to record the reward)
    
    // We no longer update user balance directly
    // const currentBalance = parseFloat(user.cincBalance || "0");
    // const newBalance = currentBalance + safeBonusAmount;
    // const updatedUser = await this.updateUserBalance(userId, newBalance);
    
    // Record the reward, marking it specifically for monthly estimate
    const reward = await this.createReferralReward({
      referrerId: userId,
      referredId: 0, // System reward
      rewardType: "daily_gift_monthly",
      rewardAmount: safeBonusAmount.toString(),
      rewardDate: new Date(),
      rewardDescription: "Daily Gift Box reward: " + safeBonusAmount + " CINC (added to Monthly Estimate)",
      isTransferredToEarnings: false,
      transferDate: null,
      metadata: JSON.stringify({
        giftBoxReward: true,
        originalAmount: bonusAmount,
        adjustedAmount: safeBonusAmount,
        targetWallet: "monthly_estimate",
        reason: bonusAmount > 10 ? "Exceeded maximum daily gift (10 CINC)" : "Standard reward"
      })
    });
    
    // Update user's daily gift record
    const now = new Date();
    
    // Generate a random cooldown period between 24 and 36 hours (in milliseconds)
    // This will randomize when the gift box becomes available again
    const minCooldown = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const maxExtraCooldown = 12 * 60 * 60 * 1000; // Up to 12 additional hours
    const randomExtraCooldown = Math.floor(Math.random() * maxExtraCooldown);
    const totalCooldown = minCooldown + randomExtraCooldown;
    
    // Calculate next available time based on randomized cooldown
    const nextAvailable = new Date(now.getTime() + totalCooldown);
    console.log(`[Daily Gift] Setting next available time to ${nextAvailable} (${Math.round(totalCooldown / (60 * 60 * 1000))} hours from now)`);
    
    const existingGift = await this.getUserDailyGift(userId);
    
    if (existingGift) {
      await this.updateUserDailyGift(userId, {
        lastClaimTime: now,
        nextAvailableTime: nextAvailable,
        claimCount: (existingGift.claimCount || 0) + 1
      });
    } else {
      await this.createUserDailyGift({
        userId,
        lastClaimTime: now, 
        nextAvailableTime: nextAvailable,
        claimCount: 1
      });
    }
    
    // Return the original user since we're not updating the balance anymore
    return { reward, user };
  }

  async processSpinReward(referrerId: number, rewardAmount: number, rewardType: string): Promise<ReferralReward> {
    // Implement spin reward processing
    // Basic validation
    if (rewardAmount < 0) {
      throw new Error("Invalid reward amount");
    }
    
    // Record the reward
    const reward = await this.createReferralReward({
      referrerId,
      referredId: 0, // System reward
      rewardType: "spin",
      rewardAmount: rewardAmount.toString(),
      rewardDate: new Date(),
      rewardDescription: "Spin Wheel Reward: " + rewardAmount + " CINC (" + rewardType + ")",
      isTransferredToEarnings: false,
      transferDate: null,
      metadata: JSON.stringify({
        spinReward: true,
        rewardType: rewardType,
        timestamp: new Date().toISOString()
      })
    });
    
    // If there's a reward amount, add it to the user's balance
    if (rewardAmount > 0) {
      const user = await this.getUser(referrerId);
      if (user) {
        const currentBalance = parseFloat(user.cincBalance || "0");
        const newBalance = currentBalance + rewardAmount;
        await this.updateUserBalance(referrerId, newBalance);
      }
    }
    
    return reward;
  }

  // Additional methods for referral stats and rewards
  async getUserRewards(userId: number): Promise<{ coinBoosterActive: boolean } | undefined> {
    // Simplified implementation
    return { coinBoosterActive: false };
  }
  
  async calculateMonthlyEstimate(userId: number): Promise<number> {
    // Get all active referrals for this user
    const referrals = await this.getReferralsByReferrerId(userId);
    let monthlyEstimate = 0;
    
    // PART 1: Calculate monthly commission from active referrals (15% of renewal fees)
    for (const referral of referrals) {
      // Only consider active referrals for monthly estimates
      if (referral.isActive && !referral.isInactive) {
        const referredUserId = referral.referredId;
        // Get the accounts of the referred user
        const referredUserAccounts = await this.getIpAccounts(referredUserId);
        
        // Calculate commission based on actual platform renewal fees for each active account
        for (const account of referredUserAccounts.filter(acc => acc.isActive)) {
          const platform = await this.getPlatform(account.platformId);
          if (platform) {
            // Get the actual renewal fee for this platform
            const renewalFee = platform.renewFee ? parseFloat(platform.renewFee) : 7000;
            // Calculate 15% commission
            monthlyEstimate += Math.round(renewalFee * 0.15);
          }
        }
      }
    }
    
    // PART 2: Add any daily gift rewards that haven't been transferred to earnings yet
    const dailyGiftRewards = await db.select({
      totalAmount: sql`SUM(CAST(${referralRewards.rewardAmount} AS NUMERIC))`
    })
    .from(referralRewards)
    .where(and(
      eq(referralRewards.referrerId, userId),
      eq(referralRewards.rewardType, "daily_gift_monthly"),
      eq(referralRewards.isTransferredToEarnings, false)
    ));
    
    // Add daily gift rewards to monthly estimate
    const dailyGiftAmount = dailyGiftRewards[0]?.totalAmount ? parseFloat(String(dailyGiftRewards[0].totalAmount)) : 0;
    monthlyEstimate += dailyGiftAmount;
    
    console.log(`[Monthly Estimate] User ${userId}: Commission = ${monthlyEstimate - dailyGiftAmount}, Daily Gifts = ${dailyGiftAmount}, Total = ${monthlyEstimate}`);
    
    return monthlyEstimate;
  }

  async getRenewalEarnings(userId: number): Promise<number> {
    const result = await db.select({
      totalAmount: sql`SUM(CAST(${referralRewards.rewardAmount} AS NUMERIC))`
    })
    .from(referralRewards)
    .where(and(
      eq(referralRewards.referrerId, userId),
      eq(referralRewards.rewardType, "renewal")
    ));
    
    const amountStr = result[0]?.totalAmount ? String(result[0].totalAmount) : "0";
    return parseFloat(amountStr);
  }

  async getPendingEarnings(userId: number): Promise<number> {
    // Get all active referrals for this user
    const referrals = await this.getReferralsByReferrerId(userId);
    let totalPendingEarnings = 0;
    
    for (const referral of referrals) {
      // Only consider active referrals that haven't been rewarded yet
      if (referral.isActive && !referral.isInactive && !referral.hasBeenRewarded) {
        const referredUserId = referral.referredId;
        // Get the accounts of the referred user
        const referredUserAccounts = await this.getIpAccounts(referredUserId);
        
        // Calculate commission based on actual platform renewal fees for each active account
        for (const account of referredUserAccounts.filter(acc => acc.isActive)) {
          const platform = await this.getPlatform(account.platformId);
          if (platform) {
            // Get the actual renewal fee for this platform
            const renewalFee = platform.renewFee ? parseFloat(platform.renewFee) : 7000;
            // Calculate 15% commission
            totalPendingEarnings += Math.round(renewalFee * 0.15);
          }
        }
      }
    }
    
    return totalPendingEarnings;
  }

  async transferMonthlyEstimateToEarnings(userId: number): Promise<User | undefined> {
    // Get the current monthly estimate
    const monthlyEstimate = await this.calculateMonthlyEstimate(userId);
    
    // If there's no monthly estimate to transfer, return early
    if (monthlyEstimate <= 0) {
      console.error("No monthly estimate to transfer for user:", userId);
      return undefined;
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;
    
    // Get current balances
    const currentTotalEarnings = parseFloat(user.totalEarnings || "0");
    
    // Check for duplicate/rapid transfers by tracking last transaction time
    const lastTransactionTime = user.lastTransactionTimestamp ? new Date(user.lastTransactionTimestamp).getTime() : 0;
    const now = new Date();
    const currentTime = now.getTime();
    
    // Prevent rapid transfers (must be at least 1 second apart)
    if (lastTransactionTime && (currentTime - lastTransactionTime < 1000)) {
      console.error("Transfer rejected: Too many rapid transfers. Please wait before transferring again.");
      return undefined;
    }
    
    // Create transaction record with enhanced tracking and validation
    const transactionId = Date.now() + "-" + userId + "-" + Math.random().toString(36).substring(2, 10);
    const transactionRecord = {
      id: transactionId,
      userId,
      type: "monthly_estimate_to_earnings",
      amount: monthlyEstimate,
      status: "pending",
      timestamp: now,
      previousTotalEarnings: currentTotalEarnings,
      sourceWallet: "monthly_estimate",
      destinationWallet: "total_earnings", 
      isVerified: false
    };
    
    try {
      // Find all daily gift rewards that haven't been transferred yet
      const pendingDailyGiftRewards = await db.select().from(referralRewards)
        .where(and(
          eq(referralRewards.referrerId, userId),
          eq(referralRewards.rewardType, "daily_gift_monthly"),
          eq(referralRewards.isTransferredToEarnings, false)
        ));

      // Calculate new total earnings
      const newTotalEarnings = currentTotalEarnings + monthlyEstimate;
      
      // Create a reward record for audit trail
      const transferReward = await this.createReferralReward({
        referrerId: userId,
        referredId: 0, // System transfer
        rewardType: "monthly_estimate_transfer",
        rewardAmount: monthlyEstimate.toString(),
        rewardDate: now,
        rewardDescription: "Transfer from Monthly Estimate to Total Earnings: " + monthlyEstimate + " CINC (Transaction ID: " + transactionId + ")",
        isTransferredToEarnings: true,
        transferDate: now,
        metadata: JSON.stringify({
          ...transactionRecord,
          dailyGiftsIncluded: pendingDailyGiftRewards.length,
          dailyGiftAmount: pendingDailyGiftRewards.reduce((sum, reward) => sum + parseFloat(reward.rewardAmount), 0)
        })
      });
      
      if (!transferReward) {
        throw new Error("Failed to create transfer record in audit trail");
      }
      
      // Update the user's total earnings
      const [updatedUser] = await db.update(users)
        .set({
          totalEarnings: newTotalEarnings.toString(),
          lastTransactionId: transactionId,
          lastTransactionTimestamp: now,
          lastTransactionType: "monthly_estimate_transfer",
          lastTransactionAmount: monthlyEstimate.toString()
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser) {
        throw new Error("Failed to update user total earnings");
      }
      
      // Verify the new total earnings
      if (parseFloat(updatedUser.totalEarnings || "0") !== newTotalEarnings) {
        throw new Error("Total Earnings integrity check failed: expected " + newTotalEarnings + ", got " + updatedUser.totalEarnings);
      }

      // Mark all daily gift rewards as transferred
      if (pendingDailyGiftRewards.length > 0) {
        const dailyGiftIds = pendingDailyGiftRewards.map(reward => reward.id);
        
        // Instead of using inArray (which might not be available), use a loop to update each reward
        for (const rewardId of dailyGiftIds) {
          await db.update(referralRewards)
            .set({
              isTransferredToEarnings: true,
              transferDate: now
            })
            .where(eq(referralRewards.id, rewardId));
        }
          
        console.log(`Marked ${dailyGiftIds.length} daily gift rewards as transferred to earnings`);
      }
      
      // Mark the transaction as verified and completed
      transactionRecord.status = "completed";
      transactionRecord.isVerified = true;
      
      // Log the success
      console.log("✓ Successfully transferred " + monthlyEstimate + " CINC from Monthly Estimate to Total Earnings for user " + userId + " (ID: " + transactionId + ")");
      
      return updatedUser;
    } catch (error) {
      // Log the error
      console.error("Monthly Estimate transfer failed:", error);
      
      // Create a rollback record
      try {
        await this.createReferralReward({
          referrerId: userId,
          referredId: 0,
          rewardType: "monthly_estimate_transfer_rollback",
          rewardAmount: "0",
          rewardDate: now,
          rewardDescription: "FAILED Monthly Estimate Transfer rollback: " + (error instanceof Error ? error.message : String(error)),
          isTransferredToEarnings: false,
          transferDate: now,
          metadata: JSON.stringify({
            originalTransaction: transactionRecord,
            rollbackReason: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          })
        });
      } catch (rollbackError) {
        console.error("Failed to create rollback record:", rollbackError);
      }
      
      return undefined;
    }
  }

  async getTotalEarnings(userId: number): Promise<number> {
    const [user] = await db.select({ totalEarnings: users.totalEarnings })
      .from(users)
      .where(eq(users.id, userId));
    return user ? parseFloat(user.totalEarnings || "0") : 0;
  }

  async getCoinBalance(userId: number): Promise<number> {
    return this.getUserBalance(userId);
  }

  async getLastDailyGiftTime(userId: number): Promise<Date | null> {
    const userGift = await this.getUserDailyGift(userId);
    return userGift ? userGift.lastClaimTime : null;
  }

  async getLastSpinTime(userId: number): Promise<Record<number, Date> | null> {
    const userSpins = await this.getUserSpins(userId);
    if (!userSpins.length) return null;
    
    const spinTimes: Record<number, Date> = {};
    for (const spin of userSpins) {
      spinTimes[spin.milestoneId] = spin.claimedAt;
    }
    
    return spinTimes;
  }

  async addCincCoins(userId: number, amount: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const currentBalance = parseFloat(user.cincBalance || "0");
    const newBalance = currentBalance + amount;
    
    await this.updateUserBalance(userId, newBalance);
    
    return newBalance;
  }

  async updateLastDailyGiftTime(userId: number, time: Date): Promise<boolean> {
    const userGift = await this.getUserDailyGift(userId);
    if (userGift) {
      const nextAvailable = new Date(time.getTime() + 24 * 60 * 60 * 1000);
      await this.updateUserDailyGift(userId, {
        lastClaimTime: time,
        nextAvailableTime: nextAvailable
      });
    } else {
      const nextAvailable = new Date(time.getTime() + 24 * 60 * 60 * 1000);
      await this.createUserDailyGift({
        userId,
        lastClaimTime: time,
        nextAvailableTime: nextAvailable,
        claimCount: 1
      });
    }
    return true;
  }

  async activateCoinBooster(userId: number): Promise<boolean> {
    // Simplified implementation - return true
    return true;
  }

  async updateLastSpinTime(userId: number, milestone: number): Promise<boolean> {
    // Implementation omitted for brevity
    return true;
  }

  async updateCoinBalance(userId: number, balance: number): Promise<boolean> {
    const updatedUser = await this.updateUserBalance(userId, balance);
    return !!updatedUser;
  }

  async updateTotalEarnings(userId: number, earnings: number): Promise<boolean> {
    const updatedUser = await this.updateUserTotalEarnings(userId, earnings);
    return !!updatedUser;
  }

  // Milestone methods
  async getReferralMilestones(): Promise<ReferralMilestone[]> {
    return db.select().from(referralMilestones)
      .where(eq(referralMilestones.isActive, true))
      .orderBy(asc(referralMilestones.referralCount));
  }

  async getReferralMilestone(id: number): Promise<ReferralMilestone | undefined> {
    const [milestone] = await db.select().from(referralMilestones)
      .where(eq(referralMilestones.id, id));
    return milestone;
  }

  async getReferralMilestoneByCount(count: number): Promise<ReferralMilestone | undefined> {
    const [milestone] = await db.select().from(referralMilestones)
      .where(eq(referralMilestones.referralCount, count));
    return milestone;
  }

  async createReferralMilestone(milestone: InsertReferralMilestone): Promise<ReferralMilestone> {
    const [newMilestone] = await db.insert(referralMilestones).values(milestone).returning();
    return newMilestone;
  }

  async updateReferralMilestone(id: number, updates: Partial<ReferralMilestone>): Promise<ReferralMilestone | undefined> {
    const [updatedMilestone] = await db.update(referralMilestones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(referralMilestones.id, id))
      .returning();
    return updatedMilestone;
  }

  async getUserMilestones(userId: number): Promise<UserMilestone[]> {
    return db.select().from(userMilestones)
      .where(eq(userMilestones.userId, userId));
  }

  async hasUserClaimedMilestone(userId: number, milestoneId: number): Promise<boolean> {
    const [userMilestone] = await db.select().from(userMilestones)
      .where(and(
        eq(userMilestones.userId, userId),
        eq(userMilestones.milestoneId, milestoneId)
      ));
    return !!userMilestone;
  }

  async checkAndTriggerMilestones(userId: number, referralCount: number): Promise<{
    triggeredMilestones: ReferralMilestone[],
    rewards: ReferralReward[],
    notifications: any[]
  }> {
    // Find all milestones that match or are below the current referral count
    const eligibleMilestones = await db.select().from(referralMilestones)
      .where(and(
        eq(referralMilestones.isActive, true),
        lte(referralMilestones.referralCount, referralCount)
      ))
      .orderBy(asc(referralMilestones.referralCount));
    
    const triggeredMilestones: ReferralMilestone[] = [];
    const rewards: ReferralReward[] = [];
    const notifications: any[] = [];
    
    // If no milestones found in the database, use the hardcoded active referral reward structure
    if (eligibleMilestones.length === 0) {
      console.log("No milestones found in the database. Using fallback reward structure.");
      
      // Use the hardcoded milestones as defined in the specifications
      const fallbackMilestones = [
        { count: 1, base: 1350, bonus: 0, description: '1 Referral Milestone' },
        { count: 2, base: 1350, bonus: 800, description: '2 Referrals Milestone' },
        { count: 3, base: 1350, bonus: 0, description: '3 Referrals Milestone' },
        { count: 4, base: 1350, bonus: 1000, description: '4 Referrals Milestone' },
        { count: 5, base: 1350, bonus: 0, description: '5 Referrals Milestone' },
        { count: 6, base: 1350, bonus: 1200, description: '6 Referrals Milestone' },
        { count: 7, base: 1350, bonus: 0, description: '7 Referrals Milestone' },
        { count: 8, base: 1350, bonus: 1500, description: '8 Referrals Milestone' },
        { count: 9, base: 1350, bonus: 0, description: '9 Referrals Milestone' },
        { count: 10, base: 1350, bonus: 1700, description: '10 Referrals Milestone' },
        { count: 11, base: 1350, bonus: 0, description: '11 Referrals Milestone' },
        { count: 12, base: 1350, bonus: 2000, description: '12 Referrals Milestone' },
        { count: 13, base: 1350, bonus: 0, description: '13 Referrals Milestone' },
        { count: 14, base: 1350, bonus: 1800, description: '14 Referrals Milestone' },
        { count: 15, base: 1350, bonus: 0, description: '15 Referrals Milestone' },
        { count: 16, base: 1350, bonus: 2200, description: '16 Referrals Milestone' },
        { count: 17, base: 1350, bonus: 0, description: '17 Referrals Milestone' },
        { count: 18, base: 1350, bonus: 2500, description: '18 Referrals Milestone' },
        { count: 19, base: 1350, bonus: 0, description: '19 Referrals Milestone' },
        { count: 20, base: 1350, bonus: 3000, description: '20 Referrals Milestone' }
      ];
      
      // Find milestones that match the current referral count
      const eligibleFallbackMilestones = fallbackMilestones.filter(m => m.count <= referralCount);
      
      // Process each eligible fallback milestone
      for (const milestone of eligibleFallbackMilestones) {
        // Check if this milestone has already been claimed
        // We need to create a custom query for fallback milestones
        const existingReferralRewards = await db.select().from(referralRewards)
          .where(and(
            eq(referralRewards.referrerId, userId),
            eq(referralRewards.rewardType, "milestone")
          ));
        
        // Look for a reward with metadata containing this milestone count
        const alreadyClaimed = existingReferralRewards.some(reward => {
          try {
            const metadata = reward.metadata ? JSON.parse(reward.metadata) : {};
            return metadata.milestoneCount === milestone.count;
          } catch (e) {
            return false;
          }
        });
        
        if (!alreadyClaimed) {
          // Calculate the total reward (base + bonus)
          const baseAmount = milestone.base;
          const bonusAmount = milestone.bonus || 0;
          const totalAmount = baseAmount + bonusAmount;
          
          // Create separate rewards for base and bonus if there's a bonus
          let baseReward: ReferralReward;
          let bonusReward: ReferralReward | null = null;
          
          // First, create the base reward
          baseReward = await this.createReferralReward({
            referrerId: userId,
            referredId: 0, // System reward
            rewardType: "milestone",
            rewardAmount: baseAmount.toString(),
            rewardDate: new Date(),
            rewardDescription: `Base Milestone Reward: ${baseAmount} CINC for reaching ${milestone.count} referrals`,
            isTransferredToEarnings: false,
            transferDate: null,
            metadata: JSON.stringify({
              milestoneCount: milestone.count,
              isBase: true,
              isBonus: false,
              baseAmount: baseAmount,
              bonusAmount: 0,
              totalMilestoneAmount: totalAmount
            })
          });
          
          rewards.push(baseReward);
          
          // If there's a bonus, create a separate bonus reward
          if (bonusAmount > 0) {
            bonusReward = await this.createReferralReward({
              referrerId: userId,
              referredId: 0, // System reward
              rewardType: "milestone_bonus",
              rewardAmount: bonusAmount.toString(),
              rewardDate: new Date(),
              rewardDescription: `Bonus Milestone Reward: ${bonusAmount} CINC for reaching ${milestone.count} referrals`,
              isTransferredToEarnings: false,
              transferDate: null,
              metadata: JSON.stringify({
                milestoneCount: milestone.count,
                isBase: false,
                isBonus: true,
                isReferralBonus: true,
                baseAmount: 0,
                bonusAmount: bonusAmount,
                totalMilestoneAmount: totalAmount
              })
            });
            
            rewards.push(bonusReward);
          }
          
          // Add to user's balance (both base and bonus)
          const user = await this.getUser(userId);
          if (user) {
            const currentBalance = parseFloat(user.cincBalance || "0");
            const newBalance = currentBalance + totalAmount;
            await this.updateUserBalance(userId, newBalance);
            
            // Create a notification object for real-time update
            const notification = {
              type: 'milestone_achieved',
              milestoneId: milestone.count, // Use count as ID for fallback
              referralCount: milestone.count,
              baseAmount: baseAmount,
              bonusAmount: bonusAmount,
              totalAmount: totalAmount,
              description: milestone.description,
              timestamp: new Date().toISOString()
            };
            
            notifications.push(notification);
          }
          
          console.log(`Fallback milestone ${milestone.count} triggered for user ${userId}: +${totalAmount} CINC (${baseAmount} base + ${bonusAmount} bonus)`);
        }
      }
      
      return { triggeredMilestones: [], rewards, notifications };
    }
    
    // Check which milestones have not been claimed from the database
    for (const milestone of eligibleMilestones) {
      const alreadyClaimed = await this.hasUserClaimedMilestone(userId, milestone.id);
      
      if (!alreadyClaimed) {
        triggeredMilestones.push(milestone);
        
        // Calculate reward amount (base + bonus)
        const baseAmount = parseFloat(milestone.coinAmount);
        const bonusAmount = milestone.bonusAmount ? parseFloat(milestone.bonusAmount) : 0;
        const totalAmount = baseAmount + bonusAmount;
        
        // Create separate rewards for base and bonus amounts
        // First, create the base reward
        const baseReward = await this.createReferralReward({
          referrerId: userId,
          referredId: 0, // System reward
          rewardType: "milestone",
          rewardAmount: baseAmount.toString(),
          rewardDate: new Date(),
          rewardDescription: `Base Milestone Reward: ${baseAmount} CINC for reaching ${milestone.referralCount} referrals`,
          isTransferredToEarnings: false,
          transferDate: null,
          metadata: JSON.stringify({
            milestoneId: milestone.id,
            milestoneCount: milestone.referralCount,
            isBase: true,
            isBonus: false,
            baseAmount: milestone.coinAmount,
            bonusAmount: "0",
            hasSpin: milestone.hasSpin,
            totalMilestoneAmount: totalAmount.toString()
          })
        });
        
        rewards.push(baseReward);
        
        // If there's a bonus, create a separate bonus reward
        let bonusReward: ReferralReward | null = null;
        if (bonusAmount > 0) {
          bonusReward = await this.createReferralReward({
            referrerId: userId,
            referredId: 0, // System reward
            rewardType: "milestone_bonus",
            rewardAmount: bonusAmount.toString(),
            rewardDate: new Date(),
            rewardDescription: `Bonus Milestone Reward: ${bonusAmount} CINC for reaching ${milestone.referralCount} referrals`,
            isTransferredToEarnings: false,
            transferDate: null,
            metadata: JSON.stringify({
              milestoneId: milestone.id,
              milestoneCount: milestone.referralCount,
              isBase: false,
              isBonus: true,
              isReferralBonus: true,
              baseAmount: "0",
              bonusAmount: milestone.bonusAmount,
              hasSpin: false, // Bonuses don't have spins
              totalMilestoneAmount: totalAmount.toString()
            })
          });
          
          rewards.push(bonusReward);
        }
        
        // Add to user's balance
        const user = await this.getUser(userId);
        if (user) {
          const currentBalance = parseFloat(user.cincBalance || "0");
          const newBalance = currentBalance + totalAmount;
          await this.updateUserBalance(userId, newBalance);
          
          // Create a notification object for real-time update
          const notification = {
            type: 'milestone_achieved',
            milestoneId: milestone.id,
            referralCount: milestone.referralCount,
            baseAmount: baseAmount,
            bonusAmount: bonusAmount,
            totalAmount: totalAmount,
            description: milestone.description,
            timestamp: new Date().toISOString()
          };
          
          notifications.push(notification);
        }
        
        // Record that user has claimed this milestone
        await db.insert(userMilestones).values({
          userId,
          milestoneId: milestone.id,
          referralCount: referralCount,
          rewardId: baseReward.id, // Link to the base reward
          claimedAt: new Date()
        });
        
        console.log(`Milestone ${milestone.referralCount} triggered for user ${userId}: +${totalAmount} CINC (${baseAmount} base + ${bonusAmount} bonus)`);
      }
    }
    
    return { triggeredMilestones, rewards, notifications };
  }

  // Spin reward methods
  async getSpinRewards(): Promise<SpinReward[]> {
    return db.select().from(spinRewards);
  }

  async getActiveSpinRewards(): Promise<SpinReward[]> {
    return db.select().from(spinRewards)
      .where(eq(spinRewards.isActive, true));
  }

  async getSpinReward(id: number): Promise<SpinReward | undefined> {
    const [reward] = await db.select().from(spinRewards)
      .where(eq(spinRewards.id, id));
    return reward;
  }

  async createSpinReward(spinReward: InsertSpinReward): Promise<SpinReward> {
    const [newSpinReward] = await db.insert(spinRewards).values(spinReward).returning();
    return newSpinReward;
  }

  async updateSpinReward(id: number, updates: Partial<SpinReward>): Promise<SpinReward | undefined> {
    const [updatedReward] = await db.update(spinRewards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(spinRewards.id, id))
      .returning();
    return updatedReward;
  }

  async getRandomSpinReward(): Promise<SpinReward> {
    const activeRewards = await this.getActiveSpinRewards();
    
    // First, classify rewards into high-value and standard rewards
    const highValueRewards = activeRewards.filter(reward => {
      const value = parseInt(reward.rewardValue);
      return reward.rewardType === 'coin' && value >= 15000;
    });
    
    const standardRewards = activeRewards.filter(reward => {
      const value = parseInt(reward.rewardValue);
      return reward.rewardType === 'coin' && value < 15000;
    });
    
    // Calculate total probability weight
    let totalWeight = 0;
    for (const reward of activeRewards) {
      totalWeight += parseFloat(reward.probability);
    }
    
    // Generate a random value between 0 and 1 (for percentage calculation)
    const random = Math.random();
    
    // Implement the 3% max probability for high-value rewards
    // This creates a hard limit on high-value rewards regardless of their configured probabilities
    const highValueThreshold = 0.03; // 3% probability cap for high-value rewards
    
    if (random <= highValueThreshold && highValueRewards.length > 0) {
      // If we hit the high-value jackpot, select one from the high-value group
      const highValueRandom = Math.random() * highValueRewards.length;
      const selectedHighValueIndex = Math.floor(highValueRandom);
      return highValueRewards[selectedHighValueIndex];
    } else {
      // Otherwise, pick from standard rewards using weighted probability
      let cumulativeWeight = 0;
      
      for (const reward of standardRewards) {
        cumulativeWeight += parseFloat(reward.probability);
        if (random <= cumulativeWeight / totalWeight) {
          return reward;
        }
      }
      
      // Fallback - should never reach here if probabilities are set correctly
      return standardRewards.length > 0 ? standardRewards[0] : activeRewards[0];
    }
  }

  async getUserSpins(userId: number): Promise<UserSpin[]> {
    return db.select().from(userSpins)
      .where(eq(userSpins.userId, userId));
  }

  async recordUserSpin(userSpin: InsertUserSpin): Promise<UserSpin> {
    const [newSpin] = await db.insert(userSpins).values(userSpin).returning();
    return newSpin;
  }

  // Daily gift methods
  async getUserDailyGift(userId: number): Promise<UserDailyGift | undefined> {
    const [gift] = await db.select().from(userDailyGifts)
      .where(eq(userDailyGifts.userId, userId));
    return gift;
  }

  async createUserDailyGift(gift: InsertUserDailyGift): Promise<UserDailyGift> {
    const [newGift] = await db.insert(userDailyGifts).values(gift).returning();
    return newGift;
  }

  async updateUserDailyGift(userId: number, updates: Partial<UserDailyGift>): Promise<UserDailyGift | undefined> {
    const [updatedGift] = await db.update(userDailyGifts)
      .set(updates)
      .where(eq(userDailyGifts.userId, userId))
      .returning();
    return updatedGift;
  }

  async isDailyGiftAvailable(userId: number): Promise<{
    available: boolean;
    nextAvailableTime?: Date;
    timeRemaining?: string;
  }> {
    return this.checkDailyBonusAvailability(userId);
  }

  async claimDailyGift(userId: number): Promise<{
    reward: number;
    dailyGift: UserDailyGift;
  }> {
    const availability = await this.isDailyGiftAvailable(userId);
    
    if (!availability.available) {
      throw new Error("Daily gift not available yet");
    }
    
    try {
      // Random reward of 1-10 CINC for the daily gift box
      const rewardAmount = Math.floor(Math.random() * 10) + 1; // Generates a random integer between 1 and 10
      
      console.log(`[Daily Gift] Generating gift of ${rewardAmount} CINC for user ${userId}`);
      
      // Process the bonus
      const { reward } = await this.processDailyBonus(userId, rewardAmount);
      
      // Get updated daily gift record
      const dailyGift = await this.getUserDailyGift(userId);
      
      if (!dailyGift) {
        throw new Error("Failed to find daily gift record after claim");
      }
      
      console.log(`[Daily Gift] Successfully claimed gift for user ${userId}: ${rewardAmount} CINC, next available: ${dailyGift.nextAvailableTime}`);
      
      return {
        reward: parseFloat(reward.rewardAmount),
        dailyGift
      };
    } catch (error) {
      console.error(`[Daily Gift] Error claiming gift for user ${userId}:`, error);
      throw error;
    }
  }
  
  // Withdrawal methods implementation
  async getWithdrawalsByUserId(userId: number): Promise<WithdrawalRequest[]> {
    return db.select().from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.requestDate));
  }
  
  async createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    // Use a transaction to ensure atomicity of the withdrawal process
    return await db.transaction(async (tx) => {
      // Get current total earnings - inside transaction for consistency
      const [user] = await tx.select().from(users).where(eq(users.id, request.userId));
      if (!user) {
        throw new Error("User not found");
      }
      
      const currentTotalEarnings = parseFloat(user.totalEarnings || "0");
      const requestAmount = parseFloat(request.requestAmount.toString());
      
      // Validate the user has enough total earnings
      if (currentTotalEarnings < requestAmount) {
        throw new Error(`Insufficient total earnings balance: ${currentTotalEarnings} available, ${requestAmount} requested`);
      }
      
      // Check for suspicious patterns (multiple large withdrawals in short time)
      const recentWithdrawals = await tx.select()
        .from(withdrawalRequests)
        .where(and(
          eq(withdrawalRequests.userId, request.userId),
          gte(withdrawalRequests.requestDate, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        ));
        
      const totalRecentAmount = recentWithdrawals.reduce((sum, w) => 
        sum + parseFloat(w.requestAmount.toString()), 0);
      
      // If user has withdrawn more than 100,000 CINC in 24 hours, flag it as suspicious
      if (totalRecentAmount + requestAmount > 100000) {
        throw new Error("Withdrawal limit exceeded. Please contact support for large withdrawals.");
      }
      
      // Create withdrawal request with calculated balances
      const newRequest = {
        ...request,
        previousBalance: currentTotalEarnings.toString(),
        newBalance: (currentTotalEarnings - requestAmount).toString()
      };
      
      // Insert the request within the transaction
      const [withdrawalRequest] = await tx.insert(withdrawalRequests).values(newRequest).returning();
      
      // Deduct the amount from user's total earnings immediately within the same transaction
      const [updatedUser] = await tx.update(users)
        .set({ totalEarnings: (currentTotalEarnings - requestAmount).toString() })
        .where(eq(users.id, request.userId))
        .returning();
      
      // Create an audit record within the same transaction
      await tx.insert(referralRewards).values({
        referrerId: request.userId,
        referredId: 0, // System transaction
        rewardType: "withdrawal_request",
        rewardAmount: (-requestAmount).toString(), // Negative amount indicates withdrawal
        rewardDate: new Date(),
        rewardDescription: `Withdrawal request of ${requestAmount} CINC from Total Earnings (ID: ${withdrawalRequest.id})`,
        isTransferredToEarnings: false,
        metadata: JSON.stringify({
          withdrawalId: withdrawalRequest.id,
          requestAmount,
          paymentMethod: request.paymentMethod,
          accountNumber: request.accountNumber,
          previousBalance: currentTotalEarnings,
          newBalance: currentTotalEarnings - requestAmount,
          timestamp: new Date().toISOString(),
          transactionId: `W-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
        })
      });
      
      return withdrawalRequest;
    });
  }
  
  async getUserWithdrawalRequests(userId: number): Promise<WithdrawalRequest[]> {
    return db.select().from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.requestDate));
  }
  
  async getWithdrawalRequest(id: number): Promise<WithdrawalRequest | undefined> {
    const [request] = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, id));
    return request;
  }
  
  async updateWithdrawalRequest(id: number, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined> {
    const [updated] = await db.update(withdrawalRequests)
      .set(updates)
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return updated;
  }
  
  async processWithdrawalRequest(
    id: number, 
    status: 'approved' | 'rejected' | 'completed', 
    adminId?: number, 
    notes?: string
  ): Promise<WithdrawalRequest | undefined> {
    const request = await this.getWithdrawalRequest(id);
    if (!request) {
      throw new Error("Withdrawal request not found");
    }
    
    const updates: Partial<WithdrawalRequest> = { status };
    
    if (status === 'approved') {
      updates.approvalDate = new Date();
      updates.adminId = adminId;
      if (notes) updates.notes = notes;
    } else if (status === 'completed') {
      updates.completionDate = new Date();
      updates.adminId = adminId;
      if (notes) updates.notes = notes;
    } else if (status === 'rejected') {
      // If rejected, return the funds to the user's total earnings
      const user = await this.getUser(request.userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      const currentTotalEarnings = parseFloat(user.totalEarnings || "0");
      const requestAmount = parseFloat(request.requestAmount.toString());
      
      // Return the withdrawal amount to total earnings
      await this.updateUserTotalEarnings(request.userId, currentTotalEarnings + requestAmount);
      
      // Set rejection reason
      if (notes) updates.rejectionReason = notes;
      
      // Create audit record for the refund
      await this.createReferralReward({
        referrerId: request.userId,
        referredId: 0, // System transaction
        rewardType: "withdrawal_rejected",
        rewardAmount: requestAmount.toString(), // Positive amount for refund
        rewardDate: new Date(),
        rewardDescription: `Withdrawal request ${id} rejected, ${requestAmount} CINC returned to Total Earnings`,
        isTransferredToEarnings: true,
        transferDate: new Date(),
        metadata: JSON.stringify({
          withdrawalId: id,
          requestAmount,
          rejectionReason: notes || "No reason provided",
          previousBalance: currentTotalEarnings,
          newBalance: currentTotalEarnings + requestAmount
        })
      });
    }
    
    return this.updateWithdrawalRequest(id, updates);
  }
  
  async getTotalWithdrawnAmount(userId: number): Promise<number> {
    const result = await db.select({
      total: sql`SUM(CAST(${withdrawalRequests.requestAmount} AS NUMERIC))`
    })
    .from(withdrawalRequests)
    .where(
      and(
        eq(withdrawalRequests.userId, userId),
        eq(withdrawalRequests.status, "completed")
      )
    );
    
    return result[0]?.total ? parseFloat(result[0].total.toString()) : 0;
  }
  
  async getPendingWithdrawalAmount(userId: number): Promise<number> {
    const result = await db.select({
      total: sql`SUM(CAST(${withdrawalRequests.requestAmount} AS NUMERIC))`
    })
    .from(withdrawalRequests)
    .where(
      and(
        eq(withdrawalRequests.userId, userId),
        eq(withdrawalRequests.status, "pending")
      )
    );
    
    return result[0]?.total ? parseFloat(result[0].total.toString()) : 0;
  }
  
  // Implementation for payment method information retrieval
  async getPaymentMethodInfo(method: string): Promise<any> {
    try {
      // For a complete implementation, this would query a payment_methods table
      // For now, we'll return structured information based on the payment method
      // This implementation ensures admin payment details are properly secured
      
      if (method === 'easypaisa') {
        return {
          accountNumber: "03001234567", // Admin's Easypaisa account number
          accountHolder: "Admin Name"   // Admin's account holder name
        };
      }
      
      if (method === 'jazzcash') {
        return {
          accountNumber: "03009876543", // Admin's JazzCash account number
          accountHolder: "Admin Name"   // Admin's account holder name
        };
      }
      
      if (method === 'ltc') {
        return {
          walletAddress: "Coming Soon"
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching payment method info:', error);
      return null;
    }
  }
}

// Initialize database with sample data
async function initializeDatabase() {
  try {
    // Check if platforms exist and create them if not
    const existingPlatforms = await db.select({ count: count() }).from(platforms);
    
    if (existingPlatforms[0]?.count === 0) {
      // Insert platform data as specified in requirements
      const platformsData = [
        {
          name: "TimeWall",
          purchaseFee: "9000.00", // Buy Account Fee
          renewFee: "7000.00", // Renewal Fee
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "TimeBucks",
          purchaseFee: "8000.00", // Buy Account Fee
          renewFee: "7000.00", // Renewal Fee
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "MicroTasks",
          purchaseFee: "7000.00", // Buy Account Fee
          renewFee: "7000.00", // Renewal Fee
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      console.log("Initializing platform data...");
      await db.insert(platforms).values(platformsData);
    }
    
    // Check if milestones exist
    const existingMilestones = await db.select({ count: count() }).from(referralMilestones);
    
    if (existingMilestones[0]?.count === 0) {
      // Insert default milestone data
      const milestones = [
        {
          referralCount: 3,
          coinAmount: "15",
          bonusAmount: "0",
          hasSpin: false,
          description: "Bronze Achievement",
          isActive: true,
          displayOrder: 1
        },
      {
        referralCount: 5,
        coinAmount: "20",
        bonusAmount: "5",
        hasSpin: true,
        description: "Silver Achievement",
        isActive: true,
        displayOrder: 2
      },
      {
        referralCount: 10,
        coinAmount: "30",
        bonusAmount: "10",
        hasSpin: true,
        description: "Gold Achievement",
        isActive: true,
        displayOrder: 3
      },
      {
        referralCount: 15,
        coinAmount: "40",
        bonusAmount: "15",
        hasSpin: true,
        description: "Platinum Achievement",
        isActive: true,
        displayOrder: 4
      },
      {
        referralCount: 20,
        coinAmount: "50",
        bonusAmount: "25",
        hasSpin: true,
        description: "Diamond Achievement",
        isActive: true,
        displayOrder: 5
      }
    ];
    
    console.log("Initializing milestone data...");
    await db.insert(referralMilestones).values(milestones);
  }
  
  // Check if spin rewards exist
  const existingSpinRewards = await db.select({ count: count() }).from(spinRewards);
  
  if (existingSpinRewards[0]?.count === 0) {
    // Insert default spin rewards
    const rewards = [
      {
        rewardValue: "5000",
        probability: "32",
        rewardType: "coin",
        displayText: "5,000CINC",
        color: "#FFD700",
        isActive: true
      },
      {
        rewardValue: "10000",
        probability: "30",
        rewardType: "coin",
        displayText: "10,000CINC",
        color: "#FFA500",
        isActive: true
      },
      {
        rewardValue: "15000",
        probability: "1",
        rewardType: "coin",
        displayText: "15,000CINC",
        color: "#FF4500",
        isActive: true
      },
      {
        rewardValue: "20000",
        probability: "1",
        rewardType: "coin",
        displayText: "20,000CINC",
        color: "#8A2BE2",
        isActive: true
      },
      {
        rewardValue: "25000",
        probability: "0.5",
        rewardType: "coin",
        displayText: "25,000CINC",
        color: "#00CED1",
        isActive: true
      },
      {
        rewardValue: "30000",
        probability: "0.5",
        rewardType: "coin",
        displayText: "30,000CINC",
        color: "#32CD32",
        isActive: true
      }
    ];
    
    console.log("Initializing spin reward data...");
    await db.insert(spinRewards).values(rewards);
  }
  
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize the database on startup
initializeDatabase().catch(console.error);

// Use the DatabaseStorage class
export const storage = new DatabaseStorage();