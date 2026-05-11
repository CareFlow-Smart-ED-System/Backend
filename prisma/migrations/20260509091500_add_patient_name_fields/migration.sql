-- Add first and last name fields to Patient
ALTER TABLE "Patient"
ADD COLUMN IF NOT EXISTS "firstName" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS "lastName" TEXT NOT NULL DEFAULT 'Unknown';
