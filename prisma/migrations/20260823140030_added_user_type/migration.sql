-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SYSTEM', 'GENERAL');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'SYSTEM';
