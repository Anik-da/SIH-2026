import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 text-white font-sans select-none">
          <div className="max-w-md w-full rounded-2xl border border-red-500/40 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h2 className="text-lg font-bold tracking-tight">3D Cadastre System Recovered</h2>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              The 3D WebGL engine intercepted an unexpected rendering event. All cadastral data and state remain safe.
            </p>
            {this.state.error && (
              <pre className="text-[11px] bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-red-300 font-mono overflow-auto max-h-32 mb-5">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 active:scale-95 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Resume 3D Scene</span>
              </button>
              <button
                onClick={this.handleReload}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
