/**
 * Luminous Paper Design: Elegant, warm, trustworthy
 * Clean layouts with subtle depth and sophisticated typography
 */

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import OCRProcessor from "@/components/OCRProcessor";
import ResultViewer from "@/components/ResultViewer";
import { Shield, ScanText, Zap, Lock } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedText("");
    setError("");
    setIsProcessing(true);
  };

  const handleComplete = (text: string) => {
    setExtractedText(text);
    setIsProcessing(false);
  };

  const handleError = (err: string) => {
    setError(err);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedText("");
    setError("");
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Subtle background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.45 0.12 175 / 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, oklch(0.60 0.14 35 / 0.05), transparent)
          `,
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ScanText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl tracking-tight font-semibold">
              Priva<span className="text-primary">Scan</span>
            </span>
          </div>
          <div className="privacy-badge">
            <Lock className="w-4 h-4" />
            <span>100% Private</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Headline */}
            <div className="space-y-4 opacity-0 animate-fade-up">
              <h1 className="text-5xl lg:text-7xl tracking-tight">
                Extract text from images,{" "}
                <span className="italic text-primary">privately</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Your images never leave your device. Powered by WebAssembly for
                lightning-fast, completely local text extraction.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 opacity-0 animate-fade-up animate-delay-200">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span>No server uploads</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm">
                <Zap className="w-4 h-4 text-accent" />
                <span>WebAssembly powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm">
                <Lock className="w-4 h-4 text-primary" />
                <span>Works offline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 flex-1 pb-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {/* Upload area */}
            {!selectedFile && (
              <div className="opacity-0 animate-fade-up animate-delay-300">
                <FileUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
              </div>
            )}

            {/* Processing */}
            {selectedFile && isProcessing && (
              <OCRProcessor file={selectedFile} onComplete={handleComplete} onError={handleError} />
            )}

            {/* Results */}
            {extractedText && !isProcessing && (
              <ResultViewer text={extractedText} onReset={handleReset} />
            )}

            {/* Error - sanitized to not expose internal details */}
            {error && (
              <div className="paper-card p-6 border-l-4 border-destructive">
                <p className="font-medium text-destructive mb-1">Processing failed</p>
                <p className="text-sm text-muted-foreground">
                  Unable to process the image. Please try a different image or check that the file is a valid image format.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works - only show when not processing */}
      {!selectedFile && !extractedText && (
        <section className="relative z-10 py-16 bg-secondary/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl text-center mb-12 opacity-0 animate-fade-up">
                How it works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Drop your image",
                    description:
                      "Drag and drop any image with text. Supports PNG, JPG, GIF, BMP, and WebP.",
                  },
                  {
                    step: "02",
                    title: "Local processing",
                    description:
                      "Tesseract.js runs entirely in your browser using WebAssembly. No data leaves your device.",
                  },
                  {
                    step: "03",
                    title: "Copy or download",
                    description:
                      "Get your extracted text instantly. Copy to clipboard or download as a text file.",
                  },
                ].map((item, i) => (
                  <div
                    key={item.step}
                    className={`opacity-0 animate-fade-up animate-delay-${(i + 1) * 100}`}
                  >
                    <div className="paper-card p-6 h-full float-up">
                      <span className="text-4xl font-mono text-primary/30 font-medium">
                        {item.step}
                      </span>
                      <h3 className="text-xl mt-4 mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 bg-background/80">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              PrivaScan &copy; {new Date().getFullYear()} &middot; Privacy-first OCR
            </p>
            <p className="text-xs">
              Built with Tesseract.js &middot; No data collection &middot; Open source
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
