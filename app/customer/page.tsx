import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"

export default async function CustomerPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Load profile and role from user_profiles
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role, full_name")
    .eq("user_id", data.user.id)
    .single()

  // If no profile, treat as customer with fallback name
  if (profileError || !profile) {
    const defaultProfile = {
      role: "customer" as const,
      full_name: data.user.email?.split("@")[0] || "Customer",
    }
    return <CustomerDashboard user={data.user} profile={defaultProfile} />
  }

  // If user is not a customer, send them to their own portal
  if (profile.role !== "customer") {
    switch (profile.role) {
      case "driver":
        redirect("/driver")
      case "courier_admin":
        redirect("/courier-admin")
      case "super_admin":
        redirect("/super-admin")
      default:
        redirect("/customer")
    }
  }

  // Customer: render customer dashboard
  return <CustomerDashboard user={data.user} profile={profile} />
}
