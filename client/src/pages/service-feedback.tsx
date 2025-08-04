import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ServiceFeedbackForm } from "@/components/service-feedback-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, TrendingUp, Users } from "lucide-react";

export default function ServiceFeedbackPage() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8" data-testid="service-feedback-page">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary" data-testid="page-title">
          {t("serviceFeedback.title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="page-subtitle">
          {t("serviceFeedback.subtitle")}
        </p>
      </div>

      {!showForm ? (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="stat-total-responses">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-average-rating">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">Out of 5 stars</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-satisfaction">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Would recommend</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-response-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24h</div>
                <p className="text-xs text-muted-foreground">Average response</p>
              </CardContent>
            </Card>
          </div>

          {/* Service Categories */}
          <Card data-testid="service-categories">
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>
                Choose a category to provide specific feedback or use our general feedback form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "water_supply", count: 234 },
                  { key: "roads", count: 189 },
                  { key: "electricity", count: 156 },
                  { key: "sanitation", count: 143 },
                  { key: "street_lighting", count: 98 },
                  { key: "parks", count: 87 },
                  { key: "administration", count: 156 },
                  { key: "online_services", count: 234 },
                  { key: "overall", count: 87 }
                ].map((category) => (
                  <div
                    key={category.key}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setShowForm(true)}
                    data-testid={`category-${category.key}`}
                  >
                    <span className="font-medium">
                      {t(`serviceFeedback.categories.${category.key}`)}
                    </span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              data-testid="button-provide-feedback"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {t("serviceFeedback.submitFeedback")}
            </Button>
            <p className="text-sm text-muted-foreground">
              Your feedback helps us improve government services for everyone
            </p>
          </div>
        </>
      ) : (
        <ServiceFeedbackForm onSuccess={handleFormSuccess} />
      )}
    </div>
  );
}