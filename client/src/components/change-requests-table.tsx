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

  const filteredRequests = changeRequests.filter((request) => {
    const matchesSearch = !searchQuery || 
      request.changeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !filterType || filterType === 'all' || request.changeType === filterType;

    return matchesSearch && matchesType;
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
    const preNA = applications.filter(app => app.preChangeStatus === 'not_applicable').length;
    const postNA = applications.filter(app => app.postChangeStatus === 'not_applicable').length;

    const getOverallStatus = (completed: number, total: number, notApplicable: number) => {
      const applicable = total - notApplicable;
      if (applicable === 0) return 'N/A';
      if (completed === 0) return 'Pending';
      if (completed === applicable) return 'Completed';
      return 'In Progress';
    };

    return {
      totalApps,
      preCompleted,
      postCompleted,
      preChange: getOverallStatus(preCompleted, totalApps, preNA),
      postChange: getOverallStatus(postCompleted, totalApps, postNA)
    };
  };

  const getValidationBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'secondary';
      case 'In Progress': return 'default';
      case 'Pending': return 'outline';
      case 'N/A': return 'secondary';
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
            Change Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CR ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CR Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pre-Application Checkout Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post-Application Checkout Status
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
                  filteredRequests.flatMap((request) => {
                    // If no applications, show single row
                    if (!request.applications || request.applications.length === 0) {
                      return (
                        <tr key={`${request.id}-no-apps`} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{request.changeId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getChangeTypeBadge(request.changeType)} className="text-xs">
                              {request.changeType}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{request.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(new Date(request.startDateTime), "MMM dd, HH:mm")}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">No applications</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500">N/A</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500">N/A</span>
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
                    }

                    // Split into rows for each application
                    return request.applications.map((app, index) => (
                      <tr key={`${request.id}-${app.applicationId}`} className="hover:bg-gray-50">
                        {/* CR ID - only show on first row */}
                        <td className="px-6 py-4">
                          {index === 0 && (
                            <div className="text-sm font-medium text-gray-900">{request.changeId}</div>
                          )}
                        </td>
                        
                        {/* Priority - only show on first row */}
                        <td className="px-6 py-4">
                          {index === 0 && (
                            <Badge variant={getChangeTypeBadge(request.changeType)} className="text-xs">
                              {request.changeType}
                            </Badge>
                          )}
                        </td>
                        
                        {/* CR Description - only show on first row */}
                        <td className="px-6 py-4">
                          {index === 0 && (
                            <>
                              <div className="text-sm text-gray-900">{request.title}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {format(new Date(request.startDateTime), "MMM dd, HH:mm")}
                              </div>
                            </>
                          )}
                        </td>
                        
                        {/* Application Name - show for each row */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {app.application?.name || 'Unknown Application'}
                          </div>
                        </td>
                        
                        {/* Pre-Application Checkout Status - individual per app */}
                        <td className="px-6 py-4">
                          <Badge 
                            variant={getValidationBadgeVariant(
                              app.preChangeStatus === 'completed' ? 'Completed' :
                              app.preChangeStatus === 'not_applicable' ? 'N/A' : 'Pending'
                            )} 
                            className="text-xs w-fit"
                          >
                            {app.preChangeStatus === 'completed' ? 'Completed' :
                             app.preChangeStatus === 'not_applicable' ? 'N/A' : 'Pending'}
                          </Badge>
                        </td>
                        
                        {/* Post-Application Checkout Status - individual per app */}
                        <td className="px-6 py-4">
                          <Badge 
                            variant={getValidationBadgeVariant(
                              app.postChangeStatus === 'completed' ? 'Completed' :
                              app.postChangeStatus === 'not_applicable' ? 'N/A' : 'Pending'
                            )} 
                            className="text-xs w-fit"
                          >
                            {app.postChangeStatus === 'completed' ? 'Completed' :
                             app.postChangeStatus === 'not_applicable' ? 'N/A' : 'Pending'}
                          </Badge>
                        </td>
                        
                        {/* Actions - only show on first row */}
                        <td className="px-6 py-4">
                          {index === 0 && (
                            <Link href={`/change-requests/${request.id}`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ));
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