/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `AdminUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "nom" TEXT,
ADD COLUMN     "role" TEXT DEFAULT 'admin',
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
