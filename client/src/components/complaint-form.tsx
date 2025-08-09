import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, MapPin, Clock, Star, User, Phone } from "lucide-react";
import type { Complaint } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface ComplaintCardProps {
  complaint: Complaint;
}

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      const res = await apiRequest("POST", `/api/complaints/${complaint.id}/feedback`, data, accessToken);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({ title: "Feedback submitted successfully" });
      setShowFeedback(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to submit feedback", description: error.message, variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      case "under-review": return "bg-purple-100 text-purple-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const getTimeSinceUpdate = (date: Date) => {
    const diffInHours = Math.floor((new Date().getTime() - new Date(date).getTime()) / 3600000);
    if (diffInHours < 1) return "Updated recently";
    if (diffInHours < 24) return `Updated ${diffInHours}h ago`;
    return `Updated ${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleSubmitFeedback = () => {
    submitFeedbackMutation.mutate({ rating, comment: comment.trim() || undefined });
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2 flex-wrap">
                <span className="font-medium text-gray-900">{complaint.id.slice(0, 8)}</span>
                <Badge className={getStatusColor(complaint.status)}>{complaint.status?.replace('-', ' ')}</Badge>
                <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                <Badge variant="outline">{complaint.category?.replace('-', ' ')}</Badge>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{complaint.title}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" /> Submitted: {formatDate(complaint.createdAt)}</span>
                <span className="flex items-center"><MapPin className="mr-1 h-3 w-3" /> {complaint.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>View Details</Button>
              {complaint.status === "resolved" && (
                <Button variant="outline" size="sm" onClick={() => setShowFeedback(true)}>Rate Resolution</Button>
              )}
              <div className="text-xs text-gray-500"><Clock className="inline mr-1 h-3 w-3" />{getTimeSinceUpdate(complaint.updatedAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Complaint Details</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                <p className="text-sm text-gray-600">ID: {complaint.id}</p>
              </div>
              <div className="flex space-x-2">
                <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* --- FIX: Added Name and Contact fields --- */}
              <div><span className="font-medium text-gray-700">Submitter Name:</span><p className="text-gray-600">{complaint.name}</p></div>
              <div><span className="font-medium text-gray-700">Contact Info:</span><p className="text-gray-600">{complaint.contact}</p></div>
              <div><span className="font-medium text-gray-700">Category:</span><p className="text-gray-600">{complaint.category.replace('-', ' ')}</p></div>
              <div><span className="font-medium text-gray-700">Location:</span><p className="text-gray-600">{complaint.location}</p></div>
              <div><span className="font-medium text-gray-700">Created:</span><p className="text-gray-600">{formatDate(complaint.createdAt)}</p></div>
              <div><span className="font-medium text-gray-700">Last Updated:</span><p className="text-gray-600">{formatDate(complaint.updatedAt)}</p></div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Description:</span>
              <p className="text-gray-600 mt-1">{complaint.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
