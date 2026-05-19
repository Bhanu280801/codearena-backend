-- User roles for admin-only problem and contest management.
ALTER TABLE "User"
ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

-- Judge configuration and frontend visibility.
ALTER TABLE "Problem"
ADD COLUMN "timeLimitMs" INTEGER NOT NULL DEFAULT 2000,
ADD COLUMN "memoryLimitMb" INTEGER NOT NULL DEFAULT 128,
ADD COLUMN "executionMode" TEXT NOT NULL DEFAULT 'STDIN',
ADD COLUMN "functionName" TEXT,
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- Submission progress and diagnostics.
ALTER TABLE "Submission"
ADD COLUMN "passedTestCases" INTEGER,
ADD COLUMN "totalTestCases" INTEGER,
ADD COLUMN "errorMessage" TEXT;

CREATE TABLE "Contest" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Contest_slug_key" ON "Contest"("slug");

CREATE TABLE "ContestProblem" (
  "id" SERIAL NOT NULL,
  "contestId" INTEGER NOT NULL,
  "problemId" INTEGER NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 100,
  "order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "ContestProblem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContestProblem_contestId_problemId_key" ON "ContestProblem"("contestId", "problemId");

ALTER TABLE "ContestProblem"
ADD CONSTRAINT "ContestProblem_contestId_fkey"
FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContestProblem"
ADD CONSTRAINT "ContestProblem_problemId_fkey"
FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ContestParticipant" (
  "id" SERIAL NOT NULL,
  "contestId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ContestParticipant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContestParticipant_contestId_userId_key" ON "ContestParticipant"("contestId", "userId");

ALTER TABLE "ContestParticipant"
ADD CONSTRAINT "ContestParticipant_contestId_fkey"
FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContestParticipant"
ADD CONSTRAINT "ContestParticipant_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
