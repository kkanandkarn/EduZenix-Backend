/*
  Warnings:

  - Added the required column `tenantId` to the `Roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CrmCollegeStandAloneType" AS ENUM ('AFFILIATED_COLLEGE', 'CONSTITUENT_UNIVERSITY_COLLEGE', 'PG_CENTER_OFF_CAMPUS_CENTER', 'AUTONOMOUS_COLLEGE', 'RECOGNIZED_CENTER');

-- CreateEnum
CREATE TYPE "CrmCollegeManagement" AS ENUM ('STATE_GOVERNMENT', 'CENTRAL_GOVERNMENT', 'PRIVATE_UNAIDED', 'PRIVATE_AIDED_GOVERNMENT_AIDED', 'UNIVERSITY', 'LOCAL_BODY');

-- CreateEnum
CREATE TYPE "CrmUniversityType" AS ENUM ('CENTRAL_UNIVERSITY', 'STATE_PUBLIC_UNIVERSITY', 'DEEMED_UNIVERSITY_PRIVATE', 'INSTITUTE_UNDER_STATE_LEGISLATURE_ACT', 'INSTITUTE_OF_NATIONAL_IMPORTANCE', 'DEEMED_UNIVERSITY_GOVERNMENT_AIDED', 'DEEMED_UNIVERSITY_GOVERNMENT', 'STATE_PRIVATE_UNIVERSITY');

-- CreateEnum
CREATE TYPE "CrmOtherInstitutionStandAloneType" AS ENUM ('TECHNICAL_POLYTECHNIC', 'TEACHER_TRAINING', 'PARAMEDICAL', 'NURSING', 'INSTITUTES_UNDER_MINISTRIES', 'PGDM_INSTITUTES', 'INSTITUTIONS_UNDER_REHABILITATION_COUNCIL_OF_INDIA', 'HOTEL_MANAGEMENT_AND_CATERING', 'PHARMACY_INSTITUTIONS');

-- CreateEnum
CREATE TYPE "CrmOtherInstitutionManagement" AS ENUM ('CENTRAL_GOVERNMENT', 'PRIVATE_UNAIDED', 'STATE_GOVERNMENT', 'PRIVATE_AIDED_GOVERNMENT_AIDED', 'LOCAL_BODY', 'UNIVERSITY');

-- AlterTable
ALTER TABLE "CrmUniversity" ALTER COLUMN "isOnboarded" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Roles" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "tenantId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "CrmCollege" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "aisheCode" TEXT,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "website" TEXT,
    "yearOfEstablishment" INTEGER,
    "location" "InstitutionLocation",
    "standAloneType" "CrmCollegeStandAloneType",
    "management" "CrmCollegeManagement",
    "universityName" TEXT,
    "universityType" "CrmUniversityType",
    "pocName" TEXT,
    "pocEmail" TEXT,
    "pocContact" TEXT,
    "address" TEXT,
    "tenantId" UUID,
    "assignedTo" UUID,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "status" "CrmStatus" NOT NULL,
    "remarks" TEXT,
    "updatedBy" UUID,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CrmCollege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmOtherInstitution" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "aisheCode" TEXT,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "website" TEXT,
    "yearOfEstablishment" INTEGER,
    "location" "InstitutionLocation",
    "standAloneType" "CrmOtherInstitutionStandAloneType",
    "management" "CrmOtherInstitutionManagement",
    "pocName" TEXT,
    "pocEmail" TEXT,
    "pocContact" TEXT,
    "address" TEXT,
    "tenantId" UUID,
    "assignedTo" UUID,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "status" "CrmStatus" NOT NULL,
    "remarks" TEXT,
    "updatedBy" UUID,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CrmOtherInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmSchool" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "udiseCode" TEXT,
    "name" TEXT,
    "state" TEXT,
    "district" TEXT,
    "block" TEXT,
    "cluster" TEXT,
    "village" TEXT,
    "panchayat" TEXT,
    "location" "InstitutionLocation",
    "pocName" TEXT,
    "pocEmail" TEXT,
    "pocContact" TEXT,
    "address" TEXT,
    "tenantId" UUID,
    "assignedTo" UUID,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "status" "CrmStatus" NOT NULL,
    "remarks" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CrmSchool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Roles" ADD CONSTRAINT "Roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCollege" ADD CONSTRAINT "CrmCollege_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCollege" ADD CONSTRAINT "CrmCollege_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCollege" ADD CONSTRAINT "CrmCollege_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOtherInstitution" ADD CONSTRAINT "CrmOtherInstitution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOtherInstitution" ADD CONSTRAINT "CrmOtherInstitution_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOtherInstitution" ADD CONSTRAINT "CrmOtherInstitution_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmSchool" ADD CONSTRAINT "CrmSchool_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmSchool" ADD CONSTRAINT "CrmSchool_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmSchool" ADD CONSTRAINT "CrmSchool_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmSchool" ADD CONSTRAINT "CrmSchool_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
