import { useState, useCallback } from 'react';
import { Automation } from '@/lib/automation';
import { useAutomationEngine } from '@/hooks/useAutomationEngine';
import TerminalConsole from '@/components/TerminalConsole';
import TaskPanel from '@/components/TaskPanel';
import SequenceEditor from '@/components/SequenceEditor';
import HeaderBar from '@/components/HeaderBar';

const Index = () => {
  const engine = useAutomationEngine();
  const [editingAuto, setEditingAuto] = useState<Automation | null | 'new'>(null);
  const [theme, setTheme] = useState<'matrix' | 'cyber'>(() => {
    return (localStorage.getItem('devenv_theme') as any) || 'matrix';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'matrix' ? 'cyber' : 'matrix';
      localStorage.setItem('devenv_theme', next);
      return next;
    });
  }, []);

  const handleCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase().trim();
    engine.addLog('INFO', `> ${cmd}`);

    if (lower === 'help') {
      engine.addLog('SYSTEM', 'Available commands:');
      engine.addLog('SYSTEM', '  help          — Show this help');
      engine.addLog('SYSTEM', '  list          — List automations');
      engine.addLog('SYSTEM', '  clear         — Clear console');
      engine.addLog('SYSTEM', '  run <name>    — Execute automation');
      engine.addLog('SYSTEM', '  version       — Show version');
    } else if (lower === 'clear') {
      engine.clearLogs();
    } else if (lower === 'list') {
      if (engine.automations.length === 0) {
        engine.addLog('INFO', 'No automations configured');
      } else {
        engine.automations.forEach((a, i) => {
          engine.addLog('INFO', `  ${i + 1}. ${a.name} (${a.steps.length} steps)`);
        });
      }
    } else if (lower === 'version') {
      engine.addLog('SYSTEM', 'DevEnv v1.0.0 — Terminal Tech Automation Engine');
    } else if (lower.startsWith('run ')) {
      const name = cmd.slice(4).trim();
      const auto = engine.automations.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (auto) {
        engine.executeAutomation(auto);
      } else {
        engine.addLog('ERROR', `Automation "${name}" not found`);
      }
    } else {
      engine.addLog('ERROR', `Unknown command: ${cmd}. Type "help" for available commands.`);
    }
  }, [engine]);

  const handleSave = useCallback((auto: Automation) => {
    engine.saveAutomation(auto);
    setEditingAuto(null);
  }, [engine]);

  return (
    <div className={`h-screen flex flex-col bg-background grid-bg ${theme === 'cyber' ? 'theme-cyber' : ''}`}>
      <HeaderBar
        currentProfile={engine.currentProfile}
        onProfileChange={engine.setProfile}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Side panel */}
        <aside className="w-72 border-r border-border bg-card/30 flex flex-col shrink-0">
          <TaskPanel
            automations={engine.automations}
            isRunning={engine.isRunning}
            onExecute={engine.executeAutomation}
            onEdit={auto => setEditingAuto(auto)}
            onDelete={engine.deleteAutomation}
            onExport={engine.exportAutomation}
            onNew={() => setEditingAuto('new')}
          />
        </aside>

        {/* Main terminal */}
        <main className="flex-1 p-3 overflow-hidden">
          <TerminalConsole
            logs={engine.logs}
            isRunning={engine.isRunning}
            onAbort={engine.abortExecution}
            onClear={engine.clearLogs}
            onCommand={handleCommand}
          />
        </main>
      </div>

      {/* Editor modal */}
      {editingAuto !== null && (
        <SequenceEditor
          automation={editingAuto === 'new' ? null : editingAuto}
          onSave={handleSave}
          onClose={() => setEditingAuto(null)}
        />
      )}
    </div>
  );
};

export default Index;
