-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('REALIZADO', 'PREVISTO');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isFuture" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'REALIZADO';
