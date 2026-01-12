import { useState, useRef } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label: string;
  accept?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}

export function FileUpload({ label, accept = "*", value, onChange, error, required }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onChange(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isImage = value?.type.startsWith('image/');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {isImage ? (
              <Image className="h-5 w-5 text-primary" />
            ) : (
              <FileText className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              {(value.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            error && "border-destructive"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className={cn("h-8 w-8 mb-2", isDragging ? "text-primary" : "text-muted-foreground")} />
          <p className="text-sm text-center">
            <span className="font-medium text-primary">Click to upload</span>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, PNG, JPG up to 5MB
          </p>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
