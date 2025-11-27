export interface SimulatedUser {
  id: string
  email: string
  password: string
  role: "customer" | "driver" | "courier_admin" | "super_admin"
  full_name: string
  phone?: string
  created_at: string
}

export interface SimulatedProfile {
  id: string
  role: "customer" | "driver" | "courier_admin" | "super_admin"
  full_name: string
  phone?: string
  company_id?: string
}

// Simulated users for testing
const SIMULATED_USERS: SimulatedUser[] = [
  {
    id: "1",
    email: "customer@test.com",
    password: "test123",
    role: "customer",
    full_name: "John Customer",
    phone: "+254712345678",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    email: "driver@test.com",
    password: "test123",
    role: "driver",
    full_name: "Jane Driver",
    phone: "+254712345679",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    email: "admin@test.com",
    password: "test123",
    role: "courier_admin",
    full_name: "Admin User",
    phone: "+254712345680",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    email: "super@test.com",
    password: "test123",
    role: "super_admin",
    full_name: "Super Admin",
    phone: "+254712345681",
    created_at: new Date().toISOString(),
  },
]

export class SimulatedAuth {
  private static currentUser: SimulatedUser | null = null
  private static readonly STORAGE_KEY = "pegasus_users"

  private static getAllUsers(): SimulatedUser[] {
    // Get stored users from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return SIMULATED_USERS
        }
      }
    }
    return SIMULATED_USERS
  }

  private static saveUsers(users: SimulatedUser[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
    }
  }

  static async getUser(): Promise<{ data: { user: SimulatedUser | null }; error: any }> {
    const user = this.currentUser
    return { data: { user }, error: null }
  }

  static async getUserProfile(userId: string): Promise<{ data: SimulatedProfile | null; error: any }> {
    const allUsers = this.getAllUsers()
    const user = allUsers.find((u) => u.id === userId)
    if (!user) {
      return { data: null, error: new Error("User not found") }
    }

    const profile: SimulatedProfile = {
      id: user.id,
      role: user.role,
      full_name: user.full_name,
      phone: user.phone,
      company_id: user.role === "driver" || user.role === "courier_admin" ? "1" : undefined,
    }

    return { data: profile, error: null }
  }

  static async signIn(email: string, password: string): Promise<{ data: { user: SimulatedUser | null }; error: any }> {
    console.log("[v0] signIn called with email:", email)
    const allUsers = this.getAllUsers()
    console.log("[v0] Available users:", allUsers.map(u => u.email))
    const user = allUsers.find((u) => u.email === email)
    console.log("[v0] User found:", user?.email)
    
    if (!user) {
      console.log("[v0] User not found, returning error")
      return { data: { user: null }, error: new Error("Invalid credentials") }
    }

    if (password !== user.password) {
      console.log("[v0] Password mismatch")
      return { data: { user: null }, error: new Error("Invalid credentials") }
    }

    console.log("[v0] Login successful for:", user.email)
    this.currentUser = user
    if (typeof window !== "undefined") {
      localStorage.setItem("pegasus_current_user_email", email)
    }
    return { data: { user }, error: null }
  }

  static async signUp(
    email: string,
    password: string,
    userData: any,
  ): Promise<{ data: { user: SimulatedUser | null }; error: any }> {
    const allUsers = this.getAllUsers()

    // Check if user already exists
    if (allUsers.find((u) => u.email === email)) {
      return { data: { user: null }, error: new Error("Email already registered") }
    }

    const newUser: SimulatedUser = {
      id: String(Date.now()),
      email,
      password: "test123", // Always use test123 for simulated auth
      role: userData.role || "customer",
      full_name: userData.full_name || "New User",
      phone: userData.phone,
      created_at: new Date().toISOString(),
    }

    allUsers.push(newUser)
    this.saveUsers(allUsers)
    this.currentUser = newUser
    return { data: { user: newUser }, error: null }
  }

  static async signOut(): Promise<{ error: any }> {
    this.currentUser = null
    // clear stored user email from localStorage on sign out
    if (typeof window !== "undefined") {
      localStorage.removeItem("pegasus_current_user_email")
    }
    return { error: null }
  }

  static getCurrentUser(): SimulatedUser | null {
    if (!this.currentUser && typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("pegasus_current_user_email")
      if (savedEmail) {
        const allUsers = this.getAllUsers()
        this.currentUser = allUsers.find((u) => u.email === savedEmail) || null
      }
    }
    return this.currentUser
  }

  static switchToRole(role: "customer" | "driver" | "courier_admin" | "super_admin") {
    const allUsers = this.getAllUsers()
    const user = allUsers.find((u) => u.role === role)
    if (user) {
      this.currentUser = user
      // store current user email in localStorage when switching roles
      if (typeof window !== "undefined") {
        localStorage.setItem("pegasus_current_user_email", user.email)
      }
    }
  }
}

// Mock data for testing - Updated with Kenyan locations and currency
export const MOCK_PACKAGES = [
  {
    id: "1",
    tracking_number: "PKG001",
    sender_name: "Alice Smith",
    sender_phone: "+254712345678",
    sender_address: "123 Westlands, Nairobi",
    recipient_name: "Bob Johnson",
    recipient_phone: "+254712345679",
    recipient_address: "456 Kilimani, Nairobi",
    package_type: "document",
    weight: 0.5,
    dimensions: "20x15x5 cm",
    status: "in_transit",
    delivery_fee: 350,
    created_at: new Date().toISOString(),
    estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    tracking_number: "PKG002",
    sender_name: "Carol Davis",
    sender_phone: "+254712345680",
    sender_address: "789 Upper Hill, Nairobi",
    recipient_name: "David Wilson",
    recipient_phone: "+254712345681",
    recipient_address: "321 Mombasa Road, Nairobi",
    package_type: "package",
    weight: 2.3,
    dimensions: "30x25x15 cm",
    status: "delivered",
    delivery_fee: 750,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    estimated_delivery: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_PAYMENTS = [
  {
    id: "1",
    package_id: "1",
    amount: 1299,
    currency: "KES",
    status: "completed",
    payment_method: "credit_card",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    package_id: "2",
    amount: 1890,
    currency: "KES",
    status: "completed",
    payment_method: "paypal",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    package_id: "3",
    amount: 950,
    currency: "KES",
    status: "completed",
    payment_method: "mpesa",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]
