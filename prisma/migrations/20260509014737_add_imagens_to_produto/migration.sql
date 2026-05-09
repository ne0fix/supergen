-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "imagens" TEXT[] DEFAULT ARRAY[]::TEXT[];
