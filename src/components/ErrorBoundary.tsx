import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, NonIdealState } from "@blueprintjs/core";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled error:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <NonIdealState
            icon="error"
            title="Something went wrong"
            description={this.state.error?.message ?? "An unexpected error occurred."}
            action={<Button intent="primary" text="Reload" onClick={() => window.location.reload()} />}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
