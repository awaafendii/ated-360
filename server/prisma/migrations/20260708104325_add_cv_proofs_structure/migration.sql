-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('PHOTO', 'VIDEO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "producers" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "annualRevenue" TEXT,
ADD COLUMN     "challenges" TEXT,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "investedAmount" TEXT,
ADD COLUMN     "legalStatus" TEXT,
ADD COLUMN     "outlook" TEXT,
ADD COLUMN     "startYear" INTEGER,
ADD COLUMN     "womenEmployed" INTEGER,
ADD COLUMN     "youthEmployed" INTEGER;

-- CreateTable
CREATE TABLE "proofs" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "type" "ProofType" NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proofs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proofs_producerId_idx" ON "proofs"("producerId");

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
