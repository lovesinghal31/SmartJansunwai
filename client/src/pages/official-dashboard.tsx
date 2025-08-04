import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Filter, Download, BarChart3, Clock, AlertTriangle } from "lucide-react";
import type { Complaint } from "@shared/schema";

interface ComplaintStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

export default function OfficialDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: complaints = [], isLoading, refetch } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
    enabled: !!user && user.role === "official",
  });

  const { data: stats } = useQuery<ComplaintStats>({
    queryKey: ["/api/analytics/stats"],
    enabled: !!user && user.role === "official",
  });

  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Complaint> }) => {
      const res = await apiRequest("PATCH", `/api/complaints/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({ title: "Complaint updated successfully" });
      setSelectedComplaint(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update complaint", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const addUpdateMutation = useMutation({
    mutationFn: async ({ complaintId, message, status }: { complaintId: string; message: string; status?: string }) => {
      const res = await apiRequest("POST", `/api/complaints/${complaintId}/updates`, { message, status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Update added successfully" });
      setUpdateMessage("");
      setNewStatus("");
      setSelectedComplaint(null);
      refetch();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to add update", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-gray-100 text-gray-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "under-review": return "bg-yellow-100 text-yellow-800";
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

  const handleUpdateComplaint = () => {
    if (!selectedComplaint) return;
    
    const updates: Partial<Complaint> = {};
    if (newStatus) updates.status = newStatus;
    
    if (Object.keys(updates).length > 0) {
      updateComplaintMutation.mutate({ id: selectedComplaint.id, updates });
    }
    
    if (updateMessage) {
      addUpdateMutation.mutate({ 
        complaintId: selectedComplaint.id, 
        message: updateMessage,
        status: newStatus || undefined
      });
    }
  };

  if (!user || user.role !== "official") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Officials only.</p>
      </div>
    );
  }

  const complaintsByStatus = {
    submitted: filteredComplaints.filter(c => c.status === "submitted"),
    "in-progress": filteredComplaints.filter(c => c.status === "in-progress"),
    "under-review": filteredComplaints.filter(c => c.status === "under-review"),
    resolved: filteredComplaints.filter(c => c.status === "resolved"),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Official Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and resolve citizen complaints</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats?.byPriority.high || 0}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredComplaints.filter(c => {
                  const daysSinceCreated = Math.floor((new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  return daysSinceCreated > 3 && c.status !== "resolved";
                }).length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.byStatus["in-progress"] || 0}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredComplaints.filter(c => {
                  const today = new Date().toDateString();
                  return c.status === "resolved" && new Date(c.updatedAt).toDateString() === today;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">3.8</div>
              <div className="text-sm text-gray-600">Avg Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="road-transportation">Road & Transportation</SelectItem>
                  <SelectItem value="water-supply">Water Supply</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="street-lighting">Street Lighting</SelectItem>
                  <SelectItem value="parks-recreation">Parks & Recreation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Management Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {Object.entries(complaintsByStatus).map(([status, statusComplaints]) => (
                <div key={status} className={`rounded-lg ${status === 'submitted' ? 'bg-gray-50' : status === 'in-progress' ? 'bg-blue-50' : status === 'under-review' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                  <div className={`p-4 border-b ${status === 'submitted' ? 'border-gray-200 bg-gray-100' : status === 'in-progress' ? 'border-blue-200 bg-blue-100' : status === 'under-review' ? 'border-yellow-200 bg-yellow-100' : 'border-green-200 bg-green-100'}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {status === 'submitted' ? 'New' : status.replace('-', ' ')}
                      </h4>
                      <Badge variant="secondary">{statusComplaints.length}</Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {statusComplaints.map((complaint) => {
                      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysSinceCreated > 3 && complaint.status !== "resolved";
                      
                      return (
                        <Card 
                          key={complaint.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-medium text-gray-600">
                                {complaint.id.slice(0, 8)}
                              </span>
                              <div className="flex space-x-1">
                                <Badge 
                                  className={`text-xs ${getPriorityColor(complaint.priority)}`}
                                >
                                  {complaint.priority}
                                </Badge>
                                {isOverdue && (
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                            </div>
                            <h5 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                              {complaint.title}
                            </h5>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {complaint.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {daysSinceCreated === 0 ? 'Today' : `${daysSinceCreated}d ago`}
                              </span>
                              <Badge className={`text-xs ${getStatusColor(complaint.status)}`}>
                                {complaint.category}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {statusComplaints.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No complaints in this status</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complaint Detail Modal */}
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complaint Details</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h3>
                      <p className="text-sm text-gray-600">ID: {selectedComplaint.id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(selectedComplaint.priority)}>
                        {selectedComplaint.priority}
                      </Badge>
                      <Badge className={getStatusColor(selectedComplaint.status)}>
                        {selectedComplaint.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <p className="text-gray-600">{selectedComplaint.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-600">{selectedComplaint.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-600">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Updated:</span>
                      <p className="text-gray-600">{new Date(selectedComplaint.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600 mt-1">{selectedComplaint.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Add Update</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Update Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No status change</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="under-review">Under Review</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="message">Update Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Add a message about this complaint..."
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleUpdateComplaint}
                      disabled={!updateMessage && !newStatus || updateComplaintMutation.isPending || addUpdateMutation.isPending}
                      className="w-full"
                    >
                      {(updateComplaintMutation.isPending || addUpdateMutation.isPending) ? "Updating..." : "Update Complaint"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
