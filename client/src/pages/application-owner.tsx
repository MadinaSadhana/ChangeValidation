import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import StatsCards from "@/components/stats-cards";
import ValidationForm from "@/components/validation-form";

export default function ApplicationOwner() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/application-owner"],
    retry: false,
  });

  const { data: assignments, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: ["/api/my-applications"],
    retry: false,
  });

  useEffect(() => {
    if (stats && isUnauthorizedError(stats as any)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [stats, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-alt">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h2>
          <p className="text-gray-600">Update validation status for assigned applications</p>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          stats={stats} 
          isLoading={statsLoading} 
          isChangeManager={false}
        />

        {/* Assigned Applications */}
        <div className="space-y-6">
          {assignmentsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : assignments && assignments.length > 0 ? (
            assignments.map((assignment: any) => (
              <ValidationForm
                key={`${assignment.changeRequestId}-${assignment.applicationId}`}
                assignment={assignment}
                onSuccess={refetchAssignments}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Assigned</h3>
              <p className="text-gray-600">You don't have any applications assigned for validation at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
