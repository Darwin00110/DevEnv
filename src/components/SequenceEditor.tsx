import { useState, useRef } from 'react';
import {
  Automation,
  AutomationStep,
  ActionType,
  ACTION_LABELS,
  ACTION_ICONS,
  ACTION_DESCRIPTIONS,
  ACTION_TYPES,
  createId,
  createStep,
  parseAutomationJson,
} from '@/lib/automation';
import { X, ChevronUp, ChevronDown, Upload } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StepEditor from '@/components/StepEditor';

interface SequenceEditorProps {
  automation: Automation | null;
  onSave: (auto: Automation) => void;
  onClose: () => void;
}

export default function SequenceEditor({ automation, onSave, onClose }: SequenceEditorProps) {
  const [name, setName] = useState(automation?.name ?? '');
  const [steps, setSteps] = useState<AutomationStep[]>(automation?.steps ?? []);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Manipulação de steps ─────────────────────────────────────────────────

  const addStep = (type: ActionType) => {
    setSteps(prev => [...prev, createStep(type)]);
  };

  const updateStep = (index: number, updated: AutomationStep) => {
    setSteps(prev => prev.map((s, i) => (i === index ? updated : s)));
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

  // ── Salvar ───────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!name.trim()) {
      setError('Nome da automação é obrigatório.');
      return;
    }
    const now = Date.now();
    const automationToSave: Automation = {
      id: automation?.id ?? createId(),
      name: name.trim(),
      steps,
      createdAt: automation?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(automationToSave);
    steps.forEach(data => {
      console.log(data)
      console.log(automationToSave.id);
      console.log(automationToSave.name);
      console.log(automationToSave.createdAt);
      window.electronAPI.SaveConfig({
        type: data.type,
        name: automationToSave.name,
        id: automationToSave.id,
        path: data.path,
        x: data.x,
        y: data.y,
        button: data.button,
        text: data.text,
        time: data.ms,
        LoopTime: data.count
      });
    });
  };

  // ── Importar JSON ────────────────────────────────────────────────────────

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed = parseAutomationJson(ev.target?.result as string);
      if (!parsed) {
        setError('JSON inválido. Certifique-se de usar um arquivo exportado por este app.');
        return;
      }
      setName(parsed.name);
      setSteps(parsed.steps);
      setError('');
    };
    reader.readAsText(file);
    // reset input para permitir reimportar o mesmo arquivo
    e.target.value = '';
  };

  return (
    <TooltipProvider delayDuration={300}>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-xl max-h-[88vh] flex flex-col bg-card border border-border rounded-md shadow-2xl overflow-hidden">

          {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {automation ? 'Editar Automação' : 'Nova Automação'}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Monte a sequência de ações que serão executadas em ordem.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Importar JSON */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Importar de JSON</p>
                </TooltipContent>
              </Tooltip>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJson}
              />
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Nome ──────────────────────────────────────────────────────── */}
          <div className="px-4 py-3 border-b border-border">
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Nome da automação..."
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
            {error && (
              <p className="text-[10px] text-destructive mt-1">{error}</p>
            )}
          </div>

          {/* ── Adicionar ação ────────────────────────────────────────────── */}
          <div className="px-4 py-2 border-b border-border">
            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">
              Adicionar ação
            </p>
            <div className="flex flex-wrap gap-1">
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

          {/* ── Lista de steps ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs space-y-1">
                <p>Nenhuma ação adicionada ainda.</p>
                <p className="text-[10px]">Use os botões acima para montar a sequência.</p>
              </div>
            ) : (
              steps.map((step, i) => (
                <div key={step.id} className="flex items-start gap-1">
                  {/* Reordenar */}
                  <div className="flex flex-col gap-0.5 pt-3 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => moveStep(i, -1)}
                          disabled={i === 0}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronUp size={11} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">Mover para cima</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => moveStep(i, 1)}
                          disabled={i === steps.length - 1}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronDown size={11} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">Mover para baixo</p></TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Editor do passo */}
                  <div className="flex-1 min-w-0">
                    <StepEditor
                      step={step}
                      index={i}
                      onChange={updated => updateStep(i, updated)}
                      onRemove={() => removeStep(i)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Rodapé ───────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              {steps.length > 0
                ? `${steps.length} ação${steps.length !== 1 ? 'ões' : ''} na sequência`
                : 'Sequência vazia'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
