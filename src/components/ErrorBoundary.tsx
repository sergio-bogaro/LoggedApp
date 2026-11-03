import { Component, type ErrorInfo, type ReactNode } from "react";

import i18n from "@/i18n/i18n";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Última barreira da UI: um erro de render não deve deixar a tela em branco.
 * O botão recarrega a página, que é suficiente para o app local.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-serif text-step-4 font-medium">
          {i18n.t("errorBoundary.title", { ns: "common" })}
        </h1>
        <p className="max-w-prose text-step-1 text-muted-foreground">
          {this.state.message || i18n.t("errorBoundary.description", { ns: "common" })}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-control bg-primary px-3 py-1.5 text-step-1 text-primary-foreground"
        >
          {i18n.t("errorBoundary.reload", { ns: "common" })}
        </button>
      </div>
    );
  }
}
