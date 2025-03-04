/*
  Warnings:

  - You are about to drop the `investors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `startups` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "investors" DROP CONSTRAINT "investors_user_id_fkey";

-- DropForeignKey
ALTER TABLE "startups" DROP CONSTRAINT "startups_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET NOT NULL;

-- DropTable
DROP TABLE "investors";

-- DropTable
DROP TABLE "startups";
