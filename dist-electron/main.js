import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "fs/promises";
import path from "node:path";
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
const isDev = !app.isPackaged;
const pathJSON = isDev ? path.join(MAIN_DIST, "config.json") : path.join(RENDERER_DIST, "config.json");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
const TaskUser = {
  Task: {
    name: "",
    id: "",
    Program: {
      Path: ""
    },
    Script: {
      Path: ""
    },
    Mouse: {
      x: 0,
      y: 0,
      click: "left"
    },
    WriteText: {
      text: ""
    },
    Delay: {
      time: 0
    },
    Loop: {
      time: 0
    }
  }
};
console.log(TaskUser);
function createWindow() {
  win = new BrowserWindow({
    x: 740,
    y: 100,
    width: 700,
    height: 600,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("get:path", async (event, type) => {
  var _a, _b;
  if (!((_a = TaskUser.Task) == null ? void 0 : _a.Program)) return;
  if (!((_b = TaskUser.Task) == null ? void 0 : _b.Script)) return;
  const resultado = await dialog.showOpenDialog({
    properties: ["openFile"]
  });
  if (resultado.canceled) {
    return {
      saida: "Operação cancelada"
    };
  }
  if (type == "open") {
    TaskUser.Task.Program.Path = resultado.filePaths[0];
  } else {
    TaskUser.Task.Script.Path = resultado.filePaths[0];
  }
  return {
    saida: resultado.filePaths[0]
  };
});
ipcMain.on("save:config", async (event, config) => {
  const { type, name, id, path: path2, x, y, button, text, time, LoopTime } = config;
  if (!TaskUser.Task) return;
  TaskUser.Task.id = id;
  TaskUser.Task.name = name;
  if (type == "open") {
    if (TaskUser.Task.Program) TaskUser.Task.Program.Path = path2 ?? "";
  }
  if (type == "script") {
    if (!TaskUser.Task.Script) return;
    TaskUser.Task.Script.Path = path2;
  }
  if (type == "mouse") {
    if (!TaskUser.Task.Mouse) return;
    TaskUser.Task.Mouse.x = x;
    TaskUser.Task.Mouse.y = y;
  }
  if (type == "click") {
    if (!TaskUser.Task.Mouse) return;
    TaskUser.Task.Mouse.click = button;
  }
  if (type == "write") {
    if (!TaskUser.Task.WriteText) return;
    TaskUser.Task.WriteText.text = text;
  }
  if (type == "delay") {
    if (!TaskUser.Task.Delay) return;
    TaskUser.Task.Delay.time = time;
  }
  if (type == "loop") {
    if (!TaskUser.Task.Loop) return;
    TaskUser.Task.Loop.time = LoopTime;
  }
  try {
    fs.access(pathJSON);
    console.log("O trem ja existe");
    const arquivo = await fs.readFile(pathJSON);
    const Json = JSON.parse(arquivo.toString());
    const idJSON = Json.Task.id;
    if (idJSON == id) {
      Json.Task = TaskUser.Task;
      await fs.writeFile(pathJSON, JSON.stringify(Json, null, 2));
    } else {
      Json.Task = TaskUser.Task;
      await fs.writeFile(pathJSON, JSON.stringify(Json, null, 2));
    }
    console.log(Json.Task.id);
  } catch (e) {
    console.log("O trem nn existe " + e);
    await fs.writeFile(pathJSON, JSON.stringify(TaskUser, null, 2));
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
