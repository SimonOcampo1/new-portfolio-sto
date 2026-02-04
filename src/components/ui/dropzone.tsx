"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: FileList) => void;
  className?: string;
  label: string;
}

export function Dropzone({ accept, multiple, disabled, onFiles, className, label }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;
    onFiles(files);
  }, [disabled, onFiles]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-foreground/20 bg-background/70 px-4 py-6 text-center text-[0.7rem] uppercase tracking-[0.2em] text-foreground/60 transition",
        isDragging && "border-primary/70 bg-primary/10 text-foreground/80",
        disabled && "pointer-events-none opacity-60",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label={label}
    >
      <UploadCloud size={22} className="text-foreground/70" />
      <span>{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
        className="sr-only"
      />
    </div>
  );
}
