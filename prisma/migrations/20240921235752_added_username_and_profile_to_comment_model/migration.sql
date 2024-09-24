-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_username_fkey";

-- DropIndex
DROP INDEX "Comment_username_key";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "profile" TEXT;
