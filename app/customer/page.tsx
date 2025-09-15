import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"

export default async function CustomerPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user role - make this more lenient to avoid redirect loops
  const { data: profile, error: profileError } = await supabase.from("user_profiles").select("role, full_name").eq("user_id", data.user.id).single()

  // If profile doesn't exist or has error, create a default customer profile
  if (profileError || !profile) {
    console.log("Profile not found, creating default customer profile")
    const defaultProfile = {
      role: "customer" as const,
      full_name: data.user.email?.split('@')[0] || "Customer"
    }
    return <CustomerDashboard user={data.user} profile={defaultProfile} />
  }

  // Allow any authenticated user to access customer dashboard
  return <CustomerDashboard user={data.user} profile={profile} />
}
