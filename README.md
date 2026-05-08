CareFlow Backend API

CareFlow is a real-time Emergency Department Management System designed to streamline emergency room workflows, patient triage, doctor collaboration, billing, notifications, and follow-up appointments.

This backend provides a secure RESTful API with role-based access control (RBAC), real-time WebSocket notifications, and modular clinical workflow management.

Features:

Authentication & Authorization:
JWT Authentication
Refresh Token Rotation
Role-Based Access Control (RBAC)
Password Reset Flow
Session Revocation

Emergency Department Workflow:
Quick Emergency Patient Registration
Emergency Case Lifecycle Management
Triage Classification
Doctor Assignment
Clinical Notes & Vital Signs
Medication Prescription & Administration
Case Timeline Tracking
Discharge Summary Generation

Real-Time System:
WebSocket Notifications using Socket.IO
Critical Patient Alerts
Queue Updates
Lab & Imaging Notifications

Administrative Features:
Staff Management
Audit Logs
Billing & Insurance
Appointment Scheduling

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
DOCTOR	        Assigned cases only
NURSE	Active    ER cases
RECEPTIONIST	  Registration and billing
PATIENT	Limited self-access

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
notification.lab_ready	      Lab/imaging available

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
