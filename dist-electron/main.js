import { app as y, BrowserWindow as j, ipcMain as g, dialog as v } from "electron";
import { createRequire as $ } from "node:module";
import { fileURLToPath as F } from "node:url";
import u from "fs/promises";
import t from "node:path";
import { exec as P, spawn as d } from "node:child_process";
$(import.meta.url);
const O = t.dirname(F(import.meta.url));
process.env.APP_ROOT = t.join(O, "..");
const T = process.env.VITE_DEV_SERVER_URL, x = t.join(process.env.APP_ROOT, "dist-electron"), f = t.join(process.env.APP_ROOT, "dist"), h = !y.isPackaged, _ = t.join(process.resourcesPath), m = h ? t.join(x, "config.json") : t.join(f, "config.json"), D = h ? t.resolve(t.join(x, "..", "icon", "icon.ico")) : t.join(f, "icon.ico"), b = h ? t.resolve(t.join(x, "..", "backend")) : t.join(f, "backend"), L = h ? t.resolve(t.join(b, "Automation", "Core", "main.exe")) : t.join(f, "backend", "Automation", "main.exe"), I = h ? t.resolve(t.join(b, "Automation", "Clicked", "main.exe")) : t.join(f, "backend", "Automation", "Clicked", "main.exe"), J = h ? t.resolve(t.join(b, "Automation", "Core", "Write", "main.exe")) : t.join(f, "backend", "Automation", "Core", "Write", "main.exe");
process.env.VITE_PUBLIC = T ? t.join(process.env.APP_ROOT, "public") : f;
console.log(_);
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
  l = new j({
    x: 740,
    icon: D,
    y: 100,
    width: 700,
    height: 600,
    webPreferences: {
      preload: t.join(O, "preload.mjs")
    }
  }), l.webContents.on("did-finish-load", () => {
    l == null || l.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), T ? (l.loadURL(T), l.webContents.openDevTools()) : l.loadFile(t.join(f, "index.html"));
}
y.on("window-all-closed", () => {
  process.platform !== "darwin" && (y.quit(), l = null);
});
y.on("activate", () => {
  j.getAllWindows().length === 0 && C();
});
function A(e, n, o) {
  let i = t.resolve(n);
  if (o = o ?? "", e.toLowerCase() == "file") {
    let r = d(i);
    r.on("close", (c) => {
      console.log("Processo finalizado com código: " + c);
    }), r.stderr.on("data", (c) => {
      console.log("Erro: " + c);
    });
  }
  if (e.toLowerCase() == "script") {
    const r = t.extname(i);
    if (r !== o) {
      console.log(`Extensão diferente: esperado ${o}, veio ${r}`);
      return;
    }
    let c;
    if (o === ".py")
      c = d("python", [i]);
    else if (o === ".c")
      c = d("gcc", [i]);
    else if (o === ".cs")
      c = d("dotnet run", [i]);
    else if (o === ".cpp")
      c = d("g++", [i]);
    else if (o === ".ps1")
      c = d("powershell", ["-ExecutionPolicy", "Bypass", "-File", i]);
    else if (o === ".bat")
      c = d("cmd", ["/c", i]);
    else {
      console.log(`Stack ${o} ainda não suportada para execução`);
      return;
    }
    c.on("close", (a) => {
      console.log("Processo finalizado com código: " + a);
    }), c.stderr.on("data", (a) => {
      console.log("Erro: " + a);
    });
  }
}
function M(e, n, o = "") {
  P(`${L} ${e} ${n} ${o}`, (i, r) => {
    i && console.log(`Erro do treco aqui parceiro: ${i}`), console.log(`stdout: ${r}`);
  });
}
function V(e) {
  P(`${I} ${e}`, (n) => {
    n && console.log("Erro na chamada do click do mouse");
  });
}
function W(e) {
  console.log("to chegando aqui"), P(`${J} ${e}`, (n, o) => {
    n && console.log(`Erro do treco aqui parceiro: ${n}`), console.log(`Saida: ${o}`);
  });
}
async function w() {
  try {
    const e = await u.readFile(m, "utf-8");
    try {
      return JSON.parse(e);
    } catch {
      const n = e.lastIndexOf("}");
      if (n !== -1) {
        const i = e.slice(0, n + 1);
        try {
          const r = JSON.parse(i);
          return await u.writeFile(m, JSON.stringify(r, null, 2)), r;
        } catch {
        }
      }
      const o = { Tasks: [] };
      return await u.writeFile(m, JSON.stringify(o, null, 2)), o;
    }
  } catch {
    const e = { Tasks: [] };
    return await u.writeFile(m, JSON.stringify(e, null, 2)), e;
  }
}
function q(e) {
  return new Promise((n) => setTimeout(n, e));
}
function B(e) {
  var o, i, r, c, a, s, S;
  const n = [];
  return (o = e == null ? void 0 : e.Program) != null && o.Path && n.push({ type: "open", path: e.Program.Path }), (i = e == null ? void 0 : e.Script) != null && i.Path && n.push({ type: "script", path: e.Script.Path, stack: e.Script.Stack ?? ".py" }), ((r = e == null ? void 0 : e.Mouse) == null ? void 0 : r.x) !== void 0 && ((c = e == null ? void 0 : e.Mouse) == null ? void 0 : c.y) !== void 0 && n.push({ type: "mouse", x: e.Mouse.x, y: e.Mouse.y }), (a = e == null ? void 0 : e.Mouse) != null && a.click && n.push({ type: "click", button: e.Mouse.click }), (s = e == null ? void 0 : e.WriteText) != null && s.text && n.push({ type: "write", text: e.WriteText.text }), (S = e == null ? void 0 : e.Delay) != null && S.time && n.push({ type: "delay", ms: e.Delay.time }), n;
}
function E(e) {
  var a;
  const n = String((e == null ? void 0 : e.id) ?? ""), o = String((e == null ? void 0 : e.name) ?? ""), i = Array.isArray(e == null ? void 0 : e.steps), r = i ? e.steps : B(e), c = Number(((a = e == null ? void 0 : e.Loop) == null ? void 0 : a.time) ?? 0);
  return !i && c > 1 && r.length > 0 ? { id: n, name: o, steps: [{ type: "loop", count: c, steps: r }] } : { id: n, name: o, steps: r };
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
        e.x !== void 0 && e.y !== void 0 && (Number(e.x), Number(e.y), M(String(e.x), String(e.y), "left"));
        break;
      case "click":
        V(String(e.button ?? "left"));
        break;
      case "write":
        e.text && W(String(e.text));
        break;
      case "delay":
        await q(Number(e.ms ?? 0));
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
g.handle("get:path", async (e, n) => {
  var i, r;
  if (!((i = p.Task) != null && i.Program) || !((r = p.Task) != null && r.Script)) return;
  let o;
  if (n == "open") {
    if (o = await v.showOpenDialog(l ?? void 0, {
      properties: ["openFile"]
    }), o.canceled)
      return {
        saida: "Operação cancelada"
      };
    p.Task.Program.Path = o.filePaths[0];
  } else {
    if (o = await v.showOpenDialog(l ?? void 0, {
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
g.on("save:config", async (e, n) => {
  if (n != null && n.id)
    try {
      const o = E(n);
      if (!o.id) return;
      const i = await w();
      Array.isArray(i.Tasks) || (i.Tasks = []);
      const r = i.Tasks.findIndex((c) => String((c == null ? void 0 : c.id) ?? "") === o.id);
      r !== -1 ? i.Tasks[r] = { ...i.Tasks[r], ...o } : i.Tasks.push(o), await u.writeFile(m, JSON.stringify(i, null, 2));
    } catch (o) {
      console.log("Falha ao salvar config.json", o);
    }
});
g.handle("config:load", async () => {
  try {
    const e = await w();
    return Array.isArray(e.Tasks) ? e.Tasks : [];
  } catch (e) {
    return console.log("Falha ao carregar config.json", e), [];
  }
});
g.on("config:delete", async (e, n) => {
  const o = String(n ?? "");
  if (o)
    try {
      const i = await w();
      Array.isArray(i.Tasks) || (i.Tasks = []), i.Tasks = i.Tasks.filter((r) => String((r == null ? void 0 : r.id) ?? "") !== o), await u.writeFile(m, JSON.stringify(i, null, 2));
    } catch (i) {
      console.log("Falha ao deletar no config.json", i);
    }
});
g.on("config:play", async (e, n) => {
  const o = await w(), i = Array.isArray(o.Tasks) ? o.Tasks : [], r = String(n ?? ""), c = i.find((s) => {
    const S = String((s == null ? void 0 : s.name) ?? ""), R = String((s == null ? void 0 : s.id) ?? "");
    return r === R || r.toLowerCase() === S.toLowerCase();
  });
  if (!c) {
    console.log("processo nn encontrado");
    return;
  }
  const a = E(c);
  for (const s of a.steps ?? [])
    await N(s);
});
g.on("get:stack", (e, n) => {
  var o, i;
  n == ".py" || n == ".cs" || n == ".cpp" || n == ".c" || n == ".bat" || n == ".ps1" ? (o = p.Task) != null && o.Script && (p.Task.Script.Stack = n) : (i = p.Task) != null && i.Script && (p.Task.Script.Stack = ".py");
});
y.whenReady().then(C);
export {
  x as MAIN_DIST,
  f as RENDERER_DIST,
  T as VITE_DEV_SERVER_URL
};
