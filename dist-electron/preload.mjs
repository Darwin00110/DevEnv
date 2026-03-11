"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  GetPath: (type) => electron.ipcRenderer.invoke("get:path", type),
  SaveConfig: (id, name, type, path, button, x, y, ms, count, text) => electron.ipcRenderer.send("save:config", id, name, type, path, button, x, y, ms, count, text),
  ConfigPlay: (name) => electron.ipcRenderer.send("config:play", name)
  // You can expose other APTs you need here.
  // ...
});
