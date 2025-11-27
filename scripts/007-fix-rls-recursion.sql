-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Create new policies that avoid recursion by checking role in a different way
-- For user_profiles table
CREATE POLICY "Super admins can view all profiles on user_profiles" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'super_admin'
    )
  );

-- For profiles table
CREATE POLICY "Super admins can view all profiles on profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE role = 'super_admin'
    )
  );
