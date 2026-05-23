"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  onFileSelect,
  accept = ".pdf",
  label = "Upload your resume (PDF only)",
  maxSizeMB = 10,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    
    
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (accept && !accept.split(",").map(a => a.trim().toLowerCase()).includes(extension)) {
      setError(`Invalid file type. Please upload a ${accept} file.`);
      return false;
    }

    
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const triggerInput = () => {
    inputRef.current?.click();
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInput}
        className={`
          relative w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-premium
          ${dragActive 
            ? "border-primary bg-primary/5 glow-purple" 
            : selectedFile 
              ? "border-accent/40 bg-accent/5 hover:bg-accent/10" 
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        <div className="flex flex-col items-center gap-3">
          {selectedFile ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent flex items-center justify-center text-3xl animate-bounce">
                📄
              </div>
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 transition-premium"
              >
                Remove File
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl">
                ☁️
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-muted mt-1">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-[10px] text-muted/60 mt-2">
                  Max file size {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-danger font-medium mt-2 flex items-center gap-1.5 animate-pulse">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
