import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface MetricDisplayProps {
  title: string
  value: number
  unit?: string
  description: string
  icon: ReactNode
  color: "blue" | "purple" | "green" | "orange"
}

export function MetricDisplay({ title, value, unit = "", description, icon, color }: MetricDisplayProps) {
  const colorClasses = {
    blue: "bg-blue-600/20 text-blue-400",
    purple: "bg-purple-600/20 text-purple-400",
    green: "bg-green-600/20 text-green-400",
    orange: "bg-orange-600/20 text-orange-400",
  }

  const formatValue = (val: number) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + "k"
    }
    return val.toFixed(2)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-white">
            {formatValue(value)}
            {unit && <span className="text-lg text-gray-400">{unit}</span>}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
