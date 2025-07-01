import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface MetricDisplayProps {
  title: string
  value: string | number | null | undefined
  unit?: string
  tooltipText?: string
  className?: string
  valueClassName?: string
}

export function MetricDisplay({ title, value, unit, tooltipText, className, valueClassName }: MetricDisplayProps) {
  const displayValue = value ?? "N/A"

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        {tooltipText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-white ${valueClassName}`}>
          {displayValue}
          {unit && value !== null && value !== undefined && <span className="text-sm font-normal">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
