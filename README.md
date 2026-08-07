# Astrologer Meenakshi - Consultation Platform

Astrology consultation booking and content-management platform with admin panel.

## Live URLs

Not yet assigned. Set these per environment:

| Variable | Used by | Example |
|---|---|---|
| `VITE_API_URL` | admin build | `https://<domain>/api` |
| `VITE_SERVER_URL` | admin build | `https://<domain>` |
| `FRONTEND_URL` | backend email links | `https://<domain>` |

The admin build has no hardcoded fallback — a missing variable fails the build
rather than silently pointing at the wrong site.

## Admin Access

Created by `Backend/scripts/createAdmin.js`, which reads credentials from the
environment. Credentials are never stored in this repository.

```bash
ADMIN_SEED_EMAIL=admin@example.com ADMIN_SEED_PASSWORD='...' node Backend/scripts/createAdmin.js
```

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
