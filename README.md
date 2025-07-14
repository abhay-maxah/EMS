# 👥 Employee Management System (EMS)

A comprehensive Employee Management System designed to streamline HR operations—manage employee data, track attendance, and handle leave requests efficiently. The system features secure role-based access for administrators and regular employees.

## 🚀 Features

### 🔐 User Management
- Admins can create and manage employee accounts.
- Secure authentication for both admin and employee roles.

### 🕒 Attendance Tracking
- Employees can punch in/out and add daily work notes.
- Admins can view complete punch-in/out records.

### 🗓️ Leave Management
- Employees can apply for various types of leave.
- Admins can approve/reject leave requests and provide reasons for rejections.
- Approved leaves auto-deduct from available balance.
- Leave balances reset at the beginning of each year.

### 🛡️ Role-Based Access Control
- **Admin Role**: Full access to user/attendance/leave management.
- **Employee Role**: Access to personal records and profile.

### 💻 Responsive UI
- Modern and intuitive interface optimized for all devices.

---

## 🛠️ Technologies Used

### Backend (NestJS)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: Mysql
- **ORM/ODM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Class Validator

### Frontend (React)
- **Framework**: React
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios

---

## ⚙️ Setup and Installation

### 1️⃣ Backend Setup

```bash
git clone <your-backend-repo-url>
cd <your-backend-repo-folder>
npm install  # or yarn install
```

Create a `.env` file in the root with variables:

```env
PORT=3000
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN=''
```

```bash
npx prisma migrate dev --name <migration-name>
```

Start the backend server:

```bash
npm run start:dev  # or yarn start:dev
```

> Runs on: `http://localhost:3000`

---

### 2️⃣ Frontend Setup

```bash
cd ../<your-frontend-repo-folder>
npm install  # or yarn install
```

Start the development server:

```bash
npm run dev  # or yarn dev
```

> Opens on: `http://localhost:5173`

---

## 🚀 Usage

### 🔑 Admin Access
- **Login** using admin credentials.
- **Dashboard**: View overall summaries.
- **User Management**: Add/edit/deactivate employees.
- **Attendance**: View all records.
- **Leave Management**: Approve or reject applications.

### 👤 Employee Access
- **Login** with employee credentials.
- **Dashboard**: View personal attendance summary.
- **Punch In/Out**: Track work hours and add notes.
- **Leave Application**: Submit new requests.
- **Leave Status**: Check status and view reasons for rejection.

---

## 🔗 API Endpoints (Brief Overview)

### 🛂 Authentication
- `POST /auth/login`: Login
- `POST /auth/add-user`: Register admin (admin only)

### 👥 Users
- `POST /users`: Create user (admin)
- `GET /users`: List all users (admin)
- `GET /users/:id`: Get user by ID
- `PUT /users/:id`: Update user (admin)
- `DELETE /users/:id`: Delete user (admin)

### 🕘 Attendance
- `POST /attendance/punch-in`: Punch in (employee)
- `POST /attendance/punch-out`: Punch out with notes
- `GET /attendance`: Get all attendance records (admin)
- `GET /attendance/my`: Get personal records (employee)

### 🗓️ Leaves
- `POST /leaves`: Apply for leave (employee)
- `GET /leaves`: View all leave applications (admin)
- `GET /leaves/my`: View personal applications (employee)
- `PUT /leaves/:id/status`: Update status (admin; auto-deduct if approved)

---

## 📂 Project Structure (High-Level)

```plaintext
project-root/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication module (login, JWT, guards)
│   │   ├── users/              # User management (create, update, leave balances)
│   │   ├── attendance/         # Punch in/out logic and tracking
│   │   ├── leaves/             # Leave application and approval
│   │   ├── main.ts             # Application bootstrap
│   │   └── app.module.ts       # Root module
│   ├── .env.example            # Sample environment file
│   ├── package.json            # Dependencies and scripts
│   └── tsconfig.json           # TypeScript config

├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/                # Axios API service functions
│   │   ├── components/         # Reusable UI components (Buttons, Modals)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Pages (Dashboard, Login, Admin views)
│   │   ├── stores/             # Zustand state management
│   │   ├── App.jsx             # Main app structure
│   │   └── main.jsx            # ReactDOM entry point
│   ├── public/                 # Static assets
│   ├── .env.example            # Sample frontend .env
│   ├── package.json            # Frontend dependencies
│   └── tailwind.config.js      # TailwindCSS (or other styling lib) config
```
---
