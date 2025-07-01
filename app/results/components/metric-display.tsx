import type React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface MetricDisplayProps {
  label: string
  value: React.ReactNode
  tooltipText: string
  className?: string
}

export function MetricDisplay({ label, value, tooltipText, className }: MetricDisplayProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <p className="text-sm text-gray-300">{label}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-gray-500 ml-2 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-gray-700">
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
