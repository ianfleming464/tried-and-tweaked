-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "amountText" TEXT,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "unit" DROP NOT NULL;
