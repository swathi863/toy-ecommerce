# Toyland E-Commerce Platform

A complete, full-stack e-commerce application for Toyland featuring Customer shopping experience, Razorpay test payment integration, order history tracking, and a comprehensive Admin Panel with real-time business analytics.

## Project Structure

The project is cleanly separated into 3 core directories:

```
Toys/
├── frontend/    # React + Vite frontend application
├── backend/     # Spring Boot + Java backend API application
└── database/    # MySQL schema, dump files, and setup instructions
```

---

## 1. Frontend (`/frontend`)
Built with **React**, **Vite**, **Vanilla CSS**, and **Lucide Icons**.

### How to Run Frontend:
```bash
cd frontend
npm install
npm run dev
```
Access the application in your browser at `http://localhost:5173/`.

---

## 2. Backend (`/backend`)
Built with **Spring Boot 3**, **Java 22**, **Spring Security**, and **JWT Authentication**.

### How to Run Backend:
```bash
cd backend
./gradlew bootRun
```
The REST API server runs at `http://localhost:8080/`.

---

## 3. Database (`/database`)
Uses **MySQL Database** (`stringstacks_ecommerce`).

### Database Setup:
1. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS stringstacks_ecommerce;
   ```
2. Import the SQL dump:
   ```bash
   mysql -u root -p stringstacks_ecommerce < database/schema.sql
   ```
