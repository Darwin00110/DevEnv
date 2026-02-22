export type ActionType = 'open' | 'script' | 'mouse' | 'click' | 'write' | 'delay' | 'loop';

export interface AutomationStep {
  id: string;
  type: ActionType;
  path?: string;
  x?: number;
  y?: number;
  button?: 'left' | 'right';
  text?: string;
  ms?: number;
  count?: number;
  steps?: AutomationStep[];
}

export interface Automation {
  id: string;
  name: string;
  steps: AutomationStep[];
  createdAt: number;
}

export interface LogEntry {
  id: string;
  level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' | 'SYSTEM';
  message: string;
  timestamp: number;
}

export const ACTION_LABELS: Record<ActionType, string> = {
  open: 'Abrir Programa',
  script: 'Executar Script',
  mouse: 'Mover Mouse',
  click: 'Clique',
  write: 'Escrever Texto',
  delay: 'Delay',
  loop: 'Loop',
};

export const ACTION_ICONS: Record<ActionType, string> = {
  open: '⬡',
  script: '⚙',
  mouse: '◎',
  click: '◉',
  write: '⌨',
  delay: '⏱',
  loop: '↻',
};

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createStep(type: ActionType): AutomationStep {
  const base: AutomationStep = { id: createId(), type };
  switch (type) {
    case 'open': return { ...base, path: '' };
    case 'script': return { ...base, path: '' };
    case 'mouse': return { ...base, x: 0, y: 0 };
    case 'click': return { ...base, button: 'left' };
    case 'write': return { ...base, text: '' };
    case 'delay': return { ...base, ms: 1000 };
    case 'loop': return { ...base, count: 3, steps: [] };
    default: return base;
  }
}
