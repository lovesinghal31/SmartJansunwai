import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  User,
  LogOut,
  Settings,
  BarChart3,
  MessageSquare,
  Map,
  Rocket,
  Shield,
  Bell,
  Trash2,
} from "lucide-react";
import LanguageSwitcher from "./language-switcher";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Notification } from "../../../shared/schema";
import Logo from "./logo.png"; // Adjust the path as necessary
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { user, logoutMutation, accessToken } = useAuth();
  const location = useLocation(); // react-router-dom's useLocation returns an object
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    isError: notificationsError,
    refetch: refetchNotifications,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications", undefined, accessToken);
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return res.json();
    },
    enabled: !!user?.id && !!accessToken,
    refetchInterval: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`, undefined, accessToken);
    },
    onSuccess: () => refetchNotifications(),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notifications/${id}`, undefined, accessToken);
    },
    onSuccess: () => refetchNotifications(),
  });

  const unreadCount =
    notifications?.filter((n: Notification) => !n.isRead).length || 0;
    
  // --- FIX: Restored the testNotifications function ---
  const testNotifications = async () => {
    console.log("Testing notifications API manually...");
    try {
      const res = await apiRequest("GET", "/api/notifications", undefined, accessToken);
      const data = await res.json();
      console.log("Manual notifications test result:", data);
      toast({ title: "Notifications test successful", description: `Found ${data.length} notifications` });
    } catch (error) {
      console.error("Manual notifications test error:", error);
      toast({ 
        title: "Notifications test failed", 
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive" 
      });
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      markAsReadMutation.mutate(n.id);
    }
    if (n.actionUrl) {
      window.location.href = n.actionUrl;
    }
  };
  
  const navigation = [
    { name: t("navigation.home"), href: "/", icon: Home },
    { name: t("navigation.features"), href: "/features", icon: Rocket },
    { name: t("navigation.chatbot"), href: "/chatbot", icon: MessageSquare, protected: true },
    { name: t("navigation.map"), href: "/complaint-map", icon: Map, protected: true },
    { name: t("navigation.feedback"), href: "/feedback", icon: MessageSquare, protected: true },
    { name: t("navigation.analytics"), href: "/analytics", icon: BarChart3, protected: true, officialOnly: true },
    { name: t("navigation.admin"), href: "/admin-dashboard", icon: Shield, protected: true, adminOnly: true },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <div className="flex items-center space-x-3">
                <img src={Logo} alt="Samadhan+" className="h-12 w-12 object-contain" />
                <span className="text-xl font-bold text-gray-900">SAMADHAN+</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const shouldShow = !item.protected || user;
              const isOfficialOnly = item.officialOnly && user?.role !== "official";
              const isAdminOnly = item.adminOnly && user?.role !== "admin";

              if (!shouldShow || isOfficialOnly || isAdminOnly) return null;

              return (
                <Link key={item.name} to={item.href}>
                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-2 rounded-full">
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto rounded-xl">
                    {/* --- FIX: Restored the Test Notifications button --- */}
                    <div className="px-4 py-2 border-b">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={testNotifications}
                        className="w-full"
                      >
                        Test Notifications
                      </Button>
                    </div>
                    {notificationsLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : notificationsError ? (
                      <div className="p-4 text-center text-sm text-red-500">Failed to load.</div>
                    ) : notifications.length > 0 ? (
                      notifications.map((n: Notification) => (
                        <div key={n.id} className={`p-3 border-b last:border-b-0 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-grow cursor-pointer" onClick={() => handleNotificationClick(n)}>
                              <p className="font-semibold text-sm">{n.title}</p>
                              <p className="text-xs text-gray-600">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:bg-red-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(n.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No notifications.</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-full">
                      <User size={20} />
                      <span className="hidden sm:inline font-semibold">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={user.role === "admin" ? "/admin-dashboard" : user.role === "official" ? "/official-dashboard" : "/citizen-dashboard"}>
                        <Home size={16} className="mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings size={16} className="mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
