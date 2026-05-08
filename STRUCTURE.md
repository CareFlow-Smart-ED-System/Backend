# CareFlow Backend - Project Structure Summary

## 📁 Complete Folder Structure

```
Backend/
├── src/
│   ├── modules/                          # Feature modules
│   │   ├── auth/                         # Authentication & JWT
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── patients/                     # Patient Management (Salma)
│   │   │   ├── patients.module.ts
│   │   │   ├── patients.controller.ts
│   │   │   ├── patients.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── cases/                        # Emergency Cases
│   │   │   ├── cases.module.ts
│   │   │   ├── cases.controller.ts
│   │   │   ├── cases.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── triage/                       # Triage Assessment
│   │   │   ├── triage.module.ts
│   │   │   ├── triage.controller.ts
│   │   │   ├── triage.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── queue/                        # Queue Management (Farah)
│   │   │   ├── queue.module.ts
│   │   │   ├── queue.controller.ts
│   │   │   ├── queue.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── doctors/                      # Doctor Operations
│   │   │   ├── doctors.module.ts
│   │   │   ├── doctors.controller.ts
│   │   │   ├── doctors.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── nurses/                       # Nurse Operations (Farah)
│   │   │   ├── nurses.module.ts
│   │   │   ├── nurses.controller.ts
│   │   │   ├── nurses.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── admin/                        # Admin Panel (Farah)
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── notifications/                # Real-time Notifications (Farah)
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.gateway.ts  # WebSocket
│   │   │   └── dto/
│   │   │
│   │   ├── billing/                      # Billing & Payment (Farah)
│   │   │   ├── billing.module.ts
│   │   │   ├── billing.controller.ts
│   │   │   ├── billing.service.ts
│   │   │   └── dto/
│   │   │
│   │   └── appointments/                 # Follow-up Appointments
│   │       ├── appointments.module.ts
│   │       ├── appointments.controller.ts
│   │       ├── appointments.service.ts
│   │       └── dto/
│   │
│   ├── common/                           # Cross-cutting Concerns
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts         # JWT authentication
│   │   │   └── roles.guard.ts            # RBAC authorization
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts        # @Roles() decorator
│   │   │   └── current-user.decorator.ts # @CurrentUser() decorator
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts  # Global exception handler
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts   # Response formatting
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── create-audit-log.dto.ts
│   │   ├── jwt.service.ts
│   │   ├── password.service.ts
│   │   └── constants.ts
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts             # Database service
│   │   └── prisma.module.ts
│   │
│   ├── app.module.ts                     # Root module
│   └── main.ts                           # Entry point
│
├── prisma/
│   ├── schema.prisma                     # Database schema
│   ├── migrations/                       # Auto-generated migrations
│   └── seed.ts                           # Seed data script
│
├── config/
│   └── configuration.ts                  # Environment config
│
├── test/
│   ├── jest-e2e.json                     # E2E test config
│   └── app.e2e-spec.ts                   # E2E tests
│
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
├── .env.example                          # Environment variables template
├── .gitignore
├── README.md                             # Project documentation
└── STRUCTURE.md                          # This file
```

## 🏗️ Architecture Overview

### Module Organization
Each module follows NestJS best practices:
- **Controller** - HTTP endpoint handlers
- **Service** - Business logic
- **Module** - Feature configuration
- **DTO** - Data validation & transfer objects

### Common Utilities
- **Guards** - JWT authentication & role-based authorization
- **Decorators** - @Roles(), @CurrentUser() for cleaner code
- **Filters** - Global exception handling
- **Interceptors** - Response formatting & logging

### Database Layer
- **Prisma Service** - ORM wrapper for database access
- **Schema** - 15+ models with relationships (see schema.prisma)
- **Migrations** - Auto-generated from schema changes

## 📊 Module Endpoints Summary

| Module | Team | Endpoints | Status |
|--------|------|-----------|--------|
| **Auth** | Farah | 9 | ✅ Structure Created |
| **Patients** | Salma | 7 | ✅ Structure Created |
| **Cases** | - | 7 | ✅ Structure Created |
| **Triage** | - | 3 | ✅ Structure Created |
| **Queue** | Farah | 2 | ✅ Structure Created |
| **Doctors** | - | 5 | ✅ Structure Created |
| **Nurses** | Farah | 5 | ✅ Structure Created |
| **Admin** | Farah | 4 | ✅ Structure Created |
| **Notifications** | Farah | 3 + 6 WebSocket | ✅ Structure Created |
| **Billing** | Farah | 5 | ✅ Structure Created |
| **Appointments** | - | 3 | ✅ Structure Created |
| **Total** | - | **53+ Endpoints** | **✅ Complete** |

## 🔄 Module Dependencies

```
AppModule
├── ConfigModule (environment variables)
├── PrismaModule (database)
├── AuthModule (auth service)
├── PatientsModule (patient management)
├── CasesModule (emergency cases)
├── TriageModule (triage assessment)
├── QueueModule (queue management)
├── DoctorsModule (doctor operations)
├── NursesModule (nurse operations)
├── AdminModule (admin panel)
├── NotificationsModule (real-time alerts)
├── BillingModule (payment processing)
└── AppointmentsModule (follow-up scheduling)
```

## 🛠️ Implementation Roadmap

### Phase 1: Foundation (Critical Path)
1. ✅ Database schema with Prisma
2. ✅ Project folder structure
3. ⏳ **Auth module implementation** (blocks all other endpoints)
4. ⏳ JWT guards & RBAC setup

### Phase 2: Core Modules
5. ⏳ Patient quick-register
6. ⏳ Emergency case creation
7. ⏳ Triage system
8. ⏳ Queue management

### Phase 3: Clinical Operations
9. ⏳ Doctor module (case assignment, prescriptions)
10. ⏳ Nurse module (vital signs, notes)
11. ⏳ Medical records management

### Phase 4: Support Services
12. ⏳ Notifications & WebSocket integration
13. ⏳ Billing module
14. ⏳ Admin panel

### Phase 5: Testing & Deployment
15. ⏳ Unit tests
16. ⏳ E2E tests
17. ⏳ Database migrations
18. ⏳ Production deployment

## 📝 Next Steps

1. **Run Database Setup**
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate:dev
   ```

2. **Implement Auth Module First**
   - Login endpoint (generate JWT)
   - Register endpoint
   - JWT validation guards

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Create DTOs for Each Module**
   - Use class-validator for validation
   - Follow TypeScript best practices

5. **Implement Service Logic**
   - Write business logic in services
   - Use Prisma for database queries

6. **Add Tests**
   - Unit tests for services
   - E2E tests for controllers

## 🔐 Security Considerations

- JWT tokens with 15-minute expiration
- Refresh token rotation for session renewal
- Argon2 password hashing
- Role-based access control (RBAC)
- Global exception handling
- Input validation with class-validator

## 📚 Key Files to Review

- [Prisma Schema](../prisma/schema.prisma) - Database design
- [Package.json](../package.json) - Dependencies
- [Main.ts](../src/main.ts) - Application entry point
- [App.module.ts](../src/app.module.ts) - Module configuration
- [README.md](../README.md) - Project documentation
