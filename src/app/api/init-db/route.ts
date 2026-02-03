import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // This is a raw SQL hack to emulate "db push" roughly for the User/Account tables
    // needed for NextAuth login. It's better than nothing if CLI is blocked.
    
    // User Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "role" TEXT NOT NULL DEFAULT 'user',
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    // Account Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
    `);

    // Session Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
    `);

    // Verification Token
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
    `);

    // Project Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT NOT NULL,
        "titleEn" TEXT NOT NULL,
        "titleEs" TEXT NOT NULL,
        "shortDescEn" TEXT NOT NULL,
        "shortDescEs" TEXT NOT NULL,
        "fullDescEn" TEXT NOT NULL,
        "fullDescEs" TEXT NOT NULL,
        "year" TEXT NOT NULL,
        "technologies" TEXT NOT NULL,
        "imageUrl" TEXT,
        "bannerUrl" TEXT,
        "videoUrl" TEXT,
        "liveUrl" TEXT,
        "codeUrl" TEXT,
        "tagsEn" TEXT NOT NULL,
        "tagsEs" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
      );
    `);

    // Publication Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Publication" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "citationApa" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "lang" TEXT NOT NULL,
        "tagsEn" TEXT NOT NULL,
        "tagsEs" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
      );
    `);

    // Skill Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Skill" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "icon" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
      );
    `);

    return NextResponse.json({ success: true, message: "Tables created successfully" });
  } catch (error: any) {
    console.error("Init DB Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
