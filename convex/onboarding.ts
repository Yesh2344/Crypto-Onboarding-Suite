import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getCurrentStep = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    return progress;
  },
});

export const initializeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (!existing) {
      await ctx.db.insert("onboardingProgress", {
        userId,
        step: "kyc",
        status: "pending",
        verificationAttempts: 0,
        lastUpdated: Date.now()
      });
    }
  },
});

export const submitKYC = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    address: v.string(),
    documentType: v.string(),
    documentNumber: v.string(),
    nationality: v.string(),
    phoneNumber: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!progress) throw new Error("Onboarding not initialized");

    // Simple risk assessment based on provided data
    const age = new Date().getFullYear() - new Date(args.dateOfBirth).getFullYear();
    const riskLevel = age < 25 ? "high" : age < 35 ? "medium" : "low";

    await ctx.db.patch(progress._id, {
      kycData: args,
      step: "verification",
      status: "verification_pending",
      riskLevel,
      lastUpdated: Date.now()
    });
  },
});

export const verifyDocuments = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!progress) throw new Error("Onboarding not initialized");

    // Simulate verification delay and random success/failure
    const isVerified = Math.random() > 0.3;
    const attempts = (progress.verificationAttempts ?? 0) + 1;

    if (isVerified) {
      await ctx.db.patch(progress._id, {
        step: "wallet",
        status: "kyc_completed",
        verificationAttempts: attempts,
        lastUpdated: Date.now()
      });
    } else {
      await ctx.db.patch(progress._id, {
        status: "verification_failed",
        verificationAttempts: attempts,
        lastUpdated: Date.now()
      });
    }

    return isVerified;
  }
});

export const connectWallet = mutation({
  args: {
    address: v.string(),
    recoveryEmail: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!progress) throw new Error("Onboarding not initialized");

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    await ctx.db.patch(progress._id, {
      walletAddress: args.address,
      recoveryEmail: args.recoveryEmail,
      backupCodes,
      step: "complete",
      status: "completed",
      lastUpdated: Date.now()
    });

    // Initialize wallet and security settings
    await ctx.db.insert("wallets", {
      userId,
      address: args.address,
      balance: 1000, // Starting balance for demo
      currency: "USDT"
    });

    await ctx.db.insert("securitySettings", {
      userId,
      twoFactorEnabled: false,
      loginNotifications: false,
      tradingLimit: 10000
    });

    return backupCodes;
  },
});
