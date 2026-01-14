/**
 * Luminous Paper Design: Elegant drop zone with subtle animations
 * Warm interactions with depth and polish
 */

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image, Sparkles } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUploader({ onFileSelect, isProcessing }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isProcessing) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, isProcessing]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        animated-border overflow-hidden transition-all duration-300 ease-out
        ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}
      `}
    >
      <input {...getInputProps()} />
      <div
        className={`
          relative p-12 lg:p-16 transition-all duration-300 ease-out
          ${isDragActive ? "bg-primary/5" : "bg-card"}
        `}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/20 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-lg" />

        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Icon container */}
          <div
            className={`
              relative w-20 h-20 rounded-2xl flex items-center justify-center
              transition-all duration-300 ease-out
              ${isDragActive
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-secondary text-muted-foreground"
              }
            `}
          >
            {isDragActive ? (
              <Sparkles className="w-8 h-8 animate-pulse" />
            ) : (
              <Upload className="w-8 h-8" />
            )}

            {/* Floating decoration */}
            <div
              className={`
                absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent
                flex items-center justify-center transition-all duration-300
                ${isDragActive ? "scale-100 opacity-100" : "scale-75 opacity-0"}
              `}
            >
              <Image className="w-3 h-3 text-accent-foreground" />
            </div>
          </div>

          {/* Text content */}
          <div className="space-y-2">
            <p className={`
              text-xl font-medium transition-colors duration-300
              ${isDragActive ? "text-primary" : "text-foreground"}
            `}>
              {isDragActive ? "Drop to scan" : "Drop an image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary font-medium">browse</span> to choose a file
            </p>
          </div>

          {/* Supported formats */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["PNG", "JPG", "GIF", "BMP", "WebP"].map((format) => (
              <span
                key={format}
                className="px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded"
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* Drag active overlay effect */}
        {isDragActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-dashed border-primary rounded-xl animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
