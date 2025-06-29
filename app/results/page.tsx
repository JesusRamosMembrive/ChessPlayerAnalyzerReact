"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Share2, AlertTriangle, TrendingUp, BarChart3, Zap, User } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useSearchParams, useRouter } from "next/navigation"

export default function AnalysisResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedUser = searchParams.get("user") || "magnus_carlsen"

  // Mock data for charts
  const moveTimeData = [
    { game: 1, avgTime: 15, suspicious: false },
    { game: 2, avgTime: 12, suspicious: false },
    { game: 3, avgTime: 3, suspicious: true },
    { game: 4, avgTime: 18, suspicious: false },
    { game: 5, avgTime: 3, suspicious: true },
    { game: 6, avgTime: 14, suspicious: false },
  ]

  const winLossData = [
    { month: "Jan", wins: 45, losses: 23, draws: 12 },
    { month: "Feb", wins: 52, losses: 18, draws: 15 },
    { month: "Mar", wins: 38, losses: 31, draws: 18 },
    { month: "Apr", wins: 41, losses: 25, draws: 14 },
  ]

  const openingData = [
    { name: "Sicilian Defense", value: 35, color: "#10b981" },
    { name: "Queen's Gambit", value: 25, color: "#3b82f6" },
    { name: "King's Indian", value: 20, color: "#8b5cf6" },
    { name: "French Defense", value: 12, color: "#f59e0b" },
    { name: "Others", value: 8, color: "#6b7280" },
  ]

  const comebackGames = [
    { id: 1, opponent: "player123", date: "2024-01-15", deficit: -5, outcome: "win" },
    { id: 2, opponent: "chessmaster", date: "2024-01-12", deficit: -3, outcome: "win" },
    { id: 3, opponent: "rookie_player", date: "2024-01-10", deficit: -4, outcome: "draw" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{selectedUser}</h1>
                  <p className="text-sm text-gray-400">Analysis completed</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Games Analyzed</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Suspicious Patterns</p>
                  <p className="text-2xl font-bold text-red-400">12</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">68%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Comebacks</p>
                  <p className="text-2xl font-bold text-orange-400">23</p>
                </div>
                <Zap className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="entropy" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="entropy" className="data-[state=active]:bg-gray-700 text-white">
              Opening Entropy
            </TabsTrigger>
            <TabsTrigger value="timing" className="data-[state=active]:bg-gray-700 text-white">
              Move Timing
            </TabsTrigger>
            <TabsTrigger value="winloss" className="data-[state=active]:bg-gray-700 text-white">
              Win/Loss Stats
            </TabsTrigger>
            <TabsTrigger value="comebacks" className="data-[state=active]:bg-gray-700 text-white">
              Comebacks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entropy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Opening Distribution</CardTitle>
                  <CardDescription className="text-white">Frequency of different opening systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={openingData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelStyle={{ fill: "#ffffff", fontSize: "12px" }}
                      >
                        {openingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000000",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Entropy Analysis</CardTitle>
                  <CardDescription className="text-white">Opening diversity vs ELO consistency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Opening Diversity</span>
                      <span className="text-white">7.2/10</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">ELO Consistency</span>
                      <span className="text-white">8.5/10</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong>Analysis:</strong> Good opening diversity with high ELO consistency. Pattern suggests
                      natural learning progression rather than artificial assistance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timing" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Move Timing Analysis</CardTitle>
                <CardDescription className="text-white">Average time between moves across recent games</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={moveTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="game" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000000",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={payload.suspicious ? "#ef4444" : "#10b981"}
                            stroke={payload.suspicious ? "#ef4444" : "#10b981"}
                            strokeWidth={2}
                          />
                        )
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">Normal timing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-white">Suspicious timing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="winloss" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Win/Loss Statistics</CardTitle>
                <CardDescription className="text-white">Game outcomes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={winLossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="month" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000000",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                    />
                    <Bar dataKey="wins" fill="#10b981" />
                    <Bar dataKey="losses" fill="#ef4444" />
                    <Bar dataKey="draws" fill="#6b7280" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comebacks" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Comeback Games</CardTitle>
                <CardDescription className="text-white">
                  Games where player recovered from significant disadvantage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comebackGames.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{game.opponent[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">vs {game.opponent}</p>
                          <p className="text-sm text-gray-400">{game.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="border-red-500 text-red-400">
                          {game.deficit} material
                        </Badge>
                        <Badge className={game.outcome === "win" ? "bg-green-600" : "bg-yellow-600"}>
                          {game.outcome}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View Game
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
