import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/verify-email", "/auth/error"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If user is authenticated
  if (user) {
    let userProfile = null
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

      if (!error && profile) {
        userProfile = profile
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }

    if (pathname.startsWith("/auth/") && pathname !== "/auth/verify-email") {
      const url = request.nextUrl.clone()

      // Redirect based on user role or default to customer
      switch (userProfile?.role) {
        case "driver":
          url.pathname = "/driver"
          break
        case "courier_admin":
          url.pathname = "/courier-admin"
          break
        case "super_admin":
          url.pathname = "/super-admin"
          break
        default:
          url.pathname = "/customer"
      }

      return NextResponse.redirect(url)
    }

    if (userProfile?.role) {
      const roleRoutes = {
        customer: "/customer",
        driver: "/driver",
        courier_admin: "/courier-admin",
        super_admin: "/super-admin",
      }

      const expectedRoute = roleRoutes[userProfile.role as keyof typeof roleRoutes]
      const isDashboardRoute = Object.values(roleRoutes).some((route) => pathname.startsWith(route))

      // Only redirect if user is accessing a dashboard route that doesn't match their role
      if (isDashboardRoute && !pathname.startsWith(expectedRoute)) {
        const url = request.nextUrl.clone()
        url.pathname = expectedRoute
        return NextResponse.redirect(url)
      }
    }

    if (
      !userProfile &&
      (pathname.startsWith("/customer") ||
        pathname.startsWith("/driver") ||
        pathname.startsWith("/courier-admin") ||
        pathname.startsWith("/super-admin"))
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/customer"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
