# poc_buildflow
81% of storage used … If you run out, you can't create, edit and upload files. Share 100 GB of storage with your family members for £0.39 for 3 months £1.59.
1
100%
# BuildFlow — Low Level Solution Design (LLD)
## Desktop POC Deployment Architecture

Version: 1.0  
Target Environment: Local Desktop / Laptop  
Future Target: AWS Cloud Production Deployment  
Architecture Style: Modular Monolith + Supporting AI Services  

---

# 1. Objective

This Low-Level Design (LLD) document defines the implementation-ready technical architecture for the BuildFlow desktop Proof of Concept (POC).

The design prioritizes:

- Fast development velocity
- Local desktop deployment
- AWS migration compatibility
- Modular extensibility
- Production-aligned engineering standards

The desktop POC must support:

- Multi-user organisation workflows
- Tender lifecycle management
- Project tracking
- Cost management
- AI-assisted tender estimation
- File uploads
- Role-based access control
- Local containerized deployment

---

# 2. Solution Overview

## 2.1 Architectural Principles

### POC Principles

- Modular monolith backend
- Shared PostgreSQL database
- Independent AI service
- Docker-first deployment
- API-first architecture
- Tenant-aware design
- AWS-compatible infrastructure

### Future Scalability Principles

- Domain boundaries enforce future microservice extraction
- Stateless APIs
- Event-driven background processing
- Externalized file storage
- Queue-based asynchronous operations

---

# 3. Desktop Deployment Architecture

## 3.1 Runtime Components

| Component | Technology | Runtime |
|---|---|---|
| Frontend Web App | React + Vite | Node container |
| Backend API | Fastify + TypeScript | Node container |
| AI Service | FastAPI + Python | Python container |
| PostgreSQL DB | PostgreSQL 16 | Docker container |
| Redis Cache | Redis 7 | Docker container |
| File Storage | MinIO | Docker container |
| Worker Service | BullMQ Worker | Node container |
| Reverse Proxy | NGINX | Docker container |

---

# 4. System Topology

```text
┌────────────────────────────────────┐
│           User Browser             │
└────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│              NGINX                 │
│      localhost reverse proxy       │
└────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌────────────────┐   ┌────────────────┐
│ React Frontend │   │ Fastify API    │
└────────────────┘   └────────────────┘
                              │
        ┌─────────────────────┼────────────────────┐
        ▼                     ▼                    ▼
┌──────────────┐      ┌──────────────┐    ┌──────────────┐
│ PostgreSQL   │      │ Redis        │    │ MinIO        │
│ + pgvector   │      │ BullMQ       │    │ File Storage │
└──────────────┘      └──────────────┘    └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Python AI Engine │
                    └──────────────────┘
```

---

# 5. Monorepo Design

## 5.1 Repository Layout

```text
buildflow/
│
├── apps/
│   ├── web/
│   ├── api/
│   ├── ai-service/
│   └── worker/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── sdk/
│   ├── config/
│   └── eslint-config/
│
├── prisma/
│
├── docker/
│
├── infrastructure/
│   ├── terraform/
│   └── aws/
│
├── scripts/
│
└── docs/
```

---

# 6. Frontend Low-Level Design

## 6.1 Frontend Technology Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Server State | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| Routing | React Router |
| Charts | Recharts |

---

## 6.2 Frontend Folder Structure

```text
src/
│
├── app/
├── assets/
├── components/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── stores/
├── utils/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── tenders/
│   ├── projects/
│   ├── tasks/
│   ├── costs/
│   ├── ai/
│   ├── approvals/
│   └── documents/
│
└── types/
```

---

## 6.3 Frontend Authentication Flow

### Login Flow

```text
User Login
   ↓
POST /api/v1/auth/login
   ↓
JWT Access Token
   ↓
Store in HTTP-only cookie
   ↓
Fetch current user profile
   ↓
Load role-based dashboard
```

---

## 6.4 Role-Based Rendering

Frontend renders UI dynamically using:

```typescript
permissions.canViewCosts
permissions.canApproveTender
permissions.canEditProject
```

Permissions retrieved from:

```text
GET /api/v1/auth/me
```

---

# 7. Backend Low-Level Design

## 7.1 Backend Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Fastify |
| Language | TypeScript |
| ORM | Prisma |
| Validation | Zod |
| Authentication | Supabase Auth |
| Queue | BullMQ |
| Logging | Pino |
| API Docs | Swagger/OpenAPI |

---

## 7.2 Backend Folder Structure

