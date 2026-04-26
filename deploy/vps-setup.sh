#!/bin/bash
# ============================================================
#  SGNexasoft — VPS Auto Setup Script
#  Tested on Ubuntu 22.04 LTS
#  Run as root: sudo bash vps-setup.sh
# ============================================================

set -e

echo "========================================="
echo " SGNexasoft VPS Setup"
echo "========================================="

# ── 1. System update ──────────────────────────────────────
echo "[1/8] Updating system..."
apt update -y && apt upgrade -y

# ── 2. Install dependencies ──────────────────────────────
echo "[2/8] Installing Java 17, Nginx, MySQL, Node.js..."
apt install -y openjdk-17-jdk nginx mysql-server curl git ufw certbot python3-certbot-nginx

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# ── 3. Configure firewall ─────────────────────────────────
echo "[3/8] Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 4. MySQL setup ────────────────────────────────────────
echo "[4/8] Setting up MySQL..."
systemctl start mysql
systemctl enable mysql

mysql -e "CREATE DATABASE IF NOT EXISTS sgnexasoft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'sguser'@'localhost' IDENTIFIED BY 'SgPass@2024!';"
mysql -e "GRANT ALL PRIVILEGES ON sgnexasoft_db.* TO 'sguser'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "MySQL configured. DB: sgnexasoft_db | User: sguser | Pass: SgPass@2024!"

# ── 5. Create app directory ───────────────────────────────
echo "[5/8] Creating app directory..."
mkdir -p /opt/sgnexasoft/{backend,frontend,uploads}
chown -R www-data:www-data /opt/sgnexasoft/uploads

# ── 6. Create systemd service ─────────────────────────────
echo "[6/8] Creating backend systemd service..."
cat > /etc/systemd/system/sgnexasoft.service << 'EOF'
[Unit]
Description=SGNexasoft Spring Boot Backend
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/sgnexasoft/backend
ExecStart=/usr/bin/java -Djava.security.egd=file:/dev/./urandom \
  -DSPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/sgnexasoft_db?useSSL=false&allowPublicKeyRetrieval=true" \
  -DSPRING_DATASOURCE_USERNAME="sguser" \
  -DSPRING_DATASOURCE_PASSWORD="SgPass@2024!" \
  -DAPP_JWT_SECRET="SGNexasoftProductionSecretKeyMustBe32Chars!" \
  -DAPP_UPLOAD_DIR="/opt/sgnexasoft/uploads/" \
  -jar /opt/sgnexasoft/backend/sgnexasoft-backend-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sgnexasoft

# ── 7. Nginx configuration ────────────────────────────────
echo "[7/8] Configuring Nginx..."
cat > /etc/nginx/sites-available/sgnexasoft << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Frontend (React build)
    root /opt/sgnexasoft/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }

    # Static file uploads
    location /uploads/ {
        alias /opt/sgnexasoft/uploads/;
        expires 30d;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
NGINXEOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/sgnexasoft /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# ── 8. Done ───────────────────────────────────────────────
echo ""
echo "========================================="
echo " Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Upload your JAR:   scp target/sgnexasoft-backend-1.0.0.jar ubuntu@YOUR_IP:/opt/sgnexasoft/backend/"
echo "  2. Start backend:     sudo systemctl start sgnexasoft"
echo "  3. Build frontend:    npm run build"
echo "  4. Upload frontend:   scp -r build/* ubuntu@YOUR_IP:/opt/sgnexasoft/frontend/"
echo "  5. Add SSL (optional):sudo certbot --nginx -d yourdomain.com"
echo ""
echo "  Check backend logs:   sudo journalctl -u sgnexasoft -f"
echo "  Check nginx logs:     sudo tail -f /var/log/nginx/error.log"
