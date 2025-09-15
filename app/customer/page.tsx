import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"

export default async function CustomerPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user role
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", data.user.id).single()

  if (!profile || profile.role !== "customer") {
    redirect("/auth/login")
  }

  return <CustomerDashboard user={data.user} profile={profile} />
}