```text
src/
│
├── app.ts
├── server.ts
├── config/
├── plugins/
├── middleware/
├── utils/
├── common/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── organisations/
│   ├── tenders/
│   ├── ai/
│   ├── projects/
│   ├── tasks/
│   ├── costs/
│   ├── documents/
│   ├── approvals/
│   ├── dashboard/
│   ├── notifications/
│   └── audit/
│
└── jobs/
```

---

## 7.3 API Request Lifecycle

```text
Request
  ↓
Fastify Route
  ↓
Auth Middleware
  ↓
Permission Middleware
  ↓
Validation Layer
  ↓
Service Layer
  ↓
Repository Layer
  ↓
Prisma ORM
  ↓
PostgreSQL
```

---

## 7.4 Backend Layering Standard

### Controller Layer

Responsibilities:

- Route handling
- Input validation
- HTTP response formatting

### Service Layer

Responsibilities:

- Business logic
- Workflow orchestration
- Permission rules

### Repository Layer

Responsibilities:

- Database access
- Query optimization
- Transaction handling

---

# 8. Authentication Design

## 8.1 Authentication Provider

### POC

Use:

- Supabase Auth

Features:

- JWT authentication
- MFA
- Email verification
- Password reset
- Session management

---

## 8.2 JWT Strategy

| Token | Expiry |
|---|---|
| Access Token | 15 minutes |
| Refresh Token | 30 days |

---

## 8.3 Authentication Middleware

```typescript
verifyJWT()
validateOrganisation()
validatePermissions()
```

---

# 9. RBAC Design

## 9.1 Roles

| Role | Access Level |
|---|---|
| Organisation Admin | Full Access |
| Director | Financial + Approval |
| Estimator | Tender Management |
| Project Manager | Project Operations |
| Site Manager | Task Updates |
| Finance/Admin | Cost Management |
| Read Only | View Only |

---

## 9.2 Permission Matrix Example

| Action | Admin | PM | Site |
|---|---|---|---|
| Create Tender | Yes | No | No |
| Edit Project | Yes | Yes | No |
| Upload Site Photo | Yes | Yes | Yes |
| View Financials | Yes | Limited | No |

---

# 10. Database Design

## 10.1 Database Technology

| Component | Technology |
|---|---|
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Vector Search | pgvector |
| Migrations | Prisma Migrate |

---

## 10.2 Multi-Tenant Strategy

### Shared Database Model

Every entity contains:

```sql
organisation_id UUID NOT NULL
```

---

## 10.3 Core Tables

### Organisation

```sql
organisation
- id
- name
- company_number
- status
- created_at
```

### User

```sql
user
- id
- organisation_id
- email
- role
- mfa_enabled
```

### Tender

```sql
tender
- id
- organisation_id
- name
- status
- value
- deadline
- win_probability
```

### Project

```sql
project
- id
- organisation_id
- tender_id
- contract_value
- start_date
- end_date
```

### Task

```sql
task
- id
- project_id
- phase_id
- assignee_id
- status
```

---

# 11. Prisma Schema Standards

## Example Prisma Model

```prisma
model Tender {
  id               String   @id @default(uuid())
  organisationId   String
  name             String
  status           String
  value            Float
  deadline         DateTime
  createdAt        DateTime @default(now())

  organisation Organisation @relation(fields: [organisationId], references: [id])
}
```

---

# 12. AI Service Design

## 12.1 AI Service Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| ML Library | scikit-learn |
| Gradient Boosting | XGBoost |
| Embeddings | sentence-transformers |
| Data Processing | pandas |

---

## 12.2 AI Service Endpoints

| Endpoint | Purpose |
|---|---|
| POST /estimate | Generate tender estimate |
| POST /similarity | Retrieve similar tenders |
| POST /risk-score | Risk scoring |
| POST /win-probability | Predict tender success |

---

## 12.3 AI Workflow

```text
Tender Submitted
      ↓
Queue AI Job
      ↓
Worker consumes job
      ↓
Call FastAPI service
      ↓
Generate estimate
      ↓
Persist AI outputs
      ↓
Notify frontend
```

---

# 13. Background Job Design

## 13.1 Queue Technology

| Component | Technology |
|---|---|
| Queue Engine | BullMQ |
| Queue Store | Redis |

---

## 13.2 Queue Types

| Queue | Purpose |
|---|---|
| email-queue | Notifications |
| ai-queue | AI processing |
| report-queue | PDF exports |
| sync-queue | File sync |
| import-queue | CSV imports |

---

# 14. File Storage Design

## 14.1 POC Storage Strategy

