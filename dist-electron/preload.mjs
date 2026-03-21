"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  GetPath: (type) => electron.ipcRenderer.invoke("get:path", type),
  GetStack: (stack) => electron.ipcRenderer.send("get:stack", stack),
  SaveConfig: (config) => electron.ipcRenderer.send("save:config", config),
  DeleteConfig: (id) => electron.ipcRenderer.send("config:delete", id),
  ConfigPlay: (key) => electron.ipcRenderer.send("config:play", key),
  LoadConfig: () => electron.ipcRenderer.invoke("config:load"),
  Teste: () => electron.ipcRenderer.invoke("teste")
  // You can expose other APTs you need here.
  // ...
});
