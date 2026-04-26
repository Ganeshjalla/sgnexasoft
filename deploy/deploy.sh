#!/bin/bash
# ============================================================
#  SGNexasoft — Deploy Script
#  Usage: ./deploy/deploy.sh YOUR_VPS_IP
# ============================================================

set -e

VPS_IP=${1:-"YOUR_VPS_IP"}
VPS_USER="ubuntu"
REMOTE_DIR="/opt/sgnexasoft"

echo "🚀 Deploying SGNexasoft to $VPS_IP..."

# ── Build backend ─────────────────────────────────────────
echo "[1/4] Building Spring Boot JAR..."
cd backend
mvn clean package -DskipTests -q
cd ..
echo "    ✓ JAR built: backend/target/sgnexasoft-backend-1.0.0.jar"

# ── Build frontend ────────────────────────────────────────
echo "[2/4] Building React app..."
cd frontend
npm ci --silent
REACT_APP_API_URL="" npm run build --silent
cd ..
echo "    ✓ React build complete: frontend/build/"

# ── Upload to VPS ─────────────────────────────────────────
echo "[3/4] Uploading to VPS ($VPS_IP)..."
scp backend/target/sgnexasoft-backend-1.0.0.jar $VPS_USER@$VPS_IP:$REMOTE_DIR/backend/
scp -r frontend/build/* $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/
echo "    ✓ Files uploaded"

# ── Restart services ──────────────────────────────────────
echo "[4/4] Restarting services..."
ssh $VPS_USER@$VPS_IP "sudo systemctl restart sgnexasoft && sudo systemctl reload nginx"
echo "    ✓ Services restarted"

echo ""
echo "✅ Deployment complete! Visit http://$VPS_IP"
