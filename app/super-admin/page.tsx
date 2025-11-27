import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard"

export default async function SuperAdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, full_name")
    .eq("user_id", data.user.id)
    .single()

  if (!profile || profile.role !== "super_admin") {
    redirect("/auth/login")
  }

  return <SuperAdminDashboard user={data.user} profile={profile} />
}
