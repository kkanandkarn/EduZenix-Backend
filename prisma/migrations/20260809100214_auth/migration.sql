-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SYSTEM', 'GENERAL');

-- CreateEnum
CREATE TYPE "AuthStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED', 'HOLD', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('UNIVERSITY', 'COLLEGE', 'SCHOOL', 'OTHER_INSTITUTION');

-- CreateEnum
CREATE TYPE "InstitutionLocation" AS ENUM ('URBAN', 'RURAL');

-- CreateEnum
CREATE TYPE "CrmStatus" AS ENUM ('PENDING', 'UNDER_NEGOTIATION', 'REQUESTED_TO_ADMIN', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Tenants" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "tenantName" TEXT NOT NULL,
    "tenantType" "TenantType" NOT NULL,
    "pocName" TEXT,
    "pocEmail" TEXT,
    "pocContact" TEXT,
    "packageStatus" "PackageStatus" NOT NULL,
    "packageId" UUID,
    "packageStartAt" TIMESTAMP(3),
    "packageExpiredAt" TIMESTAMP(3),
    "status" "AuthStatus" NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Packages" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "packageName" TEXT NOT NULL,
    "packageData" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantsId" UUID,
    "usersId" UUID,

    CONSTRAINT "Packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "roleName" TEXT NOT NULL,
    "roleKey" TEXT,
    "roleDescription" TEXT,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "roleType" "RoleType" NOT NULL DEFAULT 'SYSTEM',
    "status" "AuthStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" UUID NOT NULL,
    "requireMfa" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaCompleted" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "status" "AuthStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" UUID,
    "updatedBy" UUID,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmUniversity" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "aisheCode" TEXT,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "website" TEXT,
    "yearOfEstablishment" INTEGER,
    "location" "InstitutionLocation",
    "pocName" TEXT,
    "pocEmail" TEXT,
    "pocContact" TEXT,
    "address" TEXT,
    "tenantId" UUID,
    "assignedTo" UUID,
    "isOnboarded" BOOLEAN NOT NULL,
    "status" "CrmStatus" NOT NULL,
    "remarks" TEXT,
    "updatedBy" UUID,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CrmUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_roleKey_key" ON "Roles"("roleKey");

-- CreateIndex
CREATE INDEX "Roles_roleKey_idx" ON "Roles"("roleKey");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Tenants" ADD CONSTRAINT "Tenants_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenants" ADD CONSTRAINT "Tenants_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packages" ADD CONSTRAINT "Packages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packages" ADD CONSTRAINT "Packages_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packages" ADD CONSTRAINT "Packages_tenantsId_fkey" FOREIGN KEY ("tenantsId") REFERENCES "Tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packages" ADD CONSTRAINT "Packages_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roles" ADD CONSTRAINT "Roles_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roles" ADD CONSTRAINT "Roles_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmUniversity" ADD CONSTRAINT "CrmUniversity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmUniversity" ADD CONSTRAINT "CrmUniversity_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmUniversity" ADD CONSTRAINT "CrmUniversity_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
