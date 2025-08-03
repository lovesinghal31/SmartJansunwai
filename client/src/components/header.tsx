import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Landmark, Bell, Menu, User, LogOut, Home, FileText, BarChart3 } from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    ...(user?.role === "citizen" 
      ? [{ name: "My Complaints", href: "/citizen-dashboard", icon: FileText }]
      : []
    ),
    ...(user?.role === "official" 
      ? [{ name: "Dashboard", href: "/official-dashboard", icon: BarChart3 }]
      : []
    ),
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center">
                <Landmark className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Jansunwai</h1>
                <p className="text-xs text-gray-600">Indore Smart City</p>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-gray-700 hover:text-primary-800 transition-colors font-medium flex items-center space-x-1 ${
                  location === item.href ? "text-primary-800" : ""
                }`}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button className="px-3 py-1 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
                EN
              </button>
              <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                हिंदी
              </button>
            </div>
            
            {/* Notification Bell */}
            {user && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell size={20} />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            )}
            
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User size={16} />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm text-gray-600">
                    {user.role === "citizen" ? "Citizen" : `Official - ${user.department}`}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary-800 text-white hover:bg-primary-900">
                  <User className="mr-2" size={16} />
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-gray-700 hover:text-primary-800 transition-colors font-medium flex items-center space-x-2 ${
                        location === item.href ? "text-primary-800" : ""
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
