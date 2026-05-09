# CareFlow Smart ED - API Testing Guide

## ✅ Successfully Tested
- Admin login with credentials
- Create multiple staff accounts (DOCTOR, NURSE, RECEPTIONIST, ADMIN)
- Staff login with temporary password
- Forced password change on first login
- Login with new permanent password

---

## 🔐 Admin Credentials (Created in Database)

```
Email: admin@careflow.com
Password: AdminPass123!
```

---

## 📋 API Workflow

### 1. Admin Login
```powershell
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@careflow.com",
  "password": "AdminPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "2f3c9a86-4bb2-4af4-a0fb-3a3b8e4f5a11",
      "email": "admin@careflow.com",
      "displayName": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

The backend now sets HTTP-only auth cookies on login and refresh. The frontend should send requests with credentials enabled so the browser attaches the session automatically. Admin users should not paste Bearer tokens manually during normal use.

---

### 2. Create a New Staff User Account
**Method:** `POST /api/v1/admin/users`  
**Description:** Creates a new staff user account with the specified role. Patients are created via quick registration, so this endpoint is for staff only.  
**Who uses it:** `ADMIN` only

**Request Body (JSON):**
```json
{
  "displayName": "Dr. Sara Ahmed",
  "email": "sara.ahmed@careflow.com",
  "password": "SecurePass123!",
  "dateOfBirth": "2000-01-15",
  "gender": "FEMALE",
  "role": "DOCTOR",
  "specialization": "Cardiology"
}
```

**Conditional Fields:**
- If `role = DOCTOR`, include `specialization`
- If `role = NURSE`, include `department`
- If `role = RECEPTIONIST` or `ADMIN`, no additional fields are required

**Allowed Roles:** `ADMIN | DOCTOR | NURSE | RECEPTIONIST`  
**Allowed Gender:** `MALE | FEMALE`

**Authentication Note:** The admin only needs to log in once. After login, the browser stores the auth cookies and automatically sends them with protected requests when credentials are enabled. For manual API testing, you can still use the returned token in an `Authorization` header if needed, but the dashboard should not require that.

#### Create DOCTOR User
```powershell
POST http://localhost:3000/api/v1/admin/users
Content-Type: application/json

{
  "displayName": "Dr. Sara Ahmed",
  "email": "sara.ahmed@careflow.com",
  "password": "TempPass123!",
  "dateOfBirth": "2000-01-15",
  "gender": "FEMALE",
  "role": "DOCTOR",
  "specialization": "Cardiology"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cmoxxz75a0002cbzhsdc02fmf",
    "email": "sara.ahmed@careflow.com",
    "displayName": "Dr. Sara Ahmed",
    "role": "DOCTOR",
    "mustChangePassword": true,
    "createdAt": "2026-05-09T06:07:19.534Z",
    "updatedAt": "2026-05-09T06:07:19.534Z",
    "message": "Staff user created successfully. User must change password on first login."
  }
}
```

---

### 3. Create NURSE User
```powershell
POST http://localhost:3000/api/v1/admin/users
Content-Type: application/json

{
  "displayName": "Nurse Fatima",
  "email": "fatima.nurse@careflow.com",
  "password": "TempPass123!",
  "dateOfBirth": "1995-05-20",
  "gender": "FEMALE",
  "role": "NURSE",
  "department": "Emergency"
}
```

---

### 4. Create RECEPTIONIST User
```powershell
POST http://localhost:3000/api/v1/admin/users
Content-Type: application/json

{
  "displayName": "Receptionist John",
  "email": "john.receptionist@careflow.com",
  "password": "TempPass123!",
  "dateOfBirth": "1990-03-10",
  "gender": "MALE",
  "role": "RECEPTIONIST"
}
```

---

### 5. Staff Login (with initial password)
```powershell
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "sara.ahmed@careflow.com",
  "password": "TempPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "cmoxxz75a0002cbzhsdc02fmf",
      "email": "sara.ahmed@careflow.com",
      "displayName": "Dr. Sara Ahmed",
      "role": "DOCTOR"
    }
  }
}
```

---

### 6. Change Password (FORCED on first login)
```powershell
PATCH http://localhost:3000/api/v1/auth/update-password
Authorization: Bearer {STAFF_TOKEN}
Content-Type: application/json

{
  "currentPassword": "TempPass123!",
  "newPassword": "MySecurePass123!",
  "confirmPassword": "MySecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

---

### 7. Login with New Password
```powershell
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "sara.ahmed@careflow.com",
  "password": "MySecurePass123!"
}
```

---

## 🛡️ Security Features Implemented

✅ **JWT Authentication**
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day rotation
- HTTP-only auth cookies for browser sessions
- Bearer token fallback for manual API clients

✅ **Role-Based Access Control**
- Admin role required for staff creation
- 401 error if token missing
- 403 error if insufficient permissions

✅ **Password Management (MVP)**
- Argon2 password hashing
- Initial passwords set by admin
- Forced password change on first login (mustChangePassword=true)
- Admin password reset capability

---

## ⚠️ Common Errors & Solutions

### Error: 401 "Token not found"
**Cause:** Browser did not send the auth cookie or the request was made without credentials enabled
**Solution:** Make sure the frontend sends requests with credentials enabled, or include the bearer token once when testing manually

### Error: 401 "Invalid token"
**Cause:** Token expired (15 minutes) or malformed
**Solution:** Login again to get new token or use refresh endpoint

### Error: 403 "Insufficient permissions"
**Cause:** User doesn't have ADMIN role
**Solution:** Only ADMIN users can create staff via /api/v1/admin/users

### Error: 409 "Email already exists"
**Cause:** User with email already exists
**Solution:** Use different email address

---

## 🎯 Created Staff Accounts

✅ **Doctor**
- Email: sara.ahmed@careflow.com
- Role: DOCTOR
- Initial Password: TempPass123!

✅ **Nurse**
- Email: fatima.nurse@careflow.com
- Role: NURSE
- Initial Password: TempPass123!

✅ **Receptionist**
- Email: john.receptionist@careflow.com
- Role: RECEPTIONIST
- Initial Password: TempPass123!

✅ **Manager**
- Email: manager@careflow.com
- Role: ADMIN
- Initial Password: TempPass123!

---

## 📚 Available Endpoints

### Auth Endpoints (No token required)
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Auth Endpoints (Token required)
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get profile
- `POST /api/v1/auth/revoke` - Revoke token
- `PATCH /api/v1/auth/update-password` - Change password

### Admin Endpoints (Admin token required)
- `POST /api/v1/admin/users` - Create staff
- `GET /api/v1/admin/users` - List all users
- `PATCH /api/v1/admin/users/:userId/reset-password` - Reset password
- `GET /api/v1/admin/audit-logs` - View audit logs

---

## 🚀 Next Steps

1. ✅ Test endpoints via Swagger at http://localhost:3000/api
2. ✅ Create more staff accounts as needed
3. ✅ Integrate with frontend application
4. ⏳ Implement patient registration (future)
5. ⏳ Implement case management (future)
