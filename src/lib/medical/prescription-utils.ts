import { PrescriptionStatus } from "@/types/database"

export function generatePrescriptionNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `RX-${timestamp}-${random}`
}

export function getStatusColor(status: PrescriptionStatus): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "approved":
      return "bg-blue-100 text-blue-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "filled":
      return "bg-green-100 text-green-800"
    case "dispensed":
      return "bg-purple-100 text-purple-800"
    case "cancelled":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function formatPrescriptionDate(date: string | null): string {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
