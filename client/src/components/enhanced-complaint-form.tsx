import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertComplaintSchema, type InsertComplaint } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { VoiceRecorder } from "@/components/voice-recorder";
import { AISuggestions } from "@/components/ai-suggestions";
import { 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Camera, 
  Mic, 
  PenTool, 
  Sparkles,
  CheckCircle2,
  Clock,
  FileImage,
  Loader2,
  Brain
} from "lucide-react";

const formSchema = insertComplaintSchema;
type ComplaintFormData = z.infer<typeof formSchema>;

interface EnhancedComplaintFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EnhancedComplaintForm({ onSuccess, onCancel }: EnhancedComplaintFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formProgress, setFormProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("manual");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiClassification, setAiClassification] = useState<any>(null);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      location: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      
      if (data.aiSuggestions) {
        setAiClassification(data.aiSuggestions);
      }
      
      toast({
        title: "Complaint Submitted Successfully",
        description: "Your complaint has been registered and assigned for review.",
      });
      
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    },
  });

  // Calculate form completion progress
  useEffect(() => {
    const values = form.getValues();
    const filledFields = Object.values(values).filter(value => 
      value !== "" && value !== null && value !== undefined
    ).length;
    const totalFields = Object.keys(values).length;
    setFormProgress((filledFields / totalFields) * 100);
  }, [form.watch()]);

  const onSubmit = (data: ComplaintFormData) => {
    submitMutation.mutate(data);
  };

  const handleVoiceTranscription = (voiceData: any) => {
    form.setValue("title", voiceData.suggestedTitle);
    form.setValue("description", voiceData.extractedComplaint);
    form.setValue("priority", voiceData.urgency);
    
    if (voiceData.location) {
      form.setValue("location", voiceData.location);
    }
    
    toast({
      title: "Voice Processed Successfully",
      description: "Your voice complaint has been converted to text",
    });
    
    setActiveTab("manual");
  };

  const handleSuggestionApply = (suggestion: string) => {
    const currentDescription = form.getValues("description");
    form.setValue("description", currentDescription + " " + suggestion);
  };

  const categories = [
    { value: "water_supply", label: "Water Supply & Sewerage", icon: "💧" },
    { value: "roads", label: "Roads & Transportation", icon: "🛣️" },
    { value: "electricity", label: "Electricity", icon: "⚡" },
    { value: "sanitation", label: "Sanitation & Cleanliness", icon: "🧹" },
    { value: "street_lighting", label: "Street Lighting", icon: "💡" },
    { value: "parks", label: "Parks & Recreation", icon: "🌳" },
    { value: "administration", label: "Administration", icon: "🏛️" },
    { value: "online_services", label: "Online Services", icon: "💻" },
    { value: "noise_pollution", label: "Noise Pollution", icon: "🔊" },
    { value: "property_tax", label: "Property Tax", icon: "🏠" },
    { value: "other", label: "Other", icon: "📝" }
  ];

  const priorities = [
    { value: "low", label: "Low Priority", color: "bg-green-100 text-green-800", icon: "🟢" },
    { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
    { value: "high", label: "High Priority", color: "bg-orange-100 text-orange-800", icon: "🟠" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800", icon: "🔴" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="enhanced-complaint-form">
      {/* Progress Header */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <PenTool className="h-6 w-6 text-primary" />
                Submit a New Complaint
              </CardTitle>
              <CardDescription className="mt-1">
                Use voice recording or manual entry. Our AI will help optimize your submission.
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Form Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={formProgress} className="w-24" />
                <span className="text-sm font-medium">{Math.round(formProgress)}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Classification Display */}
      {aiClassification && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <Brain className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Category</div>
                <Badge variant="secondary">{aiClassification.category}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Priority</div>
                <Badge variant="outline">{aiClassification.priority}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div className="text-sm font-medium">{aiClassification.department}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="text-sm font-medium">{Math.round(aiClassification.confidence * 100)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice Recording
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice">
          <VoiceRecorder onTranscriptionComplete={handleVoiceTranscription} />
        </TabsContent>

        <TabsContent value="manual">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem data-testid="input-title">
                        <FormLabel>Complaint Title</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Brief description of the issue"
                            className="text-lg"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a clear, concise title for your complaint
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem data-testid="input-category">
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complaint category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem data-testid="input-priority">
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                <div className="flex items-center gap-2">
                                  <span>{priority.icon}</span>
                                  <span>{priority.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select urgency level based on the severity of the issue
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem data-testid="input-location">
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Specific address or landmark"
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide the exact location where the issue exists
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem data-testid="input-description">
                        <FormLabel>Detailed Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the issue in detail. Include what happened, when it started, and how it affects you..."
                            rows={6}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormDescription>
                          The more details you provide, the better we can help you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* AI Suggestions */}
                  {form.watch("description") && (
                    <AISuggestions 
                      partialText={form.watch("description")}
                      onSuggestionSelect={(suggestion) => {
                        form.setValue("description", suggestion);
                      }}
                      onApplySuggestion={handleSuggestionApply}
                    />
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending || formProgress < 60}
                  className="min-w-32"
                  data-testid="button-submit"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}