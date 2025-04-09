-- CreateTable
CREATE TABLE "profile_shares" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_shares_share_token_key" ON "profile_shares"("share_token");

-- AddForeignKey
ALTER TABLE "profile_shares" ADD CONSTRAINT "profile_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
