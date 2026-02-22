import { contextBridge, ipcRenderer } from 'electron'
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  GetPath: (type: string) => ipcRenderer.invoke('get:path', type),
  // You can expose other APTs you need here.
  // ...
})
