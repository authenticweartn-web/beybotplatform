"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, MessageSquare, ShoppingCart, Users, DollarSign, AlertCircle } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useDashboardMetrics, useDashboardCharts, useDashboardActivity } from "@/lib/hooks/use-dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"

function MetricsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-border bg-card">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="border-border bg-card">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics()
  const { data: charts, isLoading: chartsLoading, error: chartsError } = useDashboardCharts()
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useDashboardActivity()

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your AI sales agent performance.</p>
      </div>

      {/* Stats Cards */}
      {metricsLoading ? (
        <MetricsSkeleton />
      ) : metricsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load metrics. Please try again.</AlertDescription>
        </Alert>
      ) : metrics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.totalConversations.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm">
                {metrics.conversationsChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : metrics.conversationsChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
                {metrics.conversationsChange !== 0 && (
                  <>
                    <span className={metrics.conversationsChange > 0 ? "text-success" : "text-destructive"}>
                      {metrics.conversationsChange > 0 ? "+" : ""}
                      {metrics.conversationsChange}%
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </>
                )}
                {metrics.conversationsChange === 0 && <span className="text-muted-foreground">No data yet</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orders Generated</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.ordersGenerated.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm">
                {metrics.ordersChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : metrics.ordersChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
                {metrics.ordersChange !== 0 && (
                  <>
                    <span className={metrics.ordersChange > 0 ? "text-success" : "text-destructive"}>
                      {metrics.ordersChange > 0 ? "+" : ""}
                      {metrics.ordersChange}%
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </>
                )}
                {metrics.ordersChange === 0 && <span className="text-muted-foreground">No data yet</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.conversionRate}%</div>
              <div className="flex items-center gap-1 text-sm">
                {metrics.conversionChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : metrics.conversionChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
                {metrics.conversionChange !== 0 && (
                  <>
                    <span className={metrics.conversionChange > 0 ? "text-success" : "text-destructive"}>
                      {metrics.conversionChange > 0 ? "+" : ""}
                      {metrics.conversionChange}%
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </>
                )}
                {metrics.conversionChange === 0 && <span className="text-muted-foreground">No data yet</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.totalRevenue.toLocaleString()} TND</div>
              <div className="flex items-center gap-1 text-sm">
                {metrics.revenueChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : metrics.revenueChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
                {metrics.revenueChange !== 0 && (
                  <>
                    <span className={metrics.revenueChange > 0 ? "text-success" : "text-destructive"}>
                      {metrics.revenueChange > 0 ? "+" : ""}
                      {metrics.revenueChange}%
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </>
                )}
                {metrics.revenueChange === 0 && <span className="text-muted-foreground">No data yet</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Charts Section */}
      {chartsLoading ? (
        <ChartsSkeleton />
      ) : chartsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load charts. Please try again.</AlertDescription>
        </Alert>
      ) : charts ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Conversations & Orders</CardTitle>
              <CardDescription>Daily overview of conversations and generated orders</CardDescription>
            </CardHeader>
            <CardContent>
              {charts.conversationData.every((d) => d.conversations === 0 && d.orders === 0) ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No conversation data yet. Start engaging with customers!
                </div>
              ) : (
                <ChartContainer
                  config={{
                    conversations: {
                      label: "Conversations",
                      color: "hsl(var(--chart-1))",
                    },
                    orders: {
                      label: "Orders",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.conversationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="conversations"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-2))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue generated by AI agent</CardDescription>
            </CardHeader>
            <CardContent>
              {charts.revenueData.every((d) => d.revenue === 0) ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No revenue data yet. Start making sales!
                </div>
              ) : (
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue (TND)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Recent Activity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions and orders from your AI agent</CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : activitiesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load activity. Please try again.</AlertDescription>
            </Alert>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-secondary p-4"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.type === "order" ? "bg-success/20" : "bg-primary/20"
                    }`}
                  >
                    {activity.type === "order" ? (
                      <ShoppingCart className="h-5 w-5 text-success" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{activity.customer}</p>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.message}</p>
                    {activity.amount && (
                      <Badge variant="secondary" className="mt-2">
                        {activity.amount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-2">
                Activity will appear here once you start receiving conversations and orders
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
