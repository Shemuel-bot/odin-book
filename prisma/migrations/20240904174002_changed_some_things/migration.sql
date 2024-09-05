/*
  Warnings:

  - Added the required column `img` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "img" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
