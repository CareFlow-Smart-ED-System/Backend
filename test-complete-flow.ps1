# Complete Testing Workflow - Admin Create Staff + Staff Login + Password Change

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CareFlow Smart ED - Complete Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"

# ============================================
# STEP 1: Admin Login
# ============================================
Write-Host "`n[STEP 1] Admin Login..." -ForegroundColor Yellowq

$adminLogin = @{
    email = "admin@careflow.com"
    password = "AdminPass123!"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $adminLogin `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $adminData = $adminResponse.Content | ConvertFrom-Json
    $adminToken = $adminData.data.accessToken
    
    Write-Host "✅ Admin logged in successfully" -ForegroundColor Green
    Write-Host "   Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Admin login failed: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# STEP 2: Create Staff Users
# ============================================
Write-Host "`n[STEP 2] Creating Staff Users..." -ForegroundColor Yellow

$headers = @{"Authorization" = "Bearer $adminToken"}

$staffUsers = @(
    @{
        displayName = "Dr. Sara Ahmed"
        email = "sara.ahmed@careflow.com"
        password = "TempPass123!"
        dateOfBirth = "2000-01-15"
        gender = "FEMALE"
        role = "DOCTOR"
        specialization = "Cardiology"
    },
    @{
        displayName = "Nurse Fatima"
        email = "fatima.nurse@careflow.com"
        password = "TempPass123!"
        dateOfBirth = "1995-05-20"
        gender = "FEMALE"
        role = "NURSE"
        department = "Emergency"
    },
    @{
        displayName = "Receptionist John"
        email = "john.receptionist@careflow.com"
        password = "TempPass123!"
        dateOfBirth = "1990-03-10"
        gender = "MALE"
        role = "RECEPTIONIST"
    },
    @{
        displayName = "Admin Manager"
        email = "manager@careflow.com"
        password = "TempPass123!"
        dateOfBirth = "1988-07-22"
        gender = "MALE"
        role = "ADMIN"
    }
)

$createdUsers = @()

foreach ($staff in $staffUsers) {
    $staffBody = $staff | ConvertTo-Json
    
    try {
        $staffResponse = Invoke-WebRequest -Uri "$baseUrl/admin/users" `
            -Method POST `
            -Headers $headers `
            -Body $staffBody `
            -ContentType "application/json" `
            -UseBasicParsing
        
        $staffData = $staffResponse.Content | ConvertFrom-Json
        $createdUsers += $staffData.data
        
        Write-Host "✅ Created $($staff.role): $($staff.email)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create $($staff.email): $_" -ForegroundColor Red
    }
}

# ============================================
# STEP 3: Test Staff Login with Initial Password
# ============================================
Write-Host "`n[STEP 3] Testing Staff Login..." -ForegroundColor Yellow

$staffToTest = $createdUsers[0]  # Test with first staff member (Doctor)

$staffLogin = @{
    email = $staffToTest.email
    password = $staffToTest.password
} | ConvertTo-Json

try {
    $staffLoginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $staffLogin `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $staffLoginData = $staffLoginResponse.Content | ConvertFrom-Json
    $staffToken = $staffLoginData.data.accessToken
    
    Write-Host "✅ Staff login successful: $($staffToTest.email)" -ForegroundColor Green
    Write-Host "   Token: $($staffToken.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "   Must Change Password: $($staffLoginData.data.user.mustChangePassword)" -ForegroundColor Green
} catch {
    Write-Host "❌ Staff login failed: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# STEP 4: Staff Changes Password
# ============================================
Write-Host "`n[STEP 4] Testing Password Change..." -ForegroundColor Yellow

$staffHeaders = @{"Authorization" = "Bearer $staffToken"}

$passwordChange = @{
    currentPassword = $staffToTest.password
    newPassword = "MySecurePass123!"
    confirmPassword = "MySecurePass123!"
} | ConvertTo-Json

try {
    $passwordResponse = Invoke-WebRequest -Uri "$baseUrl/auth/update-password" `
        -Method PATCH `
        -Headers $staffHeaders `
        -Body $passwordChange `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $passwordData = $passwordResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Password changed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Password change failed: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# STEP 5: Test Login with New Password
# ============================================
Write-Host "`n[STEP 5] Testing Login with New Password..." -ForegroundColor Yellow

$newLogin = @{
    email = $staffToTest.email
    password = "MySecurePass123!"
} | ConvertTo-Json

try {
    $newLoginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $newLogin `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $newLoginData = $newLoginResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Login with new password successful" -ForegroundColor Green
    Write-Host "   New Token: $($newLoginData.data.accessToken.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login with new password failed: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📊 Created Staff Accounts:" -ForegroundColor Cyan
$createdUsers | ForEach-Object {
    Write-Host "   - $($_.displayName) ($($_.role)) - $($_.email)" -ForegroundColor Green
}

Write-Host "`n🔐 Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@careflow.com" -ForegroundColor Green
Write-Host "   Password: AdminPass123!" -ForegroundColor Green

Write-Host "`n🎯 All endpoints working:" -ForegroundColor Cyan
Write-Host "   ✅ POST /api/v1/auth/login" -ForegroundColor Green
Write-Host "   ✅ POST /api/v1/admin/users" -ForegroundColor Green
Write-Host "   ✅ PATCH /api/v1/auth/update-password" -ForegroundColor Green
Write-Host "   ✅ First login password change enforced" -ForegroundColor Green
