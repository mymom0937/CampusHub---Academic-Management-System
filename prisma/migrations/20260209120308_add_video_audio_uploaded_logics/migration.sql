-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('TEXT', 'VIDEO', 'AUDIO');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "mediaType" "MediaType",
ADD COLUMN     "mediaUrl" TEXT;
