import { contextBridge, ipcRenderer } from 'electron'
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  GetPath: (type: string) => ipcRenderer.invoke('get:path', type),
  SaveConfig: (id: string, name: string, type: string, path: string, button: string, x: number, y: number, ms: number, count: number, text: string) => ipcRenderer.send('save:config', id, name, type, path, button, x, y, ms, count, text)
  // You can expose other APTs you need here.
  // ...
})
