import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
const isDev = !app.isPackaged;
const pathJSON = isDev ? path.join(MAIN_DIST, "config.json") : path.join(RENDERER_DIST, "config.json");
const pathICON = isDev ? path.resolve(path.join(MAIN_DIST, "..", "icon", "icon.ico")) : path.join(RENDERER_DIST, "icon.ico");
isDev ? path.resolve(path.join(MAIN_DIST, "..", "backend")) : path.join(RENDERER_DIST, "backend");
isDev ? path.resolve(path.join(MAIN_DIST, "..", "backend", "OpenPrograms", "bin", "Debug", "net10.0", "OpenPrograms.exe")) : path.join(RENDERER_DIST, "backend", "OpenPrograms", "bin", "OpenPrograms.exe");
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
      Stack: "Python",
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
function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    x: 740,
    icon: pathICON,
    y: 100,
    width: 700,
    height: 600,
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
function OpenPrograms(args, Path, stack) {
  let pathBackend = path.resolve(Path);
  stack = stack ?? "";
  try {
    fs.access(pathBackend);
    console.log("O treco existe");
  } catch (e) {
    console.log("O treco nn existe");
  }
  if (args.toLowerCase() == "file") {
    let processo = spawn(pathBackend);
    processo.on("close", (code) => {
      console.log("Processo finalizado com código: " + code);
    });
    processo.stderr.on("data", (data) => {
      console.log("Erro: " + data);
    });
  }
  if (args.toLowerCase() == "script") {
    let verificacaoTipo = path.extname(pathBackend);
    if (verificacaoTipo != ".py") {
      console.log("O trem nn e python bacana");
      return;
    } else {
      let processo = spawn(`${stack} ${pathBackend}`);
      processo.on("close", (code) => {
        console.log("Processo finalizado com código: " + code);
      });
      processo.stderr.on("data", (data) => {
        console.log("Erro: " + data);
      });
    }
  }
}
async function loadJSON() {
  await fs.access(pathJSON);
  const arquivo = await fs.readFile(pathJSON, "utf-8");
  const json = JSON.parse(arquivo);
  return json;
}
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
    await fs.access(pathJSON);
    const arquivo = await fs.readFile(pathJSON, "utf-8");
    const json = JSON.parse(arquivo);
    if (!json.Tasks) {
      json.Tasks = [];
    }
    const index = json.Tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      json.Tasks[index] = TaskUser.Task;
    } else {
      json.Tasks.push(TaskUser.Task);
    }
    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2));
  } catch (e) {
    const novo = {
      Tasks: [TaskUser.Task]
    };
    await fs.writeFile(pathJSON, JSON.stringify(novo, null, 2));
  }
});
ipcMain.on("config:play", async (event, name) => {
  const JSONuser = await loadJSON();
  let DataJSON = JSON.stringify(JSONuser, null, 3);
  DataJSON = JSON.parse(DataJSON);
  let ProcessoUser = null;
  for (let i = 0; i < DataJSON.Tasks.length; i++) {
    if (name == DataJSON.Tasks[i].name) {
      ProcessoUser = DataJSON.Tasks[i];
      console.log("Encontrei");
      if (ProcessoUser.Program != "") {
        OpenPrograms("File", ProcessoUser.Program.Path, "");
      }
      if (ProcessoUser.Script != "") {
        OpenPrograms("script", ProcessoUser.Script.Path, "python");
      }
      break;
    } else {
      console.log("processo nn encontrado");
    }
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
