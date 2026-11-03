import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary global y modular para la aplicación.
 * Previene pantallas en blanco ante excepciones inesperadas de renderizado
 * y provee una interfaz accesible con opción de reintento inmediato.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main
          role="alert"
          aria-live="assertive"
          className="min-h-[60vh] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div
              aria-hidden="true"
              className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto text-2xl"
            >
              ⚠️
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-bold text-text-primary">
                Algo no salió como esperábamos
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                Ocurrió un error inesperado al procesar esta vista. Puedes reintentar la acción o volver a la página de inicio.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-background/80 border border-border/80 rounded-xl text-left">
                <p className="text-xs font-mono text-red-400 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-accent flex-1 !py-2.5 text-sm font-semibold justify-center min-h-[44px]"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-4 rounded-pill border border-border bg-surface text-text-secondary hover:text-white hover:border-accent transition text-sm font-semibold text-center min-h-[44px]"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

