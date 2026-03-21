import { contextBridge, ipcRenderer } from 'electron'
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  GetPath: (type: string) => ipcRenderer.invoke('get:path', type),
  GetStack: (stack: string) => ipcRenderer.send('get:stack', stack),
  SaveConfig: (config: any) => ipcRenderer.send('save:config', config),
  DeleteConfig: (id: string) => ipcRenderer.send('config:delete', id),
  ConfigPlay: (key: string) => ipcRenderer.send('config:play', key),
  LoadConfig: () => ipcRenderer.invoke('config:load'),
  Teste: () => ipcRenderer.invoke('teste')
  // You can expose other APTs you need here.
  // ...
})
