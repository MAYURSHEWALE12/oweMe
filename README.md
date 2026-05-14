# OweMe — Track Loans with Friends

A full-stack fintech application for tracking loans, splitting expenses, and managing debts between friends. Built with Java 21 + Spring Boot backend and React.js frontend.

## Features

### Authentication & Security
- JWT-based authentication with access & refresh tokens
- BCrypt password encryption
- Password reset via email (Brevo SMTP)
- Protected routes with axios interceptors

### Reports & Analytics
- Full financial dashboard with stats (Total Lent, Received, Outstanding)
- Weekly trend chart (lent vs received)
- Smart insights (most active friend, highest pending)
- Settlement summary (who owes whom)
- Export reports

### PDF Reports
- Complete ledger PDF with branding
- Per-friend transaction statement PDF
- Summary cards (You'll Get, You'll Give, Current Balance)
- Grand total row
- Settlement summary in PDF
- Multi-page support with headers/footers

### Email Integration
- Share reports via email (Brevo SMTP)
- Professional HTML email templates
- Password reset codes via email

### Transactions (Chat-Style Ledger)
- Chat-style transaction feed with timeline grouping
- Date-based sections (Today, Yesterday, date)
- Given/Taken buttons for quick entry
- Edit/delete transactions with auto balance recalculation
- Soft-delete with "deleted" markers
- Timeline dots and hover animations

### Friend Management
- Add friends by name/phone/email
- Auto-link friends when they register
- Duplicate prevention (checks both directions)
- Edit friend name/phone
- View from both perspectives (your friends + friends who added you)

### Notifications
- Real-time notifications via SSE (Server-Sent Events)
- Bell icon with unread count
- Slide-in notification drawer
- Auto-mark read on open

### Mobile Friendly
- Fully responsive design
- Mobile-optimized transaction view
- Fixed bottom action bar
- Dark mode support

### Dark/Light Mode
- Full theme support across all pages
- Dark fintech SaaS theme
- Clean light mode

## Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.2.1**
- Spring Security 6 with JWT
- Spring Data JPA (Hibernate)
- MySQL 8.0
- Maven
- jjwt 0.12.3
- Springdoc OpenAPI 2.3.0
- Apache POI (Excel export)
- jasperreports/iText (PDF)
- Spring Boot Mail (Brevo SMTP)
- Server-Sent Events (SSE)

### Frontend
- **React 18**
- **Vite**
- React Router 6
- Axios with interceptors
- **Tailwind CSS 3**
- **Framer Motion** (animations)
- **Recharts** (charts)
- **jsPDF + jspdf-autotable** (PDF generation)
- React Hot Toast
- React Icons (Feather Icons)

## Project Structure

```
oweMe/
├── backend/
│   ├── src/main/java/com/okcredit/
│   │   ├── config/         # Security, OpenAPI config
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── entity/         # JPA entities
│   │   ├── exception/      # Global exception handler
│   │   ├── repository/     # JPA repositories
│   │   ├── security/       # JWT, auth filter, user details
│   │   └── service/        # Business logic
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable (Logo, NotificationPanel)
│   │   ├── context/        # Auth, Theme context
│   │   ├── hooks/          # useDebounce
│   │   ├── layouts/        # MainLayout, AuthLayout
│   │   ├── pages/          # All page components
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── dashboard/  # Dashboard (removed, replaced by Reports)
│   │   │   ├── reports/    # Reports & Analytics
│   │   │   ├── transactions/ # Chat-style ledger
│   │   │   ├── settings/   # Account settings
│   │   │   ├── portal/     # Customer portal
│   │   │   └── LandingPage.jsx
│   │   ├── services/       # API service modules
│   │   └── utils/          # PDF generator
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   └── schema.sql
├── docker-compose.yml
└── README.md
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | System users with roles |
| `shops` | User accounts (personal shops) |
| `customers` | Friends with running balance |
| `transactions` | Credit/payment records |
| `notifications` | In-app notifications |
| `reminders` | Payment reminders |

### Key Relationships
- User 1→1 Shop (each user has a personal shop)
- Shop 1→N Customers (friends added by user)
- Customer 1→N Transactions
- Customer → User (optional link for friend login)

## Setup Instructions

### Prerequisites
- Java 21+
- Node.js 20+
- MySQL 8.0+
- Maven 3.9+

### Local Development

#### 1. Database
```sql
CREATE DATABASE oweMe;
```

#### 2. Backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```
API at `http://localhost:8080`

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App at `http://localhost:3000`

#### 4. Production Build
```bash
cd frontend
npm run build
npx serve dist -l 3000 --cors -s
```

### API Documentation
Swagger UI: `http://localhost:8080/swagger-ui.html`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Send reset code |
| POST | `/api/auth/reset-password` | Reset with code |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List friends |
| POST | `/api/customers` | Add friend |
| PUT | `/api/customers/{id}` | Update friend |
| DELETE | `/api/customers/{id}` | Soft-delete friend |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/customer/{id}` | Get transactions |
| POST | `/api/transactions/credit` | Give credit |
| POST | `/api/transactions/payment` | Receive payment |
| PUT | `/api/transactions/{id}` | Edit transaction |
| DELETE | `/api/transactions/{id}` | Soft-delete transaction |

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/friend/dashboard` | Friend's dashboard |
| GET | `/api/reports/monthly` | Download Excel report |
| POST | `/api/email/send-report` | Email PDF report |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| POST | `/api/notifications/read-all` | Mark all read |
| GET | `/api/sse/notifications` | SSE real-time stream |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/customer-statement` | Lookup by phone |

## Environment Variables

### Backend (`application.yml`)
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | H2 in-memory | MySQL JDBC URL |
| `DB_USERNAME` | `sa` | DB username |
| `DB_PASSWORD` | (empty) | DB password |
| `JWT_SECRET` | (embedded) | JWT signing key |
| `BREVO_USERNAME` | (required for email) | Brevo SMTP login |
| `BREVO_PASSWORD` | (required for email) | Brevo SMTP key |

### Frontend (`.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend API URL |

## Docker

```bash
docker-compose up -d
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
VITE_API_URL=https://your-api.com/api npm run build
# Deploy the dist/ folder to Vercel
```

### Backend (Render/Railway)
```bash
cd backend
# Set build: mvn clean package -DskipTests
# Set start: java -jar target/*.jar
# Add env vars for DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET
```

## Screenshots

Landing page with dark fintech SaaS theme, Reports & Analytics dashboard, Chat-style transaction ledger, PDF report export.

## License

MIT
