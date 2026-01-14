/**
 * Luminous Paper Design: Clean, readable results with elegant actions
 * Focused on the extracted text with refined interactions
 */

import { useState } from "react";
import { Copy, Download, RotateCcw, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResultViewerProps {
  text: string;
  onReset: () => void;
}

export default function ResultViewer({ text, onReset }: ResultViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privascan-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully");
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Success header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Text extracted</h3>
          <p className="text-sm text-muted-foreground">
            {wordCount} words &middot; {charCount} characters
          </p>
        </div>
      </div>

      {/* Text output */}
      <div className="paper-card overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-3 bg-secondary/50 border-b border-border/50 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Extracted Text
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Text content */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <pre className="font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground">
            {text || "(No text detected in image)"}
          </pre>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCopy}
          className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy text
            </>
          )}
        </Button>

        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1 sm:flex-none gap-2 border-border hover:bg-secondary"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>

        <Button
          onClick={onReset}
          variant="ghost"
          className="flex-1 sm:flex-none gap-2 hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Scan another
        </Button>
      </div>
    </div>
  );
}
