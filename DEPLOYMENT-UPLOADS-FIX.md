# Deployment Uploads Persistence Fix

**Issue:** When images are uploaded to the server via admin panel, they get stored in the server's `backend/uploads/` directory. However, when redeploying, these uploaded images disappear because the deployment process doesn't preserve them.

---

## Root Cause

The deployment process was:
1. ✅ Backup server uploads to local `backend/uploads-backup/`
2. ✅ Build new Docker image
3. ✅ Upload image to server
4. ✅ Stop containers with `docker-compose down`
5. ❌ **Start containers without restoring uploads**
6. ❌ **Server uploads get overwritten/lost**

**The Problem:** After `docker-compose down`, when `docker-compose up -d` runs, the Docker volume mount (`./backend/uploads:/app/backend/uploads`) uses whatever is in the local `./backend/uploads/` directory on the server. If this directory doesn't have the latest uploaded files, they're gone.

---

## Solution Implemented

### 1. Updated Deployment Script

**File:** `deploy.sh`

Added upload preservation logic on the **server side** during deployment:

```bash
# BEFORE DEPLOYMENT
echo "Creating backup of current uploads..."
mkdir -p /tmp/zenyourlife-uploads-backup
cp -r backend/uploads/* /tmp/zenyourlife-uploads-backup/

# STOP CONTAINERS
docker-compose down

# AFTER STOPPING, BEFORE STARTING
echo "Restoring uploads from backup..."
mkdir -p backend/uploads
cp -r /tmp/zenyourlife-uploads-backup/* backend/uploads/
rm -rf /tmp/zenyourlife-uploads-backup

# START CONTAINERS
docker-compose up -d
```

### 2. Updated .gitignore

**File:** `.gitignore`

Added entries to ensure uploads are never committed to Git:

```
# Uploads - managed on server, never commit
backend/uploads/
backend/uploads-backup/
uploads/
*.tar.gz
```

---

## How It Works Now

### Deployment Flow (Corrected):

1. **Local Machine - Step 2:** Backup server uploads to local backup
   ```bash
   rsync server:/app/zenyourlife/backend/uploads/ → local/backend/uploads-backup/
   ```

2. **Local Machine - Steps 3-5:** Build and upload Docker image
   - Build new Docker image with latest code
   - Compress and upload to server

3. **Server - Step 6:** Deploy with upload preservation
   ```bash
   # Backup uploads on server (to /tmp)
   cp -r backend/uploads/* /tmp/zenyourlife-uploads-backup/

   # Stop containers
   docker-compose down

   # Restore uploads from backup
   cp -r /tmp/zenyourlife-uploads-backup/* backend/uploads/

   # Start containers with preserved uploads
   docker-compose up -d
   ```

### Key Points:

✅ **Server-side backup:** Uploads are backed up on the server to `/tmp/` before stopping containers

✅ **Immediate restoration:** Uploads are restored from `/tmp/` backup before starting new containers

✅ **Volume persistence:** Docker volume mount ensures uploads persist across container restarts

✅ **Git exclusion:** Uploads are ignored by Git, never committed to repository

✅ **Local backup:** Optional local backup for disaster recovery

---

## Docker Volume Configuration

**File:** `docker-compose.yml`

The volume mount ensures uploads persist outside containers:

```yaml
services:
  zenyourlife-app:
    volumes:
      - ./backend/uploads:/app/backend/uploads  # ✅ Persists on host
      - ./logs:/app/logs
```

**What this means:**
- Files in `./backend/uploads` on the server are mapped to `/app/backend/uploads` inside container
- When container writes to `/app/backend/uploads`, it actually writes to server's `./backend/uploads`
- When container is recreated, it still sees the same files because they're on the host filesystem

---

## Testing the Fix

### Before Deployment:
1. Upload a test image via admin panel
2. Note the image URL (e.g., `https://zenyourlife.be/api/uploads/services/test-image.jpg`)
3. Verify image loads in browser

### During Deployment:
```bash
./deploy.sh
```

Watch for these console messages:
```
Creating backup of current uploads...
Loading Docker image...
Stopping containers...
Restoring uploads from backup...
Starting containers...
```

### After Deployment:
1. Visit the same image URL from step 2
2. ✅ Image should still load
3. ✅ All previously uploaded images should be intact
4. ✅ Admin panel should show all images

---

## Troubleshooting

### If images still disappear:

**Check 1: Verify server directory exists**
```bash
ssh -p 2212 root@72.60.214.160
cd /app/zenyourlife
ls -la backend/uploads/
```

**Check 2: Verify Docker volume mount**
```bash
docker inspect zenyourlife-app | grep -A 5 "Mounts"
```
Should show:
```json
{
  "Source": "/app/zenyourlife/backend/uploads",
  "Destination": "/app/backend/uploads",
  "Type": "bind"
}
```

**Check 3: Check permissions**
```bash
ls -la /app/zenyourlife/backend/uploads
```
Should be readable/writable:
```
drwxr-xr-x  backend/uploads
```

**Check 4: Verify backup/restore ran**
```bash
# During deployment, SSH to server and check:
ls -la /tmp/zenyourlife-uploads-backup/
```

---

## Manual Recovery (If Needed)

If uploads were lost before this fix, you can recover from local backup:

```bash
# From your local machine, restore to server:
cd /path/to/zenyourlife
sshpass -p "JbNM7TNPMgv9387grrGS#Sj" rsync -avz -e "ssh -p 2212 -o StrictHostKeyChecking=no" \
    backend/uploads-backup/ root@72.60.214.160:/app/zenyourlife/backend/uploads/
```

---

## Best Practices Going Forward

### DO:
✅ Run `./deploy.sh` for all deployments
✅ Keep local backup in `backend/uploads-backup/` for recovery
✅ Monitor deployment logs for backup/restore messages
✅ Test image uploads after each deployment

### DON'T:
❌ Don't commit `backend/uploads/` to Git
❌ Don't manually delete `backend/uploads/` on server
❌ Don't run `docker-compose down` without preserving uploads first
❌ Don't modify docker-compose volumes without updating deploy script

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│ Local Machine                                               │
│                                                             │
│  backend/uploads-backup/  ← rsync from server (Step 2)     │
│  (disaster recovery copy)                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ Docker image upload
┌─────────────────────────────────────────────────────────────┐
│ Server: 72.60.214.160                                       │
│                                                             │
│  /app/zenyourlife/backend/uploads/  ← Persistent storage   │
│         ↓                                                   │
│  Docker Volume Mount                                        │
│         ↓                                                   │
│  Container: /app/backend/uploads/  ← Application sees      │
│                                                             │
│  Backup: /tmp/zenyourlife-uploads-backup/ (during deploy)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Modified

1. ✅ `deploy.sh` - Added server-side backup/restore logic
2. ✅ `.gitignore` - Added uploads exclusion rules

## Files Already Correct

- ✅ `docker-compose.yml` - Volume mount already configured
- ✅ `Dockerfile` - Creates uploads directory with proper permissions

---

## Verification Checklist

After running deployment:

- [ ] Deploy script shows "Creating backup of current uploads..."
- [ ] Deploy script shows "Restoring uploads from backup..."
- [ ] Test image uploaded before deployment still loads
- [ ] New images can be uploaded via admin panel
- [ ] All service images display correctly
- [ ] All property images display correctly
- [ ] Container logs show no permission errors

---

**Status:** Fixed and ready for production deployment ✅

**Next Deployment:** Uploads will be automatically preserved during deployment process.
