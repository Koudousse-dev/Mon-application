/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AdminUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "createdAt",
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
