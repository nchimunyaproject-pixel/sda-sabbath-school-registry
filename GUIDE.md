# SDA Sabbath School Registry – User & Technical Guide

Welcome to the **SDA Sabbath School Registry**, a hierarchical administrative platform designed to model the organizational structure of the Seventh-day Adventist Church. This guide explains how the system operates, how the database fallback works, and how to configure and run the application.

---

## 1. Administrative Hierarchy & Data Scope

The application enforces a strict hierarchical chain of command, ensuring data is private, secure, and properly aggregated:

```
[Union Conference]  --> Can view all Districts & approve overall metrics
       |
  [Districts]       --> Manages local churches & approves registration requests
       |
   [Churches]       --> Clerk adds classes/teachers, tracks local offerings
       |
    [Users]         --> Teachers manage student attendance sheets
```

### Roles and Responsibilities:
1. **Conference Admin (Elder Mutale)**:
   * Has global visibility across all districts.
   * Can create new districts and view aggregated data.
   * Can publish union-wide bulletins that filter down to all levels.
2. **District Admin (Pastor Phiri)**:
   * Manages a specific district.
   * Approves or rejects new church self-registrations.
   * Tracks weekly attendance report status for all churches in their district.
3. **Church Clerk (Sarah Miller)**:
   * Adds classes, adds teachers, and updates assignments.
   * Tracks local offerings (Weekly Mission, 13th Sabbath, Investment, etc.).
   * Compiles weekly class attendance and reports using built-in Google Gemini AI summaries.
4. **Teacher (John Doe)**:
   * Manages student rosters for their assigned Sabbath School class.
   * Logs weekly attendance (Present, Absent, Sick, Travelled).
   * Records visitors and submits weekly report sheets.

---

## 2. Technical Design & Architecture

### Frontend (Client-side)
* **Vite + React**: Fast modular building, rendering with TypeScript.
* **Tailwind CSS**: Premium, dark-blue and amber-accented layouts.
* **HashRouter**: Ensures client-side routing works out-of-the-box in static hosts.
* **Recharts**: Beautiful visual representations of weekly attendance and offerings.

### Backend (Server-side)
* **Express API**: Handles routing, user authorization, and data sync.
* **Nodemailer**: Connects to SMTP (e.g. Gmail) to send password recovery emails and temporary credential codes to clerks and teachers.
* **Bcrypt**: Securely hashes user passwords.

---

## 3. Database: Smart Dual-Mode Fallback

To ensure the system works immediately without manual database server setups:
1. **Primary Database (MySQL)**: The server tries to hook into a standard MySQL server (`localhost:3306`).
2. **Fallback Database (SQLite)**: If MySQL is offline, the backend falls back to an in-process SQLite database (`sda_church.db`) using the native `node:sqlite` package.
3. **DDL Parser**: On SQLite fallback, the backend reads `init.sql` and dynamically translates MySQL dialect constraints (such as `ENGINE=InnoDB`, `AUTO_INCREMENT`, `UNIQUE KEY`, and `NOW()`) into SQLite DDL on-the-fly to initialize and seed the tables automatically.

---

## 4. Default Seed Credentials

Use these credentials to log in and explore the different administrative dashboards:

| Administrative Scope | Email Address | Password |
| :--- | :--- | :--- |
| **Conference Admin** | `conference@church.com` | `password123` |
| **District Admin** | `district@church.com` | `password123` |
| **Church Clerk** | `clerk@church.com` | `password123` |
| **Sabbath School Teacher** | `john@church.com` | `password123` |

---

## 5. Local Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Credentials**:
   Rename or create `.env.local` in the project root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   GMAIL_USER=your_gmail_address@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   ```
3. **Run in Development**:
   ```bash
   npm run dev
   ```
   This will concurrently boot up:
   * The backend API server at `http://localhost:3001`
   * The frontend client at `http://localhost:5173`
