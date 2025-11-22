-- Create migration for subscription fields
-- Run: npx prisma migrate dev --name add_stripe_subscription_fields

-- This migration adds subscription tracking to the User model for Stripe integration

ALTER TABLE "User" ADD COLUMN "subscription" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionStartDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX "User_subscription_idx" ON "User"("subscription");
