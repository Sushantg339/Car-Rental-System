# 🚗 Car Rental System Backend (TypeScript)

A **production-grade backend API** for a Car Rental System built using **TypeScript, Node.js, Express, PostgreSQL, JWT authentication, Zod validation, and the `pg` library**.

This project is designed to reflect **real-world backend engineering**, focusing on:

* Secure authentication
* Authorization & ownership checks
* Clean API contracts
* Business-rule enforcement
* Scalable architecture

---

## 🧠 System Overview

```
Client (Postman / Frontend)
        ↓
   Express Server (TypeScript)
        ↓
 Authentication Middleware (JWT)
        ↓
 Controllers (Business Logic)
        ↓
 PostgreSQL Database (pg Pool)
```

---

## ✨ Features

* 🔐 JWT-based authentication (login-only token issuance)
* 👤 Secure user signup & login using bcrypt
* 📦 User-specific booking management
* 🧾 Strict ownership checks on all bookings
* 📊 Booking summary & analytics
* 🧱 Input validation using Zod
* ⚠️ Consistent API-wide error handling
* 🗄️ PostgreSQL integration using `pg` with connection pooling

---

## 🛠️ Tech Stack

* **Language:** TypeScript
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (`pg` – node-postgres)
* **Authentication:** JWT, bcrypt
* **Validation:** Zod
* **Architecture:** RESTful APIs

---

## 🗂️ Database Schema

### `users` table

| Field      | Description     |
| ---------- | --------------- |
| id         | Primary Key     |
| username   | Unique username |
| password   | Hashed password |
| created_at | Timestamp       |

---

### `bookings` table

| Field        | Description                    |
| ------------ | ------------------------------ |
| id           | Primary Key                    |
| user_id      | Foreign Key → users.id         |
| car_name     | Name of car                    |
| days         | Rental duration                |
| rent_per_day | Cost per day                   |
| status       | booked / completed / cancelled |
| created_at   | Timestamp                      |

> All fields are **non-null** to ensure strong data integrity.

---

## 🔐 Authentication & Authorization

* JWT is issued **only during login**
* Token must be sent in request headers:

```
Authorization: Bearer <JWT_TOKEN>
```

* All `/bookings` routes are **protected**
* Auth middleware attaches user info to request:

```ts
req.user = {
  userId: number,
  username: string
};
```

---

## 📌 API Routes Overview

### Auth Routes

* `POST /auth/signup` – Register new user
* `POST /auth/login` – Authenticate & receive JWT

---

### Booking Routes (Protected)

* `POST /bookings` – Create booking
* `GET /bookings` – Fetch bookings / summary
* `PUT /bookings/:bookingId` – Update booking
* `DELETE /bookings/:bookingId` – Delete booking

---

### Business Rules

* `days < 365`
* `rentPerDay ≤ 2000`
* `totalCost = days × rentPerDay`
* Default booking status: `booked`
* Summary ignores `cancelled` bookings

---

## ⚠️ Error Handling Standard

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Readable error message"
}
```

---

# 🚀 Local Setup & Installation Guide

Follow these steps to **run the project locally**.

---

## 1️⃣ Prerequisites

Make sure you have the following installed:

* **Node.js** (v18+ recommended)
* **PostgreSQL**
* **Git**
* **npm**

Check versions:

```bash
node -v
npm -v
psql --version
```

---

## 2️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/car-rental-backend.git
cd car-rental-backend
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Setup PostgreSQL Database

### Create Database

```sql
CREATE DATABASE car_rental_db;
```

### Connect to Database

```bash
psql car_rental_db
```

### Create Tables

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  car_name VARCHAR(255) NOT NULL,
  days INTEGER NOT NULL,
  rent_per_day INTEGER NOT NULL,
  status VARCHAR(20) CHECK (status IN ('booked', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5️⃣ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/car_rental_db
JWT_SECRET=your_super_secret_key
```

⚠️ **Never commit `.env` to GitHub**

---

## 6️⃣ Run the Server

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

Server will start at:

```
http://localhost:3000
```

---

## 7️⃣ Testing APIs (Postman)

### Example Login Request

```http
POST /auth/login
Authorization: none
```

```json
{
  "username": "rahul",
  "password": "123"
}
```

Use the returned token for all `/bookings` routes.

---

## 📁 Project Structure (Conceptual)

```
src/
├── routes/        // API routes
├── controllers/   // Business logic
├── middleware/    // Auth middleware
├── db/            // pg pool & queries
├── schemas/       // Zod validation schemas
├── utils/         // Helper functions
└── index.ts       // Server entry point
```

---

## 🔐 Security Measures

* Password hashing with bcrypt
* JWT secret stored in environment variables
* SQL injection prevention using parameterized queries
* Authorization enforced via middleware
* Ownership validation on all sensitive routes

---

## 📈 Learning Outcomes

* Type-safe backend development with TypeScript
* JWT authentication & middleware design
* PostgreSQL relational modeling
* Ownership-based authorization
* Clean and scalable API architecture

---

## 🔮 Future Enhancements

* Unit & integration tests (Jest + Supertest)
* Pagination & filtering
* Swagger / OpenAPI documentation
* Admin role & permissions
* Rate limiting

---

## 👤 Author

**Sushant Gupta**
Full-Stack Developer

