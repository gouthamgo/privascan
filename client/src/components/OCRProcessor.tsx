/**
 * Luminous Paper Design: Elegant processing state with smooth animations
 * Clear progress indication with refined visual feedback
 */

import { useEffect, useRef, useState } from "react";
import Tesseract, { createWorker } from "tesseract.js";
import { Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { preprocessImage, canvasToBlob, cleanOCRText } from "@/lib/ocrUtils";

interface OCRProcessorProps {
  file: File | null;
  onComplete: (text: string) => void;
  onError: (error: string) => void;
}

export default function OCRProcessor({ file, onComplete, onError }: OCRProcessorProps) {
  const [status, setStatus] = useState<string>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [processingStep, setProcessingStep] = useState<string>("");
  const workerRef = useRef<Tesseract.Worker | null>(null);

  useEffect(() => {
    if (!file) return;

    const processImage = async () => {
      try {
        setStatus("initializing");
        setProgress(0);
        setProcessingStep("Preparing your image...");

        // Step 1: Preprocess image for better OCR
        const preprocessedCanvas = await preprocessImage(file);
        const preprocessedBlob = await canvasToBlob(preprocessedCanvas);
        setProgress(25);
        setProcessingStep("Loading OCR engine...");

        // Step 2: Create worker
        const worker = await createWorker("eng", 1, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setStatus("scanning");
              setProgress(Math.round(25 + m.progress * 75));
              setProcessingStep("Extracting text...");
            } else if (m.status === "loading tesseract core") {
              setStatus("loading");
              setProgress(Math.round(25 + m.progress * 25));
              setProcessingStep("Loading WebAssembly core...");
            }
          },
        });

        workerRef.current = worker;

        // Step 3: Perform OCR on preprocessed image
        const {
          data: { text },
        } = await worker.recognize(preprocessedBlob);

        // Step 4: Clean extracted text
        setProcessingStep("Cleaning up results...");
        const cleanedText = cleanOCRText(text);

        setStatus("complete");
        setProgress(100);
        onComplete(cleanedText);

        // Cleanup
        await worker.terminate();
        workerRef.current = null;
      } catch (err) {
        setStatus("error");
        onError(err instanceof Error ? err.message : "OCR processing failed");
        if (workerRef.current) {
          await workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    };

    processImage();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [file, onComplete, onError]);

  if (!file || status === "idle") return null;

  const statusConfig = {
    initializing: { label: "Initializing", color: "text-muted-foreground" },
    loading: { label: "Loading Engine", color: "text-primary" },
    scanning: { label: "Scanning", color: "text-primary" },
    complete: { label: "Complete", color: "text-primary" },
    error: { label: "Error", color: "text-destructive" },
  };

  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.initializing;

  return (
    <div className="paper-card overflow-hidden">
      <div className="p-8 space-y-6">
        {/* Status header */}
        <div className="flex items-center gap-4">
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${status === "error" ? "bg-destructive/10" : status === "complete" ? "bg-primary/10" : "bg-secondary"}
            `}
          >
            {status === "error" ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : status === "complete" ? (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            ) : (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            )}
          </div>
          <div>
            <h3 className={`text-lg font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {processingStep}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {status !== "complete" && status !== "error" && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono font-medium text-primary">{progress}%</span>
            </div>

            {/* Main progress bar */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full progress-shimmer rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between">
              {["Prepare", "Load", "Scan", "Clean"].map((step, i) => {
                const stepProgress = (i + 1) * 25;
                const isActive = progress >= stepProgress - 25 && progress < stepProgress;
                const isComplete = progress >= stepProgress;

                return (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div
                      className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${isComplete ? "bg-primary" : isActive ? "bg-primary/50 animate-pulse" : "bg-muted"}
                      `}
                    />
                    <span
                      className={`
                        text-xs transition-colors duration-300
                        ${isComplete ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}
                      `}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Privacy notice footer */}
      <div className="px-8 py-4 bg-secondary/50 border-t border-border/50">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
          <p>
            <span className="font-medium text-foreground">Processing locally</span>
            {" "}&mdash; Your image stays on your device. No data is uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
}
