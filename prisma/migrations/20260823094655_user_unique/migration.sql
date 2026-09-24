/*
  Warnings:

  - A unique constraint covering the columns `[email,tenantId,status]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Users_email_status_key";

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_tenantId_status_key" ON "Users"("email", "tenantId", "status");
