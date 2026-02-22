import { useState } from 'react';
import { Automation, AutomationStep, ActionType, ACTION_LABELS, ACTION_ICONS, createId, createStep } from '@/lib/automation';
import { X, Plus, GripVertical, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SequenceEditorProps {
  automation: Automation | null;
  onSave: (auto: Automation) => void;
  onClose: () => void;
}

const ACTION_TYPES: ActionType[] = ['open', 'script', 'mouse', 'click', 'write', 'delay', 'loop'];

const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  open: 'Abre um programa (.exe) no computador',
  script: 'Executa um script (.bat, .ps1, .py)',
  mouse: 'Move o cursor para uma posição X, Y na tela',
  click: 'Realiza um clique esquerdo ou direito',
  write: 'Digita um texto automaticamente',
  delay: 'Aguarda um tempo em milissegundos antes de continuar',
  loop: 'Repete as próximas ações um número de vezes',
};

function StepEditor({ step, onChange, onRemove, index }: { step: AutomationStep; onChange: (s: AutomationStep) => void; onRemove: () => void; index: number }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded bg-secondary/50 border border-border group">
      <div className="flex flex-col items-center gap-1 pt-1">
        <GripVertical size={12} className="text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{index + 1}</span>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm">{ACTION_ICONS[step.type]}</span>
          <span className="text-xs font-semibold text-foreground">{ACTION_LABELS[step.type]}</span>
          <span className="text-[10px] text-muted-foreground">— {ACTION_DESCRIPTIONS[step.type]}</span>
        </div>

        {(step.type === 'open' || step.type === 'script') && (
          <div className='flex flex-direction-col gap-1'>
            <input
              value={step.path || ''}
              onChange={e => onChange({ ...step, path: e.target.value })}
              placeholder={step.type === 'open' ? 'Ex: C:\\Program Files\\app.exe' : 'Ex: C:\\scripts\\build.bat'}
              className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <button className='w-15 bg-background border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors' onClick={() => {
              window.electronAPI.configTeste()
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="#fff" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h5.175q.4 0 .763.15t.637.425L12 6h8q.825 0 1.413.588T22 8v10q0 .825-.587 1.413T20 20zm0-2h16V8h-8.825l-2-2H4zm0 0V6z"/></svg>
            </button>
          </div>
        )}

        {step.type === 'mouse' && (
          <div className="flex gap-2 items-center">
            <span className="text-[10px] text-muted-foreground">Posição:</span>
            <input type="number" value={step.x || 0} onChange={e => onChange({ ...step, x: +e.target.value })} className="w-20 bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary" placeholder="X" />
            <span className="text-[10px] text-muted-foreground">x</span>
            <input type="number" value={step.y || 0} onChange={e => onChange({ ...step, y: +e.target.value })} className="w-20 bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary" placeholder="Y" />
            <span className="text-[10px] text-muted-foreground">pixels</span>
          </div>
        )}

        {step.type === 'click' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Botão:</span>
            <select value={step.button || 'left'} onChange={e => onChange({ ...step, button: e.target.value as 'left' | 'right' })} className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary">
              <option value="left">Esquerdo (principal)</option>
              <option value="right">Direito (menu contexto)</option>
            </select>
          </div>
        )}

        {step.type === 'write' && (
          <input value={step.text || ''} onChange={e => onChange({ ...step, text: e.target.value })} placeholder="Ex: npm run dev" className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
        )}

        {step.type === 'delay' && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Aguardar:</span>
            <input type="number" value={step.ms || 1000} onChange={e => onChange({ ...step, ms: +e.target.value })} className="w-24 bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary" />
            <span className="text-[10px] text-muted-foreground">ms (1000 = 1 segundo)</span>
          </div>
        )}

        {step.type === 'loop' && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Repetir:</span>
            <input type="number" value={step.count || 1} onChange={e => onChange({ ...step, count: +e.target.value })} className="w-16 bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary" />
            <span className="text-[10px] text-muted-foreground">vezes</span>
          </div>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-terminal-red transition-colors">
            <X size={13} />
          </button>
        </TooltipTrigger>
        <TooltipContent><p className="text-xs">Remover esta ação</p></TooltipContent>
      </Tooltip>
    </div>
  );
}

export default function SequenceEditor({ automation, onSave, onClose }: SequenceEditorProps) {
  const [name, setName] = useState(automation?.name || '');
  const [steps, setSteps] = useState<AutomationStep[]>(automation?.steps || []);

  const addStep = (type: ActionType) => {
    setSteps(prev => [...prev, createStep(type)]);
  };

  const updateStep = (index: number, step: AutomationStep) => {
    setSteps(prev => prev.map((s, i) => i === index ? step : s));
  };

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= steps.length) return;
    setSteps(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: automation?.id || createId(),
      name: name.trim(),
      steps,
      createdAt: automation?.createdAt || Date.now(),
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="w-full max-w-xl max-h-[85vh] flex flex-col bg-card border border-border rounded-md shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {automation ? 'Editar Automação' : 'Nova Automação'}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Monte uma sequência de ações que serão executadas automaticamente na ordem abaixo.
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Name */}
          <div className="px-4 pt-3">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome da Automação</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Iniciar ambiente de desenvolvimento"
              className="w-full mt-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Dê um nome descritivo para identificar esta automação facilmente.</p>
          </div>

          {/* Add step buttons */}
          <div className="px-4 pt-3">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Adicionar Ação</label>
            <p className="text-[10px] text-muted-foreground mb-1">Clique em uma ação para adicioná-la à sequência:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACTION_TYPES.map(type => (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => addStep(type)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-secondary/60 text-secondary-foreground hover:bg-primary/15 hover:text-primary border border-transparent hover:border-primary/30 transition-all"
                    >
                      <span>{ACTION_ICONS[type]}</span>
                      {ACTION_LABELS[type]}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{ACTION_DESCRIPTIONS[type]}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Steps list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {steps.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
                <p>Nenhuma ação adicionada ainda.</p>
                <p className="text-[10px]">Use os botões acima para montar sua sequência de automação.</p>
              </div>
            )}
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-start gap-1">
                <div className="flex flex-col gap-0.5 pt-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => moveStep(i, -1)} className="p-0.5 text-muted-foreground hover:text-foreground" disabled={i === 0}>
                        <ChevronUp size={11} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Mover para cima</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => moveStep(i, 1)} className="p-0.5 text-muted-foreground hover:text-foreground" disabled={i === steps.length - 1}>
                        <ChevronDown size={11} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Mover para baixo</p></TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex-1">
                  <StepEditor step={step} onChange={s => updateStep(i, s)} onRemove={() => removeStep(i)} index={i} />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              {steps.length > 0 ? `${steps.length} ação${steps.length !== 1 ? 'ões' : ''} na sequência` : ''}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 transition-colors">
                Cancelar
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="px-4 py-1.5 rounded text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    Salvar
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{!name.trim() ? 'Defina um nome para salvar' : 'Salvar automação e fechar editor'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
