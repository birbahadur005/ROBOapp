# Deployment Guide: RAVAN College Receptionist & AI Visitor Appointment System

This guide explains how to deploy the application into production across different environments:
- **Option 1: Docker & Docker Compose** *(Recommended for VPS & Cloud VMs)*
- **Option 2: Linux VPS / Ubuntu Server** *(Bare-metal with PM2 + Nginx Reverse Proxy + Free SSL)*
- **Option 3: Cloud Platforms** *(Render, Railway, Fly.io)*
- **Option 4: Local Campus Network / Windows Server** *(Campus Intranet Kiosk without Cloud)*

---

## 🔒 Important: HTTPS & SSL Notice for PWA and WebRTC Camera

Modern web browsers (Chrome, Safari, Firefox, Edge, Android Chrome) **require HTTPS** to enable:
1. **WebRTC Camera Capture** (for visitor photo capture on smartphones and tablets).
2. **PWA "Install to Home Screen"** prompt.
3. **Web Push Notifications**.

> **Exception**: `http://localhost` is treated as a secure origin by browsers for local development and testing. When deploying to a real domain (e.g. `reception.college.edu` or a public IP), **HTTPS with SSL is mandatory**.

---

## 🐳 Option 1: Docker & Docker Compose (Recommended)

### Prerequisites
- A Linux/Windows/macOS server with **Docker** and **Docker Compose v2** installed.
- Port `5000` (or `80`/`443`) open in your firewall.

### 1. Clone & Configure
```bash
git clone <your-repository-url> ravan-app
cd ravan-app

# Copy and update environment variables
cp .env.example .env
nano .env
```

### 2. Start Services
```bash
# Build and run containers in background
docker compose up -d --build
```

### 3. Verify Deployment
```bash
# Check container logs
docker compose logs -f app

# Test health check
curl http://localhost:5000/api/health
```

The application is now running on `http://localhost:5000` with:
- Web App & API container
- Persistent volume for uploaded visitor photos (`visitor_uploads`)
- Automatic Prisma migration and initial seed data

---

## 🐧 Option 2: Linux VPS / Ubuntu Server (PM2 + Nginx + Let's Encrypt)

This setup is ideal for a standard Ubuntu 22.04 or 24.04 VPS (DigitalOcean Droplet, AWS EC2, Linode, Hetzner).

### 1. Install Node.js 20+ & PM2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git

# Install PM2 process manager globally
sudo npm install -g pm2
```

### 2. Clone Repository & Build Application
```bash
cd /var/www
sudo git clone <your-repo-url> ravan-receptionist
cd ravan-receptionist
sudo chown -R $USER:$USER /var/www/ravan-receptionist

# Install server dependencies
cd server
npm install
npx prisma generate
npx prisma db push
npm run build
npx tsx prisma/seed.ts

# Install client dependencies & build PWA
cd ../client
npm install
npm run build

# Return to root
cd ..
```

### 3. Configure Environment Variables
```bash
cat << 'EOF' > server/.env
PORT=5000
NODE_ENV=production
APP_URL=https://reception.yourcollege.edu
CORS_ORIGIN=https://reception.yourcollege.edu
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-random-32-char-jwt-secret-key-here
SESSION_SECRET=your-random-32-char-session-secret-here
GEMINI_API_KEY=your-optional-gemini-api-key
STORAGE_DRIVER=local
STORAGE_UPLOAD_DIR=../../uploads/visitor-photos
DEFAULT_COLLEGE_NAME="Your College Name"
DEFAULT_COLLEGE_TAGLINE="AI Visitor & Appointment Management System"
EOF
```

### 4. Start Application with PM2 Daemon
```bash
# Start backend process (which serves both API and built client PWA)
pm2 start server/dist/index.js --name "ravan-reception"

# Enable PM2 to auto-start on system reboot
pm2 startup
pm2 save
```

### 5. Configure Nginx Reverse Proxy with WebSocket Support
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/ravan-reception
```

Paste the following configuration (replace `reception.yourcollege.edu` with your domain):
```nginx
server {
    server_name reception.yourcollege.edu;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

Enable the site and test configuration:
```bash
sudo ln -s /etc/nginx/sites-available/ravan-reception /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Install Free SSL Certificate via Let's Encrypt
```bash
sudo certbot --nginx -d reception.yourcollege.edu
```
Certbot will configure SSL automatically and setup automatic certificate renewals.

---

## ☁️ Option 3: Cloud Platforms (Render, Railway, Fly.io)

### Render (Easiest Cloud Deploy)
1. Push your code to a GitHub or GitLab repository.
2. Sign in to [Render.com](https://render.com) and click **New &rarr; Web Service**.
3. Select your repository.
4. Set the following build settings:
   - **Environment**: `Docker`
   - **Docker Context**: `.`
   - **Dockerfile Path**: `Dockerfile`
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: *(32+ random characters)*
   - `SESSION_SECRET`: *(32+ random characters)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `DATABASE_URL`: `"file:/app/server/dev.db"`
6. Click **Create Web Service**. Render will build the Docker container and provide a free `https://your-service.onrender.com` URL with SSL included.

---

## 🏫 Option 4: Local Campus Network / Windows PC (LAN Kiosk)

If the college prefers to host the receptionist application completely inside the local campus Wi-Fi / LAN without external cloud servers:

### 1. Build and Run on Server / Reception PC
```powershell
# In PowerShell from project root:
npm --prefix server install
npm --prefix client install

npm --prefix server run build
npm --prefix client run build

# Start the server
node server/dist/index.js
```

### 2. Access Across Campus Wi-Fi
Find the local IP address of the hosting computer:
```powershell
ipconfig
# Look for IPv4 Address, e.g. 192.168.1.50
```

- Any tablet, phone, or computer connected to the college Wi-Fi can open:
  `http://192.168.1.50:5000`
- To configure a custom domain within campus routers (e.g. `http://reception.college.local`), add a DNS record or router hostname pointing to the server's static LAN IP.

---

## 📋 Production Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | HTTP port for the backend web server |
| `NODE_ENV` | No | `production` | Environment mode (`production` or `development`) |
| `APP_URL` | Yes | `http://localhost:5000` | Canonical public URL of the application |
| `CORS_ORIGIN` | No | `http://localhost:5000` | Comma-separated allowed CORS origins |
| `DATABASE_URL` | Yes | `"file:./dev.db"` | Prisma database URL (SQLite or PostgreSQL) |
| `JWT_SECRET` | Yes | *(Random)* | 32+ character key for JWT visitor token signing |
| `SESSION_SECRET` | Yes | *(Random)* | Session secret encryption key |
| `GEMINI_API_KEY` | No | `""` | Google Gemini API key for Grounded AI assistant |
| `STORAGE_DRIVER` | No | `local` | Storage driver (`local`) |
| `STORAGE_UPLOAD_DIR` | No | `../../uploads/visitor-photos` | Directory path for encrypted visitor photos |

---

## 🔑 Default Production Demo Credentials

| Role | Account ID / Identifier | Default Password | Initial Dashboard URL |
|---|---|---|---|
| **Super Admin** | `ADMIN-001` / `admin@college.edu` | `Admin@123` | `/admin/login` |
| **Director** | `DIRECTOR-001` / `director@college.edu` | `Director@123` | `/authority/login` |
| **Principal** | `PRINCIPAL-001` / `principal@college.edu` | `Principal@123` | `/authority/login` |
| **Reception Desk** | `RECEPTION-001` / `reception@college.edu` | `Reception@123` | `/authority/login` |

> **Security Recommendation**: Change all initial passwords immediately upon first deployment via the Admin Dashboard.
