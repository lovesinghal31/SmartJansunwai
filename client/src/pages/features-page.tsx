import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Map, 
  BarChart3, 
  MessageSquare, 
  Mic, 
  QrCode,
  Smartphone, 
  Globe, 
  Zap,
  Shield,
  Clock,
  Users,
  Bell,
  FileText,
  Camera,
  Navigation,
  Layers,
  TrendingUp,
  Brain,
  Heart,
  Target,
  Award,
  Lightbulb,
  Rocket,
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function FeaturesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const featureCategories = [
    { id: "all", name: "All Features", icon: Rocket },
    { id: "ai", name: "AI & ML", icon: Brain },
    { id: "citizen", name: "Citizen Tools", icon: Users },
    { id: "official", name: "Official Tools", icon: Shield },
    { id: "mobile", name: "Mobile & PWA", icon: Smartphone },
  ];

  const allFeatures = [
    // AI & ML Features
    {
      id: "chatbot",
      category: "ai",
      title: "Smart Chatbot Assistant",
      description: "AI-powered assistant to guide users through complaint processes and provide instant help",
      icon: Bot,
      status: "available",
      route: "/chatbot",
      navigationPath: "/chatbot",
      highlights: ["24/7 availability", "Multilingual support", "Voice input", "Smart suggestions"],
      accuracy: "94.2%",
      color: "from-blue-50 to-indigo-50 border-blue-200"
    },
    {
      id: "classification",
      category: "ai",
      title: "Complaint Auto-Classification",
      description: "Automatically categorize and route complaints using advanced NLP algorithms",
      icon: Brain,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["NLP-powered", "Auto-routing", "Smart prioritization", "Learning system"],
      accuracy: "92.8%",
      color: "from-purple-50 to-violet-50 border-purple-200"
    },
    {
      id: "sentiment",
      category: "ai",
      title: "Sentiment Analysis",
      description: "Analyze citizen emotions and prioritize complaints based on urgency and sentiment",
      icon: Heart,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Emotion detection", "Urgency scoring", "Voice analysis", "Text analysis"],
      accuracy: "89.5%",
      color: "from-pink-50 to-rose-50 border-pink-200"
    },
    {
      id: "prediction",
      category: "ai",
      title: "Predictive Analytics",
      description: "Forecast complaint trends and identify potential issues before they escalate",
      icon: TrendingUp,
      status: "available",
      route: "/analytics",
      navigationPath: "/analytics",
      highlights: ["Trend forecasting", "Early warning", "Resource planning", "Performance optimization"],
      accuracy: "87.3%",
      color: "from-green-50 to-emerald-50 border-green-200"
    },

    // Citizen Tools
    {
      id: "mobile-app",
      category: "citizen",
      title: "Progressive Web App (PWA)",
      description: "Mobile-first experience with offline support and push notifications",
      icon: Smartphone,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Offline support", "Push notifications", "Install on device", "Cross-platform"],
      accuracy: null,
      color: "from-cyan-50 to-blue-50 border-cyan-200"
    },
    {
      id: "voice-input",
      category: "citizen",
      title: "Voice-to-Text Complaints",
      description: "Submit complaints using voice input with Google Speech API integration",
      icon: Mic,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Speech recognition", "Multilingual", "Hands-free", "Accessibility"],
      accuracy: null,
      color: "from-yellow-50 to-amber-50 border-yellow-200"
    },
    {
      id: "qr-scanner",
      category: "citizen",
      title: "QR Code Scanner",
      description: "Scan QR codes to quickly tag location-based issues and public utilities",
      icon: QrCode,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Location tagging", "Asset identification", "Quick reporting", "Utility mapping"],
      accuracy: null,
      color: "from-indigo-50 to-blue-50 border-indigo-200"
    },
    {
      id: "complaint-map",
      category: "citizen",
      title: "Interactive Complaint Map",
      description: "Visualize complaints geographically with real-time plotting and heatmap analysis",
      icon: Map,
      status: "available",
      route: "/complaint-map",
      navigationPath: "/complaint-map",
      highlights: ["Real-time mapping", "Heatmap analysis", "Location search", "Ward filtering"],
      accuracy: null,
      color: "from-green-50 to-teal-50 border-green-200"
    },

    // Official Tools
    {
      id: "analytics",
      category: "official",
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive performance metrics, trends, and AI-powered insights for officials",
      icon: BarChart3,
      status: "available",
      route: "/analytics",
      navigationPath: "/analytics",
      highlights: ["Performance metrics", "Trend analysis", "AI insights", "Export reports"],
      accuracy: null,
      color: "from-orange-50 to-red-50 border-orange-200"
    },
    {
      id: "kanban",
      category: "official",
      title: "Kanban Board Management",
      description: "Visual workflow management with drag-and-drop complaint tracking",
      icon: Layers,
      status: "available",
      route: "/official-dashboard",
      navigationPath: "/official-dashboard",
      highlights: ["Visual workflow", "Drag & drop", "Status tracking", "Team collaboration"],
      accuracy: null,
      color: "from-slate-50 to-gray-50 border-slate-200"
    },
    {
      id: "sla-engine",
      category: "official",
      title: "Smart SLA Management",
      description: "Automated escalation and priority assignment based on complaint type and severity",
      icon: Clock,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Auto escalation", "Priority scoring", "Timeline tracking", "Performance monitoring"],
      accuracy: null,
      color: "from-violet-50 to-purple-50 border-violet-200"
    },
    {
      id: "audit-logs",
      category: "official",
      title: "Comprehensive Audit Trail",
      description: "Complete logging of all actions with who did what and when for accountability",
      icon: FileText,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Action logging", "User tracking", "Timestamp records", "Compliance ready"],
      accuracy: null,
      color: "from-gray-50 to-slate-50 border-gray-200"
    },

    // Mobile & PWA
    {
      id: "offline-support",
      category: "mobile",
      title: "Offline-First Architecture",
      description: "Continue working even without internet connection with service worker support",
      icon: Zap,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Service worker", "Local storage", "Sync on connect", "Background updates"],
      accuracy: null,
      color: "from-emerald-50 to-green-50 border-emerald-200"
    },
    {
      id: "notifications",
      category: "mobile",
      title: "Real-time Notifications",
      description: "WebSocket-powered live updates and push notifications for status changes",
      icon: Bell,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Push notifications", "WebSocket updates", "Status alerts", "Custom preferences"],
      accuracy: null,
      color: "from-red-50 to-pink-50 border-red-200"
    },
    {
      id: "camera-integration",
      category: "mobile",
      title: "Camera Integration",
      description: "Capture and attach photos directly from device camera for evidence",
      icon: Camera,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Direct capture", "Image compression", "Multiple photos", "Gallery access"],
      accuracy: null,
      color: "from-blue-50 to-cyan-50 border-blue-200"
    },
    {
      id: "gps-location",
      category: "mobile",
      title: "GPS Location Services",
      description: "Automatic location detection and precise complaint positioning",
      icon: Navigation,
      status: "available",
      route: null,
      navigationPath: null,
      highlights: ["Auto-location", "GPS precision", "Address lookup", "Area boundaries"],
      accuracy: null,
      color: "from-teal-50 to-cyan-50 border-teal-200"
    }
  ];

  // Debug user state and routes
  console.log("FeaturesPage - Current user:", user);
  console.log("FeaturesPage - User role:", user?.role);
  console.log("FeaturesPage - Navigate function available:", typeof navigate);
  
  // Debug available routes
  const availableRoutes = allFeatures.filter(f => f.navigationPath).map(f => ({ title: f.title, navigationPath: f.navigationPath }));
  console.log("FeaturesPage - Available navigation paths:", availableRoutes);

  const filteredFeatures = selectedCategory === "all" 
    ? allFeatures 
    : allFeatures.filter(feature => feature.category === selectedCategory);

  const handleFeatureClick = (feature: any) => {
    console.log("Feature clicked:", feature.title, "NavigationPath:", feature.navigationPath);
    console.log("Navigate function:", typeof navigate);
    
    if (feature.navigationPath) {
      // Route to the specific feature using react-router navigation
      console.log("Attempting to navigate to:", feature.navigationPath);
      try {
        navigate(feature.navigationPath);
        console.log("Navigation successful");
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback to window.location if navigate fails
        window.location.href = feature.navigationPath;
      }
    } else {
      // Show "coming soon" popup
      console.log("Showing coming soon message for:", feature.title);
      toast({
        title: "Feature Coming Soon",
        description: `${feature.title} is currently being developed and will be available soon!`,
        variant: "default"
      });
    }
  };

  const getStatusBadge = (status: string, hasNavigationPath: boolean) => {
    if (hasNavigationPath) {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Coming Soon</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center">
              <Rocket className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Platform Features</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the comprehensive suite of AI-powered tools and advanced features that make 
            Jansunwai the most sophisticated grievance redressal platform.
          </p>
          {/* Debug Navigation Test */}
          <div className="mt-4 flex justify-center space-x-4">
            <Button 
              onClick={() => {
                console.log("Testing navigation to /chatbot");
                navigate("/chatbot");
              }}
              variant="outline"
              size="sm"
            >
              Test Chatbot Nav
            </Button>
            <Button 
              onClick={() => {
                console.log("Testing navigation to /features");
                navigate("/features");
              }}
              variant="outline"
              size="sm"
            >
              Test Features Nav
            </Button>
            <Button 
              onClick={() => {
                console.log("Testing window.location.href to /chatbot");
                window.location.href = "/chatbot";
              }}
              variant="outline"
              size="sm"
            >
              Test Window Location
            </Button>
            <Button 
              onClick={() => {
                console.log("Testing navigation to /auth (non-protected)");
                navigate("/auth");
              }}
              variant="outline"
              size="sm"
            >
              Test Auth Nav
            </Button>
          </div>
        </div>

        {/* Feature Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">{allFeatures.length}</div>
              <div className="text-sm text-gray-600">Total Features</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {allFeatures.filter(f => f.category === "ai").length}
              </div>
              <div className="text-sm text-gray-600">AI-Powered</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {allFeatures.filter(f => f.status === "available").length}
              </div>
              <div className="text-sm text-gray-600">Ready to Use</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Availability</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {featureCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                <category.icon size={16} />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {featureCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map((feature) => (
                  <Card 
                    key={feature.id} 
                    className={`hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${feature.color} cursor-pointer`}
                    onClick={() => {
                      console.log("Card clicked for feature:", feature.title);
                      handleFeatureClick(feature);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
                            <feature.icon size={24} className="text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                            {getStatusBadge(feature.status, !!feature.navigationPath)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                      
                      {/* Accuracy Badge */}
                      {feature.accuracy && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Accuracy Rate</span>
                            <span className="font-semibold text-gray-800">{feature.accuracy}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: feature.accuracy }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Feature Highlights */}
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          {feature.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center space-x-1 text-xs">
                              <CheckCircle className="text-green-500 flex-shrink-0" size={12} />
                              <span className="text-gray-600">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      {feature.category === "official" && (!user || user.role !== "official") ? (
                        <Button className="w-full" variant="outline" disabled title="Officials only">
                          <Shield size={16} className="mr-2" />
                          Officials Only
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={(e) => {
                            console.log("Button clicked for feature:", feature.title);
                            e.stopPropagation();
                            handleFeatureClick(feature);
                          }}
                          variant={feature.navigationPath ? "default" : "outline"}
                        >
                          {feature.navigationPath ? (
                            <>
                              Try Feature
                              <ArrowRight size={16} className="ml-2" />
                            </>
                          ) : (
                            <>
                              <Lightbulb size={16} className="mr-2" />
                              Coming Soon
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Feature Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Feature Availability by User Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Feature</th>
                    <th className="text-center p-3">Citizens</th>
                    <th className="text-center p-3">Officials</th>
                    <th className="text-center p-3">Administrators</th>
                    <th className="text-right p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.slice(0, 8).map((feature) => (
                    <tr 
                      key={feature.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleFeatureClick(feature)}
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <feature.icon size={16} className="text-gray-600" />
                          <span className="font-medium">{feature.title}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <CheckCircle className="text-green-500 mx-auto" size={16} />
                      </td>
                      <td className="p-3 text-center">
                        <CheckCircle className="text-green-500 mx-auto" size={16} />
                      </td>
                      <td className="p-3 text-center">
                        <CheckCircle className="text-green-500 mx-auto" size={16} />
                      </td>
                      <td className="p-3 text-right">
                        {getStatusBadge(feature.status, !!feature.navigationPath)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 text-yellow-500" />
              Getting Started with Advanced Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">For Citizens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Start by exploring the chatbot assistant and interactive map for an enhanced complaint experience.
                </p>
                <Link to="/chatbot">
                  <Button className="w-full">
                    Start with Chatbot
                  </Button>
                </Link>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-green-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">For Officials</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access the analytics dashboard and Kanban board for comprehensive complaint management.
                </p>
                <Link to="/analytics">
                  <Button className="w-full">
                    View Analytics
                  </Button>
                </Link>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="text-purple-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Features</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Experience automatic classification, sentiment analysis, and predictive insights.
                </p>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}