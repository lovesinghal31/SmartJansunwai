import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("complaints");

  const { data: stats } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats"],
    enabled: !!user && user.role === "official",
  });

  // Mock enhanced analytics data
  const analyticsData = {
    totalComplaints: 12847,
    resolvedComplaints: 10234,
    averageResolutionTime: 4.2,
    citizenSatisfaction: 4.3,
    departmentPerformance: [
      { name: "Water Supply", complaints: 2456, resolved: 2123, avgTime: 3.2, satisfaction: 4.1 },
      { name: "Roads & Transportation", complaints: 3821, resolved: 2987, avgTime: 5.8, satisfaction: 3.9 },
      { name: "Electricity", complaints: 1654, resolved: 1523, avgTime: 2.1, satisfaction: 4.5 },
      { name: "Sanitation", complaints: 2134, resolved: 1876, avgTime: 4.5, satisfaction: 4.2 },
      { name: "Street Lighting", complaints: 987, resolved: 912, avgTime: 1.8, satisfaction: 4.6 },
      { name: "Parks & Recreation", complaints: 456, resolved: 398, avgTime: 6.2, satisfaction: 4.0 },
    ],
    trendData: [
      { month: "Jan", complaints: 1234, resolved: 987, satisfaction: 4.1 },
      { month: "Feb", complaints: 1456, resolved: 1123, satisfaction: 4.2 },
      { month: "Mar", complaints: 1687, resolved: 1345, satisfaction: 4.0 },
      { month: "Apr", complaints: 1543, resolved: 1298, satisfaction: 4.3 },
      { month: "May", complaints: 1789, resolved: 1456, satisfaction: 4.2 },
      { month: "Jun", complaints: 1623, resolved: 1387, satisfaction: 4.4 },
    ],
    wardPerformance: [
      { ward: 1, complaints: 156, performance: 92 },
      { ward: 2, complaints: 234, performance: 87 },
      { ward: 3, complaints: 189, performance: 94 },
      { ward: 4, complaints: 298, performance: 83 },
      { ward: 5, complaints: 176, performance: 91 },
    ],
    aiInsights: [
      {
        type: "prediction",
        title: "Peak Complaint Period Forecast",
        description: "Expect 15% increase in road-related complaints during monsoon season",
        impact: "high",
        recommendation: "Increase road maintenance team capacity by 20%"
      },
      {
        type: "optimization",
        title: "Resource Allocation Opportunity",
        description: "Water supply department showing 23% faster resolution times",
        impact: "medium",
        recommendation: "Adopt water dept. workflow for other departments"
      },
      {
        type: "alert",
        title: "Ward 4 Performance Alert",
        description: "17% drop in resolution rate compared to city average",
        impact: "high",
        recommendation: "Immediate review of Ward 4 processes required"
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
                Complaint Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-600">Interactive trend chart would be displayed here</p>
                  <p className="text-sm text-gray-500">Showing complaints and resolutions over time</p>
                </div>
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
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-600">Pie chart showing complaint categories</p>
                  <p className="text-sm text-gray-500">Roads: 30%, Water: 25%, Other: 45%</p>
                </div>
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

        {/* Ward Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Performance Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {analyticsData.wardPerformance.map((ward) => (
                <div key={ward.ward} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">Ward {ward.ward}</div>
                  <div className="text-sm text-gray-600 mb-2">{ward.complaints} complaints</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(ward.performance)}`}>
                    {ward.performance}% performance
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${ward.performance}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}