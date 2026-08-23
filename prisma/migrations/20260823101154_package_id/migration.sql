-- AddForeignKey
ALTER TABLE "Tenants" ADD CONSTRAINT "Tenants_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
