-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT', 'RECEPTIONIST');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('Active', 'Resolved', 'Transferred');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('Pending', 'Paid', 'Sent_to_Insurance');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "patient_id" TEXT NOT NULL,
    "user_id" TEXT,
    "firstName" TEXT NOT NULL DEFAULT 'Unknown',
    "lastName" TEXT NOT NULL DEFAULT 'Unknown',
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "doctor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "Nurse" (
    "nurse_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Nurse_pkey" PRIMARY KEY ("nurse_id")
);

-- CreateTable
CREATE TABLE "EmergencyCase" (
    "case_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'Active',
    "arrival_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyCase_pkey" PRIMARY KEY ("case_id")
);

-- CreateTable
CREATE TABLE "Triage" (
    "triage_id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "triage_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nurse_id" TEXT NOT NULL,

    CONSTRAINT "Triage_pkey" PRIMARY KEY ("triage_id")
);

-- CreateTable
CREATE TABLE "CaseDoctor" (
    "id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "CaseDoctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VitalSigns" (
    "id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "blood_pressure" TEXT NOT NULL,
    "heart_rate" INTEGER NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VitalSigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "notes" TEXT,
    "chronic_diseases" TEXT,
    "family_history" TEXT,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingReport" (
    "id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImagingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurseNote" (
    "id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NurseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "case_id" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billing" (
    "bill_id" SERIAL NOT NULL,
    "case_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("bill_id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "appointment_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_user_id_key" ON "Patient"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_user_id_key" ON "Doctor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Nurse_user_id_key" ON "Nurse"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Triage_case_id_key" ON "Triage"("case_id");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_case_id_key" ON "MedicalRecord"("case_id");

-- CreateIndex
CREATE UNIQUE INDEX "Billing_case_id_key" ON "Billing"("case_id");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nurse" ADD CONSTRAINT "Nurse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCase" ADD CONSTRAINT "EmergencyCase_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Triage" ADD CONSTRAINT "Triage_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Triage" ADD CONSTRAINT "Triage_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "Nurse"("nurse_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDoctor" ADD CONSTRAINT "CaseDoctor_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDoctor" ADD CONSTRAINT "CaseDoctor_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSigns" ADD CONSTRAINT "VitalSigns_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSigns" ADD CONSTRAINT "VitalSigns_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "Nurse"("nurse_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingReport" ADD CONSTRAINT "ImagingReport_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseNote" ADD CONSTRAINT "NurseNote_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseNote" ADD CONSTRAINT "NurseNote_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "Nurse"("nurse_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "EmergencyCase"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;
