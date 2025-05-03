import { db } from "./db";
import { sql } from "drizzle-orm";
import { type User, type InsertUser } from "@shared/schema";
import type { IStorage } from "./storage";

/**
 * The OWNERS3 account is the only guaranteed account
 */
export const OWNER_ACCOUNT = {
  username: "OWNERS3",
  firstName: "Owner",
  lastName: "Account",
  email: "owner@example.com",
  password: "Zia/Karam/Abdul/@owners3",
  referralCode: "OWNERS3",
  cincBalance: "5000",
  totalEarnings: "0", // Fixed - should be 0 since user has no real earnings
  isReferralActive: true,
};

/**
 * Note: This function is retained for compatibility but has been disabled.
 * All test account creation has been removed.
 */
export async function ensureTestAccountsExist(storage: IStorage): Promise<void> {
  console.log("Test account creation has been disabled.");
  return;
}