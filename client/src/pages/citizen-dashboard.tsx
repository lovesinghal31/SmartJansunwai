import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ComplaintCard from "@/components/complaint-card";
import ComplaintForm from "@/components/complaint-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import type { Complaint } from "@shared/schema";

  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const lastNotificationId = useRef<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const { data: complaints = [], isLoading, refetch } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  // Poll notifications every 4 seconds
  useEffect(() => {
    if (!user) return;
    let interval: NodeJS.Timeout;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data);
        if (data.length > 0) {
          const latest = data[0];
          if (lastNotificationId.current !== latest.id) {
            // Show toast for new notification
            toast({
              title: latest.title || "New Notification",
              description: latest.message,
              variant: latest.type === "error" ? "destructive" : "default",
            });
            lastNotificationId.current = latest.id;
          }
        }
      } catch (e) {}
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [user, toast]);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = complaints.reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalComplaints = complaints.length;
  const resolvedComplaints = statusCounts.resolved || 0;
  const inProgressComplaints = statusCounts["in-progress"] || 0;
  const avgResolutionTime = resolvedComplaints > 0 ? "4.2 days" : "N/A";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      case "under-review": return "bg-purple-100 text-purple-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!user || user.role !== "citizen") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Citizens only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-gray-600 mt-1">Track and manage your submitted complaints</p>
          </div>
          <Dialog open={showComplaintForm} onOpenChange={setShowComplaintForm}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit New Complaint</DialogTitle>
              </DialogHeader>
              <ComplaintForm 
                onSuccess={() => {
                  setShowComplaintForm(false);
                  refetch();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{totalComplaints}</div>
              <div className="text-sm text-blue-700">Total Complaints</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{inProgressComplaints}</div>
              <div className="text-sm text-yellow-700">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{resolvedComplaints}</div>
              <div className="text-sm text-green-700">Resolved</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600">{avgResolutionTime}</div>
              <div className="text-sm text-gray-700">Avg Resolution</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                {complaints.length === 0 
                  ? "You haven't submitted any complaints yet." 
                  : "No complaints match your search criteria."
                }
              </p>
              {complaints.length === 0 && (
                <Button onClick={() => setShowComplaintForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Your First Complaint
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
