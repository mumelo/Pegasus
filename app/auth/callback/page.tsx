"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        // Get the code from URL parameters
        const code = searchParams.get('code')
        
        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error("Auth callback error:", error)
            setError(error.message)
            return
          }

          if (data.session?.user) {
            console.log("User authenticated:", data.session.user.id)
            
            // Wait a moment for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Get user profile to determine role
            const { data: profile, error: profileError } = await supabase
              .from("user_profiles")
              .select("role")
              .eq("user_id", data.session.user.id)
              .single()

            if (profileError) {
              console.error("Profile fetch error:", profileError)
              // Try the profiles table as fallback
              const { data: fallbackProfile, error: fallbackError } = await supabase
                .from("profiles")
                .select("role")
                .eq("user_id", data.session.user.id)
                .single()
              
              if (fallbackError) {
                console.error("Fallback profile fetch error:", fallbackError)
                // Default to customer if profile not found
                router.push("/customer")
                return
              }
              
              // Use fallback profile
              redirectBasedOnRole(fallbackProfile?.role)
              return
            }

            // Redirect based on role
            redirectBasedOnRole(profile?.role)
          } else {
            console.log("No session found, redirecting to login")
            router.push("/auth/login")
          }
        } else {
          // No code parameter, check for existing session
          const { data, error } = await supabase.auth.getSession()
          
          if (error || !data.session) {
            router.push("/auth/login")
            return
          }
          
          // User already has session, redirect to appropriate dashboard
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .single()
            
          redirectBasedOnRole(profile?.role)
        }
      } catch (error) {
        console.error("Callback handling error:", error)
        setError("An error occurred during authentication")
      } finally {
        setLoading(false)
      }
    }

    const redirectBasedOnRole = (role: string | undefined) => {
      switch (role) {
        case "driver":
          router.push("/driver")
          break
        case "courier_admin":
          router.push("/courier-admin")
          break
        case "super_admin":
          router.push("/super-admin")
          break
        default:
          router.push("/customer")
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Verifying Account</CardTitle>
            <CardDescription className="text-gray-600">Please wait while we verify your account...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
            <CardDescription className="text-gray-600">There was an issue verifying your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Return to Login
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
