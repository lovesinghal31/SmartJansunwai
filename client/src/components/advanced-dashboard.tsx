import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Sparkles,
  Target,
  Zap,
  Activity,
  Star,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AdvancedDashboard() {
  const { t } = useTranslation();
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", selectedTimeRange, selectedCategory],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mock data for demonstration (replace with real API data)
  const mockData = {
    overview: {
      totalComplaints: 1247,
      resolvedComplaints: 892,
      averageResolutionTime: 3.2,
      citizenSatisfaction: 4.2,
      trends: {
        complaintsChange: 12,
        resolutionChange: -8,
        satisfactionChange: 5
      }
    },
    recentActivity: [
      { time: "2 min ago", action: "New complaint submitted", category: "roads", priority: "high" },
      { time: "5 min ago", action: "Complaint resolved", category: "water_supply", priority: "medium" },
      { time: "12 min ago", action: "Update posted", category: "electricity", priority: "urgent" },
      { time: "18 min ago", action: "Feedback received", category: "sanitation", priority: "low" },
    ],
    categoryData: [
      { name: "Roads", value: 324, resolved: 245, pending: 79 },
      { name: "Water Supply", value: 287, resolved: 198, pending: 89 },
      { name: "Electricity", value: 156, resolved: 134, pending: 22 },
      { name: "Sanitation", value: 234, resolved: 187, pending: 47 },
      { name: "Street Lighting", value: 89, resolved: 67, pending: 22 },
      { name: "Other", value: 157, resolved: 61, pending: 96 }
    ],
    timelineData: [
      { date: "Mon", complaints: 45, resolved: 38 },
      { date: "Tue", complaints: 52, resolved: 41 },
      { date: "Wed", complaints: 38, resolved: 45 },
      { date: "Thu", complaints: 67, resolved: 52 },
      { date: "Fri", complaints: 89, resolved: 67 },
      { date: "Sat", complaints: 34, resolved: 28 },
      { date: "Sun", complaints: 28, resolved: 31 }
    ],
    priorityDistribution: [
      { name: "Low", value: 425, color: "#10B981" },
      { name: "Medium", value: 547, color: "#F59E0B" },
      { name: "High", value: 198, color: "#EF4444" },
      { name: "Urgent", value: 77, color: "#DC2626" }
    ],
    satisfactionTrend: [
      { month: "Jan", rating: 3.8 },
      { month: "Feb", rating: 3.9 },
      { month: "Mar", rating: 4.1 },
      { month: "Apr", rating: 4.0 },
      { month: "May", rating: 4.2 },
      { month: "Jun", rating: 4.3 }
    ]
  };

  const data = dashboardData || mockData;

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }: any) => (
    <Card className={`border-l-4 border-l-${color}-500`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(change)}% from last week
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Government Services Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights and analytics for citizen services
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant={selectedTimeRange === "24h" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange("24h")}
          >
            24h
          </Button>
          <Button
            variant={selectedTimeRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange("7d")}
          >
            7 days
          </Button>
          <Button
            variant={selectedTimeRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange("30d")}
          >
            30 days
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={data.overview.totalComplaints.toLocaleString()}
          change={data.overview.trends.complaintsChange}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Resolved Cases"
          value={data.overview.resolvedComplaints.toLocaleString()}
          change={data.overview.trends.resolutionChange}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${data.overview.averageResolutionTime} days`}
          change={data.overview.trends.resolutionChange}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Citizen Satisfaction"
          value={`${data.overview.citizenSatisfaction}/5`}
          change={data.overview.trends.satisfactionChange}
          icon={Star}
          color="purple"
        />
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Complaints Timeline
            </CardTitle>
            <CardDescription>Daily complaints vs resolutions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="complaints" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stackId="2"
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
            <CardDescription>Current complaint priorities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.priorityDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.priorityDistribution.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Performance
            </CardTitle>
            <CardDescription>Complaints by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.priority === 'urgent' ? 'bg-red-500' :
                    activity.priority === 'high' ? 'bg-orange-500' :
                    activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {activity.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Citizen Satisfaction Trend
          </CardTitle>
          <CardDescription>Monthly satisfaction ratings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.satisfactionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="rating" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI-Powered Insights */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Smart recommendations based on data analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/70 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Trending Issue</span>
              </div>
              <p className="text-sm text-gray-700">
                Road maintenance complaints increased 23% this week. Consider proactive inspections.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-white/70 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Quick Win</span>
              </div>
              <p className="text-sm text-gray-700">
                92% of street lighting issues can be resolved within 24 hours. Fast-track these cases.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-white/70 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Success Pattern</span>
              </div>
              <p className="text-sm text-gray-700">
                Complaints with photo evidence are resolved 40% faster. Encourage photo uploads.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}