import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getSecuritySettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
# Added comment
    if (!userId) return null;

    const settings = await ctx.db
      .query("securitySettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    return settings;
  },
});

export const updateSecuritySettings = mutation({
  args: {
    twoFactorEnabled: v.boolean(),
    loginNotifications: v.boolean(),
    tradingLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const settings = await ctx.db
      .query("securitySettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (settings) {
      await ctx.db.patch(settings._id, args);
    } else {
      await ctx.db.insert("securitySettings", {
        userId,
        ...args
      });
    }
  },
});
