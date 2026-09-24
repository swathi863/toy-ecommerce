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

## 4. Environment Configuration & Security

The project uses externalized environment variables to keep sensitive credentials secure.

### Local Development Setup:
1. Copy `application-example.properties` to create your local `application.properties`:
   ```bash
   cp backend/src/main/resources/application-example.properties backend/src/main/resources/application.properties
   ```
2. Open `backend/src/main/resources/application.properties` and replace placeholder environment variables with your local database & secret key values OR set them in your local OS environment.

### Production Setup (Render / Cloud Hosting):
Configure the required environment variables directly in your hosting platform (e.g. Render Dashboard under **Environment Variables**):
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `BREVO_API_KEY`
- `MAIL_USERNAME`
- `FRONTEND_URL`

> **IMPORTANT SECURITY RULE**: Never commit real database passwords, JWT secrets, or API keys to GitHub. Real `application.properties` files must remain untracked in `.gitignore`.
