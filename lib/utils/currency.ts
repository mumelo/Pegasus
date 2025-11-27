// Currency formatting utility for Kenyan Shillings

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencySimple(amount: number): string {
  return `Ksh ${amount.toFixed(2)}`
}
