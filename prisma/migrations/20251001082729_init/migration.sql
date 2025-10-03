-- AlterTable
ALTER TABLE "public"."VPSServer" ALTER COLUMN "status" SET DEFAULT true;

-- CreateTable
CREATE TABLE "public"."VPSGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VPSGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VPSGroupServer" (
    "vpsGroupId" TEXT NOT NULL,
    "vpsServerId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "VPSGroupServer_pkey" PRIMARY KEY ("vpsGroupId","vpsServerId")
);

-- AddForeignKey
ALTER TABLE "public"."VPSGroupServer" ADD CONSTRAINT "VPSGroupServer_vpsGroupId_fkey" FOREIGN KEY ("vpsGroupId") REFERENCES "public"."VPSGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VPSGroupServer" ADD CONSTRAINT "VPSGroupServer_vpsServerId_fkey" FOREIGN KEY ("vpsServerId") REFERENCES "public"."VPSServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
