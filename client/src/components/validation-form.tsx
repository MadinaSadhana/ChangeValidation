import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import FileUpload from "./file-upload";

const validationSchema = z.object({
  preChangeStatus: z.enum(["pending", "completed", "not_applicable"]).optional(),
  postChangeStatus: z.enum(["pending", "completed", "not_applicable"]).optional(),
  preChangeComments: z.string().optional(),
  postChangeComments: z.string().optional(),
  preChangeAttachments: z.array(z.string()).optional(),
  postChangeAttachments: z.array(z.string()).optional(),
});

type ValidationData = z.infer<typeof validationSchema>;

interface ValidationFormProps {
  assignment: any;
  onSuccess: () => void;
}

export default function ValidationForm({ assignment, onSuccess }: ValidationFormProps) {
  const { toast } = useToast();
  const [preChangeFiles, setPreChangeFiles] = useState<string[]>(assignment.preChangeAttachments || []);
  const [postChangeFiles, setPostChangeFiles] = useState<string[]>(assignment.postChangeAttachments || []);

  const form = useForm<ValidationData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      preChangeStatus: assignment.preChangeStatus,
      postChangeStatus: assignment.postChangeStatus,
      preChangeComments: assignment.preChangeComments || "",
      postChangeComments: assignment.postChangeComments || "",
      preChangeAttachments: assignment.preChangeAttachments || [],
      postChangeAttachments: assignment.postChangeAttachments || [],
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ValidationData) => {
      return apiRequest(
        "PATCH",
        `/api/change-requests/${assignment.changeRequestId}/applications/${assignment.applicationId}/validation`,
        {
          ...data,
          preChangeAttachments: preChangeFiles,
          postChangeAttachments: postChangeFiles,
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Validation status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/application-owner"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update validation status",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ValidationData) => {
    updateMutation.mutate(data);
  };

  const getChangeTypeBadge = (type: string) => {
    const variants = {
      P1: "destructive",
      P2: "default",
      Emergency: "destructive",
      Standard: "secondary",
    };
    return variants[type as keyof typeof variants] || "secondary";
  };

  const isChangeWindowActive = () => {
    const now = new Date();
    const startTime = new Date(assignment.changeRequest.startDateTime);
    const endTime = new Date(assignment.changeRequest.endDateTime);
    return now >= startTime && now <= endTime;
  };

  const isChangeWindowPassed = () => {
    const now = new Date();
    const endTime = new Date(assignment.changeRequest.endDateTime);
    return now > endTime;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {assignment.changeRequest.changeId} - {assignment.changeRequest.title}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <Badge variant={getChangeTypeBadge(assignment.changeRequest.changeType)}>
                {assignment.changeRequest.changeType}
              </Badge>
              <span className="text-sm text-gray-500">
                {format(new Date(assignment.changeRequest.startDateTime), "MMM dd, yyyy HH:mm")} - 
                {format(new Date(assignment.changeRequest.endDateTime), "HH:mm")}
              </span>
            </div>
          </div>
          <div className="mt-3 sm:mt-0">
            <span className="text-sm text-gray-500">Application: {assignment.application.name}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pre-Change Validation */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Pre-Change Validation</h4>

                <FormField
                  control={form.control}
                  name="preChangeStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="not_applicable">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preChangeComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Add your observations..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Attachments</FormLabel>
                  <FileUpload
                    files={preChangeFiles}
                    onFilesChange={setPreChangeFiles}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>

              {/* Post-Change Validation */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Post-Change Validation</h4>

                {!isChangeWindowPassed() ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg mb-2">
                      {isChangeWindowActive() ? "Change in Progress" : "Change Not Started"}
                    </div>
                    <p>Post-change validation will be available after the change window.</p>
                  </div>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="postChangeStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="not_applicable">Not Applicable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postChangeComments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comments</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Add your observations..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Attachments</FormLabel>
                      <FileUpload
                        files={postChangeFiles}
                        onFilesChange={setPostChangeFiles}
                        disabled={updateMutation.isPending}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-blue-700"
              >
                {updateMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
