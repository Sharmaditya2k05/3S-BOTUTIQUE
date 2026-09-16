#!/bin/bash
# =============================================================================
# 3S Saree Boutique — Oracle Cloud VM Setup
# =============================================================================
# Run this on a fresh Ubuntu 22.04+ ARM instance (Oracle Always Free tier).
#
# Usage:
#   1. SSH into your Oracle Cloud VM
#   2. Clone or copy this repo to the VM
#   3. Run:  chmod +x deploy/setup.sh && sudo deploy/setup.sh
#
# What this does:
#   - Installs Node.js 20, nginx, certbot, pm2
#   - Builds the client and server
#   - Creates a production .env with a random JWT secret
#   - Seeds the database (or resets to blank — your choice)
#   - Starts the app with PM2 (auto-restarts on crash and boot)
#   - Configures nginx as a reverse proxy
#   - Opens firewall ports 80 and 443
#   - Sets up a daily backup cron job
#
# After this script finishes:
#   - Your site is live at http://<VM_PUBLIC_IP>
#   - To add HTTPS with a domain, run:
#       sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# =============================================================================

set -euo pipefail

APP_DIR="/opt/3s-saree"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "=========================================="
echo "  3S Saree Boutique — Server Setup"
echo "=========================================="
echo ""

# ─── Check we're running as root ─────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  echo "Please run with sudo:  sudo deploy/setup.sh"
  exit 1
fi

# ─── System packages ─────────────────────────────────────────────────────────
echo "[1/8] Installing system packages..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw > /dev/null

# ─── Node.js 20 ──────────────────────────────────────────────────────────────
if ! command -v node &> /dev/null || [[ "$(node -v)" != v20* && "$(node -v)" != v22* ]]; then
  echo "[2/8] Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null
else
  echo "[2/8] Node.js $(node -v) already installed."
fi

# ─── PM2 ──────────────────────────────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  echo "     Installing PM2..."
  npm install -g pm2 > /dev/null 2>&1
fi

# ─── Copy project to /opt ────────────────────────────────────────────────────
echo "[3/8] Setting up project at $APP_DIR..."
mkdir -p "$APP_DIR"
rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' \
  "$REPO_DIR/" "$APP_DIR/"

mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/backups"
mkdir -p "$APP_DIR/server/uploads/thumbs"
mkdir -p "$APP_DIR/server/data"

# ─── Install dependencies & build ────────────────────────────────────────────
echo "[4/8] Installing dependencies and building..."
cd "$APP_DIR/server"
npm install --omit=dev 2>&1 | tail -1

cd "$APP_DIR/client"
npm install 2>&1 | tail -1
npm run build 2>&1 | tail -1

# Copy built client into server/public
rm -rf "$APP_DIR/server/public"
cp -r "$APP_DIR/client/dist" "$APP_DIR/server/public"

cd "$APP_DIR/server"
npm install typescript --no-save 2>&1 | tail -1
npx tsc 2>&1 | tail -1 || true

echo "     Build complete."

# ─── Production .env ──────────────────────────────────────────────────────────
ENV_FILE="$APP_DIR/server/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "[5/8] Creating production .env..."
  JWT_SECRET=$(openssl rand -hex 32)
  ADMIN_PW=$(openssl rand -base64 16)
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=4000
JWT_SECRET=$JWT_SECRET

# Admin credentials — change these after first login
ADMIN_EMAIL=admin@3ssaree.com
ADMIN_PASSWORD=$ADMIN_PW
ADMIN_NAME=Boutique Admin

# Grok AI Chat API key (optional — chat falls back to WhatsApp without it)
# Get yours at https://console.x.ai
GROK_API_KEY=
EOF
  echo "     JWT_SECRET generated. Saved to $ENV_FILE"
  echo "     Admin password generated — see $ENV_FILE"
else
  echo "[5/8] .env already exists, keeping it."
fi

