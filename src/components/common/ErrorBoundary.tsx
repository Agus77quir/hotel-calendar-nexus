
import React from 'react';
import { Button } from '@/components/ui/button';

type ErrorBoundaryState = {
  hasError: boolean;
  error?: unknown;
};

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <h1 className="text-lg font-semibold">Ha ocurrido un error inesperado</h1>
            <p className="text-muted-foreground text-sm">
              Por favor, intenta recargar la página. Si el problema persiste, contáctanos.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={this.handleReload} className="bg-primary text-primary-foreground">
                Recargar
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;
