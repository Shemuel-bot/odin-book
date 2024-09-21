-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_username_fkey";

-- DropIndex
DROP INDEX "Post_username_key";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "profile" TEXT;
