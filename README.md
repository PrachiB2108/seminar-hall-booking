# 🏛️ Seminar Hall Booking System — MERN Stack

A full-stack web application built with **MongoDB, Express, React, Node.js (MERN)** that allows college students to book seminar halls and administrators to manage bookings.

---

## 📁 Project Structure

```
seminar-hall-booking/
├── client/                  ← React (Vite) frontend — runs on port 5173
│   ├── src/
│   │   ├── api/             ← Axios instance (auto-attaches JWT token)
│   │   ├── components/      ← Navbar, ProtectedRoute, ToastContainer
│   │   ├── context/         ← AuthContext (global login state)
│   │   ├── pages/           ← Home, Halls, Book, MyBookings, Login, Register, Admin
│   │   ├── App.jsx          ← Routes definition
│   │   ├── main.jsx         ← React entry point
│   │   └── index.css        ← Global styles
│   ├── index.html
│   ├── vite.config.js       ← Vite config + API proxy to backend
│   └── package.json
│
└── server/                  ← Express + Mongoose backend — runs on port 5000
    ├── config/
    │   └── db.js            ← MongoDB connection (Mongoose)
    ├── middleware/
    │   └── auth.js          ← JWT verification middleware
    ├── models/
    │   ├── User.js          ← User schema (name, email, password, role)
    │   ├── Hall.js          ← Hall schema (name, location, capacity, facilities)
    │   └── Booking.js       ← Booking schema (user, hall, date, time, status)
    ├── routes/
    │   ├── auth.js          ← /api/auth  (register, login, me)
    │   ├── halls.js         ← /api/halls (list, details, availability)
    │   ├── bookings.js      ← /api/bookings (create, my, cancel)
    │   ├── admin.js         ← /api/admin (dashboard, approve/reject, manage halls)
    │   └── setup.js         ← /api/setup (one-time seed route)
    ├── scripts/
    │   └── seed.js          ← Manual seed script (for local MongoDB)
    ├── server.js            ← Express app entry point
    └── package.json
```

---

## ✅ Prerequisites

Make sure the following are installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or above | https://nodejs.org |
| npm | v9 or above | Comes with Node.js |
| MongoDB Atlas account | Free tier | https://www.mongodb.com/atlas |

---

## 🍃 Step 1 — Set Up MongoDB Atlas

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in
2. Create a **free cluster** (M0 tier)
3. Under **Database Access** → Add a database user with a username and password
4. Under **Network Access** → Click **Add IP Address** → Select **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Go to **Database → Connect → Drivers** → Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
   ```

---

## ⚙️ Step 2 — Configure Environment Variables

Open `server/.env` and replace the `MONGO_URI` with your Atlas connection string:

```env
MONGO_URI=mongodb+srv://yourUsername:yourPassword@yourCluster.mongodb.net/seminar_hall_booking
JWT_SECRET=seminar_hall_jwt_secret_change_in_production
PORT=5000
CLIENT_URL=http://localhost:5173
```

> ⚠️ Replace `yourUsername`, `yourPassword`, and `yourCluster` with your actual Atlas credentials.

---

## 📦 Step 3 — Install Dependencies

Open two terminal windows.

**Terminal 1 — Install backend packages:**
```bash
cd server
npm install
```

**Terminal 2 — Install frontend packages:**
```bash
cd client
npm install
```

---

## ▶️ Step 4 — Start the Application

**Terminal 1 — Start the backend server (port 5000):**
```bash
cd server
npm run dev
```

Expected output:
```
========================================
  Seminar Hall Booking - MERN Backend
  Server running at: http://localhost:5000
========================================

MongoDB connected
```

**Terminal 2 — Start the React frontend (port 5173):**
```bash
cd client
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Now open **http://localhost:5173** in your browser.

---

## 🌱 Step 5 — Seed Admin User & Default Halls (IMPORTANT — Do this once)

After both servers are running, open this URL in your browser:

```
http://localhost:5000/api/setup
```

You should see:
```json
{
  "message": "Setup complete",
  "results": [
    "✅ Admin user created: admin@college.edu / admin123",
    "✅ 5 default halls created"
  ]
}
```

