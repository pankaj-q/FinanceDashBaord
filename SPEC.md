# Finance Dashboard - Technical Specification

## Overview

A comprehensive finance dashboard backend system with role-based access control, financial records management, and analytics capabilities.

## Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 4.x (fast, low-overhead)
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod
- **Logging**: Pino

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Charts**: Recharts
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Caddy (auto-HTTPS in production)

## Architecture

```
finance-dashboard/
├── backend/
│   ├── src/
│   │   ├── plugins/          # Fastify plugins
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth & RBAC middleware
│   │   ├── utils/            # Helpers
│   │   └── types/            # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   └── types/            # TypeScript types
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Data Models

### User
```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  password     String
  name         String
  role         Role      @default(VIEWER)
  status       Status    @default(ACTIVE)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  refreshToken String?
  records      Record[]
}
```

### Record (Financial Entry)
```prisma
model Record {
  id          String      @id @default(uuid())
  amount      Float
  type        RecordType
  category    Category
  date        DateTime
  description String?
  notes       String?
  createdBy   String
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?
}
```

### Enums
```prisma
enum Role {
  VIEWER
  ANALYST
  ADMIN
}

enum Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum RecordType {
  INCOME
  EXPENSE
}

enum Category {
  // Income
  SALARY
  INVESTMENT
  FREELANCE
  OTHER_INCOME
  
  // Expense
  FOOD
  TRANSPORT
  UTILITIES
  ENTERTAINMENT
  HEALTHCARE
  EDUCATION
  SHOPPING
  HOUSING
  INSURANCE
  OTHER_EXPENSE
}
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| POST | /api/auth/refresh | Refresh token | Public |
| POST | /api/auth/logout | Logout user | Authenticated |
| GET | /api/auth/me | Get current user | Authenticated |

### Users (Admin only)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users | List all users | ADMIN |
| GET | /api/users/:id | Get user by ID | ADMIN |
| PUT | /api/users/:id | Update user | ADMIN |
| DELETE | /api/users/:id | Delete user | ADMIN |
| PATCH | /api/users/:id/status | Update user status | ADMIN |

### Records
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/records | List records (paginated) | ANALYST+ |
| GET | /api/records/:id | Get record by ID | ANALYST+ |
| POST | /api/records | Create record | ANALYST+ |
| PUT | /api/records/:id | Update record | ANALYST+ (own) / ADMIN (all) |
| DELETE | /api/records/:id | Delete record | ANALYST+ (own) / ADMIN (all) |

### Dashboard Analytics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/dashboard/summary | Get summary stats | ANALYST+ |
| GET | /api/dashboard/trends | Get monthly trends | ANALYST+ |
| GET | /api/dashboard/categories | Get category breakdown | ANALYST+ |
| GET | /api/dashboard/recent | Get recent activity | ANALYST+ |

## Role Permissions

| Action | VIEWER | ANALYST | ADMIN |
|--------|--------|---------|-------|
| View dashboard | ✓ | ✓ | ✓ |
| View records | ✓ | ✓ | ✓ |
| Create records | ✗ | ✓ | ✓ |
| Edit own records | ✗ | ✓ | ✓ |
| Edit any record | ✗ | ✗ | ✓ |
| Delete own records | ✗ | ✓ | ✓ |
| Delete any record | ✗ | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✓ |

## Request/Response Formats

### Pagination
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Filters
```typescript
interface RecordFilters {
  type?: 'INCOME' | 'EXPENSE';
  category?: Category;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
```

### Dashboard Summary Response
```typescript
interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
  averageTransaction: number;
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: any;
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Measures

1. **Password Hashing**: Argon2id
2. **JWT Access Token**: 15 minutes expiry
3. **JWT Refresh Token**: 7 days expiry, stored in DB
4. **Rate Limiting**: 100 requests per minute per IP
5. **Input Validation**: Zod schemas
6. **CORS**: Configured for frontend origin
7. **Helmet**: Security headers

## Frontend Pages

1. **Login/Register** - Authentication forms
2. **Dashboard** - Summary cards, charts, recent activity
3. **Records** - CRUD operations, filtering, pagination
4. **Analytics** - Detailed charts and trends
5. **Users** (Admin) - User management interface

## Animations

- Page transitions with Framer Motion
- Card hover effects
- Chart animations on load
- Staggered list animations
- Modal slide-in effects
- Loading skeleton animations

## Docker Configuration

- Multi-stage build for frontend
- Node Alpine for backend
- PostgreSQL 15 for production
- Caddy for reverse proxy with auto-HTTPS
- Volume for database persistence
