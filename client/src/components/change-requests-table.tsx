import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Download, Filter, ExternalLink, X } from "lucide-react";
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
  const [filterType, setFilterType] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterApplication, setFilterApplication] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const filteredRequests = changeRequests.filter((request) => {
    const matchesSearch = !searchQuery.trim() || 
      request.changeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.description && request.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || request.changeType === filterType;
    
    // Status filter
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const overallStatus = getOverallStatus(request);
      matchesStatus = overallStatus.toLowerCase() === filterStatus.toLowerCase();
    }
    
    // Application filter
    let matchesApplication = true;
    if (filterApplication !== 'all') {
      matchesApplication = request.applications?.some((app: any) => 
        app.application.name.toLowerCase().includes(filterApplication.toLowerCase())
      ) || false;
    }
    
    // Date filter
    let matchesDate = true;
    if (filterDateFrom || filterDateTo) {
      const requestDate = new Date(request.startDate);
      if (filterDateFrom) {
        matchesDate = matchesDate && requestDate >= new Date(filterDateFrom);
      }
      if (filterDateTo) {
        matchesDate = matchesDate && requestDate <= new Date(filterDateTo);
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesApplication && matchesDate;
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

  const getCompletionDate = (request: any) => {
    if (!request.applications || request.applications.length === 0) {
      return null;
    }

    // Check if all applications have both pre and post status completed
    const allCompleted = request.applications.every((app: any) => 
      app.preChangeStatus === 'completed' && app.postChangeStatus === 'completed'
    );

    if (!allCompleted) {
      return null;
    }

    // Find the latest completion date among all applications
    let latestDate = null;
    for (const app of request.applications) {
      const preDate = app.preChangeUpdatedAt ? new Date(app.preChangeUpdatedAt) : null;
      const postDate = app.postChangeUpdatedAt ? new Date(app.postChangeUpdatedAt) : null;
      
      if (preDate && (!latestDate || preDate > latestDate)) {
        latestDate = preDate;
      }
      if (postDate && (!latestDate || postDate > latestDate)) {
        latestDate = postDate;
      }
    }

    return latestDate;
  };

  const getOverallStatus = (request: any) => {
    if (!request.applications || request.applications.length === 0) {
      return 'Pending';
    }

    const allCompleted = request.applications.every((app: any) => 
      app.preChangeStatus === 'completed' && app.postChangeStatus === 'completed'
    );
    
    if (allCompleted) {
      return 'Completed';
    }
    
    const anyInProgress = request.applications.some((app: any) => 
      app.preChangeStatus === 'in_progress' || app.postChangeStatus === 'in_progress'
    );
    
    if (anyInProgress) {
      return 'In Progress';
    }
    
    return 'Pending';
  };

  const exportToCSV = () => {
    // Flatten data for CSV export
    const flattenedData: any[] = [];
    
    filteredRequests.forEach(request => {
      if (request.applications && request.applications.length > 0) {
        request.applications.forEach((app: any) => {
          flattenedData.push({
            'CR ID': request.changeId,
            'CR Title': request.title,
            'CR Description': request.description || '',
            'Priority': request.changeType,
            'Overall Status': getOverallStatus(request),
            'Start Date': request.startDate ? format(new Date(request.startDate), 'yyyy-MM-dd') : '',
            'End Date': request.endDate ? format(new Date(request.endDate), 'yyyy-MM-dd') : '',
            'Application Name': app.application.name,
            'Application Description': app.application.description || '',
            'Application Owner': app.application.spoc ? 
              `${app.application.spoc.firstName || ''} ${app.application.spoc.lastName || ''}`.trim() : 'N/A',
            'Application Owner Email': app.application.spoc?.email || '',
            'Pre-Change Status': app.preChangeStatus.replace('_', ' '),
            'Post-Change Status': app.postChangeStatus.replace('_', ' '),
            'Pre-Change Comments': app.preChangeComments || '',
            'Post-Change Comments': app.postChangeComments || '',
            'Last Updated': app.preChangeUpdatedAt ? format(new Date(app.preChangeUpdatedAt), 'yyyy-MM-dd HH:mm') : ''
          });
        });
      } else {
        // If no applications, still include the change request
        flattenedData.push({
          'CR ID': request.changeId,
          'CR Title': request.title,
          'CR Description': request.description || '',
          'Priority': request.changeType,
          'Overall Status': getOverallStatus(request),
          'Start Date': request.startDate ? format(new Date(request.startDate), 'yyyy-MM-dd') : '',
          'End Date': request.endDate ? format(new Date(request.endDate), 'yyyy-MM-dd') : '',
          'Application Name': '',
          'Application Description': '',
          'Application Owner': '',
          'Application Owner Email': '',
          'Pre-Change Status': '',
          'Post-Change Status': '',
          'Pre-Change Comments': '',
          'Post-Change Comments': '',
          'Last Updated': ''
        });
      }
    });

    if (flattenedData.length === 0) {
      alert('No data to export');
      return;
    }

    // Convert to CSV
    const headers = Object.keys(flattenedData[0]);
    const csvContent = [
      headers.join(','),
      ...flattenedData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `change_requests_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearMoreFilters = () => {
    setFilterStatus("all");
    setFilterApplication("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const getUniqueApplications = () => {
    const apps = new Set<string>();
    changeRequests.forEach(request => {
      if (request.applications) {
        request.applications.forEach((app: any) => {
          apps.add(app.application.name);
        });
      }
    });
    return Array.from(apps).sort();
  };

  const hasActiveFilters = filterStatus !== "all" || filterApplication !== "all" || filterDateFrom || filterDateTo;

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

  const calculateOverallStatus = (request: any) => {
    if (!request.applications || request.applications.length === 0) {
      return { status: 'No Applications', badge: 'outline', color: 'text-gray-500' };
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

    if (allCompleted) {
      return { status: 'Completed', badge: 'secondary', color: 'text-green-600' };
    }
    if (hasInProgress) {
      return { status: 'In Progress', badge: 'destructive', color: 'text-orange-600' };
    }
    if (hasPending) {
      return { status: 'Pending', badge: 'outline', color: 'text-yellow-600' };
    }
    
    return { status: 'Pending', badge: 'outline', color: 'text-gray-500' };
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
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="P1">P1 Priority</SelectItem>
                  <SelectItem value="P2">P2 Priority</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Dialog open={showMoreFilters} onOpenChange={setShowMoreFilters}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className={hasActiveFilters ? "border-blue-500 bg-blue-50" : ""}>
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Additional Filters</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status-filter">Overall Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="application-filter">Application</Label>
                      <Select value={filterApplication} onValueChange={setFilterApplication}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Application" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Applications</SelectItem>
                          {getUniqueApplications().map(app => (
                            <SelectItem key={app} value={app}>{app}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="date-from">Start Date From</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="date-to">Start Date To</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={clearMoreFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                      <Button onClick={() => setShowMoreFilters(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
          <div className="overflow-x-auto max-w-full">
            <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CR ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CR Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Status
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white sticky right-0 z-10 border-l border-gray-200" style={{ minWidth: '150px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
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
                            <div className="text-sm text-gray-900">{request.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getChangeTypeBadge(request.changeType)} className="text-xs">
                              {request.changeType}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-xs text-gray-500">
                              No Applications
                            </Badge>
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
                          <td className="px-6 py-4 bg-white sticky right-0 z-10 border-l border-gray-200" style={{ minWidth: '150px' }}>
                            <Link href={`/change-requests/${request.id}`}>
                              <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:text-blue-800 hover:bg-blue-50 whitespace-nowrap">
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
                      <tr key={`${request.id}-${app.id || app.applicationId}-${index}`} className="hover:bg-gray-50">
                        {/* CR ID - only show on first row */}
                        <td className="px-6 py-4">
                          {index === 0 && (
                            <div className="text-sm font-medium text-gray-900">{request.changeId}</div>
                          )}
                        </td>
                        
                        {/* CR Description - only show on first row */}
                        <td className="px-6 py-4">
                          {index === 0 && (
                            <div className="text-sm text-gray-900">{request.title}</div>
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
                        

                        
                        {/* Overall Status - only show on first row */}
                        <td className="px-6 py-4">
                          {index === 0 && (() => {
                            const overallStatus = calculateOverallStatus(request);
                            return (
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={overallStatus.badge as any} 
                                  className={`text-xs font-medium ${
                                    overallStatus.status === 'In Progress' 
                                      ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-sm' 
                                      : overallStatus.color
                                  }`}
                                >
                                  {overallStatus.status === 'In Progress' && (
                                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></span>
                                  )}
                                  {overallStatus.status}
                                </Badge>
                              </div>
                            );
                          })()}
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
                              app.preChangeStatus === 'in_progress' ? 'In Progress' : 'Pending'
                            )} 
                            className="text-xs w-fit"
                          >
                            {app.preChangeStatus === 'completed' ? 'Completed' :
                             app.preChangeStatus === 'in_progress' ? 'In Progress' : 'Pending'}
                          </Badge>
                        </td>
                        
                        {/* Post-Application Checkout Status - individual per app */}
                        <td className="px-6 py-4">
                          <Badge 
                            variant={getValidationBadgeVariant(
                              app.postChangeStatus === 'completed' ? 'Completed' :
                              app.postChangeStatus === 'in_progress' ? 'In Progress' : 'Pending'
                            )} 
                            className="text-xs w-fit"
                          >
                            {app.postChangeStatus === 'completed' ? 'Completed' :
                             app.postChangeStatus === 'in_progress' ? 'In Progress' : 'Pending'}
                          </Badge>
                        </td>
                        
                        {/* Actions - only show on first row */}
                        <td className="px-6 py-4 bg-white sticky right-0 z-10 border-l border-gray-200" style={{ minWidth: '150px' }}>
                          {index === 0 && (
                            <Link href={`/change-requests/${request.id}`}>
                              <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:text-blue-800 hover:bg-blue-50 whitespace-nowrap">
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