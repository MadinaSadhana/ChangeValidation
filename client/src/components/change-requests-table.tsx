import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface ChangeRequestsTableProps {
  changeRequests: any[];
  isLoading: boolean;
  isChangeManager: boolean;
}

export default function ChangeRequestsTable({ 
  changeRequests, 
  isLoading, 
  isChangeManager 
}: ChangeRequestsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredRequests = changeRequests.filter((request) => {
    const matchesSearch = !searchQuery || 
      request.changeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !filterType || filterType === 'all' || request.changeType === filterType;
    const matchesStatus = !filterStatus || filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getChangeTypeBadge = (type: string) => {
    const variants = {
      P1: "destructive",
      P2: "default", 
      Emergency: "destructive",
      Standard: "secondary",
    };
    return variants[type as keyof typeof variants] || "secondary";
  };

  const getValidationSummary = (applications: any[]) => {
    if (!applications || applications.length === 0) {
      return {
        totalApps: 0,
        preCompleted: 0,
        postCompleted: 0,
        preChange: 'No Data',
        postChange: 'No Data'
      };
    }

    const totalApps = applications.length;
    const preCompleted = applications.filter(app => app.preChangeStatus === 'completed').length;
    const postCompleted = applications.filter(app => app.postChangeStatus === 'completed').length;

    const getOverallStatus = (completed: number, total: number) => {
      if (completed === 0) return 'Pending';
      if (completed === total) return 'Completed';
      return 'In Progress';
    };

    return {
      totalApps,
      preCompleted,
      postCompleted,
      preChange: getOverallStatus(preCompleted, totalApps),
      postChange: getOverallStatus(postCompleted, totalApps)
    };
  };

  const getValidationBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'secondary';
      case 'In Progress': return 'default';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search change requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Change Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="P1">P1</SelectItem>
                  <SelectItem value="P2">P2</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isChangeManager ? "Recent Change Requests" : "Assigned Change Requests"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pre-Checkout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post-Checkout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No change requests found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    // Calculate validation status summary
                    const validationSummary = getValidationSummary(request.applications || []);
                    
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.changeId}</div>
                            <div className="text-sm text-gray-500">{request.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getChangeTypeBadge(request.changeType)}>
                            {request.changeType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.applicationCount} Application{request.applicationCount !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <Badge 
                              variant={getValidationBadgeVariant(validationSummary.preChange)} 
                              className="text-xs w-fit"
                            >
                              {validationSummary.preChange}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {validationSummary.preCompleted}/{validationSummary.totalApps}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <Badge 
                              variant={getValidationBadgeVariant(validationSummary.postChange)} 
                              className="text-xs w-fit"
                            >
                              {validationSummary.postChange}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {validationSummary.postCompleted}/{validationSummary.totalApps}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(request.startDateTime), "MMM dd, yyyy")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(request.startDateTime), "HH:mm")} - {format(new Date(request.endDateTime), "HH:mm")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/change-requests/${request.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredRequests.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredRequests.length} of {changeRequests.length} results
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}