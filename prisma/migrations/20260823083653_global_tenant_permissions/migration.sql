-- CreateTable
CREATE TABLE "GlobalTenantPermissions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "tenantId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "GlobalTenantPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GlobalTenantPermissions_tenantId_idx" ON "GlobalTenantPermissions"("tenantId");

-- CreateIndex
CREATE INDEX "GlobalTenantPermissions_tenantId_permissionId_idx" ON "GlobalTenantPermissions"("tenantId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalTenantPermissions_tenantId_permissionId_key" ON "GlobalTenantPermissions"("tenantId", "permissionId");

-- AddForeignKey
ALTER TABLE "GlobalTenantPermissions" ADD CONSTRAINT "GlobalTenantPermissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalTenantPermissions" ADD CONSTRAINT "GlobalTenantPermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "GlobalPermissionMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalTenantPermissions" ADD CONSTRAINT "GlobalTenantPermissions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalTenantPermissions" ADD CONSTRAINT "GlobalTenantPermissions_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
