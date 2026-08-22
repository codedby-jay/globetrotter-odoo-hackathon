-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SIGHTSEEING', 'FOOD', 'NATURE', 'CULTURE', 'ADVENTURE', 'SHOPPING', 'NIGHTLIFE', 'OTHER');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('TRANSPORT', 'STAY', 'ACTIVITY', 'MEALS', 'OTHER');

-- CreateEnum
CREATE TYPE "ShareEventType" AS ENUM ('VIEW', 'COPY', 'SHARE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "odooPartnerId" INTEGER,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedDestination" (
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "SavedDestination_pkey" PRIMARY KEY ("userId","cityId")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "region" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "costIndex" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "cityId" TEXT,
    "name" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "imageUrl" TEXT,
    "durationMin" INTEGER,
    "typicalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "coverPhotoUrl" TEXT,
    "budgetLimit" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "shareSlug" TEXT NOT NULL,
    "copiedFromId" TEXT,
    "odooExpenseId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "notes" TEXT,
    "stayCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transportCost" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StopActivity" (
    "id" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "activityId" TEXT,
    "customName" TEXT,
    "customDescription" TEXT,
    "scheduledDate" DATE NOT NULL,
    "startTime" TIME(0),
    "durationMin" INTEGER,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "costCategory" "CostCategory" NOT NULL DEFAULT 'ACTIVITY',
    "position" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "StopActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripExpense" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "stopId" TEXT,
    "category" "CostCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "incurredOn" DATE,

    CONSTRAINT "TripExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareEvent" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "event" "ShareEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "City_externalId_key" ON "City"("externalId");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "City_country_idx" ON "City"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_externalId_key" ON "Activity"("externalId");

-- CreateIndex
CREATE INDEX "Activity_cityId_idx" ON "Activity"("cityId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_shareSlug_key" ON "Trip"("shareSlug");

-- CreateIndex
CREATE INDEX "Trip_ownerId_idx" ON "Trip"("ownerId");

-- CreateIndex
CREATE INDEX "Stop_tripId_position_idx" ON "Stop"("tripId", "position");

-- CreateIndex
CREATE INDEX "StopActivity_stopId_scheduledDate_position_idx" ON "StopActivity"("stopId", "scheduledDate", "position");

-- CreateIndex
CREATE INDEX "TripExpense_tripId_idx" ON "TripExpense"("tripId");

-- CreateIndex
CREATE INDEX "ShareEvent_tripId_idx" ON "ShareEvent"("tripId");

-- AddForeignKey
ALTER TABLE "SavedDestination" ADD CONSTRAINT "SavedDestination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDestination" ADD CONSTRAINT "SavedDestination_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same-table integrity (cross-table date rules are enforced in the service layer)
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_endDate_gte_startDate" CHECK ("endDate" >= "startDate");
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_budgetLimit_non_negative" CHECK ("budgetLimit" IS NULL OR "budgetLimit" >= 0);

ALTER TABLE "Stop" ADD CONSTRAINT "Stop_endDate_gte_startDate" CHECK ("endDate" >= "startDate");
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_stayCost_non_negative" CHECK ("stayCost" >= 0);
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_transportCost_non_negative" CHECK ("transportCost" >= 0);
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_position_non_negative" CHECK ("position" >= 0);

ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_cost_non_negative" CHECK ("cost" >= 0);
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_position_non_negative" CHECK ("position" >= 0);
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_duration_non_negative" CHECK ("durationMin" IS NULL OR "durationMin" >= 0);

ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_amount_non_negative" CHECK ("amount" >= 0);

ALTER TABLE "Activity" ADD CONSTRAINT "Activity_typicalCost_non_negative" CHECK ("typicalCost" >= 0);
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_popularity_non_negative" CHECK ("popularity" >= 0);
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_duration_non_negative" CHECK ("durationMin" IS NULL OR "durationMin" >= 0);

ALTER TABLE "City" ADD CONSTRAINT "City_popularity_non_negative" CHECK ("popularity" >= 0);
ALTER TABLE "City" ADD CONSTRAINT "City_costIndex_non_negative" CHECK ("costIndex" >= 0);
