"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RoiChartProps {
  data: { month: number; roi: number }[]
}

const formatNumber = (num: number, decimals = 0) => {
  if (num === null || num === undefined) return "N/A"
  return num.toFixed(decimals)
}

export function RoiChart({ data }: RoiChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No hay datos de ROI disponibles para mostrar el gráfico.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
        <XAxis dataKey="month" stroke="#ffffff" tickFormatter={(tick) => `Mes ${tick}`} />
        <YAxis stroke="#ffffff" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#000000",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#ffffff",
          }}
          labelFormatter={(label) => `Mes ${label}`}
          formatter={(value: number, name: string) => [`${formatNumber(value)}`, name === "roi" ? "ROI" : "Tendencia"]}
        />
        <Area type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} fill="url(#roiGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
