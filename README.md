# ZenYourLife - Wellness & Massage Services Platform

Multi-language wellness and massage services booking platform with admin panel.

## Live URLs

- **Frontend:** https://zenyourlife.be
- **Admin Panel:** https://zenyourlife.be/admin
- **API:** https://zenyourlife.be/api

## Admin Access

- **Email:** admin@zenyourlife.be
- **Password:** ZenYourLife@Admin2026!

## Deployment

Deploy to production server with a single command:

```bash
./deploy.sh
```

This script will:
1. Build Docker image for linux/amd64
2. Compress and upload to server
3. Deploy and restart containers
4. Verify deployment

**Requirements:**
- Docker installed locally
- sshpass installed (`brew install hudochenkov/sshpass/sshpass` on macOS)

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Admin Panel
```bash
cd admin
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```env
PORT=5001
NODE_ENV=development
SERVER_ENV=production
MONGODB_URI=mongodb+srv://...
ADMIN_API_KEY=...
JWT_SECRET=...
```

### Admin (.env.production)
```env
VITE_API_URL=https://zenyourlife.be/api
VITE_SERVER_URL=https://zenyourlife.be
```

## Tech Stack

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React, Vite, TailwindCSS
- **Admin:** React, Vite, TailwindCSS
- **Deployment:** Docker, Nginx, Let's Encrypt SSL

## Features

- Multi-language support (EN, FR, DE, NL, ES)
- Online booking system
- Appointment management
- Service management
- Payment integration (Stripe)
- Email notifications
- SMS reminders (Twilio)
- Secure authentication
- Admin dashboard

## Server Details

- **Server:** 72.60.214.160
- **SSH Port:** 2212
- **Domain:** zenyourlife.be
- **SSL:** Let's Encrypt (auto-renewal)
