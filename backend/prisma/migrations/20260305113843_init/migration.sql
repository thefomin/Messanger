-- CreateTable
CREATE TABLE "MessageKey" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "encryptedKey" TEXT NOT NULL,

    CONSTRAINT "MessageKey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageKey" ADD CONSTRAINT "MessageKey_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageKey" ADD CONSTRAINT "MessageKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
