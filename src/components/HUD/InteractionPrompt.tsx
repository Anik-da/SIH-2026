import { ScanLine } from 'lucide-react';

interface InteractionPromptProps {
  message: string;
  visible: boolean;
}

export function InteractionPrompt({ message, visible }: InteractionPromptProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-[58%] z-10 -translate-x-1/2">
      <div className="flex items-center gap-2.5 rounded-lg border border-cyan-400/40 bg-slate-900/85 px-4 py-2.5 backdrop-blur-md">
        <ScanLine className="h-4 w-4 text-cyan-400" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div>
          <div className="text-[10px] tracking-wider text-cyan-400">PROPERTY DETECTED</div>
          <div className="text-sm font-medium text-slate-200">{message}</div>
        </div>
        <kbd className="ml-1 rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">E</kbd>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
