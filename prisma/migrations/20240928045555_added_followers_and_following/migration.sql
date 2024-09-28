/*
  Warnings:

  - You are about to drop the `_friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followers" INTEGER[],
ADD COLUMN     "following" INTEGER[];

-- DropTable
DROP TABLE "_friends";
