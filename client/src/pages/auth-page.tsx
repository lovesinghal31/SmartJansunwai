import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Landmark, Shield, Users, TrendingUp, KeyRound, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

// --- Mock Aadhaar Database ---
const aadhaarDatabase: Record<string, { name: string, dob: string, location: string }> = {
  "123456789012": { name: "Aditya Sharma", dob: "1990-05-15", location: "Vijay Nagar, Indore" },
  "210987654321": { name: "Priya Verma", dob: "1988-11-22", location: "Palasia, Indore" },
  "112233445566": { name: "Rohan Mehta", dob: "1995-02-10", location: "Rau, Indore" },
};

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  contact: z.string().optional(),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

interface Department {
    id: string;
    name: string;
    slug: string;
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationStep, setVerificationStep] = useState<"aadhaar" | "otp" | "verified">("aadhaar");
  const [isVerifying, setIsVerifying] = useState(false);

  // --- NEW: Separate mutation for official account requests ---
  const requestOfficialAccountMutation = useMutation({
    mutationFn: async (data: Omit<RegisterData, 'confirmPassword'>) => {
      // This points to the new backend endpoint for official requests
      const res = await apiRequest("POST", "/api/auth/register/official-request", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Request failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your official account request has been sent for admin approval.",
      });
      setActiveTab("login");
      registerForm.reset();
    },
    onError: (error: any) => {
        toast({
            title: "Request Failed",
            description: error.message || "Could not submit your request.",
            variant: "destructive",
        });
    }
  });

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setDepartmentsLoading(true);
        const res = await apiRequest("GET", "/api/categories");
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(data);
      } catch (err: any) {
        toast({ title: "Error", description: "Could not load departments.", variant: "destructive" });
      } finally {
        setDepartmentsLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "citizen",
      department: "",
      contact: "",
      location: "",
    },
  });

  const role = registerForm.watch("role");

  useEffect(() => {
    setVerificationStep("aadhaar");
    setAadhaarNumber("");
    setOtp("");
    registerForm.reset();
    registerForm.setValue("role", role);
  }, [role, registerForm]);


  if (user) {
    setTimeout(() => navigate("/"), 0);
    return null;
  }

  const handleAadhaarSubmit = () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      toast({ title: "Invalid Aadhaar", description: "Please enter a valid 12-digit Aadhaar number.", variant: "destructive" });
      return;
    }
    if (!aadhaarDatabase[aadhaarNumber]) {
      toast({ title: "Aadhaar Not Found", description: "This Aadhaar number is not in our test database.", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setVerificationStep("otp");
      setIsVerifying(false);
      toast({ title: "OTP Sent", description: "An OTP (123456) has been sent to your registered mobile number." });
    }, 1000);
  };

  const handleOtpSubmit = () => {
    if (otp !== "123456") {
      toast({ title: "Invalid OTP", description: "The OTP you entered is incorrect.", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      const userData = aadhaarDatabase[aadhaarNumber];
      registerForm.setValue("username", userData.name.split(" ")[0].toLowerCase());
      registerForm.setValue("location", userData.location);
      setVerificationStep("verified");
      setIsVerifying(false);
      toast({ title: "Aadhaar Verified!", description: "Your details have been pre-filled." });
    }, 1000);
  };

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate("/"),
    });
  };

  // --- FIX: This function now correctly handles the logic for both roles ---
  const onRegister = (data: RegisterData) => {
    const { confirmPassword, ...registerData } = data;
    
    if (data.role === 'official') {
      // If the user is an official, send their registration for approval
      requestOfficialAccountMutation.mutate(registerData);
    } else {
      // If the user is a citizen, create their account directly
      registerMutation.mutate(registerData, {
        onSuccess: () => navigate("/"),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="w-12 h-12 bg-primary-800 rounded-full flex items-center justify-center">
              <img src="/logo.png" alt="Samadhan+ Logo" className="p-1"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Samadhan+</h1>
              <p className="text-sm text-gray-600">Indore Smart City</p>
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Smart Grievance Redressal Platform
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of citizens and officials working together to build a better Indore through efficient complaint management and resolution.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Shield className="mx-auto mb-2 text-primary-600" size={24} />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Platform Availability</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="mx-auto mb-2 text-green-600" size={24} />
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <TrendingUp className="mx-auto mb-2 text-blue-600" size={24} />
              <div className="text-2xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Landmark className="mx-auto mb-2 text-purple-600" size={24} />
              <div className="text-2xl font-bold text-gray-900">AI</div>
              <div className="text-sm text-gray-600">Powered Platform</div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Samadhan+</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input id="login-username" {...loginForm.register("username")} placeholder="Enter your username" />
                    {loginForm.formState.errors.username && <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.username.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" {...loginForm.register("password")} placeholder="Enter your password" />
                    {loginForm.formState.errors.password && <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="register-role">I am a...</Label>
                    <Select value={role} onValueChange={(value: "citizen" | "official") => registerForm.setValue("role", value)}>
                      <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="official">Government Official</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {role === 'citizen' && (
                    <>
                      {verificationStep !== 'verified' && (
                        <Card className="bg-gray-50 p-4">
                          <CardTitle className="text-base mb-2">Aadhaar Verification</CardTitle>
                          {verificationStep === 'aadhaar' && (
                            <div className="space-y-2">
                              <Label htmlFor="aadhaar">12-Digit Aadhaar Number</Label>
                              <Input id="aadhaar" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} placeholder="xxxx xxxx xxxx" />
                              <Button type="button" className="w-full" onClick={handleAadhaarSubmit} disabled={isVerifying}>
                                {isVerifying ? "Sending OTP..." : "Send OTP"}
                              </Button>
                            </div>
                          )}
                          {verificationStep === 'otp' && (
                            <div className="space-y-2">
                              <Label htmlFor="otp">Enter OTP</Label>
                              <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" />
                              <Button type="button" className="w-full" onClick={handleOtpSubmit} disabled={isVerifying}>
                                {isVerifying ? "Verifying..." : "Verify OTP"}
                              </Button>
                            </div>
                          )}
                        </Card>
                      )}

                      {verificationStep === 'verified' && (
                        <>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                            <UserCheck className="mx-auto h-6 w-6 text-green-600" />
                            <p className="text-sm font-medium text-green-700">Aadhaar Verified!</p>
                          </div>
                          <div>
                            <Label htmlFor="register-username">Username</Label>
                            <Input id="register-username" {...registerForm.register("username")} placeholder="Choose a username" />
                            {registerForm.formState.errors.username && <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.username.message}</p>}
                          </div>
                          <div>
                            <Label htmlFor="register-location">Location</Label>
                            <Input id="register-location" {...registerForm.register("location")} placeholder="Your location" />
                          </div>
                          <div>
                            <Label htmlFor="register-password">Password</Label>
                            <Input id="register-password" type="password" {...registerForm.register("password")} placeholder="Create a password" />
                            {registerForm.formState.errors.password && <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.password.message}</p>}
                          </div>
                          <div>
                            <Label htmlFor="register-confirm-password">Confirm Password</Label>
                            <Input id="register-confirm-password" type="password" {...registerForm.register("confirmPassword")} placeholder="Confirm your password" />
                            {registerForm.formState.errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {role === 'official' && (
                     <>
                        <div>
                            <Label htmlFor="official-name">Full Name</Label>
                            <Input id="official-name" {...registerForm.register("username")} placeholder="Enter your full name" />
                        </div>
                        <div>
                            <Label htmlFor="official-contact">Contact Number</Label>
                            <Input id="official-contact" {...registerForm.register("contact")} placeholder="Enter your contact number" />
                        </div>
                        <div>
                            <Label htmlFor="register-department">Department</Label>
                            <Select onValueChange={(value) => registerForm.setValue("department", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departmentsLoading && <div className="p-2 text-gray-500">Loading...</div>}
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.slug}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="official-password">Password</Label>
                            <Input id="official-password" type="password" {...registerForm.register("password")} placeholder="Create a password" />
                        </div>
                        <div>
                            <Label htmlFor="official-confirm-password">Confirm Password</Label>
                            <Input id="official-confirm-password" type="password" {...registerForm.register("confirmPassword")} placeholder="Confirm your password" />
                        </div>
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={registerMutation.isPending || requestOfficialAccountMutation.isPending || (role === 'citizen' && verificationStep !== 'verified')}>
                    {role === 'citizen' ? (verificationStep === 'verified' ? "Create Account" : "Verify to Continue") : "Request Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
