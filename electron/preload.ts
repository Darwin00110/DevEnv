import { contextBridge, ipcRenderer } from 'electron'
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  configTeste: () => ipcRenderer.invoke ('teste'),
  // You can expose other APTs you need here.
  // ...
})
