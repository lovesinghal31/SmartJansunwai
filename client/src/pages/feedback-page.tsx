import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Star, Send, Filter, Calendar, User } from "lucide-react";
import Header from "@/components/header";

// Form schema for feedback submission
const feedbackFormSchema = z.object({
  complaintId: z.string().min(1, "Please select a complaint"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export default function FeedbackPage() {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");

  // Queries
  const { data: complaints = [] } = useQuery<any[]>({
    queryKey: ["/api/complaints"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/complaints", undefined, accessToken);
      return res.json();
    },
    enabled: !!accessToken,
  });

  const { data: allFeedback = [] } = useQuery<any[]>({
    queryKey: ["/api/feedback/all"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/feedback/all", undefined, accessToken);
      return res.json();
    },
    enabled: !!accessToken && user?.role === "official",
  });

  // Get resolved complaints for citizens
  const resolvedComplaints = complaints.filter(c => c.status === "resolved" || c.status === "closed");

  // Feedback submission mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting feedback with data:", data);
      const res = await apiRequest("POST", `/api/complaints/${data.complaintId}/feedback`, {
        rating: data.rating,
        comment: data.comment || ""
      }, accessToken);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/all"] });
      toast({ title: "Feedback submitted successfully", description: "Thank you for your feedback!" });
      form.reset();
      setSelectedRating(0);
    },
    onError: (error: Error) => {
      console.error("Feedback submission error:", error);
      toast({ 
        title: "Failed to submit feedback", 
        description: error.message || "Please try again later", 
        variant: "destructive" 
      });
    },
  });

  // Manual test function
  const testFeedbackSubmission = async () => {
    if (resolvedComplaints.length === 0) {
      toast({ title: "No resolved complaints to test with", variant: "destructive" });
      return;
    }
    
    const testComplaint = resolvedComplaints[0];
    console.log("Testing feedback submission for complaint:", testComplaint.id);
    
    try {
      const res = await apiRequest("POST", `/api/complaints/${testComplaint.id}/feedback`, {
        rating: 5,
        comment: "Test feedback submission"
      }, accessToken);
      const data = await res.json();
      console.log("Test feedback submission result:", data);
      toast({ title: "Test feedback submitted successfully" });
    } catch (error) {
      console.error("Test feedback submission error:", error);
      toast({ 
        title: "Test feedback submission failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  // Form setup
  const form = useForm({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      complaintId: "",
      rating: 1,
      comment: "",
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      complaintId: data.complaintId,
      rating: selectedRating,
      comment: data.comment,
    };
    console.log('Submitting feedback:', payload);
    submitFeedbackMutation.mutate(payload);
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }: any) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange(star)}
          className={`text-2xl ${
            star <= rating 
              ? "text-yellow-400" 
              : "text-gray-300"
          } ${!readonly ? "hover:text-yellow-300 transition-colors" : ""}`}
        >
          <Star fill="currentColor" />
        </button>
      ))}
    </div>
  );

  // Citizen view for feedback submission
  if (user?.role === "citizen") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="border-b bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Center</h1>
                <p className="text-gray-600 dark:text-gray-300">Share your experience and help us improve our services</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={testFeedbackSubmission}>
                  Test Feedback
                </Button>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Citizen Feedback
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Submit Feedback
                </CardTitle>
                <CardDescription>
                  Please provide feedback for your resolved complaints to help us improve our services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resolvedComplaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>You have no resolved complaints to provide feedback for.</p>
                    <p className="text-sm mt-2">Feedback can be submitted once your complaints are resolved.</p>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="complaintId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Complaint</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a resolved complaint" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {resolvedComplaints.map((complaint: any) => (
                                  <SelectItem key={complaint.id} value={complaint.id}>
                                    {complaint.title} - {complaint.category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rating</label>
                        <StarRating 
                          rating={selectedRating} 
                          onRatingChange={setSelectedRating}
                        />
                        <p className="text-xs text-gray-500">
                          {selectedRating === 0 && "Please select a rating"}
                          {selectedRating === 1 && "Very Poor"}
                          {selectedRating === 2 && "Poor"}
                          {selectedRating === 3 && "Average"}
                          {selectedRating === 4 && "Good"}
                          {selectedRating === 5 && "Excellent"}
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Feedback</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Please share your detailed feedback about the service..."
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={submitFeedbackMutation.isPending || selectedRating === 0}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Previous Feedback */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Previous Feedback</CardTitle>
                <CardDescription>Review feedback you've submitted for past complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedComplaints
                    .filter(c => c.feedback)
                    .map((complaint: any) => (
                    <div key={complaint.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{complaint.title}</h4>
                          <p className="text-sm text-gray-500">{complaint.category}</p>
                        </div>
                        <StarRating rating={complaint.feedback?.rating || 0} readonly />
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{complaint.feedback?.comment}</p>
                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>Category: {complaint.feedback?.category?.replace('_', ' ')}</span>
                        <span>{new Date(complaint.feedback?.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {resolvedComplaints.filter(c => c.feedback).length === 0 && (
                    <p className="text-center text-gray-500 py-4">No previous feedback submitted</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Official/Admin view for feedback management
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <div className="text-sm space-y-1">
              <p>User: {user?.username} (Role: {user?.role})</p>
              <p>Access Token: {accessToken ? "Present" : "Missing"}</p>
              <p>Total Complaints: {complaints.length}</p>
              <p>Resolved Complaints: {resolvedComplaints.length}</p>
              <p>Selected Rating: {selectedRating}</p>
              {submitFeedbackMutation.error && (
                <p className="text-red-600">Error: {submitFeedbackMutation.error.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Monitor and analyze citizen feedback</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Official Dashboard
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allFeedback.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allFeedback.length > 0 
                  ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1)
                  : "0.0"
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allFeedback.filter(f => {
                  const date = new Date(f.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allFeedback.length > 0 
                  ? Math.round((allFeedback.filter(f => f.rating >= 4).length / allFeedback.length) * 100)
                  : 0
                }%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="excellent">5 Stars</SelectItem>
                  <SelectItem value="good">4 Stars</SelectItem>
                  <SelectItem value="average">3 Stars</SelectItem>
                  <SelectItem value="poor">1-2 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Feedback</CardTitle>
            <CardDescription>Comprehensive view of citizen feedback and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFeedback
                  .filter(feedback => {
                    if (filterStatus === "all") return true;
                    if (filterStatus === "excellent") return feedback.rating === 5;
                    if (filterStatus === "good") return feedback.rating === 4;
                    if (filterStatus === "average") return feedback.rating === 3;
                    if (filterStatus === "poor") return feedback.rating <= 2;
                    return true;
                  })
                  .map((feedback: any) => {
                    const complaint = complaints.find(c => c.id === feedback.complaintId);
                    return (
                      <TableRow key={feedback.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{complaint?.title || "Unknown"}</div>
                            <div className="text-sm text-gray-500">{complaint?.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>{feedback.citizenName || "Anonymous"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {feedback.category?.replace('_', ' ') || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StarRating rating={feedback.rating} readonly />
                            <span className="text-sm">({feedback.rating}/5)</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate" title={feedback.comment}>
                            {feedback.comment}
                          </p>
                        </TableCell>
                        <TableCell>{new Date(feedback.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            {allFeedback.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No feedback received yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}