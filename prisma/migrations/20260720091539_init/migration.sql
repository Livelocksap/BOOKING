-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "planta" TEXT NOT NULL,
    "puerta" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SOCIO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" DATETIME,
    "courtId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "Reservation_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_username_key" ON "Member"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Court_name_key" ON "Court"("name");

-- CreateIndex
CREATE INDEX "Reservation_date_courtId_idx" ON "Reservation"("date", "courtId");

-- CreateIndex
CREATE INDEX "Reservation_memberId_date_idx" ON "Reservation"("memberId", "date");
