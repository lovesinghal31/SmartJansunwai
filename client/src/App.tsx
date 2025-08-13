import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CitizenDashboard from "@/pages/citizen-dashboard";
import OfficialDashboard from "@/pages/official-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ChatbotPage from "@/pages/chatbot-page";
import ComplaintMapPage from "@/pages/complaint-map-page";
import AnalyticsPage from "@/pages/analytics-page";
import FeaturesPage from "@/pages/features-page";
import FeedbackPage from "@/pages/feedback-page";
import NotFound from "@/pages/not-found";
import TrackComplaintPage from "@/components/track-complaint"; 

function AppRouter() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/track-complaint" element={<ProtectedRoute><TrackComplaintPage /></ProtectedRoute>} />
        <Route path="/citizen-dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/official-dashboard" element={<ProtectedRoute><OfficialDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
        <Route path="/complaint-map" element={<ProtectedRoute><ComplaintMapPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
