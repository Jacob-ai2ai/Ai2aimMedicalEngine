-- Direct SQL script to create admin user
-- Run this in Supabase SQL Editor

-- First, we need to use the Supabase Auth Admin API to create users
-- But since we can't do that directly via SQL, here's what you need to do:

-- OPTION 1: Use Supabase Dashboard
-- 1. Go to Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Email: admin@ai2aimrx.com
-- 4. Password: admin123
-- 5. Check "Auto Confirm User" checkbox
-- 6. Click "Create user"
-- 7. Copy the User ID (UUID)

-- OPTION 2: After creating user via Dashboard, run this to create profile:
-- (Replace 'USER_ID_HERE' with the actual UUID from step 7 above)

INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID from Supabase Dashboard
  'admin@ai2aimrx.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
