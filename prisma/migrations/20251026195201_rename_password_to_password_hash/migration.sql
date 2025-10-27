/*
  Warnings:

  - You are about to drop the column `password` on the `AdminUser` table. All the data in the column will be lost.
  - Added the required column `password_hash` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "password",
ADD COLUMN     "password_hash" TEXT NOT NULL;
