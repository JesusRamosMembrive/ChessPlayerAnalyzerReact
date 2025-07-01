import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResultsLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2 bg-gray-700" />
            <Skeleton className="h-4 w-96 bg-gray-700" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    <Skeleton className="h-4 w-24 bg-gray-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2 bg-gray-600" />
                  <Skeleton className="h-3 w-32 bg-gray-600" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-48 bg-gray-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full bg-gray-600" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
