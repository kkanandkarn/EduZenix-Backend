/*
  Warnings:

  - A unique constraint covering the columns `[tenantName]` on the table `Tenants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tenants_tenantName_key" ON "Tenants"("tenantName");
