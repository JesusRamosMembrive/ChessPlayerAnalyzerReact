import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricDisplayProps {
  title: string
  value: string | number | undefined | null
  unit?: string
  tooltipText: string
  valueClassName?: string
}

export function MetricDisplay({ title, value, unit, tooltipText, valueClassName }: MetricDisplayProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-300">{title}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className={cn("text-lg font-semibold", valueClassName)}>
        {value ?? "N/A"}
        {value !== undefined && value !== null && unit ? unit : ""}
      </p>
    </div>
  )
}
