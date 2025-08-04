import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertServiceFeedbackSchema, type InsertServiceFeedback } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

const formSchema = insertServiceFeedbackSchema.extend({
  issues: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
});

type ServiceFeedbackFormData = z.infer<typeof formSchema>;

interface ServiceFeedbackFormProps {
  onSuccess?: () => void;
}

export function ServiceFeedbackForm({ onSuccess }: ServiceFeedbackFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<ServiceFeedbackFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceCategory: "overall",
      overallRating: 3,
      serviceQualityRating: 3,
      responseTimeRating: 3,
      staffBehaviorRating: 3,
      accessibilityRating: 3,
      wouldRecommend: true,
      serviceUsageFrequency: "monthly",
      contactMethod: "online",
      isAnonymous: false,
      issues: [],
      improvements: [],
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ServiceFeedbackFormData) => {
      const response = await fetch("/api/service-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-feedback"] });
      toast({
        title: t("success.submitted"),
        description: t("serviceFeedback.thankYou"),
      });
      form.reset();
      setCurrentStep(1);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: t("errors.generic"),
        description: error.message || t("errors.serverError"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFeedbackFormData) => {
    submitMutation.mutate(data);
  };

  const renderStarRating = (
    field: any,
    label: string,
    description?: string
  ) => (
    <FormItem data-testid={`rating-${field.name}`}>
      <FormLabel>{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      <FormControl>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => field.onChange(rating)}
              className={`p-1 transition-colors ${
                rating <= field.value
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-gray-300 hover:text-gray-400"
              }`}
              data-testid={`star-${rating}`}
            >
              <Star className="h-6 w-6 fill-current" />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {field.value}/5
          </span>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );

  const commonIssues = [
    "long_wait_times",
    "poor_service_quality", 
    "unhelpful_staff",
    "unclear_process",
    "system_downtime",
    "lack_of_information"
  ];

  const improvementAreas = [
    "faster_response",
    "better_communication",
    "staff_training",
    "system_upgrade",
    "clearer_guidelines",
    "more_accessibility"
  ];

  const categories = [
    "overall",
    "water_supply", 
    "roads",
    "electricity",
    "sanitation",
    "street_lighting",
    "parks",
    "administration",
    "online_services"
  ];

  const frequencies = ["daily", "weekly", "monthly", "rarely", "first_time"];
  const contactMethods = ["online", "phone", "in_person", "email", "mobile_app"];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle data-testid="form-title">
          {t("serviceFeedback.title")}
        </CardTitle>
        <CardDescription>
          {t("serviceFeedback.subtitle")}
        </CardDescription>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  {t("serviceFeedback.generalServiceFeedback")}
                </h3>
                
                <FormField
                  control={form.control}
                  name="serviceCategory"
                  render={({ field }) => (
                    <FormItem data-testid="input-serviceCategory">
                      <FormLabel>{t("serviceFeedback.serviceCategory")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {t(`serviceFeedback.categories.${category}`)}
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
                  name="overallRating"
                  render={({ field }) =>
                    renderStarRating(field, t("serviceFeedback.overallRating"))
                  }
                />

                <FormField
                  control={form.control}
                  name="serviceQualityRating"
                  render={({ field }) =>
                    renderStarRating(field, t("serviceFeedback.serviceQualityRating"))
                  }
                />

                <FormField
                  control={form.control}
                  name="responseTimeRating"
                  render={({ field }) =>
                    renderStarRating(field, t("serviceFeedback.responseTimeRating"))
                  }
                />

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep(2)}
                    data-testid="button-next-step"
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Detailed Feedback</h3>
                
                <FormField
                  control={form.control}
                  name="staffBehaviorRating"
                  render={({ field }) =>
                    renderStarRating(field, t("serviceFeedback.staffBehaviorRating"))
                  }
                />

                <FormField
                  control={form.control}
                  name="accessibilityRating"
                  render={({ field }) =>
                    renderStarRating(field, t("serviceFeedback.accessibilityRating"))
                  }
                />

                <FormField
                  control={form.control}
                  name="wouldRecommend"
                  render={({ field }) => (
                    <FormItem data-testid="input-wouldRecommend">
                      <FormLabel>{t("serviceFeedback.wouldRecommend")}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                          className="flex items-center gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="recommend-yes" />
                            <Label htmlFor="recommend-yes" className="flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4" />
                              {t("common.yes")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="recommend-no" />
                            <Label htmlFor="recommend-no" className="flex items-center gap-2">
                              <ThumbsDown className="h-4 w-4" />
                              {t("common.no")}
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceUsageFrequency"
                  render={({ field }) => (
                    <FormItem data-testid="input-serviceUsageFrequency">
                      <FormLabel>{t("serviceFeedback.serviceUsageFrequency")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frequencies.map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {t(`serviceFeedback.frequencies.${frequency}`)}
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
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem data-testid="input-contactMethod">
                      <FormLabel>{t("serviceFeedback.contactMethod")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {t(`serviceFeedback.contactMethods.${method}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    data-testid="button-previous-step"
                  >
                    {t("common.previous")}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep(3)}
                    data-testid="button-next-step"
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Additional Details</h3>
                
                <FormField
                  control={form.control}
                  name="specificDepartment"
                  render={({ field }) => (
                    <FormItem data-testid="input-specificDepartment">
                      <FormLabel>{t("serviceFeedback.specificDepartment")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issues"
                  render={() => (
                    <FormItem data-testid="input-issues">
                      <FormLabel>{t("serviceFeedback.issues")}</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {commonIssues.map((issue) => (
                          <FormField
                            key={issue}
                            control={form.control}
                            name="issues"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(issue)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), issue])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== issue)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {t(`serviceFeedback.commonIssues.${issue}`)}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="improvements"
                  render={() => (
                    <FormItem data-testid="input-improvements">
                      <FormLabel>{t("serviceFeedback.improvements")}</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {improvementAreas.map((improvement) => (
                          <FormField
                            key={improvement}
                            control={form.control}
                            name="improvements"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(improvement)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), improvement])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== improvement)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {t(`serviceFeedback.improvementAreas.${improvement}`)}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="suggestions"
                  render={({ field }) => (
                    <FormItem data-testid="input-suggestions">
                      <FormLabel>{t("serviceFeedback.suggestions")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("serviceFeedback.suggestions")}
                          value={field.value || ""}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0" data-testid="input-isAnonymous">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>{t("serviceFeedback.isAnonymous")}</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                    data-testid="button-previous-step"
                  >
                    {t("common.previous")}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? t("common.loading") : t("serviceFeedback.submitFeedback")}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}