-- CreateEnum
CREATE TYPE "BookStat" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'LOANED', 'RESERVED');

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bornOn" DATE NOT NULL,
    "diedOn" DATE NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,
    "genId" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookInstance" (
    "id" SERIAL NOT NULL,
    "book" TEXT NOT NULL,
    "imprint" TEXT NOT NULL,
    "status" "BookStat" NOT NULL DEFAULT E'MAINTENANCE',
    "due" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_authId_key" ON "Book"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_genId_key" ON "Book"("genId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_genId_fkey" FOREIGN KEY ("genId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
