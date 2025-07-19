import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Users, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-primary">Change Request Management</h1>
            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Streamline Your Change Management Process
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Manage Pre and Post Change validations efficiently with automated workflows, 
            real-time tracking, and comprehensive reporting.
          </p>
          <div className="mt-8">
            <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Change Requests</CardTitle>
              <CardDescription>
                Create and manage change requests with auto-generated IDs and comprehensive tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-success mb-2" />
              <CardTitle>Validation Tracking</CardTitle>
              <CardDescription>
                Monitor Pre and Post Change validation statuses in real-time across all applications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-warning mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure access for Change Managers, Application Owners, and Administrators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-error mb-2" />
              <CardTitle>Automated Workflows</CardTitle>
              <CardDescription>
                Reduce manual effort with automated notifications and escalation workflows
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Streamlined Process</h3>
                    <p className="text-gray-600">Centralized platform eliminates manual communication and tracking</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Faster Validation</h3>
                    <p className="text-gray-600">Automated notifications and real-time updates reduce validation time</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Reduced Errors</h3>
                    <p className="text-gray-600">Standardized workflows minimize human error and improve accuracy</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Historical Data</h3>
                    <p className="text-gray-600">Comprehensive validation history enables data-driven optimization</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="mb-6">Join thousands of teams already using our platform to streamline their change management process.</p>
                <Button onClick={handleLogin} size="lg" variant="secondary">
                  Sign In Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
