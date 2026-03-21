import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "fs/promises";
import path from "node:path";
import { exec, spawn } from "node:child_process";
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
const pathAutomation = isDev ? path.resolve(path.join(pathBACKEND, "Automation", "Core", "main.exe")) : path.join(RENDERER_DIST, "backend", "Automation", "main.exe");
const pathAutomationClicked = isDev ? path.resolve(path.join(pathBACKEND, "Automation", "Clicked", "main.exe")) : path.join(RENDERER_DIST, "backend", "Automation", "Clicked", "main.exe");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
const TaskUser = {
  Task: {
    Program: {
      Path: ""
    },
    Script: {
      Stack: ".py",
      Path: ""
    }
  }
};
function createWindow() {
  win = new BrowserWindow({
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
function CallAutomationMouse(x, y, imagePath = "") {
  exec(`${pathAutomation} ${x} ${y} ${imagePath}`, (error, stdout) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
  });
}
function CallAutomationMouseClicked(button) {
  exec(`${pathAutomationClicked} ${button}`, (error) => {
    if (error) {
      console.log("Erro na chamada do click do mouse");
    }
  });
}
function CallAutomationKeyboard(mode, text, delay) {
  exec(`${pathAutomation} ${mode} ${text} ${delay}`, (error) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`);
    }
  });
}
async function loadJSON() {
  try {
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
  } catch {
    const fallback = { Tasks: [] };
    await fs.writeFile(pathJSON, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function buildStepsFromLegacy(task) {
  var _a, _b, _c, _d, _e, _f, _g;
  const steps = [];
  if ((_a = task == null ? void 0 : task.Program) == null ? void 0 : _a.Path) steps.push({ type: "open", path: task.Program.Path });
  if ((_b = task == null ? void 0 : task.Script) == null ? void 0 : _b.Path) steps.push({ type: "script", path: task.Script.Path, stack: task.Script.Stack ?? ".py" });
  if (((_c = task == null ? void 0 : task.Mouse) == null ? void 0 : _c.x) !== void 0 && ((_d = task == null ? void 0 : task.Mouse) == null ? void 0 : _d.y) !== void 0) {
    steps.push({ type: "mouse", x: task.Mouse.x, y: task.Mouse.y });
  }
  if ((_e = task == null ? void 0 : task.Mouse) == null ? void 0 : _e.click) steps.push({ type: "click", button: task.Mouse.click });
  if ((_f = task == null ? void 0 : task.WriteText) == null ? void 0 : _f.text) steps.push({ type: "write", text: task.WriteText.text });
  if ((_g = task == null ? void 0 : task.Delay) == null ? void 0 : _g.time) steps.push({ type: "delay", ms: task.Delay.time });
  return steps;
}
function normalizeTask(task) {
  var _a;
  const id = String((task == null ? void 0 : task.id) ?? "");
  const name = String((task == null ? void 0 : task.name) ?? "");
  const hasSteps = Array.isArray(task == null ? void 0 : task.steps);
  const steps = hasSteps ? task.steps : buildStepsFromLegacy(task);
  const loopCount = Number(((_a = task == null ? void 0 : task.Loop) == null ? void 0 : _a.time) ?? 0);
  if (!hasSteps && loopCount > 1 && steps.length > 0) {
    return { id, name, steps: [{ type: "loop", count: loopCount, steps }] };
  }
  return { id, name, steps };
}
async function executeStep(step) {
  if (!step || !step.type) return;
  switch (step.type) {
    case "open":
      if (step.path) OpenPrograms("file", String(step.path), "");
      break;
    case "script":
      if (step.path) OpenPrograms("script", String(step.path), String(step.stack ?? ".py"));
      break;
    case "mouse":
      if (step.x !== void 0 && step.y !== void 0) {
        ({ x: Number(step.x), y: Number(step.y), has: true });
        CallAutomationMouse(String(step.x), String(step.y), "left");
      }
      break;
    case "click":
      CallAutomationMouseClicked(String(step.button ?? "left"));
      break;
    case "write":
      if (step.text) CallAutomationKeyboard("write", String(step.text), "0");
      break;
    case "delay":
      await sleep(Number(step.ms ?? 0));
      break;
    case "loop": {
      const count = Number(step.count ?? 1);
      const safeCount = count > 0 ? count : 1;
      for (let i = 0; i < safeCount; i++) {
        for (const inner of step.steps ?? []) {
          await executeStep(inner);
        }
      }
      break;
    }
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
ipcMain.on("save:config", async (event, automation) => {
  if (!(automation == null ? void 0 : automation.id)) return;
  try {
    const task = normalizeTask(automation);
    if (!task.id) return;
    const json = await loadJSON();
    if (!Array.isArray(json.Tasks)) json.Tasks = [];
    const index = json.Tasks.findIndex((t) => String((t == null ? void 0 : t.id) ?? "") === task.id);
    if (index !== -1) {
      json.Tasks[index] = { ...json.Tasks[index], ...task };
    } else {
      json.Tasks.push(task);
    }
    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2));
  } catch (e) {
    console.log("Falha ao salvar config.json", e);
  }
});
ipcMain.handle("config:load", async () => {
  try {
    const json = await loadJSON();
    return Array.isArray(json.Tasks) ? json.Tasks : [];
  } catch (e) {
    console.log("Falha ao carregar config.json", e);
    return [];
  }
});
ipcMain.on("config:delete", async (event, id) => {
  const idStr = String(id ?? "");
  if (!idStr) return;
  try {
    const json = await loadJSON();
    if (!Array.isArray(json.Tasks)) json.Tasks = [];
    json.Tasks = json.Tasks.filter((t) => String((t == null ? void 0 : t.id) ?? "") !== idStr);
    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2));
  } catch (e) {
    console.log("Falha ao deletar no config.json", e);
  }
});
ipcMain.on("config:play", async (event, key) => {
  const JSONuser = await loadJSON();
  const tasks = Array.isArray(JSONuser.Tasks) ? JSONuser.Tasks : [];
  const keyStr = String(key ?? "");
  const task = tasks.find((t) => {
    const nameStr = String((t == null ? void 0 : t.name) ?? "");
    const idStr = String((t == null ? void 0 : t.id) ?? "");
    return keyStr === idStr || keyStr.toLowerCase() === nameStr.toLowerCase();
  });
  if (!task) {
    console.log("processo nn encontrado");
    return;
  }
  const normalized = normalizeTask(task);
  for (const step of normalized.steps ?? []) {
    await executeStep(step);
  }
});
ipcMain.on("get:stack", (event, stack) => {
  var _a, _b;
  if (stack == ".py" || stack == ".cs" || stack == ".cpp" || stack == ".c" || stack == ".bat" || stack == ".ps1") {
    if ((_a = TaskUser.Task) == null ? void 0 : _a.Script) {
      TaskUser.Task.Script.Stack = stack;
    }
  } else {
    if ((_b = TaskUser.Task) == null ? void 0 : _b.Script) {
      TaskUser.Task.Script.Stack = ".py";
    }
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
