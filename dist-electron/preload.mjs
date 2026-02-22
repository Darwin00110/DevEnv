"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  configTeste: () => electron.ipcRenderer.send("teste")
  // You can expose other APTs you need here.
  // ...
});
