import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavigationHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/simple-logout");
    },
    onSuccess: () => {
      // Invalidate auth queries so useAuth can detect the logout
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Logged Out", 
        description: "You have been successfully logged out.",
      });
      
      // Use a slight delay to ensure the auth state is refreshed
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: () => {
      toast({
        title: "Logout Error", 
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user?.email || 'User';
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'change_manager':
        return 'Change Manager';
      case 'application_owner':
        return 'Application Owner';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const isChangeManager = user?.role === 'change_manager';

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="text-xl font-semibold text-primary cursor-pointer">
                  Change Request Management
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/">
                <span className={`px-1 pb-4 text-sm font-medium transition-colors cursor-pointer ${
                  location === '/' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  Dashboard
                </span>
              </Link>

              {!isChangeManager && (
                <Link href="/my-applications">
                  <span className={`px-1 pb-4 text-sm font-medium transition-colors cursor-pointer ${
                    location === '/my-applications' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    My Applications
                  </a>
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getInitials(user?.firstName, user?.lastName)}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">{getDisplayName()}</div>
                    <div className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="font-medium">{getDisplayName()}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
