-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "oauth_provider" TEXT,
    "oauth_id" TEXT,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_shares" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "share_method" VARCHAR(50) DEFAULT 'email',

    CONSTRAINT "profile_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_share_analytics" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "share_method" VARCHAR(50) NOT NULL,
    "recipient_count" INTEGER NOT NULL DEFAULT 1,
    "shared_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_share_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_views" (
    "id" SERIAL NOT NULL,
    "document_id" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "viewer_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_downloads" (
    "id" SERIAL NOT NULL,
    "document_id" TEXT NOT NULL,
    "downloader_id" TEXT NOT NULL,
    "downloader_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "downloaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_analytics" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "document_views" INTEGER NOT NULL DEFAULT 0,
    "document_downloads" INTEGER NOT NULL DEFAULT 0,
    "profile_views" INTEGER NOT NULL DEFAULT 0,
    "profile_shares" INTEGER NOT NULL DEFAULT 0,
    "match_count" INTEGER NOT NULL DEFAULT 0,
    "avg_match_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_shares_share_token_key" ON "profile_shares"("share_token");

-- CreateIndex
CREATE INDEX "profile_share_analytics_user_id_idx" ON "profile_share_analytics"("user_id");

-- CreateIndex
CREATE INDEX "document_views_document_id_idx" ON "document_views"("document_id");

-- CreateIndex
CREATE INDEX "document_views_viewer_id_idx" ON "document_views"("viewer_id");

-- CreateIndex
CREATE INDEX "document_views_entity_id_idx" ON "document_views"("entity_id");

-- CreateIndex
CREATE INDEX "document_downloads_document_id_idx" ON "document_downloads"("document_id");

-- CreateIndex
CREATE INDEX "document_downloads_downloader_id_idx" ON "document_downloads"("downloader_id");

-- CreateIndex
CREATE INDEX "document_downloads_entity_id_idx" ON "document_downloads"("entity_id");

-- CreateIndex
CREATE INDEX "daily_analytics_user_id_idx" ON "daily_analytics"("user_id");

-- CreateIndex
CREATE INDEX "daily_analytics_date_idx" ON "daily_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_analytics_user_id_date_key" ON "daily_analytics"("user_id", "date");

-- AddForeignKey
ALTER TABLE "profile_shares" ADD CONSTRAINT "profile_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_share_analytics" ADD CONSTRAINT "profile_share_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_views" ADD CONSTRAINT "document_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_downloads" ADD CONSTRAINT "document_downloads_downloader_id_fkey" FOREIGN KEY ("downloader_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