# ─── Seed database if empty ──────────────────────────────────────────────────
DB_FILE="$APP_DIR/server/data/db.json"
if [ ! -f "$DB_FILE" ]; then
  echo "[5b]  No database found. Initializing with starter categories..."
  cd "$APP_DIR/server"
  npx ts-node-dev --transpile-only src/reset.ts 2>&1 | tail -1 || \
    node -e "
      require('dotenv').config({path:'$APP_DIR/server/.env'});
      const fs = require('fs');
      const email = process.env.ADMIN_EMAIL || 'admin@3ssaree.com';
      const pw = process.env.ADMIN_PASSWORD || 'Boutique@123';
      const name = process.env.ADMIN_NAME || 'Boutique Admin';
      const db = {products:[],categories:[],settings:{businessName:'3S Saree',logo:'',description:'',whatsappNumber:'',phone:'',email:'',instagram:'',facebook:'',address:'',city:'',businessHours:'',aboutText:'',yearsOfExperience:'',heroImage:'',heroHeading:'Discover Elegance',heroSubheading:'Handpicked Sarees for Every Occasion',heroTagline:'Tradition, woven beautifully for the modern woman.',footerText:'',ownerImage:'',ownerName:'',announcementText:'',announcementLink:'',announcementColor:'#5f1526',announcementEnabled:false,seoTitle:'',seoDescription:'',seoKeywords:'',googleAnalyticsId:'',lowStockThreshold:0,adminNotificationEmail:'',googleBusinessUrl:'',homepageSections:[{id:'hero',type:'hero',enabled:true,order:0},{id:'why-us',type:'why-us',enabled:true,order:1},{id:'categories',type:'categories',enabled:true,order:2},{id:'featured',type:'featured',enabled:true,order:3},{id:'new-arrivals',type:'new-arrivals',enabled:true,order:4},{id:'our-story',type:'our-story',enabled:true,order:5},{id:'testimonials',type:'testimonials',enabled:true,order:6},{id:'cta',type:'cta',enabled:true,order:7}]},events:[],admins:[{id:'admin1',email:email,passwordHash:require('bcryptjs').hashSync(pw,10),name:name}],reviews:[],testimonials:[],customers:[],coupons:[],blog:[],whatsappTemplates:[]};
      fs.writeFileSync('$DB_FILE', JSON.stringify(db, null, 2));
    "
  echo "     Database initialized. Admin email: \$(grep ADMIN_EMAIL $ENV_FILE | cut -d= -f2)"
  echo "     ⚠  Check $ENV_FILE for your admin credentials"
fi

# ─── Start with PM2 ──────────────────────────────────────────────────────────
echo "[6/8] Starting app with PM2..."
cd "$APP_DIR"
pm2 delete 3s-saree 2>/dev/null || true
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>&1 | tail -1
echo "     App running on port 4000."

# ─── Nginx ────────────────────────────────────────────────────────────────────
echo "[7/8] Configuring nginx..."
# Use IP-based config (no domain yet)
cat > /etc/nginx/sites-available/3s-saree <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 100M;

    location /uploads/ {
        alias /opt/3s-saree/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/3s-saree /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "     Nginx configured."

# ─── Firewall ─────────────────────────────────────────────────────────────────
echo "[8/8] Configuring firewall..."
ufw allow 22/tcp > /dev/null
ufw allow 80/tcp > /dev/null
ufw allow 443/tcp > /dev/null
ufw --force enable > /dev/null
# Oracle Cloud also needs iptables rules (their default image blocks 80/443)
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
netfilter-persistent save 2>/dev/null || true

echo "     Firewall: ports 22, 80, 443 open."

# ─── Backup cron ──────────────────────────────────────────────────────────────
chmod +x "$APP_DIR/deploy/backup.sh"
CRON_LINE="0 3 * * * $APP_DIR/deploy/backup.sh >> $APP_DIR/logs/backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "3s-saree"; echo "$CRON_LINE") | crontab -

echo ""
echo "=========================================="
echo "  Setup complete!"
echo "=========================================="
echo ""
echo "  Your site is live at:"
echo "    http://$(curl -s ifconfig.me 2>/dev/null || echo '<VM_PUBLIC_IP>')"
echo ""
echo "  Admin panel:"
echo "    http://<YOUR_IP>/admin/login"
echo "    Credentials are in $APP_DIR/server/.env"
echo ""
echo "  Next steps:"
echo "    1. Open Oracle Cloud Console → Networking → Virtual Cloud Networks"
echo "       → Security Lists → Add ingress rules for ports 80 and 443"
echo "    2. Point your domain to this VM's public IP"
echo "    3. Run: sudo certbot --nginx -d yourdomain.com"
echo "    4. Change the admin password from the admin panel"
echo "    5. Fill in Settings (WhatsApp number, phone, hero image, etc.)"
echo "    6. (Optional) Add your Grok API key to $ENV_FILE for AI chat"
echo "       Get one at https://console.x.ai"
echo ""
echo "  Useful commands:"
echo "    pm2 status              — check if app is running"
echo "    pm2 logs 3s-saree       — view live logs"
echo "    pm2 restart 3s-saree    — restart after code changes"
echo "    sudo nginx -t           — test nginx config"
echo "    $APP_DIR/deploy/backup.sh  — manual backup"
echo ""
