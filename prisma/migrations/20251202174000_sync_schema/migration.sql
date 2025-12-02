-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'OTHER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "minStockThreshold" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "stockQuantity" INTEGER NOT NULL DEFAULT 0;
