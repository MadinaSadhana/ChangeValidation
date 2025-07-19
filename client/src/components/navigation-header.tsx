import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronDown, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
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
  const [showPriorityAlert, setShowPriorityAlert] = useState(false);

  // Query for priority notifications
  const { data: changeRequests } = useQuery({
    queryKey: ["/api/change-requests"],
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Calculate priority notifications
  const priorityNotifications = changeRequests?.filter((cr: any) => {
    const now = new Date();
    const startTime = new Date(cr.startDateTime);
    const timeDiff = startTime.getTime() - now.getTime();
    const hoursUntilStart = timeDiff / (1000 * 60 * 60);
    
    // Show alert for P1/Emergency changes starting within 2 hours, or overdue
    return (cr.changeType === 'P1' || cr.changeType === 'Emergency') && 
           cr.status === 'active' && 
           (hoursUntilStart <= 2 || hoursUntilStart < 0);
  }) || [];

  // Show priority alert when there are critical changes
  useEffect(() => {
    if (priorityNotifications.length > 0) {
      setShowPriorityAlert(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShowPriorityAlert(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [priorityNotifications.length]);

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

  // Show toast notification for priority alerts (only once per session)
  useEffect(() => {
    if (priorityNotifications.length > 0 && showPriorityAlert) {
      toast({
        title: "High Priority Change Requests!",
        description: priorityNotifications.length === 1 
          ? `${priorityNotifications[0].changeId} (${priorityNotifications[0].changeType}) needs immediate attention`
          : `${priorityNotifications.length} high priority change requests need attention`,
        variant: "destructive",
      });
    }
  }, [showPriorityAlert]); // Only trigger when alert visibility changes

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-semibold text-primary cursor-pointer">
                  Change Request Management
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/">
                <a className={`px-1 pb-4 text-sm font-medium transition-colors ${
                  location === '/' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  Dashboard
                </a>
              </Link>
              {!isChangeManager && (
                <Link href="/my-applications">
                  <a className={`px-1 pb-4 text-sm font-medium transition-colors ${
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
            <Button variant="ghost" size="sm" className="relative">
              <Bell className={`h-5 w-5 ${priorityNotifications.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              {priorityNotifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                >
                  {priorityNotifications.length}
                </Badge>
              )}
            </Button>
            
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
