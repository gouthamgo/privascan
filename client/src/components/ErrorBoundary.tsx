import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Only show detailed errors in development
const isDev = import.meta.env.DEV;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production, you could send this to an error tracking service
    // For now, just log to console in development
    if (isDev) {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <h2 className="text-2xl mb-3">Something went wrong</h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              An unexpected error occurred while processing your request.
              Please try reloading the page.
            </p>

            {/* Only show error details in development */}
            {isDev && this.state.error && (
              <div className="w-full p-4 rounded-lg bg-muted/50 border border-border mb-6 text-left">
                <p className="text-xs text-muted-foreground mb-2 font-mono uppercase">
                  Development only
                </p>
                <pre className="text-sm text-destructive whitespace-pre-wrap break-words font-mono">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
