import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DriverDashboard } from "@/components/driver/driver-dashboard"

export default async function DriverPage() {
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

  if (!profile || profile.role !== "driver") {
    redirect("/auth/login")
  }

  return <DriverDashboard user={data.user} profile={profile} />
}
