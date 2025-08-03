import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
  Menu
} from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Features", href: "/features", icon: Rocket },
    { name: "Chatbot", href: "/chatbot", icon: MessageSquare, protected: true },
    { name: "Map", href: "/complaint-map", icon: Map, protected: true },
    { name: "Analytics", href: "/analytics", icon: BarChart3, protected: true, officialOnly: true },
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
              
              if (!shouldShow || isOfficialOnly) return null;
              
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
                    <Link href={user.role === "official" ? "/official-dashboard" : "/citizen-dashboard"}>
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