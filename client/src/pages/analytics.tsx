import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Calendar, Clock, 
  AlertTriangle, CheckCircle, XCircle, Activity,
  Download, Filter, BarChart3
} from "lucide-react";
import { format, subDays, subWeeks, subMonths } from "date-fns";

const COLORS = {
  P1: '#dc2626', // Red
  P2: '#ea580c', // Orange  
  Emergency: '#991b1b', // Dark Red
  Standard: '#059669', // Green
  completed: '#059669', // Green
  in_progress: '#ea580c', // Orange
  pending: '#eab308' // Yellow
};

interface AnalyticsData {
  overview: {
    totalRequests: number;
    completedRequests: number;
    inProgressRequests: number;
    pendingRequests: number;
    avgCompletionTime: number;
    successRate: number;
  };
  trends: Array<{
    date: string;
    created: number;
    completed: number;
    pending: number;
    in_progress: number;
  }>;
  priorityDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  applicationMetrics: Array<{
    name: string;
    totalValidations: number;
    completedValidations: number;
    avgCompletionTime: number;
    successRate: number;
  }>;
  performanceMetrics: Array<{
    period: string;
    avgPreValidationTime: number;
    avgPostValidationTime: number;
    totalTime: number;
  }>;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const data = analyticsData || {
    overview: {
      totalRequests: 0,
      completedRequests: 0,
      inProgressRequests: 0,
      pendingRequests: 0,
      avgCompletionTime: 0,
      successRate: 0,
    },
    trends: [],
    priorityDistribution: [],
    applicationMetrics: [],
    performanceMetrics: [],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Advanced reporting and insights for change request management</p>
        </div>
        
        <div className="flex space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalRequests}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                All Time
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{data.overview.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                High Performance
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
                <p className="text-2xl font-bold text-orange-600">{data.overview.avgCompletionTime.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-orange-700 border-orange-200">
                Processing Time
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-blue-600">{data.overview.inProgressRequests}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                In Progress
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full lg:w-fit grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="priority">Priority Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: data.overview.completedRequests, color: COLORS.completed },
                        { name: 'In Progress', value: data.overview.inProgressRequests, color: COLORS.in_progress },
                        { name: 'Pending', value: data.overview.pendingRequests, color: COLORS.pending }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Completed', value: data.overview.completedRequests, color: COLORS.completed },
                        { name: 'In Progress', value: data.overview.inProgressRequests, color: COLORS.in_progress },
                        { name: 'Pending', value: data.overview.pendingRequests, color: COLORS.pending }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.priorityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {data.priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Request Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM dd')} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                      formatter={(value, name) => [value, name.replace('_', ' ').toUpperCase()]}
                    />
                    <Area type="monotone" dataKey="created" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#059669" fill="#059669" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="in_progress" stackId="1" stroke="#ea580c" fill="#ea580c" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.trends.map(d => ({
                    ...d,
                    completionRate: d.created > 0 ? ((d.completed / d.created) * 100).toFixed(1) : 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM dd')} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                      formatter={(value) => [`${value}%`, 'Completion Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="#059669" 
                      strokeWidth={3}
                      dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="priority" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.priorityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.applicationMetrics.slice(0, 8).map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{app.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {app.completedValidations}/{app.totalValidations} validations completed
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${app.successRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge 
                          variant={app.successRate > 90 ? "secondary" : app.successRate > 75 ? "outline" : "destructive"}
                          className="mb-2"
                        >
                          {app.successRate.toFixed(0)}%
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {app.avgCompletionTime.toFixed(1)}h avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Validation Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value}h`, name]} />
                    <Line 
                      type="monotone" 
                      dataKey="avgPreValidationTime" 
                      stroke="#3b82f6" 
                      name="Pre-Validation Time"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPostValidationTime" 
                      stroke="#059669" 
                      name="Post-Validation Time"
                      strokeWidth={3}
                      dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Validation Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}h`, 'Total Time']} />
                    <Bar dataKey="totalTime" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {data.performanceMetrics.length > 0 
                      ? (data.performanceMetrics.reduce((sum, metric) => sum + metric.avgPreValidationTime, 0) / data.performanceMetrics.length).toFixed(1)
                      : '0'
                    }h
                  </p>
                  <p className="text-sm text-gray-600">Avg Pre-Validation</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {data.performanceMetrics.length > 0 
                      ? (data.performanceMetrics.reduce((sum, metric) => sum + metric.avgPostValidationTime, 0) / data.performanceMetrics.length).toFixed(1)
                      : '0'
                    }h
                  </p>
                  <p className="text-sm text-gray-600">Avg Post-Validation</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {data.performanceMetrics.length > 0 
                      ? (data.performanceMetrics.reduce((sum, metric) => sum + metric.totalTime, 0) / data.performanceMetrics.length).toFixed(1)
                      : '0'
                    }h
                  </p>
                  <p className="text-sm text-gray-600">Avg Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}