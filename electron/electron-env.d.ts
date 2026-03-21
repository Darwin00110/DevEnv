/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

type saida = { saida: string }

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  electronAPI: {
    GetPath: (type: string) => Promise<saida>
    GetStack: (stack: string) => void
    SaveConfig: (config: any) => void
    DeleteConfig: (id: string) => void
    ConfigPlay: (key: string) => void
    LoadConfig: () => Promise<any>
    Teste: () => Promise<any>
  }
}
