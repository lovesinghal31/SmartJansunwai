import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Landmark, Shield, Users, TrendingUp } from "lucide-react";


const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const navigate = useNavigate(); // ✅ Correct hook
  const [activeTab, setActiveTab] = useState("login");
  
  // Department state for dynamic loading
  const [departments, setDepartments] = useState<Array<{id: string, name: string, slug: string}>>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // Fetch departments on component mount
  useEffect(() => {
    async function fetchDepartments() {
      setDepartmentsLoading(true);
      setDepartmentsError(null);
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(data);
      } catch (err: any) {
        setDepartmentsError(err.message || "Unknown error");
      } finally {
        setDepartmentsLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "citizen",
      department: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    setTimeout(() => navigate("/"), 0);
    return null;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/"); // ✅ Correct usage
      },
    });
  };

  const onRegister = (data: RegisterData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        navigate("/"); // ✅ Correct usage
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="w-12 h-12 bg-primary-800 rounded-full flex items-center justify-center">
              <Landmark className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jansunwai</h1>
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
            <CardTitle className="text-center">Welcome to Jansunwai</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      {...loginForm.register("username")}
                      placeholder="Enter your username"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-600 mt-1">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...loginForm.register("password")}
                      placeholder="Enter your password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      {...registerForm.register("username")}
                      placeholder="Choose a username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-role">Role</Label>
                    <Select
                      value={registerForm.watch("role")}
                      onValueChange={(value: "citizen" | "official") => 
                        registerForm.setValue("role", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="official">Government Official</SelectItem>
                      </SelectContent>
                    </Select>
                    {registerForm.formState.errors.role && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.role.message}
                      </p>
                    )}
                  </div>

                  {registerForm.watch("role") === "official" && (
                    <div>
                      <Label htmlFor="register-department">Department</Label>
                      <Select
                        value={registerForm.watch("department") || ""}
                        onValueChange={(value) => registerForm.setValue("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentsLoading && <div className="p-2 text-gray-500">Loading...</div>}
                          {departmentsError && <div className="p-2 text-red-500">{departmentsError}</div>}
                          {!departmentsLoading && !departmentsError && departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.slug || dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.department && (
                        <p className="text-sm text-red-600 mt-1">
                          {registerForm.formState.errors.department.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerForm.register("password")}
                      placeholder="Create a password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      {...registerForm.register("confirmPassword")}
                      placeholder="Confirm your password"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
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
