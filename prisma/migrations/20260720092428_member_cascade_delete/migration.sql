-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" DATETIME,
    "courtId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "Reservation_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("cancelledAt", "courtId", "createdAt", "date", "hour", "id", "memberId", "status") SELECT "cancelledAt", "courtId", "createdAt", "date", "hour", "id", "memberId", "status" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE INDEX "Reservation_date_courtId_idx" ON "Reservation"("date", "courtId");
CREATE INDEX "Reservation_memberId_date_idx" ON "Reservation"("memberId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
