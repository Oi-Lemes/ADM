/*
  Warnings:

  - You are about to drop the column `senha` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[magicLinkToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Aula" ADD COLUMN     "contentUrl" TEXT;

-- AlterTable
ALTER TABLE "Modulo" ADD COLUMN     "contentUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "senha",
ADD COLUMN     "magicLinkToken" TEXT,
ADD COLUMN     "magicLinkTokenExpires" TIMESTAMP(3),
ADD COLUMN     "nome" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_magicLinkToken_key" ON "User"("magicLinkToken");
