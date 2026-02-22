import { useState, useCallback, useRef } from 'react';
import { Automation, AutomationStep, LogEntry, createId } from '@/lib/automation';

const STORAGE_KEY = 'devenv_automations';
const PROFILE_KEY = 'devenv_profile';

export function useAutomationEngine() {
  const [automations, setAutomations] = useState<Automation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: createId(), level: 'SYSTEM', message: 'DevEnv v1.0.0 initialized', timestamp: Date.now() },
    { id: createId(), level: 'INFO', message: 'Automation engine ready', timestamp: Date.now() },
    { id: createId(), level: 'SYSTEM', message: 'Type "help" for available commands', timestamp: Date.now() },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(() => 
    localStorage.getItem(PROFILE_KEY) || 'default'
  );
  const abortRef = useRef(false);

  const persist = useCallback((autos: Automation[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(autos));
  }, []);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = { id: createId(), level, message, timestamp: Date.now() };
    setLogs(prev => [...prev, entry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([{ id: createId(), level: 'SYSTEM', message: 'Console cleared', timestamp: Date.now() }]);
  }, []);

  const saveAutomation = useCallback((auto: Automation) => {
    setAutomations(prev => {
      const exists = prev.findIndex(a => a.id === auto.id);
      const next = exists >= 0 ? prev.map(a => a.id === auto.id ? auto : a) : [...prev, auto];
      persist(next);
      return next;
    });
    addLog('SUCCESS', `Automation "${auto.name}" saved`);
  }, [persist, addLog]);

  const deleteAutomation = useCallback((id: string) => {
    setAutomations(prev => {
      const auto = prev.find(a => a.id === id);
      const next = prev.filter(a => a.id !== id);
      persist(next);
      if (auto) addLog('INFO', `Automation "${auto.name}" deleted`);
      return next;
    });
  }, [persist, addLog]);

  const simulateStep = async (step: AutomationStep): Promise<void> => {
    if (abortRef.current) throw new Error('Execution aborted');

    switch (step.type) {
      case 'open':
        addLog('INFO', `Opening: ${step.path || '(empty path)'}`);
        await new Promise(r => setTimeout(r, 800));
        addLog('SUCCESS', `Launched: ${step.path}`);
        break;
      case 'script':
        addLog('INFO', `Executing script: ${step.path || '(empty path)'}`);
        await new Promise(r => setTimeout(r, 1200));
        addLog('SUCCESS', `Script completed: ${step.path}`);
        break;
      case 'mouse':
        addLog('INFO', `Moving mouse to (${step.x}, ${step.y})`);
        await new Promise(r => setTimeout(r, 300));
        break;
      case 'click':
        addLog('INFO', `${step.button === 'right' ? 'Right' : 'Left'} click`);
        await new Promise(r => setTimeout(r, 200));
        break;
      case 'write':
        addLog('INFO', `Typing: "${step.text}"`);
        await new Promise(r => setTimeout(r, 500));
        break;
      case 'delay':
        addLog('INFO', `Waiting ${step.ms}ms...`);
        await new Promise(r => setTimeout(r, Math.min(step.ms || 1000, 3000)));
        break;
      case 'loop':
        for (let i = 0; i < (step.count || 1); i++) {
          if (abortRef.current) throw new Error('Execution aborted');
          addLog('INFO', `Loop iteration ${i + 1}/${step.count}`);
          for (const s of step.steps || []) {
            await simulateStep(s);
          }
        }
        break;
    }
  };

  const executeAutomation = useCallback(async (auto: Automation) => {
    setIsRunning(true);
    abortRef.current = false;
    addLog('SYSTEM', `═══ Executing: ${auto.name} ═══`);

    try {
      for (const step of auto.steps) {
        await simulateStep(step);
      }
      addLog('SUCCESS', `═══ "${auto.name}" completed successfully ═══`);
    } catch (err: any) {
      addLog('ERROR', err.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  }, [addLog]);

  const abortExecution = useCallback(() => {
    abortRef.current = true;
    addLog('WARN', 'Abort signal sent...');
  }, [addLog]);

  const exportAutomation = useCallback((auto: Automation) => {
    const json = JSON.stringify({ name: auto.name, steps: auto.steps.map(({ id, ...rest }) => rest) }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${auto.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('SUCCESS', `Exported "${auto.name}" as JSON`);
  }, [addLog]);

  const setProfile = useCallback((name: string) => {
    setCurrentProfile(name);
    localStorage.setItem(PROFILE_KEY, name);
    addLog('INFO', `Switched to profile: ${name}`);
  }, [addLog]);

  return {
    automations, logs, isRunning, currentProfile,
    saveAutomation, deleteAutomation, executeAutomation, abortExecution,
    exportAutomation, addLog, clearLogs, setProfile,
  };
}
