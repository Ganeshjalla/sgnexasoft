# SGNexasoft — Freelance Platform

A full-stack freelance marketplace connecting clients with student developers.
Built with **Spring Boot 3 + React 18 + MySQL + JWT + WebSocket**.

---

## 🏗️ Architecture

```
Frontend (React 18 + Tailwind CSS) → REST API → Backend (Spring Boot 3) → MySQL
                                  ↘ WebSocket (STOMP/SockJS) ↗
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

---

### 1. Database Setup

```sql
CREATE DATABASE sgnexasoft_db;
```

> The app will auto-create all tables on first run (`spring.jpa.hibernate.ddl-auto=update`).

---

### 2. Backend Setup

```bash
cd backend

# Edit database credentials if needed:
# src/main/resources/application.properties
# spring.datasource.username=root
# spring.datasource.password=root

mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Demo Accounts

Register via `/register` or create manually in DB:

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@sg.com       | admin123  |
| Client  | client@sg.com      | client123 |
| Student | student@sg.com     | student123|

---

## 📦 Features

### ✅ Authentication
- JWT-based login/register
- Role-based access: CLIENT / STUDENT / ADMIN

### ✅ Project Management
- Post, browse, search projects
- Category, skills, budget, deadline
- Status tracking: OPEN → IN_PROGRESS → UNDER_REVIEW → COMPLETED

### ✅ Bidding System
- Students apply with proposals and bid amounts
- Clients review and accept bids
- Auto-creates contract on acceptance

### ✅ Contract & Workflow
- Auto-generated contracts on bid acceptance
- Full project lifecycle tracking

### ✅ Submission System
- Students submit work with files
- Clients approve, request revision, or reject
- File uploads stored locally

### ✅ Payment System (Escrow)
- Client initiates payment (held in escrow)
- Released to student wallet after approval
- Transaction history with status tracking

### ✅ Real-time Messaging
- WebSocket-powered chat (STOMP + SockJS)
- Conversation threads per user

### ✅ Notifications
- Auto-notified on: bid received, assigned, submitted, payment released
- Unread count in topbar

### ✅ Reviews & Ratings
- Post-project rating system (1–5 stars)
- Average rating shown on profiles

### ✅ Admin Panel
- Platform stats overview
- Manage all users (enable/disable)
- Monitor all projects and payments

### ✅ Dashboard
- Role-specific stats
- Revenue chart (Chart.js)
- Project status doughnut chart

---

## 📁 Project Structure

```
sgnexasoft/
├── backend/                    # Spring Boot app
│   └── src/main/java/com/sgnexasoft/
│       ├── model/              # JPA Entities
│       ├── repository/         # Spring Data JPA
│       ├── service/            # Business logic
│       ├── controller/         # REST + WebSocket
│       ├── security/           # JWT + Auth
│       ├── config/             # CORS, WebSocket
│       └── exception/          # Error handling
│
└── frontend/                   # React app
    └── src/
        ├── api/                # Axios + services
        ├── context/            # Auth context
        ├── components/layout/  # Sidebar + topbar
        └── pages/              # All page components
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/projects | Browse open projects |
| POST | /api/projects | Create project (CLIENT) |
| POST | /api/bids | Place bid (STUDENT) |
| POST | /api/projects/{id}/assign/{bidId} | Assign student |
| POST | /api/submissions | Submit work |
| POST | /api/payments/initiate | Hold payment in escrow |
| POST | /api/payments/{id}/release | Release payment |
| GET | /api/messages/conversation/{userId} | Get messages |
| WS | /ws | WebSocket endpoint |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Charts | Chart.js, react-chartjs-2 |
| HTTP | Axios |
| Real-time | STOMP, SockJS |
| Backend | Spring Boot 3.2, Spring Security |
| Auth | JWT (jjwt 0.11.5) |
| Database | MySQL 8 + Spring Data JPA |
| File Upload | Local filesystem |
| Build | Maven (backend), Create React App (frontend) |

---

## 🔧 Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sgnexasoft_db
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASS
app.jwt.secret=YourSecretKeyAtLeast32Chars
app.jwt.expiration=86400000    # 24 hours in ms
app.upload.dir=uploads/
```

---

## 🚀 Production Tips

1. Replace local file storage with **AWS S3**
2. Add **Razorpay SDK** for real payments
3. Use **PostgreSQL** for production DB
4. Add **Docker Compose** for containerized deployment
5. Set environment variables for secrets

---

## 📄 License
MIT — Free to use and modify.
