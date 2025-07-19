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

  // Calculate overall RAG status for each change request
  const calculateRAGStatus = (request: ChangeRequest) => {
    if (!request.applications || request.applications.length === 0) {
      return 'amber'; // No applications means incomplete
    }

    let hasRed = false;
    let hasAmber = false;
    let allGreen = true;

    for (const app of request.applications) {
      const preStatus = app.preChangeStatus;
      const postStatus = app.postChangeStatus;

      // Red conditions: any validation is in progress or has issues
      if (preStatus === 'in_progress' || postStatus === 'in_progress') {
        hasRed = true;
        allGreen = false;
      }
      
      // Amber conditions: any validation is pending
      if (preStatus === 'pending' || postStatus === 'pending') {
        hasAmber = true;
        allGreen = false;
      }

      // Not green if not completed or not applicable
      if (preStatus !== 'completed' && preStatus !== 'not_applicable') {
        allGreen = false;
      }
      if (postStatus !== 'completed' && postStatus !== 'not_applicable') {
        allGreen = false;
      }
    }

    if (hasRed) return 'red';
    if (hasAmber) return 'amber';
    if (allGreen) return 'green';
    return 'amber';
  };

  // Calculate statistics
  const totalRequests = changeRequests.length;
  const ragCounts = changeRequests.reduce(
    (acc, request) => {
      const status = calculateRAGStatus(request);
      acc[status]++;
      return acc;
    },
    { red: 0, amber: 0, green: 0 }
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

      {/* Red Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-red-600">{ragCounts.red}</p>
              <Badge variant="outline" className="mt-1 border-red-200 text-red-700">
                Red Status
              </Badge>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Amber Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Action</p>
              <p className="text-2xl font-bold text-yellow-600">{ragCounts.amber}</p>
              <Badge variant="outline" className="mt-1 border-yellow-200 text-yellow-700">
                Amber Status
              </Badge>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      {/* Green Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{ragCounts.green}</p>
              <Badge variant="outline" className="mt-1 border-green-200 text-green-700">
                Green Status
              </Badge>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}