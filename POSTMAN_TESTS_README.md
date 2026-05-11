# Medication Administration - Postman Tests

## How to Use

### 1. Import the Collection
- Open **Postman**
- Click **File** → **Import**
- Select `postman_medication_administration.json`
- Click **Import**

### 2. Environment Setup
The collection uses **environment variables** that are automatically set:
- `token` - JWT authentication token
- `caseId` - Emergency case ID
- `medicationId` - Medication prescription ID
- `userId` - Current user ID

### 3. Test Flow

Run the requests in order:

#### **Request 1: Login (Get Token)**
```
POST http://localhost:3000/api/v1/auth/login
Body: {
  "email": "nurse@careflow.com",
  "password": "NursePass123!"
}
```
✅ Automatically saves `token` and `userId` from response

#### **Request 2: Create Emergency Case**
```
POST http://localhost:3000/api/v1/cases
Authorization: Bearer {{token}}
Body: {
  "patientId": "patient-uuid-here",
  "description": "Emergency case for medication test"
}
```
✅ Automatically saves `caseId` from response

#### **Request 3: Prescribe Medication**
```
POST http://localhost:3000/api/v1/doctors/prescribe
Authorization: Bearer {{token}}
Body: {
  "caseId": "{{caseId}}",
  "name": "Aspirin",
  "dosage": "500mg",
  "frequency": "twice daily"
}
```
✅ Automatically saves `medicationId` from response

#### **Request 4: Administer Medication** ✅ (Main Test)
```
POST http://localhost:3000/api/v1/nurses/medications/administrations
Authorization: Bearer {{token}}
Body: {
  "caseId": "{{caseId}}",
  "medicationId": "{{medicationId}}"
}
```
**Expected Response (200 OK):**
```json
{
  "message": "Medication administration recorded",
  "data": {
    "caseId": "uuid",
    "medicationId": "uuid",
    "administeredBy": "nurseId",
    "administeredAt": "2025-05-04"
  }
}
```

**Tests Include:**
- ✅ Status code is 200
- ✅ Response has correct structure
- ✅ Data contains required fields (caseId, medicationId, administeredBy, administeredAt)
- ✅ administeredBy is a valid UUID
- ✅ administeredAt is in YYYY-MM-DD format

#### **Request 5: Error Test - Non-existent Case**
```
POST http://localhost:3000/api/v1/nurses/medications/administrations
Authorization: Bearer {{token}}
Body: {
  "caseId": "invalid-case-id",
  "medicationId": "invalid-med-id"
}
```
**Expected:** 404 Not Found

#### **Request 6: Error Test - Medication Not Found**
```
POST http://localhost:3000/api/v1/nurses/medications/administrations
Authorization: Bearer {{token}}
Body: {
  "caseId": "{{caseId}}",
  "medicationId": "00000000-0000-0000-0000-000000000000"
}
```
**Expected:** 404 Not Found

#### **Request 7: Error Test - Missing Authorization**
```
POST http://localhost:3000/api/v1/nurses/medications/administrations
Body: {
  "caseId": "{{caseId}}",
  "medicationId": "{{medicationId}}"
}
(No Authorization header)
```
**Expected:** 401 Unauthorized

---

## Quick Start (Run All Tests)

1. **Start your server:** `npm run start:dev`
2. **Open Postman**
3. **Import** the JSON collection
4. **Select** the collection
5. **Click** Run Collection (⏯️ button)
6. **Watch** tests execute automatically

---

## API Specification

### Endpoint: Administer Prescribed Medication

**Method:** `POST`

**Path:** `/api/v1/nurses/medications/administrations`

**Description:** Records that a nurse has administered a previously prescribed medication to the patient.

**Authentication:** Required (JWT Bearer Token)

**Who Uses It:** Nurse

**Request Body:**
```json
{
  "caseId": "uuid",
  "medicationId": "uuid"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Medication administration recorded",
  "data": {
    "caseId": "uuid",
    "medicationId": "uuid",
    "administeredBy": "nurseId",
    "administeredAt": "2025-05-04"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Case not found"
}
```

**Notes:**
- The `medicationId` in the request body refers to the specific prescription record ID created by the Doctor
- The `administeredAt` date is automatically set to the current date
- Only nurses can access this endpoint
- Date format is `YYYY-MM-DD`

---

## Notes

- The `token` expires after **24 hours**
- Environment variables reset when you refresh the environment
- Tests automatically fail if status codes don't match expectations
- Change credentials in Request 1 if you use different credentials
- Change patient ID in Request 2 with actual data from your database
