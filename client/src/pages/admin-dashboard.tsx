import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  Building2, 
  Clock, 
  Bell, 
  FileText, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Activity,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const departmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  slaHours: z.number().min(1, "SLA hours must be at least 1"),
  isActive: z.boolean(),
});

const slaFormSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  responseTimeHours: z.number().min(1),
  resolutionTimeHours: z.number().min(1),
  escalationLevels: z.number().min(1).max(5),
  isActive: z.boolean(),
});

const notificationFormSchema = z.object({
  userId: z.string().min(1, "User is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  actionUrl: z.string().optional(),
  metadata: z.string().optional(),
  expiresAt: z.date().optional(),
});

const userUpdateFormSchema = z.object({
  role: z.enum(["citizen", "official", "admin"]),
  department: z.string().optional(),
});

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [slaDialog, setSlaDialog] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const { accessToken } = useAuth();

  // Queries
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/departments"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/departments", undefined, accessToken);
      return res.json();
    },
    enabled: !!accessToken,
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users", undefined, accessToken);
      return res.json();
    },
    enabled: !!accessToken,
  });

  const { data: slaSettings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/sla-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/sla-settings", undefined, accessToken);
      return res.json();
    },
    enabled: !!accessToken,
  });

  const { data: auditLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/audit-logs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/audit-logs", undefined, accessToken);
      return res.json();
    },
    enabled: !!accessToken,
  });

  const { data: stats = {} } = useQuery<any>({
    queryKey: ["/api/analytics/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/stats", undefined, accessToken);
      return res.json();
    },
    enabled: !!accessToken,
  });

  // Department mutations
  const createDepartmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/departments", data, accessToken);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departments"] });
      setDepartmentDialog(false);
      toast({ title: "Department created successfully" });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/admin/departments/${id}`, data, accessToken);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departments"] });
      setDepartmentDialog(false);
      toast({ title: "Department updated successfully" });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/departments/${id}`, undefined, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departments"] });
      toast({ title: "Department deleted successfully" });
    },
  });

  // SLA mutations
  const createSlaMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/sla-settings", data, accessToken);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sla-settings"] });
      setSlaDialog(false);
      toast({ title: "SLA settings created successfully" });
    },
  });

  // User mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data, accessToken);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setUserDialog(false);
      toast({ title: "User updated successfully" });
    },
  });

  // Notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      // Ensure expiresAt is sent as a date or omitted
      const payload = { ...data };
      if (!payload.expiresAt) delete payload.expiresAt;
      const res = await apiRequest("POST", "/api/admin/notifications", payload, accessToken);
      return res.json();
    },
    onSuccess: () => {
      setNotificationDialog(false);
      toast({ title: "Notification sent successfully" });
    },
  });

  // Forms
  const departmentForm = useForm({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      slaHours: 72,
      isActive: true,
    },
  });

  const slaForm = useForm({
    resolver: zodResolver(slaFormSchema),
    defaultValues: {
      departmentId: "",
      priority: "medium" as const,
      responseTimeHours: 24,
      resolutionTimeHours: 72,
      escalationLevels: 3,
      isActive: true,
    },
  });

  const notificationForm = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      userId: "",
      type: "info",
      category: "general",
      title: "",
      message: "",
      actionUrl: "",
      metadata: "",
      expiresAt: undefined,
    },
  });

  const userForm = useForm({
    resolver: zodResolver(userUpdateFormSchema),
    defaultValues: {
      role: "citizen" as const,
      department: "",
    },
  });

  const handleEditDepartment = (department: any) => {
    setSelectedDepartment(department);
    departmentForm.reset(department);
    setDepartmentDialog(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    userForm.reset({
      role: user.role,
      department: user.department || "",
    });
    setUserDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage all aspects of the Jansunwai system</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sla">SLA Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">Active system complaints</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">Citizens: {users.filter(u => u.role === "citizen").length}, Officials: {users.filter(u => u.role === "official").length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{departments.length}</div>
                  <p className="text-xs text-muted-foreground">Active: {departments.filter(d => d.isActive).length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24h</div>
                  <p className="text-xs text-muted-foreground">Within SLA targets</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system actions and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => setDepartmentDialog(true)} className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Department
                  </Button>
                  <Button onClick={() => setSlaDialog(true)} variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Configure SLA Settings
                  </Button>
                  <Button onClick={() => setNotificationDialog(true)} variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Department Management</h2>
              <Button onClick={() => setDepartmentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>SLA Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept: any) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.description}</TableCell>
                      <TableCell>{dept.slaHours}h</TableCell>
                      <TableCell>
                        <Badge variant={dept.isActive ? "default" : "secondary"}>
                          {dept.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDepartment(dept)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteDepartmentMutation.mutate(dept.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex space-x-2">
                <Badge variant="outline">{users.filter(u => u.role === "citizen").length} Citizens</Badge>
                <Badge variant="outline">{users.filter(u => u.role === "official").length} Officials</Badge>
                <Badge variant="outline">{users.filter(u => u.role === "admin").length} Admins</Badge>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === "admin" ? "default" : 
                          user.role === "official" ? "secondary" : "outline"
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || "N/A"}</TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* SLA Settings Tab */}
          <TabsContent value="sla" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">SLA Configuration</h2>
              <Button onClick={() => setSlaDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add SLA Rule
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Resolution Time</TableHead>
                    <TableHead>Escalation Levels</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slaSettings.map((sla: any) => (
                    <TableRow key={sla.id}>
                      <TableCell>{departments.find(d => d.id === sla.departmentId)?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          sla.priority === "urgent" ? "destructive" :
                          sla.priority === "high" ? "default" :
                          sla.priority === "medium" ? "secondary" : "outline"
                        }>
                          {sla.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{sla.responseTimeHours}h</TableCell>
                      <TableCell>{sla.resolutionTimeHours}h</TableCell>
                      <TableCell>{sla.escalationLevels}</TableCell>
                      <TableCell>
                        <Badge variant={sla.isActive ? "default" : "secondary"}>
                          {sla.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Notification Management</h2>
              <Button onClick={() => setNotificationDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Send System Notifications</CardTitle>
                <CardDescription>Send important updates and announcements to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Bell className="h-6 w-6 mb-2" />
                    System Maintenance
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Emergency Alert
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <UserCheck className="h-6 w-6 mb-2" />
                    User Updates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">System Analytics</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Complaints by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="capitalize">{status}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Complaints by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.byCategory && Object.entries(stats.byCategory).map(([category, count]) => (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Complaints by Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.byPriority && Object.entries(stats.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between">
                        <span className="capitalize">{priority}</span>
                        <Badge variant={
                          priority === "urgent" ? "destructive" :
                          priority === "high" ? "default" : "outline"
                        }>
                          {count as number}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Audit Trail</h2>
              <Badge variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {auditLogs.length} Total Entries
              </Badge>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.slice(0, 20).map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.action.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{users.find(u => u.id === log.userId)?.username || "Unknown"}</TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{log.ipAddress || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Department Dialog */}
      <Dialog open={departmentDialog} onOpenChange={setDepartmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
            <DialogDescription>
              {selectedDepartment ? "Update department information" : "Create a new department for complaint categorization"}
            </DialogDescription>
          </DialogHeader>
          <Form {...departmentForm}>
            <form onSubmit={departmentForm.handleSubmit((data) => {
              if (selectedDepartment) {
                updateDepartmentMutation.mutate({ id: selectedDepartment.id, ...data });
              } else {
                createDepartmentMutation.mutate(data);
              }
            })} className="space-y-4">
              <FormField
                control={departmentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Water Supply & Sewerage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={departmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief description of department responsibilities" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={departmentForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="department@indore.gov.in" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={departmentForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91 12345 67890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={departmentForm.control}
                  name="slaHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default SLA Hours</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={departmentForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDepartmentDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}>
                  {selectedDepartment ? "Update" : "Create"} Department
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* SLA Dialog */}
      <Dialog open={slaDialog} onOpenChange={setSlaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure SLA Settings</DialogTitle>
            <DialogDescription>
              Set response and resolution time targets for different priority levels
            </DialogDescription>
          </DialogHeader>
          <Form {...slaForm}>
            <form onSubmit={slaForm.handleSubmit((data) => createSlaMutation.mutate(data))} className="space-y-4">
              <FormField
                control={slaForm.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={slaForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={slaForm.control}
                  name="responseTimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Time (Hours)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={slaForm.control}
                  name="resolutionTimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution Time (Hours)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={slaForm.control}
                  name="escalationLevels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escalation Levels</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="1" 
                          max="5"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={slaForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSlaDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSlaMutation.isPending}>
                  Create SLA Rule
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
        <DialogContent style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification to a specific user or broadcast to all users
            </DialogDescription>
          </DialogHeader>
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit((data) => createNotificationMutation.mutate(data))} className="space-y-4">
              <FormField
                control={notificationForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Notification title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detailed notification message" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="actionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="/dashboard" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="metadata"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metadata (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Additional data in JSON format" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Time (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNotificationDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createNotificationMutation.isPending}>
                  Send Notification
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Update user role and department assignments
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit((data) => {
              updateUserMutation.mutate({ id: selectedUser.id, ...data });
            })} className="space-y-4">
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="official">Official</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (For Officials)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setUserDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  Update User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}