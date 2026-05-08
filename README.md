# 🏥 MediCare — Hospital Management System

A full-stack, production-grade **Hospital Management System** built with React.js, Node.js, Express, and MySQL. Features role-based dashboards for Admins, Doctors, and Patients with a beautiful medical-themed UI.

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Forgot/Reset password flow
- Secure protected routes

### 👨‍💼 Admin Dashboard
- Real-time statistics (doctors, patients, appointments, revenue)
- Interactive charts (Recharts) — area, bar, pie charts
- Manage Doctors (add, edit, delete, toggle availability)
- Manage Patients (view, search, filter)
- Manage Appointments (approve, confirm, cancel, complete)
- Manage Departments (add, edit, delete)
- Payment management (mark paid, filter by status)

### 👤 Patient Dashboard
- Book appointments (department → time slot → confirm)
- View/cancel upcoming appointments
- View digital prescriptions with medication details
- Payment history & invoices
- Editable profile (personal, medical info, emergency contact)

### 👨‍⚕️ Doctor Dashboard
- Today's schedule with quick status updates
- Weekly appointment trend chart
- Write prescriptions with multiple medications
- Manage patient list (view details, contact)
- Availability management (days, time slots)
- Editable professional profile

### 🌐 Public Pages
- Home (hero, stats, departments, top doctors, testimonials, emergency)
- Doctors page with search & filter
- Doctor detail page with reviews
- 3-step appointment booking wizard
- About page (mission, values, team)
- Services page (all 8 departments)
- Contact page with FAQ accordion
- Forgot Password page

### 🎨 UI/UX
- Clean medical-themed design
- Dark / Light mode toggle (persisted)
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and hover effects
- Toast notifications
- Loading states and skeletons

---

## 🗂 Project Structure

```
medicare/
├── frontend/                  # React.js frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Reusable UI components
│   │   │   │   ├── UI.js      # StatCard, Badge, Modal, Button, etc.
│   │   │   │   └── LoadingSpinner.js
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.js  # Sidebar + TopBar
│   │   │       ├── Navbar.js           # Public navbar
│   │   │       └── Footer.js
│   │   ├── context/
│   │   │   ├── AuthContext.js  # JWT auth state
│   │   │   └── ThemeContext.js # Dark/light mode
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── PublicPages.js  # About, Services, Doctors, etc.
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── patient/        # Patient dashboard pages
│   │   │   └── doctor/         # Doctor dashboard pages
│   │   ├── services/
│   │   │   └── api.js          # Axios instance + API helpers
│   │   ├── App.js              # Routes + protected routes
│   │   ├── index.js
│   │   └── index.css           # Tailwind + custom styles
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                   # Node.js / Express API
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── dashboardController.js
│   │   └── resourceController.js  # Patients, Departments, Payments, Notifications, Prescriptions
│   ├── middleware/
│   │   └── auth.js            # JWT verify + role authorize
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── patients.js
│   │   ├── appointments.js
│   │   ├── departments.js
│   │   ├── prescriptions.js
│   │   ├── payments.js
│   │   ├── notifications.js
│   │   ├── dashboard.js
│   │   ├── admin.js
│   │   └── users.js
│   ├── server.js              # Express entry point
│   ├── package.json
│   └── .env.example
│
└── database/
    └── schema.sql             # Full MySQL schema + seed data
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| MySQL | v8+ |
| npm | v9+ |

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd medicare
```

---

### 2. Set Up the Database

```bash
# Log into MySQL
mysql -u root -p

# Run the schema file
source /path/to/medicare/database/schema.sql
# or
mysql -u root -p < database/schema.sql
```

This creates the `medicare_db` database with all tables and seed data including demo users.

---

### 3. Configure the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medicare_db

JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

✅ API running at: `http://localhost:5000`
✅ Health check: `http://localhost:5000/api/health`

---

### 4. Configure the Frontend

```bash
cd frontend

# Install dependencies
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

✅ App running at: `http://localhost:3000`

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@medicare.com | admin123 |
| **Doctor** | dr.sarah.johnson@medicare.com | doctor123 |
| **Patient** | john.doe@email.com | patient123 |

