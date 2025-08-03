import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertComplaintSchema, type InsertComplaint } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface ComplaintFormProps {
  onSuccess?: () => void;
}

export default function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      priority: "medium",
    },
  });

  const createComplaintMutation = useMutation({
    mutationFn: async (data: InsertComplaint) => {
      const res = await apiRequest("POST", "/api/complaints", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({ title: "Complaint submitted successfully" });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to submit complaint", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: InsertComplaint) => {
    createComplaintMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="category">Complaint Category</Label>
        <Select
          value={form.watch("category")}
          onValueChange={(value) => form.setValue("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="road-transportation">Road & Transportation</SelectItem>
            <SelectItem value="water-supply">Water Supply</SelectItem>
            <SelectItem value="electricity">Electricity</SelectItem>
            <SelectItem value="sanitation">Sanitation</SelectItem>
            <SelectItem value="street-lighting">Street Lighting</SelectItem>
            <SelectItem value="parks-recreation">Parks & Recreation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.category && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="title">Complaint Title</Label>
        <Input
          id="title"
          {...form.register("title")}
          placeholder="Brief description of the issue"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...form.register("location")}
          placeholder="Enter location or address"
        />
        {form.formState.errors.location && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.location.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="priority">Priority Level</Label>
        <Select
          value={form.watch("priority")}
          onValueChange={(value: "low" | "medium" | "high") => form.setValue("priority", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.priority && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.priority.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Complaint Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Describe your complaint in detail..."
          rows={4}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={createComplaintMutation.isPending}
      >
        {createComplaintMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Complaint"
        )}
      </Button>
    </form>
  );
}
