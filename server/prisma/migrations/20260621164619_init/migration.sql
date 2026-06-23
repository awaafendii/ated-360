-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRODUCTEUR', 'PARTENAIRE');

-- CreateEnum
CREATE TYPE "Zone" AS ENUM ('CONAKRY', 'KINDIA', 'BOKE', 'MAMOU', 'LABE', 'FARANAH', 'KANKAN', 'NZEREKORE');

-- CreateEnum
CREATE TYPE "FarmType" AS ENUM ('AVICOLE', 'AGRICOLE', 'MIXTE');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('ALIMENTATION', 'VACCINATION', 'TRAITEMENT', 'RENDEMENT');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('URGENT', 'NORMAL', 'INFO');

-- CreateEnum
CREATE TYPE "AlertKind" AS ENUM ('VACCIN', 'CLIMAT', 'TRAITEMENT');

-- CreateEnum
CREATE TYPE "DroneStatus" AS ENUM ('DEMANDE_ENVOYEE', 'PLANIFIE', 'REALISE', 'RAPPORT_PRET', 'ANNULE');

-- CreateEnum
CREATE TYPE "DronePack" AS ENUM ('SURVOL', 'SANTE', 'COMPLET');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PRODUCTEUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "zone" "Zone" NOT NULL,
    "farmType" "FarmType" NOT NULL DEFAULT 'MIXTE',
    "poultryCount" INTEGER NOT NULL DEFAULT 0,
    "hectares" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "type" "RecordType" NOT NULL,
    "farmType" "FarmType" NOT NULL,
    "detail" TEXT NOT NULL,
    "quantity" TEXT,
    "zone" "Zone" NOT NULL,
    "details" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "priority" "AlertPriority" NOT NULL,
    "kind" "AlertKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drone_missions" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "pack" "DronePack" NOT NULL,
    "parcelle" TEXT NOT NULL,
    "culture" TEXT NOT NULL,
    "hectares" DOUBLE PRECISION,
    "zone" "Zone" NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "note" TEXT,
    "status" "DroneStatus" NOT NULL DEFAULT 'DEMANDE_ENVOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drone_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drone_reports" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "ndvi" DOUBLE PRECISION NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "waterStress" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "mapUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drone_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_snapshots" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "global" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "farmType" "FarmType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "producers_userId_key" ON "producers"("userId");

-- CreateIndex
CREATE INDEX "records_producerId_type_idx" ON "records"("producerId", "type");

-- CreateIndex
CREATE INDEX "records_producerId_occurredAt_idx" ON "records"("producerId", "occurredAt");

-- CreateIndex
CREATE INDEX "alerts_producerId_resolved_idx" ON "alerts"("producerId", "resolved");

-- CreateIndex
CREATE INDEX "drone_missions_producerId_status_idx" ON "drone_missions"("producerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "drone_reports_missionId_key" ON "drone_reports"("missionId");

-- CreateIndex
CREATE INDEX "score_snapshots_producerId_createdAt_idx" ON "score_snapshots"("producerId", "createdAt");

-- AddForeignKey
ALTER TABLE "producers" ADD CONSTRAINT "producers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drone_missions" ADD CONSTRAINT "drone_missions_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drone_reports" ADD CONSTRAINT "drone_reports_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "drone_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_snapshots" ADD CONSTRAINT "score_snapshots_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
