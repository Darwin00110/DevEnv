"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  GetPath: (type) => electron.ipcRenderer.invoke("get:path", type),
  SaveConfig: (config) => electron.ipcRenderer.send("save:config", config),
  ConfigPlay: (key) => electron.ipcRenderer.send("config:play", key),
  GetStack: (stack) => electron.ipcRenderer.send("get:stack", stack)
  // You can expose other APTs you need here.
  // ...
});
