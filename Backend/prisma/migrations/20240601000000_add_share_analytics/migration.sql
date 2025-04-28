-- Add share_method column to profile_shares table
ALTER TABLE "profile_shares" ADD COLUMN "share_method" VARCHAR(50) DEFAULT 'email';

-- Create profile_share_analytics table
CREATE TABLE "profile_share_analytics" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "share_method" VARCHAR(50) NOT NULL,
    "recipient_count" INTEGER NOT NULL DEFAULT 1,
    "shared_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX "profile_share_analytics_user_id_idx" ON "profile_share_analytics"("user_id");