### Use MinIO

Why:

- S3 compatible
- Local deployment
- Future AWS migration support

---

## 14.2 File Categories

| Category | Examples |
|---|---|
| Tender Documents | ITT, PQQ |
| Drawings | PDFs |
| Photos | Site photos |
| Reports | Exports |
| AI Outputs | Generated cost plans |

---

## 14.3 File Upload Flow

```text
Frontend Upload
      ↓
Fastify Upload Endpoint
      ↓
Virus Validation
      ↓
Store in MinIO
      ↓
Persist Metadata
      ↓
Return File URL
```

---

# 15. API Design Standards

## 15.1 REST Conventions

| Action | Method |
|---|---|
| Create | POST |
| Retrieve | GET |
| Update | PUT/PATCH |
| Delete | DELETE |

---

## 15.2 Endpoint Naming

```text
/api/v1/tenders
/api/v1/projects
/api/v1/tasks
/api/v1/costs
/api/v1/ai/estimate
```

---

## 15.3 Standard Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

---

# 16. Docker Deployment Design

## 16.1 Docker Compose Architecture

```yaml
services:
  web:
  api:
  ai-service:
  worker:
  postgres:
  redis:
  minio:
  nginx:
```

---

## 16.2 Local Ports

| Service | Port |
|---|---|
| Frontend | 5173 |
| API | 3000 |
| AI Service | 8000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| MinIO | 9000 |
| NGINX | 80 |

---

# 17. Environment Variables

## 17.1 API Environment Variables

```env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
AI_SERVICE_URL=
SUPABASE_URL=
SUPABASE_KEY=
```

---

# 18. Logging & Monitoring

## 18.1 Logging Standards

### Use Pino

Structured JSON logs:

```json
{
  "level": "info",
  "service": "api",
  "message": "Tender created",
  "organisationId": "org_123"
}
```

---

## 18.2 Audit Logging

Audit events stored for:

- Tender approval
- Cost modification
- User creation
- File uploads
- Project updates

---

# 19. Security Design

## 19.1 Security Controls

| Control | Implementation |
|---|---|
| Authentication | JWT |
| Password Hashing | bcrypt |
| Validation | Zod |
| File Validation | MIME validation |
| Rate Limiting | Fastify rate limit |
| SQL Injection | Prisma ORM |
| XSS Protection | React escaping |
| CORS | Restricted origins |

---

## 19.2 Future Production Security

- AWS WAF
- Cloudflare
- Secrets Manager
- KMS Encryption
- PostgreSQL RLS
- SIEM Integration

---

# 20. CI/CD Design

## 20.1 POC CI/CD

### GitHub Actions

Pipeline:

```text
Commit
  ↓
Lint
  ↓
Unit Tests
  ↓
Build Docker Images
  ↓
Deploy Local Environment
```

---

# 21. AWS Migration Path

## 21.1 Infrastructure Mapping

| Local | AWS |
|---|---|
| Docker Compose | ECS Fargate |
| PostgreSQL | RDS |
| Redis | ElastiCache |
| MinIO | S3 |
| Local Secrets | Secrets Manager |
| NGINX | ALB |

---

## 21.2 Migration Strategy

### Phase 1

Desktop POC

### Phase 2

Single AWS environment

### Phase 3

Production multi-environment deployment

### Phase 4

Microservice extraction if required

---

# 22. Recommended Initial Implementation Order

## Sprint 1

- Monorepo setup
- Docker setup
- PostgreSQL setup
- Frontend shell
- Authentication

## Sprint 2

- Tender management
- Dashboard
- File uploads
- RBAC

## Sprint 3

- Projects
- Tasks
- Cost management
- AI integration

## Sprint 4

- Testing
- Optimization
- Demo workflows
- AWS preparation

---

# 23. Final Technical Recommendation

## Recommended Final Stack

| Layer | Recommendation |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | Tailwind + shadcn/ui |
| Backend | Fastify + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| AI | FastAPI + XGBoost |
| Queue | BullMQ |
| Cache | Redis |
| Storage | MinIO → S3 |
| Auth | Supabase Auth |
| Deployment | Docker → ECS |
| Infrastructure | Terraform |
| CI/CD | GitHub Actions |

---

# 24. Conclusion

This low-level solution design provides:

- A complete desktop-deployable architecture
- Clear implementation structure
- AWS-compatible infrastructure choices
- Modular scalability path
- Production-grade engineering foundations

The proposed solution minimizes future migration cost while enabling rapid delivery of the BuildFlow POC.
