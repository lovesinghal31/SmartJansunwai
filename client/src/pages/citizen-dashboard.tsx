import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AIComplaintForm from "@/components/ai-complaint-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, 
  Search, 
  Bot, 
  MapPin, 
  MessageSquare, 
  Smartphone, 
  TrendingUp, 
  Shield,
  Brain,
  BarChart3,
  Heart,
  Loader2,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

// Type for status options from backend
interface StatusOption {
  value: string;
  label: string;
  displayLabel: string;
}

// Import types for query results
// Types copied from home-page.tsx
interface HomepageStats {
  totalComplaints: number;
  resolvedComplaints: number;
  avgResolutionDays: number;
}
interface AiAccuracyStats {
  classification: number;
  prediction: number;
  sentiment: number;
}
interface DashboardPreviewStats {
  total: number;
  inProgressOrUrgent: number;
  resolved: number;
  avgDays: number;
}

export default function CitizenDashboard() {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const lastNotificationId = useRef<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<'citizen' | 'official'>('citizen');
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatusOptions() {
      setStatusLoading(true);
      setStatusError(null);
      try {
        const res = await fetch("/api/status-options");
        if (!res.ok) throw new Error("Failed to fetch status options");
        const data = await res.json();
        setStatusOptions(data);
      } catch (err: any) {
        setStatusError(err.message || "Unknown error");
      } finally {
        setStatusLoading(false);
      }
    }
    fetchStatusOptions();
  }, []);


  const { data: homepageStats, isLoading: statsLoading } = useQuery<HomepageStats>({
    queryKey: ["/api/stats/homepage"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/stats/homepage");
      if (!res.ok) throw new Error("Failed to fetch homepage stats");
      return res.json();
    },
    placeholderData: { totalComplaints: 0, resolvedComplaints: 0, avgResolutionDays: 0 },
  });

  const { data: aiAccuracy, isLoading: aiLoading } = useQuery<AiAccuracyStats>({
    queryKey: ["/api/ai/accuracy"],
    queryFn: async () => {
      return { classification: 92, prediction: 85, sentiment: 88 };
    },
    placeholderData: { classification: 0, prediction: 0, sentiment: 0 },
  });

  // --- NEW: Fetch stats for the selected dashboard preview ---
  const { data: dashboardStats, isLoading: dashboardLoading } = useQuery<DashboardPreviewStats>({
    // The query key changes when the selected dashboard changes, triggering a refetch
    queryKey: ["/api/stats/dashboard", selectedDashboard], 
    queryFn: async () => {
        // This single endpoint should be smart enough to return different data 
        // based on the user's role (citizen vs official)
        const res = await apiRequest("GET", `/api/stats/dashboard/${selectedDashboard}`, undefined, accessToken);
        if (!res.ok) throw new Error(`Failed to fetch ${selectedDashboard} dashboard stats`);
        return res.json();
    },
    // Only run this query if the user is logged in
    enabled: !!user, 
    placeholderData: { total: 0, inProgressOrUrgent: 0, resolved: 0, avgDays: 0 }
  });

  // Fetch user complaints for citizen dashboard
  const { data: userComplaints = [], isLoading: complaintsLoading, error: complaintsError } = useQuery<any[]>({
    queryKey: ["/api/complaints"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/complaints", undefined, accessToken);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
    enabled: !!user && !!accessToken,
  });

  const features = [
    { icon: Bot, title: "AI-Powered Classification", description: "Automatically categorize and route complaints to the right department using advanced NLP algorithms.", color: "bg-purple-100 text-purple-800" },
    { icon: MapPin, title: "Interactive Complaint Map", description: "Visualize complaints geographically with real-time plotting and heatmap analysis.", color: "bg-green-100 text-green-600" },
    { icon: MessageSquare, title: "Smart Chatbot Assistant", description: "Get instant help and guidance through our AI chatbot trained on common civic issues.", color: "bg-yellow-100 text-yellow-600" },
    { icon: Smartphone, title: "Mobile-First PWA", description: "Access the platform seamlessly across all devices with offline support and push notifications.", color: "bg-purple-100 text-purple-600" },
    { icon: TrendingUp, title: "Real-time Analytics", description: "Comprehensive dashboards with performance metrics and predictive insights for officials.", color: "bg-green-100 text-green-600" },
    { icon: Shield, title: "Smart SLA Management", description: "Automated escalation and priority assignment based on complaint type and severity.", color: "bg-red-100 text-red-600" }
  ];

  const aiFeatures = [
    { icon: Brain, title: "Smart Classification", description: "Automatically categorize complaints and route them to the appropriate department using NLP.", value: aiAccuracy?.classification },
    { icon: BarChart3, title: "Predictive Analytics", description: "Forecast complaint trends and identify potential issues before they escalate.", value: aiAccuracy?.prediction },
    { icon: Heart, title: "Sentiment Analysis", description: "Understand citizen emotions and prioritize complaints based on urgency and sentiment.", value: aiAccuracy?.sentiment }
  ];

  const handleDashboardRedirect = () => {
    if (user?.role === 'official' || user?.role === 'admin') {
      navigate('/official-dashboard');
    } else {
      navigate('/citizen-dashboard');
    }
  };
  
  // --- NEW: Function to handle the button click in the dashboard preview header ---
  const handlePreviewHeaderButtonClick = () => {
    if (selectedDashboard === 'citizen') {
        // For citizens, scroll to the complaint form at the top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // For officials, navigate to the analytics page
        navigate('/analytics');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <section className="text-white py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
                Smart Grievance Redressal for <span className="text-yellow-400">Indore</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                AI-powered platform to submit, track, and resolve civic complaints efficiently. Your voice matters in building a better Indore.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200" onClick={handleDashboardRedirect}>
                  <Plus className="mr-2 h-5 w-5" />
                  Go to dashboard
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/track-complaint')}>
                  <Search className="mr-2 h-5 w-5" />
                  Track Complaint
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-300">
                    {statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : (homepageStats?.totalComplaints ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-100">Total Complaints</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-300">
                    {statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : (homepageStats?.resolvedComplaints ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-100">Resolved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-300">
                    {statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : `${(homepageStats?.avgResolutionDays ?? 0).toFixed(1)} days`}
                  </div>
                  <div className="text-sm text-blue-100">Avg Resolution</div>
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={statusLoading ? "Loading..." : "Filter by status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusLoading && <div className="p-2 text-gray-500">Loading...</div>}
                  {statusError && <div className="p-2 text-red-500">{statusError}</div>}
                  {!statusLoading && !statusError && statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.displayLabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-white shadow-2xl w-full max-w-lg mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-900">Quick Complaint Submission</CardTitle>
                <CardDescription className="text-center text-gray-600">Let our AI assist you in filing your complaint.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <AIComplaintForm onNavigateToTrack={() => navigate('/track-complaint')} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered tools and intuitive interfaces designed to streamline the grievance redressal process for both citizens and officials.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- UPDATED Dashboard Preview --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dual Dashboard Experience</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Separate optimized interfaces for citizens to track their complaints and officials to manage resolutions efficiently.
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <Button variant={selectedDashboard === 'citizen' ? 'default' : 'ghost'} onClick={() => setSelectedDashboard('citizen')} className="px-6 py-2">
                Citizen Dashboard
              </Button>
              <Button variant={selectedDashboard === 'official' ? 'default' : 'ghost'} onClick={() => setSelectedDashboard('official')} className="px-6 py-2">
                Official Dashboard
              </Button>
            </div>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {selectedDashboard === 'citizen' ? 'My Complaints' : 'Complaint Management'}
              </CardTitle>
              {/* This button is now fully functional */}
              <Button onClick={handlePreviewHeaderButtonClick}>
                <Plus className="mr-2 h-4 w-4" />
                {selectedDashboard === 'citizen' ? 'New Complaint' : 'View Analytics'}
              </Button>
            </CardHeader>
            <CardContent>
                {/* Show a message if user is not logged in */}
                {!user ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Please log in to see your dashboard stats.</p>
                        <Button className="mt-4" onClick={() => navigate('/auth')}>Login</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-blue-50 border-blue-200"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{dashboardLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : dashboardStats?.total}</div><div className="text-sm text-blue-700">{selectedDashboard === 'citizen' ? 'Total Complaints' : 'Total Active'}</div></CardContent></Card>
                        <Card className="bg-yellow-50 border-yellow-200"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{dashboardLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : dashboardStats?.inProgressOrUrgent}</div><div className="text-sm text-yellow-700">{selectedDashboard === 'citizen' ? 'In Progress' : 'Urgent'}</div></CardContent></Card>
                        <Card className="bg-green-50 border-green-200"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{dashboardLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : dashboardStats?.resolved}</div><div className="text-sm text-green-700">{selectedDashboard === 'citizen' ? 'Resolved' : 'Resolved Today'}</div></CardContent></Card>
                        <Card className="bg-gray-50 border-gray-200"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-gray-600">{dashboardLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : `${(dashboardStats?.avgDays ?? 0).toFixed(1)} days`}</div><div className="text-sm text-gray-700">Avg Days</div></CardContent></Card>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Intelligence</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced machine learning algorithms working behind the scenes to improve efficiency and citizen experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* --- FIX: Reformatted this section to prevent parsing errors --- */}
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-white to-gray-100">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 bg-white bg-opacity-80 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon size={20} className="text-gray-700" />
                    </div>
                    <div className="mb-4 min-h-[100px]">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                  <Card className="bg-white mt-auto">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className="text-gray-600">Accuracy Rate</span>
                        <span className="font-semibold text-gray-800">{aiLoading ? '--' : `${feature.value}%`}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-400 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: aiLoading ? '0%' : `${feature.value}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
