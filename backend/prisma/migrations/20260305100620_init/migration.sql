/*
  Warnings:

  - You are about to drop the column `content` on the `messages` table. All the data in the column will be lost.
  - Added the required column `ciphertext` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedKey` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "content",
ADD COLUMN     "ciphertext" TEXT NOT NULL,
ADD COLUMN     "encryptedKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "publicKey" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
