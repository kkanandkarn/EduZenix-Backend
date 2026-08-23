/*
  Warnings:

  - You are about to drop the column `roleKey` on the `Roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleName,tenantId]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Roles_roleKey_idx";

-- DropIndex
DROP INDEX "Roles_roleKey_key";

-- AlterTable
ALTER TABLE "Roles" DROP COLUMN "roleKey";

-- CreateIndex
CREATE INDEX "Roles_tenantId_idx" ON "Roles"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_roleName_tenantId_key" ON "Roles"("roleName", "tenantId");
