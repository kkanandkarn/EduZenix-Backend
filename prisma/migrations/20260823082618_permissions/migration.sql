-- AlterTable
ALTER TABLE "Roles" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tenants" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GlobalPermissionMaster" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "permissionName" TEXT NOT NULL,
    "parent" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL DEFAULT 'SYSTEM',
    "updatedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "GlobalPermissionMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalRolePermissions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "GlobalRolePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GlobalPermissionMaster_permissionName_parent_idx" ON "GlobalPermissionMaster"("permissionName", "parent");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalPermissionMaster_permissionName_parent_key" ON "GlobalPermissionMaster"("permissionName", "parent");

-- CreateIndex
CREATE INDEX "GlobalRolePermissions_roleId_idx" ON "GlobalRolePermissions"("roleId");

-- CreateIndex
CREATE INDEX "GlobalRolePermissions_roleId_permissionId_idx" ON "GlobalRolePermissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalRolePermissions_roleId_permissionId_key" ON "GlobalRolePermissions"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "GlobalRolePermissions" ADD CONSTRAINT "GlobalRolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalRolePermissions" ADD CONSTRAINT "GlobalRolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "GlobalPermissionMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalRolePermissions" ADD CONSTRAINT "GlobalRolePermissions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalRolePermissions" ADD CONSTRAINT "GlobalRolePermissions_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
