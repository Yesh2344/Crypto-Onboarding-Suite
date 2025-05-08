import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getWalletBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    return wallet;
  },
});

export const getTransactionHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
    
    return transactions;
  },
});

export const simulateTrade = mutation({
  args: {
    type: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Simple trading simulation
    const newBalance = args.type === "buy" 
      ? wallet.balance + args.amount 
      : wallet.balance - args.amount;

    if (args.type === "sell" && newBalance < 0) {
      throw new Error("Insufficient balance");
    }

    await ctx.db.patch(wallet._id, {
      balance: newBalance
    });

    await ctx.db.insert("transactions", {
      userId,
      type: args.type,
      amount: args.amount,
      currency: args.currency,
      status: "completed",
      timestamp: Date.now(),
      description: `${args.type.toUpperCase()} ${args.amount} ${args.currency}`
    });

    return newBalance;
  },
});

export const initializeWallet = mutation({
  args: {
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) {
      await ctx.db.insert("wallets", {
        userId,
        address: args.address,
        balance: 1000, // Starting balance for demo
        currency: "USDT"
      });
    }
  },
});
