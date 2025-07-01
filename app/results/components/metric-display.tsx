import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface MetricDisplayProps {
  label: string
  value: string | number
  tooltipText: string
}

export function MetricDisplay({ label, value, tooltipText }: MetricDisplayProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-300">{label}</p>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-gray-900 text-white border-gray-700">
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
