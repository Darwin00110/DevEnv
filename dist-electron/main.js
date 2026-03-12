import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "fs/promises";
import path from "node:path";
import { spawn, exec } from "node:child_process";
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
const isDev = !app.isPackaged;
const pathJSON = isDev ? path.join(MAIN_DIST, "config.json") : path.join(RENDERER_DIST, "config.json");
const pathICON = isDev ? path.resolve(path.join(MAIN_DIST, "..", "icon", "icon.ico")) : path.join(RENDERER_DIST, "icon.ico");
const pathBACKEND = isDev ? path.resolve(path.join(MAIN_DIST, "..", "backend")) : path.join(RENDERER_DIST, "backend");
const pathAutomation = isDev ? path.resolve(path.join(pathBACKEND, "Automation", "bin", "Release", "net10.0", "win-x64", "publish", "Automation.exe")) : path.join(RENDERER_DIST, "dist", "Automation");
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
      Stack: ".py",
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
    const verificacaoTipo = path.extname(pathBackend);
    if (verificacaoTipo !== stack) {
      console.log(`Extensão diferente: esperado ${stack}, veio ${verificacaoTipo}`);
      return;
    }
    let processo;
    if (stack === ".py") {
      processo = spawn("python", [pathBackend]);
    } else if (stack === ".c") {
      processo = spawn("gcc", [pathBackend]);
    } else if (stack === ".cs") {
      processo = spawn("dotnet run", [pathBackend]);
    } else if (stack === ".cpp") {
      processo = spawn("g++", [pathBackend]);
    } else if (stack === ".ps1") {
      processo = spawn("powershell", ["-ExecutionPolicy", "Bypass", "-File", pathBackend]);
    } else if (stack === ".bat") {
      processo = spawn("cmd", ["/c", pathBackend]);
    } else {
      console.log(`Stack ${stack} ainda não suportada para execução`);
      return;
    }
    processo.on("close", (code) => {
      console.log("Processo finalizado com código: " + code);
    });
    processo.stderr.on("data", (data) => {
      console.log("Erro: " + data);
    });
  }
}
function CallAutomationMouse(mode, x, y, button, delay) {
  exec(`${pathAutomation} ${mode} ${x} ${y} ${button} ${delay}`, (error, stdout, stderr2) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
  });
}
function CallAutomationKeyboard(mode, text, delay) {
  exec(`${pathAutomation} ${mode} ${text} ${delay}`, (error, stdout) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
  });
}
async function loadJSON() {
  await fs.access(pathJSON);
  const arquivo = await fs.readFile(pathJSON, "utf-8");
  try {
    return JSON.parse(arquivo);
  } catch {
    const lastBrace = arquivo.lastIndexOf("}");
    if (lastBrace !== -1) {
      const trimmed = arquivo.slice(0, lastBrace + 1);
      try {
        const parsed = JSON.parse(trimmed);
        await fs.writeFile(pathJSON, JSON.stringify(parsed, null, 2));
        return parsed;
      } catch {
      }
    }
    const fallback = { Tasks: [] };
    await fs.writeFile(pathJSON, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}
ipcMain.handle("get:path", async (event, type) => {
  var _a, _b;
  if (!((_a = TaskUser.Task) == null ? void 0 : _a.Program)) return;
  if (!((_b = TaskUser.Task) == null ? void 0 : _b.Script)) return;
  let resultado;
  if (type == "open") {
    resultado = await dialog.showOpenDialog(win ?? void 0, {
      properties: ["openFile"]
    });
    if (resultado.canceled) {
      return {
        saida: "Operação cancelada"
      };
    }
    TaskUser.Task.Program.Path = resultado.filePaths[0];
  } else {
    resultado = await dialog.showOpenDialog(win ?? void 0, {
      properties: ["openFile"],
      filters: [
        {
          name: "Scripts",
          extensions: ["py", "cs", "cpp", "c", "bat", "ps1"]
        },
        {
          name: "All Files",
          extensions: ["*"]
        }
      ]
    });
    if (resultado.canceled) {
      return {
        saida: "Operação cancelada"
      };
    }
    TaskUser.Task.Script.Path = resultado.filePaths[0];
  }
  return {
    saida: resultado.filePaths[0]
  };
});
ipcMain.on("save:config", async (event, config) => {
  const { type, name, id, path: path2, x, y, button, text, time, LoopTime } = config;
  if (!id) return;
  const defaultTask = () => ({
    id,
    name: name ?? "",
    Program: { Path: "" },
    Script: { Stack: ".py", Path: "" },
    Mouse: { x: 0, y: 0, click: "left" },
    WriteText: { text: "" },
    Delay: { time: 0 },
    Loop: { time: 0 }
  });
  try {
    await fs.access(pathJSON);
    const arquivo = await fs.readFile(pathJSON, "utf-8");
    const json = JSON.parse(arquivo);
    if (!json.Tasks) {
      json.Tasks = [];
    }
    const index = json.Tasks.findIndex((t) => t.id === id);
    const task = index !== -1 ? json.Tasks[index] : defaultTask();
    task.id = id;
    if (name !== void 0) task.name = name;
    if (type == "open") {
      if (!task.Program) task.Program = { Path: "" };
      if (path2 !== void 0) task.Program.Path = path2 ?? "";
    }
    if (type == "script") {
      if (!task.Script) task.Script = { Stack: ".py", Path: "" };
      if (path2 !== void 0) task.Script.Path = path2 ?? "";
    }
    if (type == "mouse") {
      if (!task.Mouse) task.Mouse = { x: 0, y: 0, click: "left" };
      if (x !== void 0) task.Mouse.x = x;
      if (y !== void 0) task.Mouse.y = y;
    }
    if (type == "click") {
      if (!task.Mouse) task.Mouse = { x: 0, y: 0, click: "left" };
      if (button !== void 0) task.Mouse.click = button;
    }
    if (type == "write") {
      if (!task.WriteText) task.WriteText = { text: "" };
      if (text !== void 0) task.WriteText.text = text ?? "";
    }
    if (type == "delay") {
      if (!task.Delay) task.Delay = { time: 0 };
      if (time !== void 0) task.Delay.time = time ?? 0;
    }
    if (type == "loop") {
      if (!task.Loop) task.Loop = { time: 0 };
      if (LoopTime !== void 0) task.Loop.time = LoopTime ?? 0;
    }
    if (index !== -1) {
      json.Tasks[index] = task;
    } else {
      json.Tasks.push(task);
    }
    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2));
    return;
  } catch (e) {
    const novo = { Tasks: [defaultTask()] };
    await fs.writeFile(pathJSON, JSON.stringify(novo, null, 2));
    return;
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
ipcMain.on("config:play", async (event, key) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  console.log(key);
  const JSONuser = await loadJSON();
  let DataJSON = JSON.stringify(JSONuser, null, 3);
  DataJSON = JSON.parse(DataJSON);
  let ProcessoUser = null;
  let found = false;
  for (let i = 0; i < DataJSON.Tasks.length; i++) {
    const task = DataJSON.Tasks[i];
    const keyStr = String(key ?? "");
    const nameStr = String((task == null ? void 0 : task.name) ?? "");
    const idStr = String((task == null ? void 0 : task.id) ?? "");
    if (keyStr === idStr || keyStr.toLowerCase() === nameStr.toLowerCase()) {
      ProcessoUser = task;
      found = true;
      const loopCountRaw = Number(((_a = ProcessoUser.Loop) == null ? void 0 : _a.time) ?? 1);
      const loopCount = loopCountRaw > 0 ? loopCountRaw : 1;
      for (let i2 = 0; i2 < loopCount; i2++) {
        console.log("Encontrei");
        if ((_b = ProcessoUser.Program) == null ? void 0 : _b.Path) {
          OpenPrograms("File", ProcessoUser.Program.Path, "");
        }
        if ((_c = ProcessoUser.Script) == null ? void 0 : _c.Path) {
          OpenPrograms("script", ProcessoUser.Script.Path, ProcessoUser.Script.Stack ?? ".py");
        }
        if (((_d = ProcessoUser.Mouse) == null ? void 0 : _d.x) != 0 && ((_e = ProcessoUser.Mouse) == null ? void 0 : _e.y) != 0) {
          CallAutomationMouse("mouse", ProcessoUser.Mouse.x, ProcessoUser.Mouse.y, ProcessoUser.Mouse.click, ((_f = ProcessoUser.Delay) == null ? void 0 : _f.time) ?? 0);
        }
        if (((_g = ProcessoUser.WriteText) == null ? void 0 : _g.text) != "") {
          CallAutomationKeyboard("write", ProcessoUser.WriteText.text, ((_h = ProcessoUser.Delay) == null ? void 0 : _h.time) ?? 0);
        }
      }
      break;
    }
  }
  if (!found) {
    console.log("processo nn encontrado");
  }
});
async function teste(texto) {
  const processo = spawn(`cmd.exe /c ${texto}`);
  processo.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });
  processo.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });
  processo.on("close", (code) => {
    console.log(`Processo finalizado com código: ${code}`);
  });
}
ipcMain.on("get:stack", (event, stack) => {
  var _a, _b;
  if (stack == ".py" || stack == ".cs" || stack == ".cpp" || stack == ".c" || stack == ".bat" || stack == ".ps1") {
    if ((_a = TaskUser.Task) == null ? void 0 : _a.Script) {
      TaskUser.Task.Script.Stack = stack;
    }
    console.log(stack);
  } else {
    if ((_b = TaskUser.Task) == null ? void 0 : _b.Script) {
      TaskUser.Task.Script.Stack = ".py";
    }
  }
});
teste("dir");
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
