/*
  Warnings:

  - You are about to drop the column `contentUrl` on the `Modulo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Modulo" DROP COLUMN "contentUrl";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "senha" TEXT;
