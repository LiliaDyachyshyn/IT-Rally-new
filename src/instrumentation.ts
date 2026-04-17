export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("@/lib/prisma");

    const stmts = [
      `DO $$ BEGIN CREATE TYPE "EventStatus" AS ENUM ('DRAFT','PUBLISHED','ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE TYPE "SponsorTier" AS ENUM ('PLATINUM','GOLD','SILVER','GENERAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "shortDesc" TEXT,
        "location" TEXT NOT NULL,
        "address" TEXT,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "coverImage" TEXT,
        "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug")`,
      `CREATE TABLE IF NOT EXISTS "ScheduleItem" (
        "id" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "time" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "speaker" TEXT,
        "room" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE TABLE IF NOT EXISTS "Speaker" (
        "id" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "title" TEXT,
        "company" TEXT,
        "bio" TEXT,
        "photo" TEXT,
        "talkTitle" TEXT,
        "linkedinUrl" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE TABLE IF NOT EXISTS "Sponsor" (
        "id" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "logoUrl" TEXT,
        "websiteUrl" TEXT,
        "tier" "SponsorTier" NOT NULL DEFAULT 'GENERAL',
        CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE TABLE IF NOT EXISTS "AdminUser" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email")`,
      `DO $$ BEGIN ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    ];

    for (const sql of stmts) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (e) {
        console.error("[instrumentation] SQL failed:", e);
      }
    }

    // Seed admin user from env vars if none exists
    try {
      const bcrypt = await import("bcryptjs");
      const email = process.env.ADMIN_EMAIL ?? "admin@itrally.org";
      const password = process.env.ADMIN_PASSWORD ?? "changeme123";
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (!existing) {
        const hashed = await bcrypt.hash(password, 12);
        await prisma.adminUser.create({
          data: { email, password: hashed, name: "Admin" },
        });
        console.log("[instrumentation] Admin user created:", email);
      }
    } catch (e) {
      console.error("[instrumentation] Admin seed failed:", e);
    }
  }
}
