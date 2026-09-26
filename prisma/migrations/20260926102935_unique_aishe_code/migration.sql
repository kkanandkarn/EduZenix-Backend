/*
  Warnings:

  - A unique constraint covering the columns `[aisheCode]` on the table `CrmCollege` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aisheCode]` on the table `CrmOtherInstitution` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aisheCode]` on the table `CrmUniversity` will be added. If there are existing duplicate values, this will fail.
  - Made the column `aisheCode` on table `CrmCollege` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aisheCode` on table `CrmOtherInstitution` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aisheCode` on table `CrmUniversity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CrmCollege" ALTER COLUMN "aisheCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "CrmOtherInstitution" ALTER COLUMN "aisheCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "CrmUniversity" ALTER COLUMN "aisheCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CrmCollege_aisheCode_key" ON "CrmCollege"("aisheCode");

-- CreateIndex
CREATE UNIQUE INDEX "CrmOtherInstitution_aisheCode_key" ON "CrmOtherInstitution"("aisheCode");

-- CreateIndex
CREATE UNIQUE INDEX "CrmUniversity_aisheCode_key" ON "CrmUniversity"("aisheCode");
