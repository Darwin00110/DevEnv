import { app as d, BrowserWindow as j, ipcMain as h, dialog as x } from "electron";
import { createRequire as _ } from "node:module";
import { fileURLToPath as $ } from "node:url";
import u from "fs/promises";
import { existsSync as D } from "node:fs";
import t from "node:path";
import { exec as P, spawn as f } from "node:child_process";
_(import.meta.url);
const O = t.dirname($(import.meta.url));
process.env.APP_ROOT = t.join(O, "..");
const w = process.env.VITE_DEV_SERVER_URL, T = t.join(process.env.APP_ROOT, "dist-electron"), F = t.join(process.env.APP_ROOT, "dist"), v = !d.isPackaged, g = v ? t.join(T, "config.json") : t.join(d.getPath("userData"), "config.json"), L = v ? t.resolve(t.join(T, "..", "icon", "icon.ico")) : t.join(process.resourcesPath, "icon", "dev_env.ico"), b = (() => {
  if (v)
    return t.resolve(t.join(T, "..", "backend"));
  const e = [
    t.join(process.resourcesPath, "backend"),
    t.join(d.getAppPath(), "dist", "backend"),
    t.join(process.resourcesPath, "app.asar", "dist", "backend")
  ];
  for (const n of e)
    if (D(n)) return n;
  return t.join(process.resourcesPath, "backend");
})(), M = t.resolve(t.join(b, "Automation", "Core", "main.exe")), I = t.resolve(t.join(b, "Automation", "Clicked", "main.exe")), J = t.resolve(t.join(b, "Automation", "Core", "Write", "main.exe"));
process.env.VITE_PUBLIC = w ? t.join(process.env.APP_ROOT, "public") : F;
console.log(process.resourcesPath);
let l;
const p = {
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
function C() {
  if (l = new j({
    x: 740,
    icon: L,
    autoHideMenuBar: !0,
    y: 100,
    width: 700,
    height: 600,
    webPreferences: {
      preload: t.join(O, "preload.mjs")
    }
  }), l.webContents.on("did-finish-load", () => {
    l == null || l.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), w)
    l.loadURL(w), l.webContents.openDevTools();
  else {
    const e = d.getAppPath();
    l.loadFile(t.join(e, "dist", "index.html"));
  }
}
d.on("window-all-closed", () => {
  process.platform !== "darwin" && (d.quit(), l = null);
});
d.on("activate", () => {
  j.getAllWindows().length === 0 && C();
});
function A(e, n, o) {
  let i = t.resolve(n);
  if (o = o ?? "", e.toLowerCase() == "file") {
    let r = f(i);
    r.on("close", (a) => {
      console.log("Processo finalizado com código: " + a);
    }), r.stderr.on("data", (a) => {
      console.log("Erro: " + a);
    });
  }
  if (e.toLowerCase() == "script") {
    const r = t.extname(i);
    if (r !== o) {
      console.log(`Extensão diferente: esperado ${o}, veio ${r}`);
      return;
    }
    let a;
    if (o === ".py")
      a = f("python", [i]);
    else if (o === ".c")
      a = f("gcc", [i]);
    else if (o === ".cs")
      a = f("dotnet run", [i]);
    else if (o === ".cpp")
      a = f("g++", [i]);
    else if (o === ".ps1")
      a = f("powershell", ["-ExecutionPolicy", "Bypass", "-File", i]);
    else if (o === ".bat")
      a = f("cmd", ["/c", i]);
    else {
      console.log(`Stack ${o} ainda não suportada para execução`);
      return;
    }
    a.on("close", (s) => {
      console.log("Processo finalizado com código: " + s);
    }), a.stderr.on("data", (s) => {
      console.log("Erro: " + s);
    });
  }
}
function B(e, n, o = "") {
  P(`${M} ${e} ${n} ${o}`, (i, r) => {
    i && console.log(`Erro do treco aqui parceiro: ${i}`), console.log(`stdout: ${r}`);
  });
}
function V(e) {
  P(`${I} ${e}`, (n) => {
    n && console.log("Erro na chamada do click do mouse");
  });
}
function q(e) {
  console.log("to chegando aqui"), P(`${J} ${e}`, (n, o) => {
    n && console.log(`Erro do treco aqui parceiro: ${n}`), console.log(`Saida: ${o}`);
  });
}
async function y() {
  await u.mkdir(t.dirname(g), { recursive: !0 });
}
async function S() {
  try {
    await y();
    const e = await u.readFile(g, "utf-8");
    try {
      return JSON.parse(e);
    } catch {
      const n = e.lastIndexOf("}");
      if (n !== -1) {
        const i = e.slice(0, n + 1);
        try {
          const r = JSON.parse(i);
          return await u.writeFile(g, JSON.stringify(r, null, 2)), r;
        } catch {
        }
      }
      const o = { Tasks: [] };
      return await y(), await u.writeFile(g, JSON.stringify(o, null, 2)), o;
    }
  } catch {
    const e = { Tasks: [] };
    return await y(), await u.writeFile(g, JSON.stringify(e, null, 2)), e;
  }
}
function U(e) {
  return new Promise((n) => setTimeout(n, e));
}
function W(e) {
  var o, i, r, a, s, c, m;
  const n = [];
  return (o = e == null ? void 0 : e.Program) != null && o.Path && n.push({ type: "open", path: e.Program.Path }), (i = e == null ? void 0 : e.Script) != null && i.Path && n.push({ type: "script", path: e.Script.Path, stack: e.Script.Stack ?? ".py" }), ((r = e == null ? void 0 : e.Mouse) == null ? void 0 : r.x) !== void 0 && ((a = e == null ? void 0 : e.Mouse) == null ? void 0 : a.y) !== void 0 && n.push({ type: "mouse", x: e.Mouse.x, y: e.Mouse.y }), (s = e == null ? void 0 : e.Mouse) != null && s.click && n.push({ type: "click", button: e.Mouse.click }), (c = e == null ? void 0 : e.WriteText) != null && c.text && n.push({ type: "write", text: e.WriteText.text }), (m = e == null ? void 0 : e.Delay) != null && m.time && n.push({ type: "delay", ms: e.Delay.time }), n;
}
function E(e) {
  var s;
  const n = String((e == null ? void 0 : e.id) ?? ""), o = String((e == null ? void 0 : e.name) ?? ""), i = Array.isArray(e == null ? void 0 : e.steps), r = i ? e.steps : W(e), a = Number(((s = e == null ? void 0 : e.Loop) == null ? void 0 : s.time) ?? 0);
  return !i && a > 1 && r.length > 0 ? { id: n, name: o, steps: [{ type: "loop", count: a, steps: r }] } : { id: n, name: o, steps: r };
}
async function N(e) {
  if (!(!e || !e.type))
    switch (e.type) {
      case "open":
        e.path && A("file", String(e.path), "");
        break;
      case "script":
        e.path && A("script", String(e.path), String(e.stack ?? ".py"));
        break;
      case "mouse":
        e.x !== void 0 && e.y !== void 0 && (Number(e.x), Number(e.y), B(String(e.x), String(e.y), "left"));
        break;
      case "click":
        V(String(e.button ?? "left"));
        break;
      case "write":
        e.text && q(String(e.text));
        break;
      case "delay":
        await U(Number(e.ms ?? 0));
        break;
      case "loop": {
        const n = Number(e.count ?? 1), o = n > 0 ? n : 1;
        for (let i = 0; i < o; i++)
          for (const r of e.steps ?? [])
            await N(r);
        break;
      }
    }
}
h.handle("get:path", async (e, n) => {
  var i, r;
  if (!((i = p.Task) != null && i.Program) || !((r = p.Task) != null && r.Script)) return;
  let o;
  if (n == "open") {
    if (o = await x.showOpenDialog(l ?? void 0, {
      properties: ["openFile"]
    }), o.canceled)
      return {
        saida: "Operação cancelada"
      };
    p.Task.Program.Path = o.filePaths[0];
  } else {
    if (o = await x.showOpenDialog(l ?? void 0, {
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
    }), o.canceled)
      return {
        saida: "Operação cancelada"
      };
    p.Task.Script.Path = o.filePaths[0];
  }
  return {
    saida: o.filePaths[0]
  };
});
h.on("save:config", async (e, n) => {
  if (n != null && n.id)
    try {
      await y();
      const o = E(n);
      if (!o.id) return;
      const i = await S();
      Array.isArray(i.Tasks) || (i.Tasks = []);
      const r = i.Tasks.findIndex((a) => String((a == null ? void 0 : a.id) ?? "") === o.id);
      r !== -1 ? i.Tasks[r] = { ...i.Tasks[r], ...o } : i.Tasks.push(o), await u.writeFile(g, JSON.stringify(i, null, 2));
    } catch (o) {
      console.log("Falha ao salvar config.json", o);
    }
});
h.handle("config:load", async () => {
  try {
    const e = await S();
    return Array.isArray(e.Tasks) ? e.Tasks : [];
  } catch (e) {
    return console.log("Falha ao carregar config.json", e), [];
  }
});
h.on("config:delete", async (e, n) => {
  const o = String(n ?? "");
  if (o)
    try {
      const i = await S();
      Array.isArray(i.Tasks) || (i.Tasks = []), i.Tasks = i.Tasks.filter((r) => String((r == null ? void 0 : r.id) ?? "") !== o), await u.writeFile(g, JSON.stringify(i, null, 2));
    } catch (i) {
      console.log("Falha ao deletar no config.json", i);
    }
});
h.on("config:play", async (e, n) => {
  const o = await S(), i = Array.isArray(o.Tasks) ? o.Tasks : [], r = String(n ?? ""), a = i.find((c) => {
    const m = String((c == null ? void 0 : c.name) ?? ""), R = String((c == null ? void 0 : c.id) ?? "");
    return r === R || r.toLowerCase() === m.toLowerCase();
  });
  if (!a) {
    console.log("processo nn encontrado");
    return;
  }
  const s = E(a);
  for (const c of s.steps ?? [])
    await N(c);
});
h.on("get:stack", (e, n) => {
  var o, i;
  n == ".py" || n == ".cs" || n == ".cpp" || n == ".c" || n == ".bat" || n == ".ps1" ? (o = p.Task) != null && o.Script && (p.Task.Script.Stack = n) : (i = p.Task) != null && i.Script && (p.Task.Script.Stack = ".py");
});
d.whenReady().then(C);
export {
  T as MAIN_DIST,
  F as RENDERER_DIST,
  w as VITE_DEV_SERVER_URL
};
