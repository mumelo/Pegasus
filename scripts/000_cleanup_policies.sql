-- Cleanup script to fix infinite recursion in RLS policies
-- Run this FIRST before running the main schema script

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Courier admins can view company packages" ON public.packages;
DROP POLICY IF EXISTS "Super admins can view all packages" ON public.packages;
DROP POLICY IF EXISTS "Customers can view their own packages" ON public.packages;
DROP POLICY IF EXISTS "Drivers can view assigned packages" ON public.packages;

-- Drop all existing policies on user_profiles too
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;

-- Disable RLS temporarily to allow clean recreation
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
