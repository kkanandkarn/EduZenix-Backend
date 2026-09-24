/*
  Warnings:

  - Added the required column `module` to the `GlobalPermissionMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GlobalPermissionMaster" ADD COLUMN     "module" TEXT NOT NULL;
