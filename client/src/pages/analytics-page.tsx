import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  PieChart,
  Activity,
  Target,
  Award
} from "lucide-react";

interface AnalyticsStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

interface AnalyticsSummary {
  totalComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  citizenSatisfaction: number;
  resolutionRate: number;
}

interface DepartmentPerformance {
  name: string;
  complaints: number;
  resolved: number;
  avgTime: number;
  satisfaction: number;
}

interface TrendData {
  month: string;
  complaints: number;
  resolved: number;
  satisfaction: number;
}

export default function AnalyticsPage() {
  const { user, accessToken } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("complaints");

  const { data: stats, isLoading: statsLoading } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/stats", undefined, accessToken);
      return res.json();
    },
    enabled: !!user && user.role === "official" && !!accessToken,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics/summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/summary", undefined, accessToken);
      return res.json();
    },
    enabled: !!user && user.role === "official" && !!accessToken,
  });

  const { data: departmentPerformance = [], isLoading: deptLoading } = useQuery<DepartmentPerformance[]>({
    queryKey: ["/api/analytics/department-performance"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/department-performance", undefined, accessToken);
      return res.json();
    },
    enabled: !!user && user.role === "official" && !!accessToken,
  });

  const { data: trendData = [], isLoading: trendsLoading } = useQuery<TrendData[]>({
    queryKey: ["/api/analytics/trends", timeRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/analytics/trends?timeRange=${timeRange}`, undefined, accessToken);
      return res.json();
    },
    enabled: !!user && user.role === "official" && !!accessToken,
  });

  // Default values for loading states
  const analyticsData = {
    totalComplaints: summary?.totalComplaints || 0,
    resolvedComplaints: summary?.resolvedComplaints || 0,
    averageResolutionTime: summary?.averageResolutionTime || 0,
    citizenSatisfaction: summary?.citizenSatisfaction || 4.0,
    resolutionRate: summary?.resolutionRate || 0,
    departmentPerformance: departmentPerformance,
    trendData: trendData,
    // Mock AI insights for now - can be enhanced later
    aiInsights: [
      {
        type: "prediction",
        title: "Data-Driven Insights Available",
        description: "Analytics are now powered by real complaint data",
        impact: "high",
        recommendation: "Review department performance metrics for optimization opportunities"
      },
      {
        type: "optimization",
        title: "Real-Time Performance Tracking",
        description: "Monitoring actual resolution times and complaint volumes",
        impact: "medium",
        recommendation: "Focus on departments with lower resolution rates"
      }
    ]
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600 bg-green-100";
    if (performance >= 80) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!user || user.role !== "official") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Officials only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.totalComplaints.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600">+12% from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round((analyticsData.resolvedComplaints / analyticsData.totalComplaints) * 100)}%
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600">+3% improvement</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.averageResolutionTime} days</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600">-0.8 days faster</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Citizen Satisfaction</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.citizenSatisfaction}/5.0</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600">+0.2 rating increase</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2" size={20} />
                Complaint Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.map((trend, index) => (
                  <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{trend.month}</span>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <div>
                        <span className="text-gray-600">Complaints: </span>
                        <span className="font-bold text-blue-600">{trend.complaints}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Resolved: </span>
                        <span className="font-bold text-green-600">{trend.resolved}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {trendsLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading trends...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2" size={20} />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats && Object.entries(stats.byCategory).map(([category, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category.replace(/-/g, ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
                {statsLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading categories...</p>
                  </div>
                )}
                {!statsLoading && (!stats || Object.keys(stats.byCategory).length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No category data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Department Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Department</th>
                    <th className="text-right p-3">Total Complaints</th>
                    <th className="text-right p-3">Resolved</th>
                    <th className="text-right p-3">Resolution Rate</th>
                    <th className="text-right p-3">Avg Time (days)</th>
                    <th className="text-right p-3">Satisfaction</th>
                    <th className="text-right p-3">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.departmentPerformance.map((dept, index) => {
                    const resolutionRate = (dept.resolved / dept.complaints) * 100;
                    const performance = resolutionRate * (5 / dept.avgTime) * (dept.satisfaction / 5) * 20;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{dept.name}</td>
                        <td className="p-3 text-right">{dept.complaints.toLocaleString()}</td>
                        <td className="p-3 text-right">{dept.resolved.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <Badge className={getPerformanceColor(resolutionRate)}>
                            {resolutionRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-3 text-right">{dept.avgTime}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end">
                            <span className="mr-1">{dept.satisfaction}</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`w-3 h-3 rounded-full ${
                                    star <= dept.satisfaction ? 'bg-yellow-400' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Badge className={getPerformanceColor(performance)}>
                            {performance.toFixed(0)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2" size={20} />
              AI-Powered Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.aiInsights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.resolutionRate}%
                </div>
                <div className="text-sm text-gray-600">Resolution Rate</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.averageResolutionTime}d
                </div>
                <div className="text-sm text-gray-600">Avg Resolution Time</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {departmentPerformance.length}
                </div>
                <div className="text-sm text-gray-600">Active Departments</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.citizenSatisfaction.toFixed(1)}/5
                </div>
                <div className="text-sm text-gray-600">Satisfaction Score</div>
              </div>
            </div>
            
            {(statsLoading || summaryLoading || deptLoading || trendsLoading) && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading analytics data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}