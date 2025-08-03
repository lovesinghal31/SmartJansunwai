import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/citizen-dashboard" component={CitizenDashboard} />
      <ProtectedRoute path="/official-dashboard" component={OfficialDashboard} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/chatbot" component={ChatbotPage} />
      <ProtectedRoute path="/complaint-map" component={ComplaintMapPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/feedback" component={FeedbackPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
