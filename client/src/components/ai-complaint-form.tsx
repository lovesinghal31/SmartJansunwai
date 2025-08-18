import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Check, Edit, Loader2, Plus, ShieldCheck, KeyRound, LocateFixed, Badge, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Define the structure for the form data
const complaintSchema = z.object({
  name: z.string().min(3, "Name is required"),
  contact: z.string().min(10, "A valid contact number is required"),
  category: z.string({ required_error: "Please select a category." }).min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  location: z.string().min(5, "Location is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

// AI analysis result structure
interface AIAnalysisResult {
  priority: "Low" | "Medium" | "High";
  isComplaintValid: boolean;
  reasoning: string; 
  suggestedCategory: string;
  estimatedResolutionDays: number;
}

const getPriorityBadgeClass = (priority: "Low" | "Medium" | "High") => {
  switch (priority) {
    case "High": return "bg-red-500 hover:bg-red-600 text-white";
    case "Medium": return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "Low": default: return "bg-blue-500 hover:bg-blue-600 text-white";
  }
};

export default function AIComplaintForm() {
  const [formStep, setFormStep] = useState<'initial' | 'preview' | 'submitted'>('initial');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [complaintId, setComplaintId] = useState<string>("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { register, handleSubmit, control, watch, getValues, setValue, reset, formState: { errors } } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const formData = watch();

  const createComplaintMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/complaints", data, accessToken);
      if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "An unknown error occurred" }));
          throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      // --- FIX: Invalidate both the main complaints list AND the map data ---
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/map"] });

      toast({ title: "Complaint Submitted!", description: `Your complaint ID is ${data.id}.` });
      setComplaintId(data.id);
      setFormStep('submitted');
    },
    onError: (error: Error) => toast({ title: "Submission Failed", description: error.message, variant: "destructive" }),
  });

  const handleAnalyzeComplaint: SubmitHandler<ComplaintFormData> = async (data) => {
    setIsAiLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "AI analysis failed");
      }
      
      const parsedAiResult: AIAnalysisResult = await response.json();

      if (!parsedAiResult.isComplaintValid) {
        toast({
          title: "Invalid Complaint",
          description: parsedAiResult.reasoning || "The AI determined this is not a valid complaint.",
          variant: "destructive",
        });
        return;
      }
      
      setValue("category", parsedAiResult.suggestedCategory);
      setAiResult(parsedAiResult);
      setComplaintId(`CMP-${Date.now().toString().slice(-6)}`);
      setFormStep('preview');

    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      toast({ title: "AI Analysis Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!password || password.length < 6) {
        toast({ title: "Password Required", description: "Please create a password of at least 6 characters.", variant: "destructive" });
        return;
    }
    const values = getValues();
    const categoryMap: Record<string, string> = {
        "Roads & Transportation": "road-transportation", "Water Supply": "water-supply",
        "Electricity": "electricity", "Sanitation": "sanitation",
        "Street Lighting": "street-lighting", "Parks & Recreation": "parks-recreation",
    };
    const backendCategory = categoryMap[values.category] || values.category.toLowerCase().replace(/ /g, '-');
    const priority = (aiResult?.priority || 'medium').toLowerCase();
    const finalData = { ...values, category: backendCategory, priority: priority, password: password };
    createComplaintMutation.mutate(finalData);
  };

  const handleDetectLocation = () => {
    setIsLocationLoading(true);
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Your browser does not support location detection.", variant: "destructive" });
      setIsLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setValue("location", data.display_name, { shouldValidate: true });
            toast({ title: "Location Detected!", description: "Your current address has been filled in." });
          } else {
            throw new Error("Could not find address for coordinates.");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast({ title: "Could Not Find Address", description: "We found your location but could not determine the address.", variant: "destructive" });
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        let message = "An unknown error occurred.";
        if (error.code === error.PERMISSION_DENIED) message = "You denied the request for Geolocation.";
        else if (error.code === error.POSITION_UNAVAILABLE) message = "Location information is unavailable.";
        toast({ title: "Location Error", description: message, variant: "destructive" });
        setIsLocationLoading(false);
      }
    );
  };

  const resetForm = () => {
    reset();
    setFormStep('initial');
    setAiResult(null);
    setComplaintId("");
    setPassword("");
  };

  if (formStep === 'submitted') {
    return (
      <div className="text-center p-4 sm:p-8">
        <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">Complaint Submitted!</h3>
        <p className="mt-1 text-gray-600">Your Complaint ID is:</p>
        <p className="text-lg font-bold text-primary-600 bg-gray-100 py-2 px-4 rounded-md inline-block">{complaintId}</p>
        <p className="mt-4 text-sm text-gray-500">You can now track this complaint. Remember your password to make changes.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> File Another Complaint</Button>
          <Button variant="outline" onClick={() => navigate('/track-complaint')}>
            <Search className="mr-2 h-4 w-4" /> Track Your Complaint
          </Button>
        </div>
      </div>
    );
  }

  if (formStep === 'preview') {
    return (
      <div className="p-2">
        <h3 className="text-xl font-semibold text-center mb-4">Complaint Preview & Confirmation</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">AI Analysis Complete</h4>
            <div className="flex justify-between items-center mt-2">
              <span><strong>AI-Assigned Priority:</strong></span>
              <Badge className={getPriorityBadgeClass(aiResult?.priority!)}>{aiResult?.priority}</Badge>
            </div>
            <p><strong>Estimated Resolution:</strong> {aiResult?.estimatedResolutionDays} days</p>
          </div>
          <Card>
             <CardContent className="p-4 space-y-2">
              <p><strong>Name:</strong> {formData.name}</p><p><strong>Contact:</strong> {formData.contact}</p>
              <p><strong>Location:</strong> {formData.location}</p><p><strong>AI-Corrected Category:</strong> {formData.category}</p>
              <p><strong>Title:</strong> {formData.title}</p>
              <div className="pt-1"><p className="font-semibold">Description:</p><p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded-md border mt-1">{formData.description}</p></div>
            </CardContent>
          </Card>
          <div className="pt-2">
            <label className="font-medium text-sm text-gray-800">Create a Password to Edit Later</label>
            <p className="text-xs text-gray-500 mb-1">Minimum 6 characters. You will need this to make any changes.</p>
            <Input type="password" placeholder="Enter a secure password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => setFormStep('initial')}><Edit className="mr-2 h-4 w-4" /> Edit Details</Button>
          <Button onClick={handleFinalSubmit} disabled={createComplaintMutation.isPending} className="flex-1">
            {createComplaintMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Final Submit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleAnalyzeComplaint)} className="space-y-3">
        <Input placeholder="Your Name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        <Input placeholder="Contact Number" {...register("contact")} />
        {errors.contact && <p className="text-red-500 text-xs">{errors.contact.message}</p>}
        <Controller name="category" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select Complaint Category" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Water Supply">Water Supply</SelectItem><SelectItem value="Roads & Transportation">Roads & Transportation</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem><SelectItem value="Sanitation">Sanitation</SelectItem>
                    <SelectItem value="Street Lighting">Street Lighting</SelectItem><SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                </SelectContent>
            </Select>
        )} />
        {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
        <Input placeholder="Complaint Title (e.g., Pothole on MG Road)" {...register("title")} />
        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
        <div className="flex items-center gap-2">
            <Input placeholder="Location (e.g., Near Palasia Square, Indore)" {...register("location")} className="flex-grow" />
            <Button type="button" variant="outline" size="icon" onClick={handleDetectLocation} disabled={isLocationLoading}>
                {isLocationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            </Button>
        </div>
        {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
        <Textarea placeholder="Describe your complaint in detail..." {...register("description")} rows={3} />
        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
        <Button type="submit" className="w-full" disabled={isAiLoading}>
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4"/>}
            Analyze Complaint
        </Button>
    </form>
  );
}
