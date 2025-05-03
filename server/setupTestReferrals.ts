import { db } from "./db";
import { sql } from "drizzle-orm";
import { 
  users, 
  referralRelationships, 
  ipAccounts,
  platforms
} from "@shared/schema";
import type { IStorage } from "./storage";
import { eq, and } from "drizzle-orm";

// Helper to create a test user
async function createTestUser(
  storage: IStorage, 
  username: string, 
  firstName: string, 
  lastName: string, 
  referredBy: string | null = null
): Promise<number> {
  // Check if user already exists
  const existingUser = await storage.getUserByUsername(username);
  if (existingUser) {
    console.log(`Test user ${username} already exists with ID ${existingUser.id}`);
    return existingUser.id;
  }

  // Create the user if it doesn't exist
  const user = await storage.createUser({
    username,
    firstName,
    lastName,
    email: `${username.toLowerCase()}@example.com`,
    password: "1", // Simple password for all test users
    referralCode: username.toUpperCase(),
    referredBy,
    verificationCode: null,
    isVerified: true,
    verificationExpiry: null,
    cincBalance: "0",
    totalEarnings: "0",
    isReferralActive: true,
    lastActivity: new Date(),
    nextRewardDate: new Date(),
    referralRewardClaimed: false
  });

  console.log(`Created test user ${username} with ID ${user.id}`);
  return user.id;
}

// Create referral relationship with specified status
async function createReferralWithStatus(
  storage: IStorage,
  referrerId: number,
  referredId: number,
  status: 'Active' | 'Grace Period' | 'Inactive' | 'Pending',
  daysRemaining: number = 15
): Promise<void> {
  const now = new Date();
  let activationDate = null;
  let isActive = false;
  let isInactive = false;
  let nextRewardDate = null;
  let gracePeriodEnds = null;
  let lastActiveDate = null;
  let isPendingRenewal = false;
  let lastRenewalDate = null;
  
  // Set dates and status flags based on requested status
  if (status === 'Active') {
    activationDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    isActive = true;
    lastActiveDate = now;
    nextRewardDate = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    gracePeriodEnds = new Date(now.getTime() + (daysRemaining + 6) * 24 * 60 * 60 * 1000);
    lastRenewalDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
  } 
  else if (status === 'Grace Period') {
    activationDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    isActive = true;
    lastActiveDate = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000); // 32 days ago
    nextRewardDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    gracePeriodEnds = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    isPendingRenewal = true;
    lastRenewalDate = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000); // 32 days ago
  }
  else if (status === 'Inactive') {
    activationDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    isActive = false;
    isInactive = true;
    lastActiveDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    nextRewardDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
    gracePeriodEnds = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000); // 9 days ago
    lastRenewalDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
  }
  else if (status === 'Pending') {
    // Pending referrals have no activation date
    activationDate = null;
    isActive = false;
    lastActiveDate = null;
  }

  // Create referral relationship
  await storage.createReferralRelationship({
    referrerId,
    referredId,
    referralDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    isActive,
    hasBeenRewarded: status !== 'Pending',
    activationDate,
    lastRenewalDate,
    nextRewardDate,
    gracePeriodEnds,
    isInactive,
    lastActiveDate,
    isPendingRenewal,
    renewalWarningCount: status === 'Grace Period' ? 1 : 0,
    lastWarningDate: status === 'Grace Period' ? new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) : null
  });

  console.log(`Created ${status} referral from user ${referrerId} to user ${referredId}`);
}

// Create an IP account for the user with specified status
async function createIpAccountWithStatus(
  storage: IStorage,
  userId: number,
  platformId: number,
  isActive: boolean,
  renewalFee: number = 7000
): Promise<void> {
  const now = new Date();
  const expiryDate = isActive 
    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days in future
    : new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
  
  // Get platform details
  const platforms = await storage.getPlatforms();
  const platform = platforms.find(p => p.id === platformId);

  // Create IP account
  await storage.createIpAccount({
    userId,
    platformId,
    platform: platform?.name || 'TestPlatform',
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    port: "8080",
    username: `user${userId}`,
    password: "testpass",
    expiryDate,
    status: isActive ? "active" : "inactive",
    notes: isActive ? "Test active account" : "Test inactive account",
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    updatedAt: now
  });

  console.log(`Created ${isActive ? 'active' : 'inactive'} IP account for user ${userId}`);
}

// Main function to set up test referrals is now permanently disabled 
export async function setupTestReferrals(storage: IStorage): Promise<void> {
  // This functionality has been permanently disabled as requested
  console.log("Test referrals functionality has been permanently disabled.");
  return;
}