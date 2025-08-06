import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ComplaintForm from "@/components/complaint-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Landmark, 
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
  Heart
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<'citizen' | 'official'>('citizen');

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Classification",
      description: "Automatically categorize and route complaints to the right department using advanced NLP algorithms.",
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: MapPin,
      title: "Interactive Complaint Map",
      description: "Visualize complaints geographically with real-time plotting and heatmap analysis.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: MessageSquare,
      title: "Smart Chatbot Assistant",
      description: "Get instant help and guidance through our AI chatbot trained on common civic issues.",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: Smartphone,
      title: "Mobile-First PWA",
      description: "Access the platform seamlessly across all devices with offline support and push notifications.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards with performance metrics and predictive insights for officials.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Shield,
      title: "Smart SLA Management",
      description: "Automated escalation and priority assignment based on complaint type and severity.",
      color: "bg-red-100 text-red-600"
    }
  ];

  const aiFeatures = [
    {
      icon: Brain,
      title: "Smart Classification",
      description: "Automatically categorize complaints and route them to the appropriate department using NLP.",
      accuracy: "94.2%",
      color: "from-purple-50 to-blue-50 border-purple-100"
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "Forecast complaint trends and identify potential issues before they escalate.",
      accuracy: "87.5%",
      color: "from-green-50 to-emerald-50 border-green-100"
    },
    {
      icon: Heart,
      title: "Sentiment Analysis",
      description: "Understand citizen emotions and prioritize complaints based on urgency and sentiment.",
      accuracy: "91.8%",
      color: "from-orange-50 to-red-50 border-orange-100"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="text-white py-16 min-h-screen bg-[#111827]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Smart Grievance Redressal for{" "}
                <span className="text-yellow-300">Indore</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                AI-powered platform to submit, track, and resolve civic complaints efficiently. 
                Your voice matters in building a better Indore.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-300"
                  onClick={() => setShowComplaintForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4 text-black" />
                  Submit New Complaint
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-black hover:bg-gray-300"
                >
                  <Search className="mr-2 h-4 w-4  text-black" />
                  Track Complaint
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-300">12,847</div>
                  <div className="text-sm text-blue-100">Total Complaints</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-300">10,234</div>
                  <div className="text-sm text-blue-100">Resolved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-300">4.2 days</div>
                  <div className="text-sm text-blue-100">Avg Resolution</div>
                </div>
              </div>
            </div>

            {/* Quick Complaint Form */}
            <Card className="bg-white shadow-2xl w-full max-w-2xl mx-auto p-6 lg:p-8">
              <CardHeader>
                <CardTitle className="text-center text-gray-900">Quick Complaint Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <ComplaintForm onSuccess={() => setShowComplaintForm(false)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-primary-800">
          <div className="bg-primary-800 text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered tools and intuitive interfaces designed to streamline 
              the grievance redressal process for both citizens and officials.
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

      {/* Dashboard Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dual Dashboard Experience</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Separate optimized interfaces for citizens to track their complaints and officials to manage resolutions efficiently.
            </p>
          </div>
          
          {/* Dashboard Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <Button
                variant={selectedDashboard === 'citizen' ? 'default' : 'ghost'}
                onClick={() => setSelectedDashboard('citizen')}
                className="px-6 py-2"
              >
                Citizen Dashboard
              </Button>
              <Button
                variant={selectedDashboard === 'official' ? 'default' : 'ghost'}
                onClick={() => setSelectedDashboard('official')}
                className="px-6 py-2"
              >
                Official Dashboard
              </Button>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between bg-">
              <CardTitle>
                {selectedDashboard === 'citizen' ? 'My Complaints' : 'Complaint Management'}
              </CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {selectedDashboard === 'citizen' ? 'New Complaint' : 'View Analytics'}
              </Button>
            </CardHeader>
            <CardContent>
              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedDashboard === 'citizen' ? '5' : '847'}
                    </div>
                    <div className="text-sm text-blue-700">
                      {selectedDashboard === 'citizen' ? 'Total Complaints' : 'Total Active'}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedDashboard === 'citizen' ? '2' : '23'}
                    </div>
                    <div className="text-sm text-yellow-700">
                      {selectedDashboard === 'citizen' ? 'In Progress' : 'Urgent'}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedDashboard === 'citizen' ? '3' : '34'}
                    </div>
                    <div className="text-sm text-green-700">
                      {selectedDashboard === 'citizen' ? 'Resolved' : 'Resolved Today'}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {selectedDashboard === 'citizen' ? '4.2' : '3.8'}
                    </div>
                    <div className="text-sm text-gray-700">Avg Days</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <p>Dashboard preview - {selectedDashboard === 'citizen' ? 'Login to view your complaints' : 'Login as official to manage complaints'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Features Section */}
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Intelligence</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced machine learning algorithms working behind the scenes to improve efficiency and citizen experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-100">
              <CardContent className="p-6 flex flex-col h-full justify-between">
                {/* Icon, Title, Description */}
                <div>
                  <div className="w-12 h-12 bg-white bg-opacity-80 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon size={20} className="text-gray-700" />
                  </div>

                  <div className="mb-4 min-h-[100px]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <Card className="bg-white mt-auto">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="text-gray-600">Accuracy Rate</span>
                      <span className="font-semibold text-gray-800">{feature.accuracy}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${parseInt(feature.accuracy)}%` }}
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
