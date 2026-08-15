import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
          <div className="max-w-md rounded-[28px] border border-mithai-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-maroon-900">Something went wrong</h1>
            <p className="mt-3 text-sm text-stone-600">The app hit an unexpected issue. Please refresh and try again.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
