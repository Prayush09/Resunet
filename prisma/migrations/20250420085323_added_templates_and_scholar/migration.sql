-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "template" TEXT NOT NULL DEFAULT 'classic';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleScholarUrl" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "patentsToDisplay" INTEGER DEFAULT 3,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "roleLink" TEXT;

-- CreateTable
CREATE TABLE "Patent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "publicationDate" TEXT,
    "patentNumber" TEXT,
    "abstract" TEXT,
    "url" TEXT,
    "citations" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Patent" ADD CONSTRAINT "Patent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
