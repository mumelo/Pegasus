import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CourierAdminDashboard } from "@/components/courier-admin/courier-admin-dashboard"

export default async function CourierAdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, company_id")
    .eq("id", data.user.id)
    .single()

  if (!profile || profile.role !== "courier_admin") {
    redirect("/auth/login")
  }

  return <CourierAdminDashboard user={data.user} profile={profile} />
}
