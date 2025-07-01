import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4 bg-gray-700" />
            <Skeleton className="h-6 w-128 mx-auto mb-8 bg-gray-700" />
            <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32 bg-gray-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full bg-gray-600" />
                <Skeleton className="h-10 w-full bg-gray-600" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
