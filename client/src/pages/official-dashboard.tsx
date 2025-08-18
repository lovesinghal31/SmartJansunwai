import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Filter, Download, BarChart3, Clock, AlertTriangle, Loader2 } from "lucide-react";
import type { Complaint } from "@shared/schema";
import { useNavigate } from "react-router-dom";

// Define the structure for the stats data from the API
interface ComplaintStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
  resolvedToday: number;
  avgResolutionDays: number;
}

// Type for category fetched from backend
interface CategoryOption {
  name: string;
  id: string;
  slug: string;
}

// Type for status options from backend
interface StatusOption {
  value: string;
  label: string;
  displayLabel: string;
}

export default function OfficialDashboard() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        setCategoriesError(err.message || "Unknown error");
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

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
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: complaints = [], isLoading: complaintsLoading, refetch, error: complaintsError } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/complaints", undefined, accessToken);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
    enabled: !!user && (user.role === "official" || user.role === "admin"),
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<ComplaintStats>({
    queryKey: ["/api/analytics/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/stats", undefined, accessToken);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!user && (user.role === "official" || user.role === "admin"),
    placeholderData: { total: 0, byStatus: {}, byCategory: {}, byPriority: {}, overdue: 0, resolvedToday: 0, avgResolutionDays: 0 }
  });

  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { status: string } }) => {
      const res = await apiRequest("PATCH", `/api/complaints/${id}`, updates, accessToken);
      if (!res.ok) throw new Error("Failed to update complaint status");
      return res.json();
    },
    // --- FIX: Invalidate both queries to ensure all data refreshes ---
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({ title: "Complaint updated successfully" });
    },
    onError: (error: Error) => toast({ title: "Failed to update complaint", description: error.message, variant: "destructive" }),
  });

  const addUpdateMutation = useMutation({
    mutationFn: async ({ complaintId, message, status }: { complaintId: string; message: string; status?: string }) => {
      const res = await apiRequest("POST", `/api/complaints/${complaintId}/updates`, { message, status }, accessToken);
      if (!res.ok) throw new Error("Failed to add update message");
      return res.json();
    },
    // --- FIX: Invalidate both queries to ensure all data refreshes ---
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({ title: "Update added successfully" });
    },
    onError: (error: Error) => toast({ title: "Failed to add update", description: error.message, variant: "destructive" }),
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

    if (newStatus && newStatus !== "none") {
      updateComplaintMutation.mutate({ id: selectedComplaint.id, updates: { status: newStatus } });
    }
    if (updateMessage) {
      addUpdateMutation.mutate({ 
        complaintId: selectedComplaint.id, 
        message: updateMessage,
        status: newStatus && newStatus !== "none" ? newStatus : undefined
      });
    }

    setSelectedComplaint(null);
    setUpdateMessage("");
    setNewStatus("");
  };

  if (!user || (user.role !== "official" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Officials and Admins only.</p>
      </div>
    );
  }

  const KANBAN_COLUMNS = ["submitted", "in-progress", "under-review", "resolved"];
  const complaintsByStatus = KANBAN_COLUMNS.reduce((acc, status) => {
      acc[status] = filteredComplaints.filter(c => c.status === status);
      return acc;
  }, {} as Record<string, Complaint[]>);


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Official Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and resolve citizen complaints</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={() => refetch()}>Refresh Data</Button>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button onClick={() => navigate('/analytics')}><BarChart3 className="mr-2 h-4 w-4" />Analytics</Button>
          </div>
        </div>

        {/* --- FIX: Re-added the debug/testing info block --- */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <div className="text-sm space-y-1">
              <p>User: {user?.username} (Role: {user?.role})</p>
              <p>Complaints Loading: {complaintsLoading ? "Yes" : "No"}</p>
              <p>Complaints Count: {complaints.length}</p>
              <p>Stats Loading: {statsLoading ? "Yes" : "No"}</p>
              <p>Stats Count: {stats?.total ?? 'N/A'}</p>
              {complaintsError && <p className="text-red-600">Complaints Error: {complaintsError.message}</p>}
              {statsError && <p className="text-red-600">Stats Error: {statsError.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-gray-900">{statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : stats?.total ?? 0}</div><div className="text-sm text-gray-600">Total Active</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-red-600">{statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : stats?.byPriority?.high ?? 0}</div><div className="text-sm text-gray-600">High Priority</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : stats?.overdue ?? 0}</div><div className="text-sm text-gray-600">Overdue</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : stats?.byStatus?.["in-progress"] ?? 0}</div><div className="text-sm text-gray-600">In Progress</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : stats?.resolvedToday ?? 0}</div><div className="text-sm text-gray-600">Resolved Today</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{statsLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : (stats?.avgResolutionDays ?? 0).toFixed(1)}</div><div className="text-sm text-gray-600">Avg Days</div></CardContent></Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search complaints..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "All Categories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesLoading && <div className="p-2 text-gray-500">Loading...</div>}
                  {categoriesError && <div className="p-2 text-red-500">{categoriesError}</div>}
                  {!categoriesLoading && !categoriesError && categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder={statusLoading ? "Loading..." : "All Status"} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Complaint Management Board</CardTitle></CardHeader>
          <CardContent>
            {complaintsLoading ? (
                <div className="text-center py-12"><Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500"/></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {KANBAN_COLUMNS.map((status) => (
                    <div key={status} className={`rounded-lg ${status === 'submitted' ? 'bg-gray-50' : status === 'in-progress' ? 'bg-blue-50' : status === 'under-review' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <div className={`p-4 border-b ${status === 'submitted' ? 'border-gray-200 bg-gray-100' : status === 'in-progress' ? 'border-blue-200 bg-blue-100' : status === 'under-review' ? 'border-yellow-200 bg-yellow-100' : 'border-green-200 bg-green-100'}`}>
                        <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 capitalize">{status === 'submitted' ? 'New' : status.replace('-', ' ')}</h4>
                        <Badge variant="secondary">{complaintsByStatus[status].length}</Badge>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {complaintsByStatus[status].map((complaint) => {
                        const daysSinceCreated = Math.floor((new Date().getTime() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysSinceCreated > 3 && complaint.status !== "resolved";
                        return (
                            <Card key={complaint.id} className="cursor-pointer hover:shadow-md transition-shadow bg-white" onClick={() => setSelectedComplaint(complaint)}>
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">{complaint.id.slice(0, 8)}</span>
                                <div className="flex space-x-1">
                                    <Badge className={`text-xs ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</Badge>
                                    {isOverdue && (<AlertTriangle className="h-3 w-3 text-red-500" />)}
                                </div>
                                </div>
                                <h5 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{complaint.title}</h5>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{daysSinceCreated === 0 ? 'Today' : `${daysSinceCreated}d ago`}</span>
                                <Badge className={`text-xs ${getStatusColor(complaint.status)}`}>{complaint.category}</Badge>
                                </div>
                            </CardContent>
                            </Card>
                        );
                        })}
                        {complaintsByStatus[status].length === 0 && (<div className="text-center py-8 text-gray-500"><p className="text-sm">No complaints in this status</p></div>)}
                    </div>
                    </div>
                ))}
                </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Complaint Details</DialogTitle></DialogHeader>
            {selectedComplaint && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h3>
                      <p className="text-sm text-gray-600">ID: {selectedComplaint.id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(selectedComplaint.priority)}>{selectedComplaint.priority}</Badge>
                      <Badge className={getStatusColor(selectedComplaint.status)}>{selectedComplaint.status}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className="font-medium text-gray-700">Category:</span><p className="text-gray-600">{selectedComplaint.category}</p></div>
                    <div><span className="font-medium text-gray-700">Location:</span><p className="text-gray-600">{selectedComplaint.location}</p></div>
                    <div><span className="font-medium text-gray-700">Created:</span><p className="text-gray-600">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p></div>
                    <div><span className="font-medium text-gray-700">Last Updated:</span><p className="text-gray-600">{new Date(selectedComplaint.updatedAt).toLocaleDateString()}</p></div>
                  </div>
                  <div className="mb-4"><span className="font-medium text-gray-700">Description:</span><p className="text-gray-600 mt-1">{selectedComplaint.description}</p></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Add Update</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Update Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger><SelectValue placeholder="Select new status (optional)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No status change</SelectItem>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>{status.displayLabel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="message">Update Message</Label>
                      <Textarea id="message" placeholder="Add a message about this complaint..." value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} rows={3} />
                    </div>
                    <Button onClick={handleUpdateComplaint} disabled={(!updateMessage && (newStatus === "" || newStatus === "none")) || updateComplaintMutation.isPending || addUpdateMutation.isPending} className="w-full">
                      {(updateComplaintMutation.isPending || addUpdateMutation.isPending) ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Complaint"}
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
