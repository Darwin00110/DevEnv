"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  GetPath: (type) => electron.ipcRenderer.invoke("get:path", type)
  // You can expose other APTs you need here.
  // ...
});
