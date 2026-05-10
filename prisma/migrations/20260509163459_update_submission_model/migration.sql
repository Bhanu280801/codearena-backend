/*
  Warnings:

  - You are about to drop the column `code` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `memory` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceCode` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verdict` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "code",
ADD COLUMN     "memory" TEXT NOT NULL,
ADD COLUMN     "sourceCode" TEXT NOT NULL,
ADD COLUMN     "verdict" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';
