import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, User, Calendar, FileText, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChangeRequestApplication {
  id: number;
  changeRequestId: number;
  applicationId: number;
  preChangeStatus: string;
  postChangeStatus: string;
  preChangeComments?: string;
  postChangeComments?: string;
  preChangeUpdatedAt?: string;
  postChangeUpdatedAt?: string;
  application: {
    id: number;
    name: string;
    description?: string;
  };
  changeRequest?: {
    id: number;
    changeId: string;
    title: string;
    description?: string;
    changeType: string;
    startDateTime: string;
    endDateTime: string;
    changeManager?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
}

export default function ApplicationOwnerDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<ChangeRequestApplication | null>(null);
  const [preCheckStatus, setPreCheckStatus] = useState<'pass' | 'fail' | ''>('');
  const [postCheckStatus, setPostCheckStatus] = useState<'pass' | 'fail' | ''>('');
  const [preCheckRemarks, setPreCheckRemarks] = useState('');
  const [postCheckRemarks, setPostCheckRemarks] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: assignments, isLoading: assignmentsLoading, error, refetch } = useQuery<ChangeRequestApplication[]>({
    queryKey: ["/api/my-applications"],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [error, toast]);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      changeRequestId: number;
      applicationId: number;
      type: 'pre' | 'post';
      status: string;
      comments?: string;
    }) => {
      return apiRequest("PATCH", `/api/change-requests/${data.changeRequestId}/applications/${data.applicationId}/validation`, {
        type: data.type,
        status: data.status,
        comments: data.comments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      setShowConfirmation(true);
      setSelectedAssignment(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update validation status",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPreCheckStatus('');
    setPostCheckStatus('');
    setPreCheckRemarks('');
    setPostCheckRemarks('');
  };

  const handleViewClick = (assignment: ChangeRequestApplication) => {
    setSelectedAssignment(assignment);
    // Pre-populate form with existing values
    setPreCheckStatus(assignment.preChangeStatus === 'completed' ? 'pass' : assignment.preChangeStatus === 'failed' ? 'fail' : '');
    setPostCheckStatus(assignment.postChangeStatus === 'completed' ? 'pass' : assignment.postChangeStatus === 'failed' ? 'fail' : '');
    setPreCheckRemarks(assignment.preChangeComments || '');
    setPostCheckRemarks(assignment.postChangeComments || '');
    setShowValidationDialog(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    // Submit both pre and post check updates
    const updates = [];
    
    if (preCheckStatus) {
      updates.push({
        changeRequestId: selectedAssignment.changeRequestId,
        applicationId: selectedAssignment.applicationId,
        type: 'pre' as const,
        status: preCheckStatus === 'pass' ? 'completed' : 'failed',
        comments: preCheckRemarks,
      });
    }
    
    if (postCheckStatus) {
      updates.push({
        changeRequestId: selectedAssignment.changeRequestId,
        applicationId: selectedAssignment.applicationId,
        type: 'post' as const,
        status: postCheckStatus === 'pass' ? 'completed' : 'failed',
        comments: postCheckRemarks,
      });
    }

    if (updates.length === 0) {
      toast({
        title: "No Changes",
        description: "Please make at least one status selection",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const update of updates) {
        await updateMutation.mutateAsync(update);
      }
      setShowValidationDialog(false);
    } catch (error) {
      // Error handling is done in the mutation onError
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pass</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getPriorityBadge = (changeType: string) => {
    const colors = {
      'Emergency': 'bg-red-500 text-white',
      'P1': 'bg-orange-500 text-white',
      'P2': 'bg-yellow-500 text-black',
      'Standard': 'bg-green-500 text-white'
    };
    return <Badge className={colors[changeType as keyof typeof colors] || 'bg-gray-500 text-white'}>{changeType}</Badge>;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (assignmentsLoading) {
    return (
      <div className="min-h-screen bg-background-alt">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Review and update validation statuses for your assigned applications</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Change Requests</h2>
          
          {!assignments || assignments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No change requests assigned to your applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment: ChangeRequestApplication) => (
                <Card key={`${assignment.changeRequestId}-${assignment.applicationId}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {assignment.changeRequest?.changeId || `CR-${assignment.changeRequestId}`}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {assignment.changeRequest?.title || 'Change Request'}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          {assignment.changeRequest?.changeType && getPriorityBadge(assignment.changeRequest.changeType)}
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm font-medium text-gray-700">
                            {assignment.application.name}
                          </span>
                        </div>
                        {assignment.changeRequest?.startDateTime && (
                          <p className="text-sm text-gray-500">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Scheduled: {format(new Date(assignment.changeRequest.startDateTime), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewClick(assignment)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-1">Pre-Check Status</span>
                        {getStatusBadge(assignment.preChangeStatus)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-1">Post-Check Status</span>
                        {getStatusBadge(assignment.postChangeStatus)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Validation Details
            </DialogTitle>
            <DialogDescription>
              {selectedAssignment?.changeRequest?.changeId || `CR-${selectedAssignment?.changeRequestId}`} - {selectedAssignment?.application.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-6">
              {/* Change Request Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Change Request Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {selectedAssignment.changeRequest?.title || 'No title provided'}</p>
                  <p><strong>Description:</strong> {selectedAssignment.changeRequest?.description || 'No description provided'}</p>
                  {selectedAssignment.changeRequest?.changeManager && (
                    <p><strong>Change Manager:</strong> {selectedAssignment.changeRequest.changeManager.firstName} {selectedAssignment.changeRequest.changeManager.lastName}</p>
                  )}
                  {selectedAssignment.changeRequest?.startDateTime && (
                    <p><strong>Schedule:</strong> {format(new Date(selectedAssignment.changeRequest.startDateTime), 'PPpp')} - {format(new Date(selectedAssignment.changeRequest.endDateTime), 'PPpp')}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Pre-Change Validation */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Pre-Change Validation</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pre-pass"
                        checked={preCheckStatus === 'pass'}
                        onCheckedChange={(checked) => setPreCheckStatus(checked ? 'pass' : '')}
                      />
                      <Label htmlFor="pre-pass" className="text-sm font-medium text-green-600">Pass</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pre-fail"
                        checked={preCheckStatus === 'fail'}
                        onCheckedChange={(checked) => setPreCheckStatus(checked ? 'fail' : '')}
                      />
                      <Label htmlFor="pre-fail" className="text-sm font-medium text-red-600">Fail</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="pre-remarks" className="text-sm font-medium">Remarks</Label>
                    <Textarea
                      id="pre-remarks"
                      placeholder="Enter your validation comments..."
                      value={preCheckRemarks}
                      onChange={(e) => setPreCheckRemarks(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Post-Change Validation */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Post-Change Validation</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="post-pass"
                        checked={postCheckStatus === 'pass'}
                        onCheckedChange={(checked) => setPostCheckStatus(checked ? 'pass' : '')}
                      />
                      <Label htmlFor="post-pass" className="text-sm font-medium text-green-600">Pass</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="post-fail"
                        checked={postCheckStatus === 'fail'}
                        onCheckedChange={(checked) => setPostCheckStatus(checked ? 'fail' : '')}
                      />
                      <Label htmlFor="post-fail" className="text-sm font-medium text-red-600">Fail</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="post-remarks" className="text-sm font-medium">Remarks</Label>
                    <Textarea
                      id="post-remarks"
                      placeholder="Enter your validation comments..."
                      value={postCheckRemarks}
                      onChange={(e) => setPostCheckRemarks(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Status Updated Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              The validation status has been successfully submitted and updated in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowConfirmation(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}