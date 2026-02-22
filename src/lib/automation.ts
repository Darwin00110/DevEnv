// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ActionType = 'open' | 'script' | 'mouse' | 'click' | 'write' | 'delay' | 'loop';

export type LogLevel = 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' | 'SYSTEM';

export interface AutomationStep {
  id: string;
  type: ActionType;
  // open / script
  path?: string;
  // mouse
  x?: number;
  y?: number;
  // click
  button?: 'left' | 'right';
  // write
  text?: string;
  // delay
  ms?: number;
  // loop
  count?: number;
  steps?: AutomationStep[];
}

export interface Automation {
  id: string;
  name: string;
  steps: AutomationStep[];
  createdAt: number;
  updatedAt: number;
}

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
}

// ─── Metadados de ações ──────────────────────────────────────────────────────

export const ACTION_LABELS: Record<ActionType, string> = {
  open:   'Abrir Programa',
  script: 'Executar Script',
  mouse:  'Mover Mouse',
  click:  'Clique',
  write:  'Escrever Texto',
  delay:  'Delay',
  loop:   'Loop',
};

export const ACTION_ICONS: Record<ActionType, string> = {
  open:   '⬡',
  script: '⚙',
  mouse:  '◎',
  click:  '◉',
  write:  '⌨',
  delay:  '⏱',
  loop:   '↻',
};

export const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  open:   'Abre um programa (.exe) no computador',
  script: 'Executa um script (.bat, .ps1, .py)',
  mouse:  'Move o cursor para uma posição X, Y na tela',
  click:  'Realiza um clique esquerdo ou direito',
  write:  'Digita um texto automaticamente',
  delay:  'Aguarda um tempo em milissegundos antes de continuar',
  loop:   'Repete as ações internas um número de vezes',
};

export const ACTION_TYPES: ActionType[] = [
  'open', 'script', 'mouse', 'click', 'write', 'delay', 'loop',
];

// ─── Utilitários ─────────────────────────────────────────────────────────────

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createStep(type: ActionType): AutomationStep {
  const base: AutomationStep = { id: createId(), type };
  switch (type) {
    case 'open':   return { ...base, path: '' };
    case 'script': return { ...base, path: '' };
    case 'mouse':  return { ...base, x: 0, y: 0 };
    case 'click':  return { ...base, button: 'left' };
    case 'write':  return { ...base, text: '' };
    case 'delay':  return { ...base, ms: 1000 };
    case 'loop':   return { ...base, count: 3, steps: [] };
    default:       return base;
  }
}

/** Garante que IDs sejam recriados ao importar JSON externo */
export function sanitizeStep(raw: Partial<AutomationStep>): AutomationStep {
  return {
    ...raw,
    id: createId(),
    type: raw.type ?? 'delay',
    steps: raw.steps?.map(sanitizeStep) ?? [],
  } as AutomationStep;
}

/** Valida e importa um JSON externo de automação */
export function parseAutomationJson(json: string): Automation | null {
  try {
    const data = JSON.parse(json);
    if (!data || typeof data.name !== 'string' || !Array.isArray(data.steps)) return null;
    const now = Date.now();
    return {
      id: createId(),
      name: data.name.trim() || 'Importada',
      steps: data.steps.map(sanitizeStep),
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}
