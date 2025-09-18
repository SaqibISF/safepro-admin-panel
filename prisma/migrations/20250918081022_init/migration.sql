-- CreateTable
CREATE TABLE "public"."VPSServer" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "privateKey" TEXT,
    "password" TEXT,
    "port" INTEGER NOT NULL DEFAULT 22,
    "domain" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "bandwidth" BIGINT,
    "ramLimit" BIGINT,
    "cpuLimit" BIGINT,
    "diskLimit" BIGINT,
    "bandWidthLimitPerSecond" BIGINT,
    "healthScore" DOUBLE PRECISION,
    "cpuUsage" DOUBLE PRECISION,
    "ramUsage" DOUBLE PRECISION,
    "diskUsage" DOUBLE PRECISION,
    "totalMBitPerSecond" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VPSServer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VPSServer_ipAddress_key" ON "public"."VPSServer"("ipAddress");
