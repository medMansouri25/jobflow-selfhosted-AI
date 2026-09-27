/*
  Warnings:

  - You are about to drop the column `coverLetter` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `cvLabel` on the `Application` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AttachmentKind" AS ENUM ('CV', 'COVER_LETTER');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "coverLetter",
DROP COLUMN "cvLabel";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "kind" "AttachmentKind" NOT NULL,
    "fileKey" VARCHAR(256) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_fileKey_key" ON "Attachment"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_applicationId_kind_key" ON "Attachment"("applicationId", "kind");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
