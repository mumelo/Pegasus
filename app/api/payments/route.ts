import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { packageId, amount, paymentMethod } = await request.json()

    // Simulate payment processing
    const paymentId = `pay_${Date.now()}`

    // In a real app, you would integrate with a payment processor like Stripe
    // For now, we'll simulate a successful payment

    // Update package payment status
    const { error: updateError } = await supabase
      .from("packages")
      .update({
        payment_status: "paid",
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", packageId)
      .eq("sender_id", user.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      id: paymentId,
      user_id: user.id,
      package_id: packageId,
      amount,
      payment_method: paymentMethod,
      status: "completed",
      created_at: new Date().toISOString(),
    })

    if (paymentError) {
      console.error("Payment record error:", paymentError)
    }

    return NextResponse.json({
      success: true,
      paymentId,
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Fetch payments error:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