> **Note**: Demo credentials are visible on the Login page for quick access. The demo mode uses seed data from the database and also falls back gracefully if the backend is not connected.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Bearer |
| POST | `/api/auth/forgot-password` | Request reset | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| PUT | `/api/auth/change-password` | Change password | Bearer |

### Doctors

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/doctors` | List all doctors | Public |
| GET | `/api/doctors/:id` | Get doctor details | Public |
| POST | `/api/doctors` | Add doctor | Admin |
| PUT | `/api/doctors/:id` | Update doctor | Admin/Doctor |
| DELETE | `/api/doctors/:id` | Delete doctor | Admin |

### Appointments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/appointments` | Get appointments (filtered by role) | Bearer |
| GET | `/api/appointments/slots` | Get available time slots | Public |
| GET | `/api/appointments/:id` | Get appointment detail | Bearer |
| POST | `/api/appointments` | Book appointment | Patient |
| PUT | `/api/appointments/:id/status` | Update status | Bearer |
| DELETE | `/api/appointments/:id` | Delete appointment | Admin |

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/admin` | Admin statistics | Admin |
| GET | `/api/dashboard/patient` | Patient statistics | Patient |
| GET | `/api/dashboard/doctor` | Doctor statistics | Doctor |

### Other Endpoints

- `GET/POST /api/departments` — Departments CRUD
- `GET/POST /api/prescriptions` — Prescriptions
- `GET /api/patients` — Patients list
- `GET/PUT /api/payments` — Payments
- `GET /api/notifications` — Notifications
- `PUT /api/notifications/:id/read` — Mark as read

---

## 🎨 Design System

### Colors
```css
Primary Blue:  #1d4ed8  (blue-700)
Medical Teal:  #14b8a6  (teal-500)
Success:       #22c55e  (green-500)
Warning:       #f59e0b  (amber-500)
Danger:        #ef4444  (red-500)
```

### Typography
- **Body**: Plus Jakarta Sans
- **Headings**: Syne (font-display)

### Shadows
```css
card:       0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)
card-hover: 0 4px 12px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.07)
```

---

## 🛡 Security Features

- JWT tokens with expiry
- bcrypt password hashing (10 rounds)
- Rate limiting (100 requests / 15 min)
- Helmet.js HTTP headers
- CORS protection
- Input validation
- Role-based route protection
- SQL injection prevention (parameterized queries)

---

## 📦 Tech Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.2 | UI framework |
| React Router Dom | 6.21 | Routing |
| Tailwind CSS | 3.x | Styling |
| Recharts | 2.10 | Charts |
| Axios | 1.6 | HTTP client |
| Lucide React | 0.303 | Icons |
| React Hot Toast | 2.4 | Notifications |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 4.18 | Web framework |
| MySQL2 | 3.6 | Database driver |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9.0 | JWT auth |
| helmet | 7.1 | Security headers |
| express-rate-limit | 7.1 | Rate limiting |
| cors | 2.8 | CORS |
| morgan | 1.10 | HTTP logging |

---

## 🔧 Customization

### Adding a New Department

1. Add to `database/schema.sql` INSERT statement
2. Update the departments list in `frontend/src/pages/HomePage.js`
3. Update the services list in `frontend/src/pages/PublicPages.js` (ServicesPage)

### Adding a New Role

1. Update `ENUM('admin','doctor','patient')` in users table
2. Add nav config in `DashboardLayout.js`
3. Add routes in `App.js`
4. Add `authorize()` middleware to relevant routes

### Changing the Color Scheme

Update `tailwind.config.js` primary color values and replace `blue-600`/`blue-700` with your preferred color throughout.

---

## 🐛 Troubleshooting

**Database connection failed**
```bash
# Check MySQL is running
sudo systemctl status mysql
# Verify credentials in .env
mysql -u root -p -e "SHOW DATABASES;"
```

**Port already in use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**CORS errors**
- Ensure `FRONTEND_URL=http://localhost:3000` in backend `.env`
- Check that proxy is set in `frontend/package.json`

**JWT errors**
- Ensure `JWT_SECRET` is set and matches between restarts
- Clear localStorage in browser and re-login

---

## 📝 License

MIT License — Free to use for personal and commercial projects.

---

## 🙏 Acknowledgments

Built with ❤️ using React, Node.js, Express, MySQL, and Tailwind CSS.

---

*MediCare Hospital Management System — Professional Healthcare Platform*
