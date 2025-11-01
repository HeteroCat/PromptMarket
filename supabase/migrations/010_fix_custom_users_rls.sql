-- Fix RLS policies for custom_users table to allow user registration
-- This migration fixes the INSERT policy that was missing

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anyone to insert new users" ON custom_users;
DROP POLICY IF EXISTS "Users can view their own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update their own data" ON custom_users;

-- Create proper RLS policies for custom_users table
CREATE POLICY "Allow anyone to insert new users" ON custom_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON custom_users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON custom_users
    FOR UPDATE USING (true);

-- Ensure profiles table has correct policies as well
DROP POLICY IF EXISTS "Allow anyone to view profiles" ON profiles;
DROP POLICY IF EXISTS "Allow anyone to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update profiles" ON profiles;

CREATE POLICY "Allow anyone to view profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update profiles" ON profiles
    FOR UPDATE USING (true);

-- Ensure RLS is enabled on both tables
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;