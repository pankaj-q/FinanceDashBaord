# Finance Dashboard

A comprehensive finance dashboard system with role-based access control, financial records management, and analytics capabilities.

## Features

- **User & Role Management**
  - Three roles: Viewer, Analyst, Admin
  - JWT-based authentication with refresh tokens
  - User status management (Active, Inactive, Suspended)

- **Financial Records**
  - CRUD operations for income/expense records
  - Category-based organization
  - Filtering by type, category, date range
  - Pagination support

- **Dashboard Analytics**
  - Summary statistics (total income, expenses, net balance)
  - Monthly trends visualization
  - Category breakdown charts
  - Recent activity feed

- **Access Control**
  - Role-based permissions
  - Viewers: Read-only access
  - Analysts: Create and manage own records
  - Admins: Full system access

## Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 4.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: JWT with refresh tokens

### Frontend
- **Framework**: React 18
- **Build**: Vite 5
- **Styling**: Tailwind CSS 3.x
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker & Docker Compose (for containerized setup)

### Local Development

1. **Clone and install dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

2. **Set up environment variables**

```bash
# backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
PORT=3001
NODE_ENV=development
```

3. **Initialize database**

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

4. **Start development servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Docker Setup (Production)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.com | admin123 |
| Analyst | analyst@finance.com | analyst123 |
| Viewer | viewer@finance.com | viewer123 |

## API Documentation

### Authentication

```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
POST /api/auth/refresh     - Refresh access token
POST /api/auth/logout      - Logout user
GET  /api/auth/me          - Get current user
```

### Records

```
GET    /api/records         - List records (paginated, filtered)
GET    /api/records/:id     - Get single record
POST   /api/records         - Create record
PUT    /api/records/:id     - Update record
DELETE /api/records/:id     - Delete record (soft delete)
```

### Dashboard

```
GET /api/dashboard/summary      - Get summary statistics
GET /api/dashboard/categories    - Get category breakdown
GET /api/dashboard/trends        - Get monthly trends
GET /api/dashboard/recent        - Get recent activity
```

### Users (Admin only)

```
GET    /api/users               - List all users
GET    /api/users/:id           - Get user by ID
POST   /api/users               - Create user
PUT    /api/users/:id           - Update user
PATCH  /api/users/:id/status    - Update user status
DELETE /api/users/:id           - Delete user
```

## Role Permissions

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View Dashboard | ✓ | ✓ | ✓ |
| View Records | ✓ | ✓ | ✓ |
| Create Records | ✗ | ✓ | ✓ |
| Edit Own Records | ✗ | ✓ | ✓ |
| Edit Any Record | ✗ | ✗ | ✓ |
| Delete Records | ✗ | ✓ | ✓ |
| View Analytics | ✗ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✓ |

## Project Structure

```
finance-dashboard/
├── backend/
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth & RBAC
│   │   ├── utils/          # Helpers & validation
│   │   └── types/          # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── types/          # TypeScript types
│   └── package.json
├── docker-compose.yml
├── SPEC.md
└── README.md
```

## Financial Categories

### Income
- Salary
- Investment
- Freelance
- Other Income

### Expenses
- Food & Dining
- Transportation
- Utilities
- Entertainment
- Healthcare
- Education
- Shopping
- Housing
- Insurance
- Other Expense

## Security Features

- Password hashing with Argon2
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 day expiry)
- Rate limiting (100 req/min)
- Input validation with Zod
- CORS configuration
- Security headers with Helmet

## Scripts

### Backend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start production server
npm run db:push    # Push schema to DB
npm run db:seed    # Seed database
npm run db:studio  # Open Prisma Studio
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## License

MIT License
