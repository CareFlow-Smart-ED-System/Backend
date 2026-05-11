CareFlow Smart Emergency Department System

CareFlow is a modular Emergency Department Management System designed to streamline emergency healthcare workflows including triage, case management, doctor assignment, medical investigations, medication administration, billing, and notifications.

The system implements secure role-based access control and preserves complete patient-care timelines to ensure traceability, scalability, and efficient emergency response management.

Features:

Emergency Department Workflow
1. Staff Authentication
Hospital staff members authenticate using secure JWT-based authentication.
Role-Based Access Control (RBAC) determines accessible modules and actions.
Supported roles include:
ADMIN
DOCTOR
NURSE
RECEPTIONIST
LAB_STAFF
RADIOLOGIST

2. Patient Registration
Receptionist or nurse performs quick patient registration during emergency intake.
A patient profile is created immediately to reduce waiting time in critical situations.
Existing patient accounts can later be linked to the emergency profile.

3. Emergency Case Creation
A new emergency case is created for the patient.
Each case receives:
unique case ID
arrival timestamp
initial status
priority tracking

4. Triage Assessment
Nurses perform triage evaluations to determine patient severity and urgency.
The system supports:
multiple triage assessments for the same case
complete triage history tracking
non-destructive updates
Important Design Feature

New triage assessments DO NOT overwrite previous assessments.

Instead:

every triage entry is stored independently
historical triage records remain preserved
the latest assessment is marked as the active/current triage state

This design provides:

medical traceability
auditability
chronological patient condition tracking

5. Queue Prioritization
Cases are dynamically ordered using:
severity level
triage urgency
arrival time
priority score
The emergency queue updates automatically as new assessments are added.

6. Doctor Assignment
Doctors are assigned to emergency cases.
Assigned doctors can:
review patient details
access medical records
prescribe medications
request investigations

7. Medical Records Management
Doctors create and update patient medical records.
Medical records include:
diagnosis
clinical notes
chronic diseases
family history
Records remain linked to the emergency case for continuity of care.

8. Medication Workflow
Doctors prescribe medications for patients.
Nurses administer medications and record administration events.
Medication administration history is preserved for tracking and auditing.

9. Laboratory Workflow
Doctors create laboratory investigation orders.
LAB_STAFF can:
upload PDF lab reports
attach investigation findings
publish results to the case timeline
Doctors and nurses can retrieve lab results directly from the case.

10. Imaging Workflow
Doctors create imaging requests.
RADIOLOGIST users upload:
imaging reports
PDF findings
Imaging reports become available within the patient case timeline.

11. Notifications System
Users receive real-time notifications for:
case assignments
uploaded investigation results
medication events
workflow updates
Notifications support:
read/unread state
mark single notification as read
mark all notifications as read

12. Billing Workflow
Completed emergency cases can generate billing records.
Receptionists and admins can:
create bills
update billing status
retrieve billing details
track unpaid cases

13. Audit Logging
Administrative and critical actions are logged.
Audit logs support:
accountability
security monitoring
operational traceability

14. Case Timeline

Each emergency case maintains a centralized timeline including:

triage events
doctor assignments
medications
investigations
notes
status changes

This provides a complete chronological view of patient care.

Tech Stack:
Backend
NestJS
TypeScript
Node.js
Database
PostgreSQL
Prisma ORM

Authentication:
JWT
Refresh Tokens
bcrypt

Real-Time Communication:
Socket.IO

Documentation:
Swagger / OpenAPI


System Architecture:

The backend is organized into modular services:

src/
│
├── auth/
├── patients/
├── cases/
├── triage/
├── queue/
├── doctors/
├── nurses/
├── admin/
├── notifications/
├── billing/
├── appointments/
├── websocket/
├── prisma/
└── common/

Main Modules:
Module	              Description
Authentication	      Login, JWT, password management
Patient Management	  Patient profiles and medical records
Emergency Cases	      Case lifecycle and workflow
Triage	Severity      classification and vitals
Queue Management	    Priority-based ER queue
Doctor Module	        Clinical access and medications
Nurse Module	        Vital signs and notes
Admin Module	        User management and audit logs
Notifications	        Real-time alerts
Billing	              Payments and insurance
Appointments	        Follow-up scheduling

Roles & Permissions:
Role	          Permissions
ADMIN	          Full system access
DOCTOR	    Assigned cases only
NURSE	Active    ER cases
RECEPTIONIST    Registration and billing
LAB_STAFF       uploading lab results ordered by dr
RADIOLOGIST     uplaoding image study report ordered by dr

Core Clinical Workflow:
Patient Arrival
      ↓
Quick Registration
      ↓
Emergency Case Creation
      ↓
Triage Assessment
      ↓
Queue Prioritization
      ↓
Doctor Assignment
      ↓
Treatment & Monitoring
      ↓
Case Completion
      ↓
Discharge Summary
      ↓
Billing & Follow-up Appointment

Real-Time Events

The system uses Socket.IO for real-time communication.

Main Events
Event	Description
queue.updated	Queue changes
notification.doctor_assigned	Doctor assigned to case
notification.critical_triage	Critical patient alert
notification.vitals_abnormal	Abnormal vitals
notification.new_prescription	Medication prescribed
notification.lab_ready	      Lab
notification.image_ready      imaging available

Security Features:
JWT Authentication
Refresh Token Rotation
Password Hashing
Role-Based Access Control
Case-Level Authorization
Immutable Audit Logs
Soft Delete Support

Design Highlights:
Realistic Emergency Room Workflow
Modular Scalable Architecture
Real-Time Clinical Communication
Timeline-Based Case Tracking
Role-Restricted Clinical Access
Audit Logging for Traceability

Team
Developed as a Software Engineering project for Emergency Department workflow management.
