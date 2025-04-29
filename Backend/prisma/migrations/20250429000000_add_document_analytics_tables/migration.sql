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

-- AddForeignKey
ALTER TABLE "document_views" ADD CONSTRAINT "document_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_downloads" ADD CONSTRAINT "document_downloads_downloader_id_fkey" FOREIGN KEY ("downloader_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
