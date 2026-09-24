-- CreateEnum
CREATE TYPE "GlobalPermissionType" AS ENUM ('ADMIN', 'GENERAL');

-- AlterTable
ALTER TABLE "GlobalPermissionMaster" ADD COLUMN     "permissionType" "GlobalPermissionType" NOT NULL DEFAULT 'GENERAL';
