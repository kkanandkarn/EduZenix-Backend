-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL', 'WHATS_APP', 'SMS');

-- CreateTable
CREATE TABLE "Otp" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "otpReason" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "otpType" "OtpType" NOT NULL,
    "otpIdentifier" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "otpData" JSONB,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);
