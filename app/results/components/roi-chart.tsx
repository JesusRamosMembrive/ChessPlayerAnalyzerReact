"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface RoiChartProps {
  data: { name: string; roi: number }[]
}

export default function RoiChart({ data }: RoiChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No ROI data available.</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            color: "#ffffff",
          }}
        />
        <Area type="monotone" dataKey="roi" stroke="#10b981" fillOpacity={1} fill="url(#colorRoi)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
