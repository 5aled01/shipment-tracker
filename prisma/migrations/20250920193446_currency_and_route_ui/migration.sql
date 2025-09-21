/*
  Warnings:

  - You are about to drop the column `price` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `billingAddr` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddr` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "price",
ADD COLUMN     "priceAED" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "priceMRU" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "billingAddr",
DROP COLUMN "customerEmail",
DROP COLUMN "shippingAddr",
ADD COLUMN     "customerPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromCountry" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "toCountry" TEXT NOT NULL DEFAULT 'Unknown';
