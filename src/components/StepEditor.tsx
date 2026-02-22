import { AutomationStep, ACTION_ICONS, ACTION_LABELS, ACTION_DESCRIPTIONS } from '@/lib/automation';
import { X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StepEditorProps {
  step: AutomationStep;
  index: number;
  onChange: (step: AutomationStep) => void;
  onRemove: () => void;
}

const inputCls =
  'bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary transition-colors';

export default function StepEditor({ step, index, onChange, onRemove }: StepEditorProps) {
  const set = (patch: Partial<AutomationStep>) => onChange({ ...step, ...patch });

  return (
    <div className="flex items-start gap-2 p-3 rounded bg-secondary/50 border border-border group">
      {/* Índice */}
      <span className="text-[10px] text-muted-foreground pt-1 w-4 text-center select-none">
        {index + 1}
      </span>

      {/* Conteúdo do passo */}
      <div className="flex-1 space-y-2 min-w-0">
        {/* Cabeçalho do tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-primary text-sm">{ACTION_ICONS[step.type]}</span>
          <span className="text-xs font-semibold text-foreground">{ACTION_LABELS[step.type]}</span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            — {ACTION_DESCRIPTIONS[step.type]}
          </span>
        </div>

        {/* Campos por tipo */}
        {(step.type === 'open' || step.type === 'script') && (
          <input
            className={`${inputCls} w-full`}
            value={step.path ?? ''}
            onChange={e => set({ path: e.target.value })}
            placeholder={
              step.type === 'open'
                ? 'C:\\Caminho\\para\\programa.exe'
                : 'C:\\Caminho\\para\\script.bat'
            }
          />
        )}

        {step.type === 'mouse' && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground">X:</label>
            <input
              type="number"
              className={`${inputCls} w-20`}
              value={step.x ?? 0}
              onChange={e => set({ x: Number(e.target.value) })}
            />
            <label className="text-[10px] text-muted-foreground">Y:</label>
            <input
              type="number"
              className={`${inputCls} w-20`}
              value={step.y ?? 0}
              onChange={e => set({ y: Number(e.target.value) })}
            />
          </div>
        )}

        {step.type === 'click' && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground">Botão:</label>
            <select
              className={`${inputCls} cursor-pointer`}
              value={step.button ?? 'left'}
              onChange={e => set({ button: e.target.value as 'left' | 'right' })}
            >
              <option value="left">Esquerdo</option>
              <option value="right">Direito</option>
            </select>
          </div>
        )}

        {step.type === 'write' && (
          <input
            className={`${inputCls} w-full`}
            value={step.text ?? ''}
            onChange={e => set({ text: e.target.value })}
            placeholder="Texto que será digitado..."
          />
        )}

        {step.type === 'delay' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={`${inputCls} w-24`}
              value={step.ms ?? 1000}
              min={0}
              onChange={e => set({ ms: Number(e.target.value) })}
            />
            <span className="text-[10px] text-muted-foreground">ms (1000 = 1 segundo)</span>
          </div>
        )}

        {step.type === 'loop' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Repetir:</span>
            <input
              type="number"
              className={`${inputCls} w-16`}
              value={step.count ?? 1}
              min={1}
              onChange={e => set({ count: Number(e.target.value) })}
            />
            <span className="text-[10px] text-muted-foreground">vezes</span>
            <span className="text-[10px] text-muted-foreground ml-2">
              (sub-passos: {step.steps?.length ?? 0})
            </span>
          </div>
        )}
      </div>

      {/* Remover */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <X size={13} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Remover esta ação</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