This creates:
- **Admin account:** `admin@college.edu` / `admin123`
- **5 halls:** Main Auditorium, Seminar Hall 1, Seminar Hall 2, Conference Room, Mini Auditorium

> ✅ Run this only once. If you run it again it will say "already exists".

---

## 🔑 Step 6 — Login as Admin

1. Open **http://localhost:5173/login**
2. Enter:
   - Email: `admin@college.edu`
   - Password: `admin123`
3. You will be redirected to the **Admin Panel**

---

## 🏫 Adding More Halls (via Admin Panel)

1. Login as admin
2. Go to **Admin Panel → Halls tab**
3. Click **+ Add Hall**
4. Fill in: Name, Location, Capacity, Facilities (comma-separated)
5. Click **Save Hall**

---

## 👤 How to Add More Admin Users

Currently, admin users must be created manually via the MongoDB Atlas dashboard:

1. Go to **Atlas → Browse Collections → seminar_hall_booking → users**
2. Click **Insert Document**
3. Add (use bcrypt hash for password — generate at https://bcrypt-generator.com):
   ```json
   {
     "name": "Admin Name",
     "email": "admin2@college.edu",
     "password": "<bcrypt-hash-of-password>",
     "department": "Administration",
     "role": "admin"
   }
   ```

Or register normally via the app and then change `role` from `user` to `admin` in Atlas.

---

## 🔄 Application Flow

### Student Flow

```
Register → Login → Browse Halls → Check Availability → Submit Booking Request
                                                              ↓
                                                    Status: "Pending"
                                                              ↓
                                              Admin Approves / Rejects
                                                              ↓
                                              Student sees status in "My Bookings"
```

### Admin Flow

```
Login (admin) → Admin Panel
                    ↓
            ┌───────────────────────────────────┐
            │ Dashboard │ Bookings │ Halls │ Users │
            └───────────────────────────────────┘
                    ↓
            Bookings tab → Filter by status/date
                    ↓
            Click Approve / Reject → Add remarks → Confirm
```

---

## 🔐 Authentication

- Uses **JWT (JSON Web Tokens)** — stateless, no sessions
- Token is stored in browser `localStorage`
- Every API request automatically sends `Authorization: Bearer <token>` header
- Token expires after **24 hours**
- Two roles: `user` (student) and `admin`

---

## 🛠️ API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/me` | Get current logged-in user |

### Halls
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/halls` | List all active halls |
| GET | `/api/halls/:id` | Get hall details |
| GET | `/api/halls/:id/availability?date=YYYY-MM-DD` | Check hall bookings for a date |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking request (auth required) |
| GET | `/api/bookings/my` | Get current user's bookings (auth required) |
| DELETE | `/api/bookings/:id` | Cancel a booking (auth required) |

### Admin (admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats + recent bookings |
| GET | `/api/admin/bookings` | All bookings (filter by status/date) |
| PUT | `/api/admin/bookings/:id` | Approve or reject a booking |
| POST | `/api/admin/halls` | Add a new hall |
| PUT | `/api/admin/halls/:id` | Update a hall |
| DELETE | `/api/admin/halls/:id` | Deactivate a hall |
| GET | `/api/admin/users` | List all registered users |

### Setup
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/setup` | Seed admin user + default halls (run once) |

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoNetworkError: connect ETIMEDOUT` | Go to Atlas → Network Access → Allow `0.0.0.0/0` |
| `MongoServerError: bad auth` | Check username/password in `.env` MONGO_URI |
| Frontend shows blank page | Make sure backend is running on port 5000 |
| Login fails after setup | Confirm `/api/setup` returned success |
| Admin panel not visible | Login with `admin@college.edu`, not a regular user account |

---

## 🧪 Default Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Student | Register via app | (your choice) |

---

## 📝 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **M** — Database | MongoDB Atlas (cloud) + Mongoose ODM |
| **E** — Backend | Express.js + Node.js |
| **R** — Frontend | React 18 + React Router v6 |
| **N** — Runtime | Node.js v18+ |
| HTTP Client | Axios |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Dev Server | Vite 5 |
| Backend Dev | Nodemon |
