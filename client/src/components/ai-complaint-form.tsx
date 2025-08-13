import { useState, useEffect } from "react";
// Type for category fetched from backend
interface CategoryOption {
  name: string;
  id: string;
  slug: string;
}
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Check, Edit, Loader2, Plus, ShieldCheck, KeyRound, LocateFixed, Badge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

// Define the structure for the AI's analysis result
interface AIAnalysisResult {
  priority: "Low" | "Medium" | "High";
  isComplaintValid: boolean;
  suggestedCategory: string;
  estimatedResolutionDays: number;
}

export default function AIComplaintForm() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

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
  const [formStep, setFormStep] = useState<'initial' | 'preview' | 'submitted' | 'editing'>('initial');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [complaintId, setComplaintId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [editId, setEditId] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, watch, getValues, setValue, reset, formState: { errors } } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const formData = watch();

  // --- Backend Mutation for Creating a Complaint ---
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
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({ title: "Complaint Submitted!", description: `Your complaint ID is ${data.id}.` });
      setComplaintId(data.id);
      setFormStep('submitted');
    },
    onError: (error: Error) => {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    },
  });

  // --- AI ANALYSIS FUNCTION ---
  const handleAnalyzeComplaint: SubmitHandler<ComplaintFormData> = async (data) => {
    setIsAiLoading(true);
    // Check if categories have loaded
    if (categoriesLoading) {
      toast({ title: "Please wait", description: "Categories are still loading. Please try again in a moment.", variant: "default" });
      return;
    }

    if (categories.length === 0) {
      toast({ title: "No categories available", description: "Categories could not be loaded. Please refresh the page.", variant: "destructive" });
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("API Key available:", !!apiKey); // Debug log
    if (!apiKey) {
      toast({ title: "Configuration Error", description: "AI service is not properly configured. Please contact administrator.", variant: "destructive" });
      setIsAiLoading(false);
      return;
    }

    // Get available categories for the AI prompt
    const categoryNames = categories.map(cat => cat.name).join(' | ');

    const prompt = `Analyze the following civic complaint. Based on the title and description, determine if it is a valid, genuine complaint or just random characters/gibberish. Also determine the correct category, priority, and estimated resolution time.
      User's chosen category: "${data.category}"
      Complaint Title: "${data.title}"
      Complaint Description: "${data.description}"
      
      Available categories: ${categoryNames}
      
      Respond ONLY with a valid JSON object with the following structure:
      {
        "priority": "Low" | "Medium" | "High",
        "isComplaintValid": boolean,
        "suggestedCategory": string (must be one of the available categories),
        "estimatedResolutionDays": integer between 1 and 14
      }`;

    try {
      console.log("Making AI API request..."); // Debug log
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      console.log("AI API response status:", response.status); // Debug log
      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText); // Debug log
        throw new Error(`AI API request failed with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("AI API result:", result); // Debug log
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error("Invalid AI response format");
      }
      
      const aiResponseText = result.candidates[0].content.parts[0].text;
      console.log("AI response text:", aiResponseText); // Debug log
      
      const parsedAiResult: AIAnalysisResult = JSON.parse(aiResponseText.replace(/```json|```/g, '').trim());

      if (!parsedAiResult.isComplaintValid) {
        toast({
          title: "Invalid Complaint Details",
          description: "Please fill the form properly with a genuine issue. Your account may be suspended for misuse.",
          variant: "destructive",
        });
        setIsAiLoading(false);
        return;
      }
      
      setValue("category", parsedAiResult.suggestedCategory);
      setAiResult(parsedAiResult);
      setComplaintId(`CMP-${Date.now().toString().slice(-6)}`);
      setFormStep('preview');

    } catch (error) {
      console.error("AI Analysis Error:", error);
      
      // Provide more specific error messages
      let errorMessage = "Could not analyze the complaint. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("quota")) {
          errorMessage = "AI service quota exceeded. Please try again later.";
        } else if (error.message.includes("401") || error.message.includes("403")) {
          errorMessage = "AI service authentication failed. Please contact administrator.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes("JSON")) {
          errorMessage = "AI response format error. Please try again.";
        }
      }
      
      toast({ 
        title: "AI Analysis Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- FINAL SUBMISSION FUNCTION ---
  const handleFinalSubmit = () => {
    if (!password) {
      toast({ title: "Password Required", description: "Please create a password to secure your complaint.", variant: "destructive" });
      return;
    }
    
    const values = getValues();
    
    // Find the matching category slug from the backend data
    const selectedCategory = categories.find(cat => cat.name === values.category);
    const backendCategory = selectedCategory?.slug || values.category.toLowerCase().replace(/ /g, '-');
    
    const finalData = {
      ...values,
      category: backendCategory,
      priority: aiResult?.priority.toLowerCase() || 'medium',
      password: password,
    };
    createComplaintMutation.mutate(finalData);
  };

  const resetForm = () => {
    reset();
    setFormStep('initial');
    setAiResult(null);
    setComplaintId("");
    setPassword("");
  };

  // --- NEW: AUTO-DETECT LOCATION FUNCTION ---
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
          // Use OpenStreetMap's free reverse geocoding API
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
        if (error.code === error.PERMISSION_DENIED) {
          message = "You denied the request for Geolocation.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        }
        toast({ title: "Location Error", description: message, variant: "destructive" });
        setIsLocationLoading(false);
      }
    );
  };

  if (formStep === 'submitted') {
    return (
      <div className="text-center p-4 sm:p-8">
        <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">Complaint Submitted!</h3>
        <p className="mt-1 text-gray-600">Your Complaint ID is:</p>
        <p className="text-lg font-bold text-primary-600">{complaintId}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> File Another Complaint</Button>
          <Button variant="outline" onClick={() => setFormStep('editing')}>Edit Complaint</Button>
        </div>
      </div>
    );
  }

  if (formStep === 'editing') {
    return (
      <div className="p-2 space-y-4">
        <h3 className="text-xl font-semibold text-center">Edit Your Complaint</h3>
        <Input placeholder="Enter Complaint ID" value={editId} onChange={(e) => setEditId(e.target.value)} />
        <Input type="password" placeholder="Enter Password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setFormStep('submitted')}>Cancel</Button>
          <Button className="flex-1" onClick={() => {}}>
            <KeyRound className="mr-2 h-4 w-4" /> Fetch Complaint
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
            <p><strong>Complaint ID:</strong> {complaintId}</p>
            <p><strong>AI-Assigned Priority:</strong> <Badge>{aiResult?.priority}</Badge></p>
            <p><strong>Estimated Resolution:</strong> {aiResult?.estimatedResolutionDays} days</p>
          </div>
          
          <Card>
            <CardContent className="p-3 space-y-1">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Category:</strong> {formData.category}</p>
              <p><strong>Title:</strong> {formData.title}</p>
            </CardContent>
          </Card>

          <div>
            <label className="font-medium text-sm">Create Password to Edit Later</label>
            <Input 
              type="password" 
              placeholder="Enter a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => setFormStep('initial')}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
          <Button onClick={handleFinalSubmit} disabled={!password || createComplaintMutation.isPending} className="flex-1">
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

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger><SelectValue placeholder={categoriesLoading ? "Loading..." : "Select Complaint Category"} /></SelectTrigger>
            <SelectContent>
              {categoriesLoading && <div className="p-2 text-gray-500">Loading...</div>}
              {categoriesError && <div className="p-2 text-red-500">{categoriesError}</div>}
              {!categoriesLoading && !categoriesError && categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}

      <Input placeholder="Complaint Title (e.g., Pothole on MG Road)" {...register("title")} />
      {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
      
      {/* --- NEW: Location Input with Auto-Detect Button --- */}
      <div className="flex items-center gap-2">
        <Input placeholder="Location (e.g., Near Palasia Square)" {...register("location")} className="flex-grow" />
        <Button type="button" variant="outline" size="icon" onClick={handleDetectLocation} disabled={isLocationLoading}>
          {isLocationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </Button>
      </div>
      {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
      
      <Textarea placeholder="Describe your complaint in detail..." {...register("description")} rows={3} />
      {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
      
      <Button type="submit" className="w-full" disabled={isAiLoading}>
        {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Complaint"}
      </Button>
    </form>
  );
}
