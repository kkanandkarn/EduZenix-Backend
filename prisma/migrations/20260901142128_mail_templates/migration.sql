-- AlterTable
ALTER TABLE "Constant" ALTER COLUMN "data" SET DATA TYPE JSONB;

-- CreateTable
CREATE TABLE "MailTemplates" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "MailTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMailTemplates" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TenantMailTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailTemplates_name_key" ON "MailTemplates"("name");

-- AddForeignKey
ALTER TABLE "TenantMailTemplates" ADD CONSTRAINT "TenantMailTemplates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
