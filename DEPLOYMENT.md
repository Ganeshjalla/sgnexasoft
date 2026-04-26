# SGNexasoft — Complete Deployment Guide

---

## 📁 Project Structure

```
sgnexasoft/
├── backend/                    # Spring Boot app
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # React app
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── deploy/
│   ├── init.sql                # DB initialization
│   ├── seed.sql                # Demo data
│   ├── vps-setup.sh            # VPS auto-setup script
│   └── deploy.sh               # Deploy updates script
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD
├── docker-compose.yml          # Production Docker setup
├── docker-compose.dev.yml      # Dev Docker (DB only)
├── .env.example                # Environment variable template
├── render.yaml                 # Render.com deployment
├── vercel.json                 # Vercel deployment
└── README.md
```

---

## 🚀 Option 1: Run Locally (Development)

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+, npm
- MySQL 8+

### Steps

```bash
# 1. Clone / extract the project
cd sgnexasoft

# 2. Create MySQL database
mysql -u root -p
mysql> CREATE DATABASE sgnexasoft_db;
mysql> exit

# 3. Configure DB credentials
# Edit: backend/src/main/resources/application.properties
# Set: spring.datasource.username and spring.datasource.password

# 4. Start backend
cd backend
mvn spring-boot:run

# 5. Start frontend (new terminal)
cd frontend
npm install
npm start

# App runs at: http://localhost:3000
# API runs at: http://localhost:8080
```

### Seed demo data

```bash
# After the app starts once (JPA creates tables), run:
mysql -u root -p sgnexasoft_db < deploy/seed.sql

# Demo accounts (all passwords: password123)
# admin@sg.com   → Admin
# client@sg.com  → Client
# student@sg.com → Student
```

---

## 🐳 Option 2: Docker Compose (Easiest full deploy)

### Prerequisites
- Docker + Docker Compose installed

```bash
cd sgnexasoft

# Start everything (DB + Backend + Frontend)
docker-compose up --build -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# App runs at: http://localhost:80

# Seed demo data (after first startup)
docker exec -i sgnexasoft-db mysql -u sguser -psgpass123 sgnexasoft_db < deploy/seed.sql

# Stop everything
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### Customise secrets

Edit `docker-compose.yml` or create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
# Edit .env with your real values
docker-compose --env-file .env up -d
```

---

## ☁️ Option 3: Free Cloud Deploy (Vercel + Render + Aiven)

### Step 1 — Free MySQL at Aiven.io

1. Go to **https://aiven.io** → Start free trial
2. Create MySQL service (free tier)
3. Copy the connection string — looks like:
   `mysql://sguser:pass@mysql-abc.aivencloud.com:12345/sgnexasoft_db?ssl-mode=REQUIRED`

### Step 2 — Deploy Backend to Render.com

1. Push code to GitHub
2. Go to **https://render.com** → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build command:** `cd backend && mvn clean package -DskipTests`
   - **Start command:** `java -jar backend/target/sgnexasoft-backend-1.0.0.jar`
5. Add Environment Variables:
   ```
   SPRING_DATASOURCE_URL      → your Aiven MySQL URL
   SPRING_DATASOURCE_USERNAME → your Aiven user
   SPRING_DATASOURCE_PASSWORD → your Aiven password
   APP_JWT_SECRET             → any 32+ char random string
   APP_UPLOAD_DIR             → /tmp/uploads/
   ```
6. Deploy → Copy your backend URL (e.g. `https://sgnexasoft-backend.onrender.com`)

### Step 3 — Deploy Frontend to Vercel

1. Go to **https://vercel.com** → New Project → Import GitHub repo
2. Set **Root Directory** → `frontend`
3. Add Environment Variable:
   ```
   REACT_APP_API_URL → https://sgnexasoft-backend.onrender.com
   ```
4. Deploy → App is live!

**Cost: ₹0/month** | ⚠️ Free Render instances sleep after 15 min inactivity (cold start ~30s)

