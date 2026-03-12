import { contextBridge, ipcRenderer } from 'electron'
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  GetPath: (type: string) => ipcRenderer.invoke('get:path', type),
  SaveConfig: (config: any) => ipcRenderer.send('save:config', config),
  ConfigPlay: (key: string) => ipcRenderer.send('config:play', key),
  GetStack: (stack: string) => ipcRenderer.send('get:stack', stack)
  // You can expose other APTs you need here.
  // ...
})
