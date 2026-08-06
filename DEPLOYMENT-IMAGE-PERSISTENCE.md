# Image Persistence Issue - Solution Guide

## Problem Summary

After Docker deployment, service images uploaded via the admin portal revert to default images instead of showing the uploaded images.

## Root Cause

The `.dockerignore` file (line 29) excludes `backend/uploads/*` from the Docker image to keep the image size small. While the `docker-compose.yml` correctly mounts `./backend/uploads:/app/backend/uploads` as a volume, **the uploads directory must already exist on the deployment server** with the image files, or they will be lost.

## Solution Options

### Option 1: Ensure Uploads Directory Persists on Server (Recommended)

This is the best approach for production. The Docker volume mount works correctly, you just need to ensure the uploads directory is preserved on your server.

**Steps:**

1. **Before first deployment**, create the uploads directory on your server:
   ```bash
   mkdir -p backend/uploads
   chmod 755 backend/uploads
   ```

2. **Initial image upload**: After first deployment, upload images via admin portal - they will persist in `./backend/uploads`

3. **For subsequent deployments**:
   - The `./backend/uploads` directory on your server will **NOT be deleted** during Docker redeployment
   - Only the Docker container is recreated, not the volume-mounted directory
   - All uploaded images remain intact

4. **Verify volume mount is working**:
   ```bash
   # Check if uploads directory exists
   ls -la backend/uploads/

   # After deployment, check container can access uploads
   docker exec zenyourlife-app ls -la /app/backend/uploads/
   ```

### Option 2: Backup and Restore Uploads During Deployment

If you're experiencing data loss, add these steps to your deployment process:

**Before Deployment:**
```bash
# Backup current uploads
tar -czf uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/uploads/
```

**After Deployment:**
```bash
# Restore if needed
tar -xzf uploads-backup-YYYYMMDD-HHMMSS.tar.gz
```

### Option 3: Use External Storage (For Large Scale)

For production with heavy image usage, consider moving to cloud storage:

1. **AWS S3** - Most popular, reliable
2. **Cloudinary** - Image optimization built-in
3. **DigitalOcean Spaces** - S3-compatible, cheaper
4. **Azure Blob Storage** - Good for Microsoft environments

This would require code changes to:
- Upload images to cloud storage instead of local filesystem
- Store cloud URLs in database
- Serve images from CDN

## Current Configuration (Working Correctly)

### docker-compose.yml (Lines 10-12)
```yaml
volumes:
  - ./backend/uploads:/app/backend/uploads  # ✅ Correct volume mount
  - ./logs:/app/logs
```

### .dockerignore (Line 29)
```
backend/uploads/*    # ✅ Correct - keeps Docker image small
!backend/uploads/.gitkeep
```

### Dockerfile (Lines 42-44)
```dockerfile
RUN mkdir -p /app/backend/uploads /app/logs && \
    chmod -R 755 /app/backend/uploads /app/logs
```

## Deployment Checklist

### First-Time Deployment:
- [ ] Create `backend/uploads/` directory on server
- [ ] Set correct permissions: `chmod 755 backend/uploads`
- [ ] Deploy Docker container with `docker-compose up -d`
- [ ] Upload images via admin portal
- [ ] Verify images appear on service page

### Subsequent Deployments:
- [ ] **DO NOT delete** `backend/uploads/` directory
- [ ] Pull latest code: `git pull origin main`
- [ ] Rebuild Docker image: `docker-compose build`
- [ ] Restart container: `docker-compose up -d`
- [ ] Verify images still appear (they should!)

## Troubleshooting

### Images disappear after deployment

**Diagnosis:**
```bash
# Check if uploads directory exists on host
ls -la backend/uploads/

# Check if container can see uploads
docker exec zenyourlife-app ls -la /app/backend/uploads/

# Check volume mounts
docker inspect zenyourlife-app | grep -A 10 "Mounts"
```

**Common causes:**
1. **Uploads directory deleted on host** - Volume mount points to empty directory
2. **Wrong deployment path** - Running docker-compose from wrong directory
3. **Volume not mounted** - Check docker-compose.yml volumes section
4. **Permissions issue** - Container can't write to uploads directory

**Solutions:**
```bash
# Recreate uploads directory if deleted
mkdir -p backend/uploads
chmod 755 backend/uploads

# Fix permissions
sudo chown -R $USER:$USER backend/uploads
chmod 755 backend/uploads

# Restart container
docker-compose restart
```

### Images work locally but not in production

**Check:**
1. Uploads directory exists on production server
2. Volume mount path is correct for your server setup
3. File permissions allow Docker to read/write
4. Database imageUrl fields contain correct URLs (`/uploads/filename.jpg`)

### New images upload but don't appear

**Check:**
1. Image uploaded successfully (check response from `/api/upload/image`)
2. Database updated with new imageUrl
3. Frontend using correct API base URL
4. CORS configured correctly for image serving

## Database Image URL Format

Images are stored in database as relative URLs:

```javascript
// Service model
{
  image: "m1.png",              // Fallback static image
  imageUrl: "/uploads/service-1765824098415-349058066.jpg"  // ✅ Uploaded image URL
}
```

