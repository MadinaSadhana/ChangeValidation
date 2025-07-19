import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  disabled?: boolean;
}

export default function FileUpload({ files, onFilesChange, disabled }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    // In a real implementation, you would upload files to a server
    // and get back file URLs or IDs. For now, we'll just simulate this.
    const newFiles = Array.from(selectedFiles).map(file => {
      // Simulate file upload and return a file identifier
      return `${file.name}_${Date.now()}`;
    });

    onFilesChange([...files, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileToRemove: string) => {
    onFilesChange(files.filter(file => file !== fileToRemove));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getFileName = (fileId: string) => {
    // Extract original filename from the simulated file ID
    return fileId.split('_').slice(0, -1).join('_');
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? triggerFileSelect : undefined}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <div className="text-sm text-gray-600">
          <span className="font-medium text-primary hover:text-blue-700">
            Upload a file
          </span>
          <span className="ml-1">or drag and drop</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{getFileName(file)}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file)}
                disabled={disabled}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
