import React from 'react';

/**
 * Error Boundary - Captura erros de renderização no React 19
 * 
 * Documentação: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Atualiza estado para mostrar fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro (pode enviar para serviço de analytics)
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('📄 Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI customizada
      return (
        <div className="h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <h2 className="text-xl font-bold text-red-800 mb-4">
              ⚠️ Algo deu errado
            </h2>
            <p className="text-sm text-red-600 mb-4">
              Ocorreu um erro ao carregar este componente.
            </p>
            <details className="text-xs text-red-500 bg-red-50 p-3 rounded">
              <summary className="cursor-pointer font-semibold">
                Ver detalhes do erro
              </summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
