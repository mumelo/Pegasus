-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;

-- Create a fixed policy that uses profiles table for the subquery
CREATE POLICY "Super admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Also fix the same issue on profiles table if it exists
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    -- Use a stable way to check if user is super_admin
    -- This avoids recursion by checking raw auth metadata instead of querying profiles
    COALESCE(auth.jwt() ->> 'role', '') = 'super_admin'
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data ->> 'role' = 'super_admin'
    )
  );
