# Fix Production Password in Neon SQL Editor

## ⚠️ IMPORTANT: The Problem

When you update a password directly in SQL, you MUST use Django's PBKDF2 hash format. Plain text passwords **WILL NOT WORK**.

## ✅ Solution: Copy and Paste This SQL in Neon

### Step 1: Update Password with Correct Hash

Go to Neon SQL Editor and run this SQL (this is the correct hash for password `admin123`):

```sql
-- Update password for district_admin with correct PBKDF2 hash
UPDATE auth_user 
SET password = 'pbkdf2_sha256$1000000$O63u3bjv8n6HC0l5g0BEYT$bO7nmjWfWrd5WgXqHqZ9dz7DaN+TYU/el0tjYQ2RoGU='
WHERE username = 'district_admin';
```

### Step 2: Verify Supervisor Profile Exists

```sql
-- Check if Supervisor profile exists
SELECT s.id, u.username, u.is_active, u.is_staff
FROM core_supervisor s 
INNER JOIN auth_user u ON s.user_id = u.id 
WHERE u.username = 'district_admin';

-- If it doesn't exist, create it:
INSERT INTO core_supervisor (user_id, is_supervisor, created_at, updated_at)
SELECT id, true, NOW(), NOW()
FROM auth_user
WHERE username = 'district_admin'
AND NOT EXISTS (
    SELECT 1 FROM core_supervisor WHERE user_id = auth_user.id
);
```

### Step 3: Verify User is Active and Has Permissions

```sql
-- Make sure user is active and has correct permissions
UPDATE auth_user 
SET is_active = true, is_staff = true, is_superuser = true
WHERE username = 'district_admin';
```

### Step 4: Verify Everything is Correct

```sql
-- Final check - should return 1 row
SELECT 
    u.username,
    u.is_active,
    u.is_staff,
    u.is_superuser,
    CASE WHEN u.password LIKE 'pbkdf2_sha256%' THEN 'Hashed' ELSE 'NOT HASHED!' END as password_status,
    CASE WHEN s.id IS NOT NULL THEN 'Has Supervisor' ELSE 'NO SUPERVISOR!' END as supervisor_status
FROM auth_user u
LEFT JOIN core_supervisor s ON s.user_id = u.id
WHERE u.username = 'district_admin';
```

## 🔐 Login Credentials

After running the SQL above:
- **Username:** `district_admin`
- **Password:** `admin123`

## ✅ Test Login

After updating, try logging in at:
- Frontend: `https://your-frontend-url.com/admin/login`
- Use credentials: `district_admin` / `admin123`

## 🐛 Troubleshooting

If login still doesn't work:

1. **Check if password is hashed:** The password field should start with `pbkdf2_sha256$`
2. **Check Supervisor profile:** User must have a record in `core_supervisor` table
3. **Check user is active:** `is_active`, `is_staff`, and `is_superuser` should all be `true`
4. **Check API endpoint:** Verify backend is running at `https://ypg-website.onrender.com`
5. **Check CORS:** Make sure CORS is configured correctly in Django settings

