/*
  Warnings:

  - The values [SYSTEM] on the enum `RoleType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SYSTEM] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleType_new" AS ENUM ('ADMIN', 'GENERAL');
ALTER TABLE "public"."Roles" ALTER COLUMN "roleType" DROP DEFAULT;
ALTER TABLE "Roles" ALTER COLUMN "roleType" TYPE "RoleType_new" USING ("roleType"::text::"RoleType_new");
ALTER TYPE "RoleType" RENAME TO "RoleType_old";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";
DROP TYPE "public"."RoleType_old";
ALTER TABLE "Roles" ALTER COLUMN "roleType" SET DEFAULT 'GENERAL';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('ADMIN', 'GENERAL');
ALTER TABLE "public"."Users" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
ALTER TABLE "Users" ALTER COLUMN "userType" SET DEFAULT 'GENERAL';
COMMIT;

-- AlterTable
ALTER TABLE "Roles" ALTER COLUMN "roleType" SET DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "userType" SET DEFAULT 'GENERAL';
