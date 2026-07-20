# Smart Clinic Management System 🏥

A modern, production-grade Clinic Management Application built using the **PERN stack** (PostgreSQL, Express.js, React, Node.js) and styled with Tailwind CSS. The system features secure authentication, role-based access control, and dynamic interactive clinical dashboards.

---

## 🚀 Key Features Implemented

*   **Secure Authentication Engine**: Integrated HTTP-Only JWT cookie session management with robust password hashing using `bcrypt`.
*   **Dynamic Patient EHR Dashboard**: Allowed patients to monitor history logs, track active digital prescriptions, and schedule real-time clinical consultations into the database with auto-generated token numbers.
*   **Doctor Clinical Engine Portal**: Enabled active practitioners to manage today's appointment matrix queue and formulate digital prescriptions (Rx Records).
*   **Role-Based Access Control (RBAC)**: Enforced strict protection layers via route authorization (`protect` and `restrictTo` middlewares).

---

## 🛠️ Tech Stack & Architecture

*   **Frontend**: React.js, Vite, Tailwind CSS, Lucide React (Icons), Axios
*   **Backend**: Node.js, Express.js
*   **Database ORM**: PostgreSQL with Sequelize ORM
*   **Session Security**: JSON Web Tokens (JWT) & Cookies

---

## 📁 Project Structure

```text
smart-clinic-system/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Authentication, Patient, & Doctor core engines
│   │   ├── middlewares/   # Auth protection & route guards
│   │   ├── models/        # Sequelize database schemas (User, Appointment, etc.)
│   │   ├── routes/        # Express REST API routing pathways
│   │   └── utils/         # Token generation scripts
│   ├── server.js          # Server entry point
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── context/       # Global AuthContext provider state pipeline
    │   ├── pages/         # Login, PatientDashboard, DoctorDashboard components
    │   └── App.jsx        # Routing matrix configurations
    └── .gitignore