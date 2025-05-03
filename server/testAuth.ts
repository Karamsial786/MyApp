import { User } from '@shared/schema';

/**
 * Check if credentials match the OWNERS3 account
 * This function now only supports the OWNERS3 account
 * 
 * @param usernameOrEmail The username or email
 * @param password The password
 * @returns The user if credentials match OWNERS3, otherwise undefined
 */
export function authenticateTestAccount(
  usernameOrEmail: string, 
  password: string
): User | undefined {
  // Only support the OWNERS3 account
  if (usernameOrEmail === 'OWNERS3' && password === 'Zia/Karam/Abdul/@owners3') {
    return {
      id: 7, // Actual database ID from PostgreSQL
      username: 'OWNERS3',
      firstName: 'Owner',
      lastName: 'Account',
      email: 'owner@example.com',
      password: 'Zia/Karam/Abdul/@owners3',
      referralCode: 'OWNERS3',
      referredBy: null,
      isVerified: true,
      verificationCode: null,
      verificationExpiry: null,
      createdAt: new Date(),
      cincBalance: '5000',
      totalEarnings: '0', // Fixed as requested - should be 0 since no real earnings
      isReferralActive: true,
      lastActivity: new Date(),
      nextRewardDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      referralRewardClaimed: true,
      monthlyEstimate: "0",
      lastTransactionId: null,
      lastTransactionTimestamp: null,
      lastTransactionType: null,
      lastTransactionAmount: null
    } as User;
  }

  return undefined;
}

/**
 * Get owner account by username
 * This function now only supports the OWNERS3 account
 * 
 * @param username The username to lookup
 * @returns The user if username is OWNERS3, otherwise undefined
 */
export function getTestAccountByUsername(username: string): User | undefined {
  // Only support the OWNERS3 account
  if (username === 'OWNERS3') {
    return {
      id: 7, // Actual database ID from PostgreSQL
      username: 'OWNERS3',
      firstName: 'Owner',
      lastName: 'Account',
      email: 'owner@example.com',
      password: 'Zia/Karam/Abdul/@owners3',
      referralCode: 'OWNERS3',
      referredBy: null,
      isVerified: true,
      verificationCode: null,
      verificationExpiry: null,
      createdAt: new Date(),
      cincBalance: '5000',
      totalEarnings: '0', // Fixed as requested - should be 0 since no real earnings
      isReferralActive: true,
      lastActivity: new Date(),
      nextRewardDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      referralRewardClaimed: true,
      monthlyEstimate: "0",
      lastTransactionId: null,
      lastTransactionTimestamp: null,
      lastTransactionType: null,
      lastTransactionAmount: null
    } as User;
  }

  return undefined;
}