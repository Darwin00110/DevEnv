import { Automation } from '@/lib/automation';
import { Play, Pencil, Trash2, Download, Plus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskPanelProps {
  automations: Automation[];
  isRunning: boolean;
  onExecute: (auto: Automation) => void;
  onEdit: (auto: Automation) => void;
  onDelete: (id: string) => void;
  onExport: (auto: Automation) => void;
  onNew: () => void;
}

export default function TaskPanel({ automations, isRunning, onExecute, onEdit, onDelete, onExport, onNew }: TaskPanelProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Automações</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={11} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs max-w-[200px]">Automações são sequências de ações que podem ser executadas automaticamente, como abrir programas, clicar e digitar textos.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onNew}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus size={12} />
                Nova
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Criar uma nova automação com sequência de ações</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {automations.length === 0 && (
            <div className="text-center py-8 px-3 space-y-2">
              <p className="text-muted-foreground text-xs">Nenhuma automação criada.</p>
              <p className="text-[10px] text-muted-foreground">
                Clique em <span className="text-primary font-semibold">"Nova"</span> acima para criar sua primeira sequência de ações automatizadas.
              </p>
            </div>
          )}
          {automations.map(auto => (
            <div
              key={auto.id}
              className="group flex items-center justify-between p-3 rounded bg-secondary/40 hover:bg-secondary/70 border border-transparent hover:border-border transition-all"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{auto.name}</div>
                <div className="text-[10px] text-muted-foreground">{auto.steps.length} ação{auto.steps.length !== 1 ? 'ões' : ''}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onExecute(auto)}
                      disabled={isRunning}
                      className="p-1.5 rounded hover:bg-primary/20 text-primary disabled:opacity-30 transition-colors"
                    >
                      <Play size={13} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Executar esta automação</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => {
                      onEdit(auto)
                    }} className="p-1.5 rounded hover:bg-primary/20 text-foreground transition-colors">
                      <Pencil size={13} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Editar ações desta automação</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onExport(auto)} className="p-1.5 rounded hover:bg-primary/20 text-foreground transition-colors">
                      <Download size={13} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Exportar como arquivo JSON</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onDelete(auto.id)} className="p-1.5 rounded hover:bg-destructive/20 text-terminal-red transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Excluir esta automação permanentemente</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
