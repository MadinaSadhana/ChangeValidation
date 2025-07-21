import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, LogIn, UserCog, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SimpleLogin() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { name: string; role: string }) => {
      return apiRequest("POST", "/api/simple-login", data);
    },
    onSuccess: (data) => {
      // Invalidate auth queries so useAuth can detect the new authentication state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login Successful",
        description: `Welcome to Change Request Management System`,
      });
      
      // Use a slight delay to ensure the auth state is refreshed
      setTimeout(() => {
        // Redirect based on role
        if (selectedRole === 'application_owner') {
          setLocation("/my-applications");
        } else {
          setLocation("/");
        }
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to log in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedRole) {
      toast({
        title: "Role Selection Required",
        description: "Please select your role to continue.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ name: name.trim(), role: selectedRole });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Change Request Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Streamline your change validation process
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Select your role and enter your name to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select 
                  value={selectedRole} 
                  onValueChange={setSelectedRole}
                  disabled={loginMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="change_manager">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        Change Manager
                      </div>
                    </SelectItem>
                    <SelectItem value="application_owner">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Application Owner
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  disabled={loginMutation.isPending}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || !selectedRole}
              >
                {loginMutation.isPending ? (
                  "Logging in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login as {selectedRole === 'change_manager' ? 'Change Manager' : 'Application Owner'}
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedRole === 'change_manager' 
                  ? 'Manage change requests and monitor all validations'
                  : selectedRole === 'application_owner'
                  ? 'View and update your application validation statuses'
                  : 'Select a role to see more information'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This system supports both Change Managers and Application Owners.
            <br />
            Access is automatically granted based on your selected role.
          </p>
        </div>
      </div>
    </div>
  );
}