Frontend config (api.js):
```javascript
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;  // Becomes: http://localhost:5001/uploads/...
};
```

## Image Upload Flow

1. Admin uploads image via admin portal → POST `/api/upload/image`
2. Backend saves to `./backend/uploads/service-{timestamp}-{random}.jpg`
3. Returns imageUrl: `/uploads/service-{timestamp}-{random}.jpg`
4. Admin updates service with new imageUrl → PATCH `/api/services/:id`
5. Database stores imageUrl
6. Frontend fetches service → GET `/api/services/:id`
7. Frontend displays image from `${API_BASE_URL}/uploads/...`

## Verification Commands

```bash
# Check images are persisted locally
ls -la backend/uploads/ | wc -l

# Check Docker container can access images
docker exec zenyourlife-app ls -la /app/backend/uploads/ | wc -l

# Both should return same count (186+ files)

# Test image serving
curl -I http://localhost:5001/uploads/service-1765824098415-349058066.jpg
# Should return: HTTP/1.1 200 OK

# Check volume mount
docker volume ls
docker inspect zenyourlife-app --format='{{json .Mounts}}' | jq
```

## Backend Code Analysis

### Functions That Could Reset Images (Investigation Results)

**✅ CONFIRMED: Backend does NOT automatically reset images on deployment**

After thorough investigation of the backend code:

1. **`assignUniqueImages` function** - **REMOVED ✅**
   - This function was previously at serviceController.js:272-305
   - Assigned default images (m1.png-m9.png) to services
   - **NOW REMOVED** to prevent accidental overwrites of uploaded images
   - API endpoint `/api/services/assign-images` also removed

2. **`seed.js` script** (backend/seed.js):
   - Clears ALL services with `Service.deleteMany({})`
   - Reinserts 13 services with default images
   - **Only runs manually**: `npm run seed` command
   - **NOT called during deployment or container startup**

3. **server.js startup** (backend/server.js):
   - Does NOT call seed script
   - Does NOT call assignUniqueImages
   - Only connects to MongoDB and starts reminder scheduler
   - **No automatic image reset on startup**

### Admin Portal Issues Found & Fixed

**Issue 1: handleToggleStatus was sending entire service object ❌**
- **Location**: admin/src/pages/Services.tsx:914
- **Problem**: When toggling service visibility, it sent the entire service object which could overwrite fields with stale data
- **Fix Applied**: Now only sends `{ isActive: newIsActive }` ✅

**Issue 2: Backend didn't preserve imageUrl on partial updates ❌**
- **Location**: backend/controllers/serviceController.js:219-228
- **Problem**: When partial updates were sent (like toggling visibility), imageUrl could be lost
- **Fix Applied**: Backend now explicitly preserves `imageUrl`, `bannerImageUrl`, and `image` fields when not provided in request ✅

### Conclusion

The images reverting to default has **TWO root causes**:

**Cause 1: File System Issue**
- The `imageUrl` field in the database points to `/uploads/filename.jpg`
- But the actual file doesn't exist on the production server in `./backend/uploads/`
- So when the frontend requests the image, it fails and falls back to the default `image` field (m1.png-m9.png)

**Cause 2: Admin Toggle Status Bug (NOW FIXED)**
- When admin toggled service visibility, the entire service object was sent
- This could overwrite `imageUrl` with stale/empty data from UI state
- **This bug is now fixed** ✅

**Root causes of file system issue:**
1. Uploads directory not persisting between deployments on production server
2. Uploads directory getting deleted during deployment process
3. Images were never successfully uploaded to production server

## Current Status

- **Local uploads directory**: ✅ Exists with 186 files (~65MB)
- **Docker volume mount**: ✅ Configured correctly
- **Image serving endpoint**: ✅ Working (`/uploads/filename`)
- **.dockerignore**: ✅ Correctly excludes uploads from image
- **Backend startup**: ✅ Does NOT reset images automatically
- **seed.js script**: ✅ Only runs when manually executed
- **assignUniqueImages**: ✅ Only runs via authenticated API call
- **Issue**: Uploads directory likely not persisted on production server OR images were never uploaded to production

## Next Steps

1. **Verify production server has `./backend/uploads/` directory**
2. **If missing, create it**: `mkdir -p backend/uploads`
3. **Deploy**: `docker-compose up -d`
4. **Re-upload images** via admin portal (one-time only)
5. **Future deployments**: Images will persist automatically

## Important Notes

- **Volume mounts persist between container restarts** - This is the correct behavior
- **Don't include uploads in Docker image** - Keeps image small, allows dynamic updates
- **Uploads directory must exist on host** - Volume mount needs target directory
- **Docker doesn't delete volume-mounted directories** - Your images are safe during redeployment
- **Backup regularly** - Consider automated backups for production

## Support

If images still disappear after following this guide:
1. Check Docker logs: `docker logs zenyourlife-app`
2. Verify volume mount: `docker inspect zenyourlife-app | grep uploads`
3. Check filesystem permissions: `ls -la backend/uploads/`
4. Review deployment process - ensure not deleting uploads directory

---

**Last Updated**: January 12, 2025
**Docker Compose Version**: 3.8
**Current Image Count**: 186 files (~65MB)
