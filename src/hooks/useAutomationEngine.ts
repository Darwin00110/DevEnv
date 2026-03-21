import { useState, useCallback, useRef, useEffect } from 'react';
import { Automation, AutomationStep, LogEntry, LogLevel, createId } from '@/lib/automation';

// ─── Constantes de storage ────────────────────────────────────────────────────

const STORAGE_KEY  = 'devenv_automations';
const PROFILE_KEY  = 'devenv_profile';

// ─── Helpers de storage ───────────────────────────────────────────────────────

function loadAutomations(): Automation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistAutomations(automations: Automation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(automations));
  } catch (e) {
    console.error('[DevEnv] Falha ao salvar automações:', e);
  }
}

function makeLog(level: LogLevel, message: string): LogEntry {
  return { id: createId(), level, message, timestamp: Date.now() };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAutomationEngine() {
  const [automations, setAutomations] = useState<Automation[]>(loadAutomations);

  const [logs, setLogs] = useState<LogEntry[]>(() => [
    makeLog('SYSTEM', 'DevEnv v1.0.0 inicializado'),
    makeLog('INFO',   'Motor de automação pronto'),
    makeLog('SYSTEM', 'Digite "help" para ver os comandos disponíveis'),
  ]);

  const [isRunning, setIsRunning]       = useState(false);
  const [currentProfile, setCurrentProfile] = useState(
    () => localStorage.getItem(PROFILE_KEY) ?? 'default'
  );

  const abortRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tasks = await window.electronAPI.LoadConfig();
        if (cancelled) return;
        if (Array.isArray(tasks) && tasks.length > 0) {
          const mapped = tasks.map((t: any) => ({
            id: String(t?.id ?? createId()),
            name: String(t?.name ?? 'Sem nome'),
            steps: Array.isArray(t?.steps) ? t.steps : [],
            createdAt: Number(t?.createdAt ?? Date.now()),
            updatedAt: Number(t?.updatedAt ?? Date.now()),
          }));
          setAutomations(mapped);
          persistAutomations(mapped);
        }
      } catch (e) {
        console.error('[DevEnv] Falha ao carregar config.json:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Logs ────────────────────────────────────────────────────────────────────

  const addLog = useCallback((level: LogLevel, message: string) => {
    setLogs(prev => [...prev, makeLog(level, message)]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([makeLog('SYSTEM', 'Console limpo')]);
  }, []);

  // ── CRUD de automações ───────────────────────────────────────────────────────

  const saveAutomation = useCallback((auto: Automation) => {
    setAutomations(prev => {
      const exists = prev.some(a => a.id === auto.id);
      const updated = { ...auto, updatedAt: Date.now() };
      const next = exists
        ? prev.map(a => (a.id === auto.id ? updated : a))
        : [...prev, updated];
      persistAutomations(next);
      return next;
    });
    addLog('SUCCESS', `Automação "${auto.name}" salva`);
  }, [addLog]);

  const deleteAutomation = useCallback((id: string) => {
    setAutomations(prev => {
      const auto = prev.find(a => a.id === id);
      const next = prev.filter(a => a.id !== id);
      persistAutomations(next);
      window.electronAPI.DeleteConfig(id);
      if (auto) addLog('INFO', `Automação "${auto.name}" excluída`);
      return next;
    });
  }, [addLog]);

  // ── Execução ─────────────────────────────────────────────────────────────────

  const simulateStep = useCallback(async (step: AutomationStep): Promise<void> => {
    if (abortRef.current) throw new Error('Execução abortada');

    switch (step.type) {
      case 'open':
        addLog('INFO',    `Abrindo: ${step.path || '(caminho vazio)'}`);
        await delay(800);
        addLog('SUCCESS', `Lançado: ${step.path}`);
        break;

      case 'script':
        addLog('INFO',    `Executando script: ${step.path || '(caminho vazio)'}`);
        await delay(1200);
        addLog('SUCCESS', `Script concluído: ${step.path}`);
        break;

      case 'mouse':
        addLog('INFO', `Movendo mouse para (${step.x}, ${step.y})`);
        await delay(300);
        break;

      case 'click':
        addLog('INFO', `${step.button === 'right' ? 'Clique direito' : 'Clique esquerdo'}`);
        await delay(200);
        break;

      case 'write':
        addLog('INFO', `Digitando: "${step.text}"`);
        await delay(500);
        break;

      case 'delay':
        addLog('INFO', `Aguardando ${step.ms}ms...`);
        await delay(Math.min(step.ms ?? 1000, 3000));
        break;

      case 'loop':
        for (let i = 0; i < (step.count ?? 1); i++) {
          if (abortRef.current) throw new Error('Execução abortada');
          addLog('INFO', `Loop — iteração ${i + 1}/${step.count}`);
          for (const s of step.steps ?? []) {
            await simulateStep(s);
          }
        }
        break;
    }
  }, [addLog]);

  const executeAutomation = useCallback(async (auto: Automation) => {
    setIsRunning(true);
    abortRef.current = false;
    addLog('SYSTEM', `═══ Executando: ${auto.name} ═══`);

    try {
      for (const step of auto.steps) {
        await simulateStep(step);
      }
      await window.electronAPI.ConfigPlay(auto.id)
      addLog('SUCCESS', `═══ "${auto.name}" concluída com sucesso ═══`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na execução';
      addLog('ERROR', msg);
    } finally {
      setIsRunning(false);
    }
  }, [addLog, simulateStep]);

  const abortExecution = useCallback(() => {
    abortRef.current = true;
    addLog('WARN', 'Sinal de abortar enviado...');
  }, [addLog]);

  // ── Export / Import ──────────────────────────────────────────────────────────

  const exportAutomation = useCallback((auto: Automation) => {
    // Remove IDs internos para o JSON exportado ficar limpo
    const payload = {
      name: auto.name,
      steps: stripIds(auto.steps),
    };
    const json = JSON.stringify(payload, null, 2);
    downloadJson(json, `${auto.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    addLog('SUCCESS', `Exportado "${auto.name}" como JSON`);
  }, [addLog]);

  // ── Perfil ───────────────────────────────────────────────────────────────────

  const switchProfile = useCallback((name: string) => {
    setCurrentProfile(name);
    localStorage.setItem(PROFILE_KEY, name);
    addLog('INFO', `Perfil alterado para: ${name}`);
  }, [addLog]);

  return {
    automations,
    logs,
    isRunning,
    currentProfile,
    // ações
    saveAutomation,
    deleteAutomation,
    executeAutomation,
    abortExecution,
    exportAutomation,
    addLog,
    clearLogs,
    setProfile: switchProfile,
  };
}

// ─── Funções utilitárias internas ─────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function stripIds(steps: AutomationStep[]): Omit<AutomationStep, 'id'>[] {
  return steps.map(({ id: _id, steps: sub, ...rest }) => ({
    ...rest,
    ...(sub ? { steps: stripIds(sub) } : {}),
  }));
}

function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
