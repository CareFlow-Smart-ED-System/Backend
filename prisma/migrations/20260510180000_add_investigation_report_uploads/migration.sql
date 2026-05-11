-- Add new staff roles to the UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'LAB_STAFF';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'RADIOLOGIST';

-- Add optional PDF metadata to LabResult
ALTER TABLE "LabResult"
  ADD COLUMN "reportFileUrl" TEXT,
  ADD COLUMN "reportFileName" TEXT,
  ADD COLUMN "uploadedBy" TEXT,
  ADD COLUMN "uploadedAt" TIMESTAMP(3);

-- Add optional PDF metadata to ImagingReport
ALTER TABLE "ImagingReport"
  ADD COLUMN "reportFileUrl" TEXT,
  ADD COLUMN "reportFileName" TEXT,
  ADD COLUMN "reportedBy" TEXT,
  ADD COLUMN "uploadedAt" TIMESTAMP(3);
