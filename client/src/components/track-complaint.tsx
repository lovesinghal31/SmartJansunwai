import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// --- FIX: Corrected the import path and types ---
import { Complaint, ComplaintStatus, COMPLAINT_STATUSES } from "../../../shared/schema"; // Adjust this relative path as needed
import ComplaintCard from "./complaint-card";
import { Loader2, Search, Edit, KeyRound } from "lucide-react";

const editComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  location: z.string().min(5, "Location is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});
type EditFormData = z.infer<typeof editComplaintSchema>;

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [password, setPassword] = useState("");
  const [fetchedComplaint, setFetchedComplaint] = useState<Complaint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const [updateMessage, setUpdateMessage] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus | "">("");

  const { toast } = useToast();
  const { accessToken } = useAuth();

  const { register, handleSubmit, reset } = useForm<EditFormData>({
    resolver: zodResolver(editComplaintSchema),
  });

  const fetchComplaintMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error("Complaint ID cannot be empty.");
      const res = await apiRequest("GET", `/api/complaints/${id}`, undefined, accessToken);
      if (res.status === 404) throw new Error("Complaint not found.");
      if (!res.ok) throw new Error("An error occurred while fetching the complaint.");
      return res.json();
    },
    onSuccess: (data: Complaint) => {
      setFetchedComplaint(data);
      reset(data); 
      setPassword(""); 
    },
    onError: (error: Error) => {
      setFetchedComplaint(null);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateComplaintMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      const res = await apiRequest("PUT", `/api/complaints/${fetchedComplaint?.id}/edit`, { ...data, password }, accessToken);
      if (res.status === 403) throw new Error("Incorrect password.");
      if (!res.ok) throw new Error("Update failed. Please try again.");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Your complaint has been updated." });
      setIsEditing(false);
      fetchComplaintMutation.mutate(fetchedComplaint!.id);
    },
    onError: (error: Error) => toast({ title: "Update Failed", description: error.message, variant: "destructive" }),
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const payload = { 
        message: updateMessage, 
        password: password,
        status: newStatus
      };
      const res = await apiRequest("POST", `/api/complaints/${fetchedComplaint?.id}/updates`, payload, accessToken);
      if (res.status === 403) throw new Error("Incorrect password.");
      if (!res.ok) throw new Error("Status update failed.");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Status update has been added." });
      setIsUpdatingStatus(false);
      setUpdateMessage("");
      setNewStatus("");
      fetchComplaintMutation.mutate(fetchedComplaint!.id);
    },
    onError: (error: Error) => toast({ title: "Update Failed", description: error.message, variant: "destructive" }),
  });

  const handleFetch = () => {
    fetchComplaintMutation.mutate(complaintId);
  };

  const onEditSubmit: SubmitHandler<EditFormData> = (data) => {
    if (!password) {
        toast({ title: "Password Required", description: "Please enter the password to update.", variant: "destructive" });
        return;
    }
    updateComplaintMutation.mutate(data);
  };

  const handleStatusUpdate = () => {
    if (!password || !newStatus) {
        toast({ title: "Fields Required", description: "Please select a status and enter the password.", variant: "destructive" });
        return;
    }
    updateStatusMutation.mutate();
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Track & Manage Your Complaint</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <Input 
            placeholder="Enter your Complaint ID to view status" 
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          />
          <Button onClick={handleFetch} disabled={!complaintId || fetchComplaintMutation.isPending}>
            {fetchComplaintMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {fetchedComplaint && (
          <div className="space-y-6">
            <ComplaintCard complaint={fetchedComplaint} />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="w-full" onClick={() => setIsUpdatingStatus(true)}>Update Status</Button>
              <Button className="w-full" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Complaint Info
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Complaint</DialogTitle>
              <DialogDescription>Make changes and enter your password to confirm.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
              <Input {...register("title")} placeholder="Complaint Title"/>
              <Input {...register("location")} placeholder="Location"/>
              <Textarea {...register("description")} placeholder="Complaint Description"/>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="password" placeholder="Enter Password to Update" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10"/>
              </div>
              <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={updateComplaintMutation.isPending || !password}>
                    {updateComplaintMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Complaint"}
                  </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isUpdatingStatus} onOpenChange={setIsUpdatingStatus}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Status Update</DialogTitle>
                    <DialogDescription>Select a new status, provide an update, and enter your password.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <Select onValueChange={(value: ComplaintStatus) => setNewStatus(value)} value={newStatus}>
                        <SelectTrigger><SelectValue placeholder="Select new status..." /></SelectTrigger>
                        <SelectContent>
                            {/* --- FIX: Dynamically generate items from the imported array --- */}
                            {COMPLAINT_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Textarea placeholder="Add a comment about the update (optional)..." value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} />
                     <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="Enter Password to Submit" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsUpdatingStatus(false)}>Cancel</Button>
                    <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending || !password || !newStatus}>
                        {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
