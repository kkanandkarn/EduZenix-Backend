/*
  Warnings:

  - A unique constraint covering the columns `[roleName,tenantId,status]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Roles_roleName_tenantId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Roles_roleName_tenantId_status_key" ON "Roles"("roleName", "tenantId", "status");
