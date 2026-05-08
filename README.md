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


## 🙏 Acknowledgments

Built with ❤️ using React, Node.js, Express, MySQL, and Tailwind CSS.

---

*MediCare Hospital Management System — Professional Healthcare Platform*