---

## 🖥️ Option 4: VPS Deploy (DigitalOcean / Hostinger)

### Quick setup (~₹400-600/month for 1GB VPS)

```bash
# 1. SSH into your fresh Ubuntu 22.04 VPS
ssh ubuntu@YOUR_VPS_IP

# 2. Upload and run the setup script
scp deploy/vps-setup.sh ubuntu@YOUR_VPS_IP:~/
ssh ubuntu@YOUR_VPS_IP "sudo bash vps-setup.sh"

# 3. From your local machine, run the deploy script
chmod +x deploy/deploy.sh
./deploy/deploy.sh YOUR_VPS_IP

# App live at: http://YOUR_VPS_IP
```

### Add SSL (HTTPS) — Free with Let's Encrypt

```bash
# Point your domain's A record to YOUR_VPS_IP first, then:
ssh ubuntu@YOUR_VPS_IP
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Auto-renews every 90 days
```

### Manage the backend service

```bash
sudo systemctl status sgnexasoft    # Check status
sudo systemctl restart sgnexasoft   # Restart
sudo journalctl -u sgnexasoft -f    # Live logs
```

---

## ⚙️ Option 5: CI/CD with GitHub Actions

### Setup once

1. Push repo to GitHub
2. Go to repo → Settings → Secrets and add:
   ```
   VPS_HOST        = your server IP
   VPS_USER        = ubuntu
   VPS_SSH_KEY     = cat ~/.ssh/id_rsa (your private key)
   DOCKER_USERNAME = your Docker Hub username
   DOCKER_PASSWORD = your Docker Hub token
   REACT_APP_API_URL = https://your-domain.com
   ```
3. Every push to `main` → auto builds, tests, and deploys 🎉

---

## 🌐 Domain + SSL Setup

### Cloudflare (Free CDN + SSL)

1. Register a domain (Namecheap, GoDaddy, etc.)
2. Add domain to **Cloudflare**
3. Point DNS A record → YOUR_VPS_IP
4. Enable Cloudflare proxy (orange cloud) → free SSL
5. In Nginx, update `server_name your-domain.com;`

---

## 🔧 Environment Variables Reference

| Variable | Example | Used In |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/sgnexasoft_db` | Backend |
| `SPRING_DATASOURCE_USERNAME` | `sguser` | Backend |
| `SPRING_DATASOURCE_PASSWORD` | `StrongPass!` | Backend |
| `APP_JWT_SECRET` | `32+CharRandomString!` | Backend |
| `APP_JWT_EXPIRATION` | `86400000` (24h) | Backend |
| `APP_UPLOAD_DIR` | `/opt/sgnexasoft/uploads/` | Backend |
| `REACT_APP_API_URL` | `https://api.yourdomain.com` | Frontend |

---

## ❗ Common Issues

| Problem | Fix |
|---|---|
| Backend won't start | Check DB is running: `sudo systemctl status mysql` |
| CORS errors | Confirm frontend URL is in `CorsConfig.java` allowed origins |
| WebSocket not connecting | Add `/ws/` proxy in Nginx config |
| JWT errors | Ensure `APP_JWT_SECRET` is 32+ characters |
| File uploads fail | Check `APP_UPLOAD_DIR` directory exists and is writable |
| React shows blank page | Run `npm run build` and ensure `index.html` is at Nginx root |
| Render cold start | Keep-alive ping via UptimeRobot every 10 min |

---

## 📊 Recommended Stack by Use Case

| Use Case | Frontend | Backend | Database | Cost |
|---|---|---|---|---|
| Demo/Learning | Vercel | Render | Aiven free | ₹0 |
| Student project | Vercel | Render | Aiven free | ₹0 |
| Production small | VPS | VPS | VPS MySQL | ~₹500/mo |
| Production scale | Vercel | Docker VPS | Managed DB | ~₹2000/mo |
