import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  onboardingProgress: defineTable({
    userId: v.id("users"),
    step: v.string(),
    status: v.string(),
    riskLevel: v.optional(v.string()),
    verificationAttempts: v.optional(v.number()),
    kycData: v.optional(v.object({
      firstName: v.string(),
      lastName: v.string(),
      dateOfBirth: v.string(),
      address: v.string(),
      documentType: v.string(),
      documentNumber: v.string(),
      nationality: v.optional(v.string()),
      phoneNumber: v.optional(v.string())
    })),
    walletAddress: v.optional(v.string()),
    recoveryEmail: v.optional(v.string()),
    backupCodes: v.optional(v.array(v.string())),
    lastUpdated: v.optional(v.number())
  }).index("by_user", ["userId"]),

  wallets: defineTable({
    userId: v.id("users"),
    address: v.string(),
    balance: v.number(),
    currency: v.string()
  }).index("by_user", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    timestamp: v.number(),
    description: v.optional(v.string())
  }).index("by_user_and_time", ["userId", "timestamp"]),

  securitySettings: defineTable({
    userId: v.id("users"),
    twoFactorEnabled: v.boolean(),
    lastPasswordChange: v.optional(v.number()),
    loginNotifications: v.boolean(),
    tradingLimit: v.optional(v.number())
  }).index("by_user", ["userId"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
