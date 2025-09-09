-- CreateTable
CREATE TABLE "public"."Token" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_accessToken_key" ON "public"."Token"("accessToken");
