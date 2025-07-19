import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";

import ChangeRequestsTable from "@/components/change-requests-table";
import CreateChangeRequestModal from "@/components/create-change-request-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);



  const { data: changeRequests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ["/api/change-requests"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isChangeManager = user?.role === "change_manager";

  return (
    <div className="min-h-screen bg-background-alt">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isChangeManager ? "Change Request Dashboard" : "My Dashboard"}
              </h2>
              <p className="text-gray-600">
                {isChangeManager 
                  ? "Monitor and manage change requests and validation statuses"
                  : "View your assigned change requests and update validation statuses"
                }
              </p>
            </div>
            {isChangeManager && (
              <div className="mt-4 sm:mt-0">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Change Request
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Change Requests Table */}
        <ChangeRequestsTable 
          changeRequests={changeRequests || []}
          isLoading={requestsLoading}
          isChangeManager={isChangeManager}
        />

        {/* Create Change Request Modal */}
        {isChangeManager && (
          <CreateChangeRequestModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSuccess={() => {
              refetchRequests();
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
