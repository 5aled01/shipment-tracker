/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `phoneE164` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Customer_phoneE164_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "createdAt",
DROP COLUMN "email",
ALTER COLUMN "phoneE164" SET NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "sku";

-- AlterTable
ALTER TABLE "TrackingEvent" ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "User";
