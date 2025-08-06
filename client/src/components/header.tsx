import { Link, useLocation } from "wouter";
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
  Menu,
  Shield,
  Bell
} from "lucide-react";
import LanguageSwitcher from "./language-switcher";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Notification } from "../../../shared/schema";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { t } = useTranslation();

  // Notification fetching
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    isError: notificationsError,
    refetch: refetchNotifications,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: false, // Only fetch when dropdown opens
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`);
    },
  });

  // Unread count
  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  // Handle notification click
  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      markAsReadMutation.mutate(n.id, {
        onSuccess: () => {
          refetchNotifications();
        },
      });
    }
    if (n.actionUrl) {
      window.location.href = n.actionUrl;
    }
  };

  const navigation = [
    { name: t('navigation.home'), href: "/", icon: Home },
    { name: t('navigation.features'), href: "/features", icon: Rocket },
    { name: t('navigation.chatbot'), href: "/chatbot", icon: MessageSquare, protected: true },
    { name: t('navigation.map'), href: "/complaint-map", icon: Map, protected: true },
    { name: t('navigation.feedback'), href: "/feedback", icon: MessageSquare, protected: true },
    { name: t('navigation.analytics'), href: "/analytics", icon: BarChart3, protected: true, officialOnly: true },
    { name: t('navigation.admin'), href: "/admin-dashboard", icon: Shield, protected: true, adminOnly: true },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Jansunwai</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              // Show all items to authenticated users, or only non-protected to unauthenticated
              const shouldShow = !item.protected || user;
              // Hide official-only items from citizens
              const isOfficialOnly = item.officialOnly && user?.role !== "official";
              // Hide admin-only items from non-admins
              const isAdminOnly = item.adminOnly && user?.role !== "admin";
              
              if (!shouldShow || isOfficialOnly || isAdminOnly) return null;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}>
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-2" onClick={() => refetchNotifications()}>
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : notificationsError ? (
                      <div className="px-4 py-2 text-sm text-red-500">Failed to load notifications.</div>
                    ) : notifications && notifications.length > 0 ? (
                      notifications.map((n: Notification) => (
                        <div
                          key={n.id}
                          className={`px-4 py-2 border-b last:border-b-0 cursor-pointer transition-colors ${n.isRead ? "bg-white" : "bg-blue-50 hover:bg-blue-100"}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="font-semibold flex items-center">
                            {n.title}
                            {!n.isRead && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                          </div>
                          <div className="text-sm text-gray-700">{n.message}</div>
                          <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No notifications.</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* User Menu */}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User size={16} />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={
                      user.role === "admin" ? "/admin-dashboard" :
                      user.role === "official" ? "/official-dashboard" : 
                      "/citizen-dashboard"
                    }>
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
                <Link href="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/features">
                  <Button>
                    <Rocket size={16} className="mr-2" />
                    Features
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}