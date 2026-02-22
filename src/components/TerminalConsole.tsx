import { useEffect, useRef, useState } from 'react';
import { LogEntry } from '@/lib/automation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface TerminalConsoleProps {
  logs: LogEntry[];
  isRunning: boolean;
  onAbort: () => void;
  onClear: () => void;
  onCommand: (cmd: string) => void;
}

const LEVEL_COLORS: Record<string, string> = {
  INFO: 'text-foreground',
  SUCCESS: 'text-terminal-green',
  ERROR: 'text-terminal-red',
  WARN: 'text-terminal-amber',
  SYSTEM: 'text-terminal-cyan',
};

export default function TerminalConsole({ logs, isRunning, onAbort, onClear, onCommand }: TerminalConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = inputRef.current?.value.trim();
      if (val) {
        onCommand(val);
        if (inputRef.current) inputRef.current.value = '';
      }
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full bg-terminal-bg rounded-md border border-border scanline">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-amber" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
            <span className="ml-3 text-xs text-muted-foreground">DevEnv Console</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowHelp(v => !v)}
                  className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle size={13} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Mostrar/ocultar guia de comandos</p>
              </TooltipContent>
            </Tooltip>
            {isRunning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={onAbort} className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-terminal-red hover:bg-destructive/30 transition-colors">
                    ABORT
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Parar a automação em execução imediatamente</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onClear} className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  CLEAR
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Limpar todos os logs do console</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Help guide */}
        {showHelp && (
          <div className="px-4 py-3 border-b border-border bg-primary/5 space-y-1.5">
            <p className="text-[11px] font-semibold text-primary">📖 Guia de Comandos</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div><span className="text-primary font-mono">help</span> <span className="text-muted-foreground">— Lista todos os comandos</span></div>
              <div><span className="text-primary font-mono">list</span> <span className="text-muted-foreground">— Mostra suas automações</span></div>
              <div><span className="text-primary font-mono">run &lt;nome&gt;</span> <span className="text-muted-foreground">— Executa uma automação</span></div>
              <div><span className="text-primary font-mono">clear</span> <span className="text-muted-foreground">— Limpa o console</span></div>
              <div><span className="text-primary font-mono">version</span> <span className="text-muted-foreground">— Versão do sistema</span></div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">💡 Dica: Crie automações no painel lateral e execute-as aqui pelo nome.</p>
          </div>
        )}

        {/* Log area */}
        <div className="flex-1 overflow-y-auto p-4 text-[13px] leading-relaxed space-y-0.5">
          {logs.length === 0 && !isRunning && (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground text-xs">Console vazio. Os logs de execução aparecerão aqui.</p>
              <p className="text-[10px] text-muted-foreground">
                Digite <span className="text-primary font-mono">help</span> abaixo para ver os comandos disponíveis
              </p>
            </div>
          )}
          {logs.map(log => (
            <div key={log.id} className="flex gap-2">
              <span className="text-muted-foreground shrink-0">{formatTime(log.timestamp)}</span>
              <span className={`shrink-0 font-semibold ${LEVEL_COLORS[log.level]}`}>[{log.level}]</span>
              <span className={LEVEL_COLORS[log.level]}>{log.message}</span>
            </div>
          ))}
          {isRunning && (
            <div className="flex gap-2 text-terminal-amber animate-pulse-glow">
              <span className="text-muted-foreground">{formatTime(Date.now())}</span>
              <span>[EXEC]</span>
              <span>Processing...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center px-4 py-2 border-t border-border bg-secondary/30">
          <span className="text-primary text-glow mr-2 text-sm font-semibold">DevEnv &gt;</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground caret-primary"
            placeholder="Digite um comando (ex: help)"
            onKeyDown={handleKey}
            disabled={isRunning}
          />
          <span className="w-2 h-4 bg-primary cursor-blink ml-1" />
        </div>
      </div>
    </TooltipProvider>
  );
}
