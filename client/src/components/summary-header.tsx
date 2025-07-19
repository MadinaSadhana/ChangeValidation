import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface ChangeRequest {
  id: number;
  changeId: string;
  title: string;
  changeType: string;
  status: string;
  applications: Array<{
    preChangeStatus: string;
    postChangeStatus: string;
  }>;
}

interface SummaryHeaderProps {
  changeRequests: ChangeRequest[];
  isLoading: boolean;
}

export default function SummaryHeader({ changeRequests, isLoading }: SummaryHeaderProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate overall status for each change request
  const calculateOverallStatus = (request: ChangeRequest) => {
    if (!request.applications || request.applications.length === 0) {
      return 'pending'; // No applications means incomplete
    }

    let hasInProgress = false;
    let hasPending = false;
    let allCompleted = true;

    for (const app of request.applications) {
      const preStatus = app.preChangeStatus;
      const postStatus = app.postChangeStatus;

      // Check if any validation is in progress
      if (preStatus === 'in_progress' || postStatus === 'in_progress') {
        hasInProgress = true;
        allCompleted = false;
      }
      
      // Check if any validation is pending
      if (preStatus === 'pending' || postStatus === 'pending') {
        hasPending = true;
        allCompleted = false;
      }

      // Check if not completed
      if (preStatus !== 'completed' || postStatus !== 'completed') {
        allCompleted = false;
      }
    }

    if (allCompleted) return 'completed';
    if (hasInProgress) return 'in_progress';
    if (hasPending) return 'pending';
    return 'pending';
  };

  // Calculate statistics
  const totalRequests = changeRequests.length;
  const statusCounts = changeRequests.reduce(
    (acc, request) => {
      const status = calculateOverallStatus(request);
      acc[status]++;
      return acc;
    },
    { completed: 0, in_progress: 0, pending: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Change Requests */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Change Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* In Progress Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.in_progress}</p>
              <Badge variant="outline" className="mt-1 border-blue-200 text-blue-700">
                Active Work
              </Badge>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Pending Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Action</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <Badge variant="outline" className="mt-1 border-yellow-200 text-yellow-700">
                Awaiting Action
              </Badge>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      {/* Completed Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              <Badge variant="outline" className="mt-1 border-green-200 text-green-700">
                Fully Complete
              </Badge>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}