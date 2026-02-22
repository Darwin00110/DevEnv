import { useState } from 'react';
import { Monitor, Palette, User, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderBarProps {
  currentProfile: string;
  onProfileChange: (name: string) => void;
  theme: 'matrix' | 'cyber';
  onThemeToggle: () => void;
}

export default function HeaderBar({ currentProfile, onProfileChange, theme, onThemeToggle }: HeaderBarProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileInput, setProfileInput] = useState(currentProfile);

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <Monitor size={16} className="text-primary text-glow" />
                <h1 className="text-sm font-bold tracking-wider text-primary text-glow">DevEnv</h1>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">DevEnv — Terminal Tech Automation Engine</p>
              <p className="text-[10px] text-muted-foreground">Crie e execute sequências de automação</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-[10px] text-muted-foreground">v1.0.0</span>
          <div className="h-3 w-px bg-border mx-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-help">
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse-glow" />
                ONLINE
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Status do sistema: ativo e pronto para executar</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Profile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-muted-foreground" />
                {editingProfile ? (
                  <input
                    value={profileInput}
                    onChange={e => setProfileInput(e.target.value)}
                    onBlur={() => {
                      if (profileInput.trim()) onProfileChange(profileInput.trim());
                      setEditingProfile(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        if (profileInput.trim()) onProfileChange(profileInput.trim());
                        setEditingProfile(false);
                      }
                    }}
                    className="bg-background border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground outline-none focus:border-primary w-20"
                    autoFocus
                  />
                ) : (
                  <button onClick={() => setEditingProfile(true)} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    {currentProfile}
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Perfil do usuário — clique para alterar o nome</p>
              <p className="text-[10px] text-muted-foreground">Cada perfil salva suas automações separadamente</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onThemeToggle}
                className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Palette size={12} />
                {theme === 'matrix' ? 'Matrix' : 'Cyber'}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Alternar tema visual</p>
              <p className="text-[10px] text-muted-foreground">
                {theme === 'matrix' ? 'Tema atual: Matrix (verde) — clique para Cyber (azul)' : 'Tema atual: Cyber (azul) — clique para Matrix (verde)'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
