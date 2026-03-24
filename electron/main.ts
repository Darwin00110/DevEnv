import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import fs from 'fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import Renderer from 'electron/renderer'
import { exec, spawn } from 'node:child_process'
import { CartesianAxis } from 'recharts'
import { stderr } from 'node:process'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
const isDev = !app.isPackaged
const pathJSON = isDev
  ? path.join(MAIN_DIST, 'config.json')
  : path.join(app.getPath('userData'), 'config.json')
const pathICON = isDev
  ? path.resolve(path.join(MAIN_DIST, "..", "icon", 'icon.ico'))
  : path.join(process.resourcesPath, 'icon', 'dev_env.ico')
const pathBACKEND = (() => {
  if (isDev) {
    return path.resolve(path.join(MAIN_DIST, "..", "backend"))
  }

  const candidates = [
    path.join(process.resourcesPath, 'backend'),
    path.join(app.getAppPath(), 'dist', 'backend'),
    path.join(process.resourcesPath, 'app.asar', 'dist', 'backend'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return path.join(process.resourcesPath, 'backend')
})()
const pathAutomation = path.resolve(path.join(pathBACKEND, "Automation", "Core", "main.exe"))
const pathAutomationClicked = path.resolve(path.join(pathBACKEND, "Automation", "Clicked", "main.exe"))
const pathAutomationKeyboard = path.resolve(path.join(pathBACKEND, "Automation", "Core", "Write", "main.exe"))
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

console.log(process.resourcesPath)

let win: BrowserWindow | null
let lastMousePos: { x: number; y: number; has: boolean } = { x: 0, y: 0, has: false }

interface configUser {
  Task?: {
    name: string,
    id: string,
    Program?: {
      Path: string
    },
    Script?: {
      Stack: ".py" | ".cs" | ".cpp" | ".c" | ".bat" | ".ps1"
      Path: string
    },
    Mouse?: {
      x: number,
      y: number,
      click: 'left' | 'right'
    },
    WriteText?: {
      text: string
    },
    Delay?: {
      time: number
    },
    Loop?: {
      time: number
    }
  }
}

const TaskUser: configUser = {
  Task: {
    name: '',
    id: '',
    Program: {
      Path: ''
    },
    Script: {
      Stack: ".py",
      Path: ''
    },
    Mouse: {
      x: 0,
      y: 0,
      click: 'left'
    },
    WriteText: {
      text: ''
    },
    Delay: {
      time: 0
    },
    Loop: {
      time: 0
    }
  },
}



function createWindow() {
  win = new BrowserWindow({
    x: 740,
    icon: pathICON,
    autoHideMenuBar: true,
    y: 100,
    width: 700,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // When packaged, load from app.asar
    const appPath = app.getAppPath()
    win.loadFile(path.join(appPath, 'dist', 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function OpenPrograms(args: string, Path: string, stack: string) {
  let pathBackend = path.resolve(Path)
  stack = stack ?? ""
  if (args.toLowerCase() == "file") {
    let processo = spawn(pathBackend)
    processo.on("close", (code) => {
      console.log("Processo finalizado com código: " + code)
    })
    processo.stderr.on("data", (data) => {
      console.log("Erro: " + data)
    })
  }
  if (args.toLowerCase() == "script") {
    const verificacaoTipo = path.extname(pathBackend)
    if (verificacaoTipo !== stack) {
      console.log(`Extensão diferente: esperado ${stack}, veio ${verificacaoTipo}`)
      return
    }
    let processo
    if (stack === ".py") {
      processo = spawn("python", [pathBackend])
    } else if (stack === ".c") {
      processo = spawn("gcc", [pathBackend])
    } else if (stack === ".cs") {
      processo = spawn("dotnet run", [pathBackend])
    } else if (stack === ".cpp") {
      processo = spawn("g++", [pathBackend])
    } else if (stack === ".ps1") {
      processo = spawn("powershell", ["-ExecutionPolicy", "Bypass", "-File", pathBackend])
    } else if (stack === ".bat") {
      processo = spawn("cmd", ["/c", pathBackend])
    } else {
      console.log(`Stack ${stack} ainda não suportada para execução`)
      return
    }

    processo.on("close", (code) => {
      console.log("Processo finalizado com código: " + code)
    })
    processo.stderr.on("data", (data) => {
      console.log("Erro: " + data)
    })
  }
}

function CallAutomationMouse(x: string, y: string, imagePath: string = "") {
  exec(`${pathAutomation} ${x} ${y} ${imagePath}`, (error, stdout) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`)
    }
    console.log(`stdout: ${stdout}`)
  })
}
function CallAutomationMouseClicked(button: string) {
  exec(`${pathAutomationClicked} ${button}`, (error) => {
    if (error) {
      console.log("Erro na chamada do click do mouse")
    }
  })
}


function CallAutomationKeyboard(text: string) {
  console.log("to chegando aqui")
  exec(`${pathAutomationKeyboard} ${text}`, (error, stdout) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`)
    }
    console.log(`Saida: ${stdout}`)
  })
}


async function ensureConfigDir() {
  await fs.mkdir(path.dirname(pathJSON), { recursive: true })
}

async function loadJSON() {
  try {
    await ensureConfigDir()
    const arquivo = await fs.readFile(pathJSON, 'utf-8')
    try {
      return JSON.parse(arquivo)
    } catch {
      const lastBrace = arquivo.lastIndexOf('}')
      if (lastBrace !== -1) {
        const trimmed = arquivo.slice(0, lastBrace + 1)
        try {
          const parsed = JSON.parse(trimmed)
          await fs.writeFile(pathJSON, JSON.stringify(parsed, null, 2))
          return parsed
        } catch {
          // fall through
        }
      }
      const fallback = { Tasks: [] }
      await ensureConfigDir()
      await fs.writeFile(pathJSON, JSON.stringify(fallback, null, 2))
      return fallback
    }
  } catch {
    const fallback = { Tasks: [] }
    await ensureConfigDir()
    await fs.writeFile(pathJSON, JSON.stringify(fallback, null, 2))
    return fallback
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function buildStepsFromLegacy(task: any) {
  const steps: any[] = []
  if (task?.Program?.Path) steps.push({ type: 'open', path: task.Program.Path })
  if (task?.Script?.Path) steps.push({ type: 'script', path: task.Script.Path, stack: task.Script.Stack ?? '.py' })
  if (task?.Mouse?.x !== undefined && task?.Mouse?.y !== undefined) {
    steps.push({ type: 'mouse', x: task.Mouse.x, y: task.Mouse.y })
  }
  if (task?.Mouse?.click) steps.push({ type: 'click', button: task.Mouse.click })
  if (task?.WriteText?.text) steps.push({ type: 'write', text: task.WriteText.text })
  if (task?.Delay?.time) steps.push({ type: 'delay', ms: task.Delay.time })
  return steps
}

function normalizeTask(task: any) {
  const id = String(task?.id ?? '')
  const name = String(task?.name ?? '')
  const hasSteps = Array.isArray(task?.steps)
  const steps = hasSteps ? task.steps : buildStepsFromLegacy(task)
  const loopCount = Number(task?.Loop?.time ?? 0)
  if (!hasSteps && loopCount > 1 && steps.length > 0) {
    return { id, name, steps: [{ type: 'loop', count: loopCount, steps }] }
  }
  return { id, name, steps }
}

async function executeStep(step: any): Promise<void> {
  if (!step || !step.type) return
  switch (step.type) {
    case 'open':
      if (step.path) OpenPrograms("file", String(step.path), "")
      break
    case 'script':
      if (step.path) OpenPrograms("script", String(step.path), String(step.stack ?? ".py"))
      break
    case 'mouse':
      if (step.x !== undefined && step.y !== undefined) {
        lastMousePos = { x: Number(step.x), y: Number(step.y), has: true }
        // move only (no click) to avoid unintended clicks
        CallAutomationMouse(String(step.x), String(step.y), "left")
      }
      break
    case 'click':
      CallAutomationMouseClicked(String(step.button ?? 'left'))
      break
    case 'write':
      if (step.text) CallAutomationKeyboard(String(step.text))
      break
    case 'delay':
      await sleep(Number(step.ms ?? 0))
      break
    case 'loop': {
      const count = Number(step.count ?? 1)
      const safeCount = count > 0 ? count : 1
      for (let i = 0; i < safeCount; i++) {
        for (const inner of step.steps ?? []) {
          await executeStep(inner)
        }
      }
      break
    }
  }
}

ipcMain.handle('get:path', async (event, type) => {
  if (!TaskUser.Task?.Program) return
  if (!TaskUser.Task?.Script) return

  let resultado: Electron.OpenDialogReturnValue
  if (type == "open") {
    resultado = await dialog.showOpenDialog(win ?? undefined, {
      properties: ['openFile']
    })
    if (resultado.canceled) {
      return {
        saida: 'Operação cancelada'
      }
    }
    TaskUser.Task.Program.Path = resultado.filePaths[0]
  } else {
    resultado = await dialog.showOpenDialog(win ?? undefined, {
      properties: ['openFile'],
      filters: [
        {
          name: 'Scripts',
          extensions: ['py', 'cs', 'cpp', 'c', 'bat', 'ps1']
        },
        {
          name: 'All Files',
          extensions: ['*']
        }
      ]
    })
    if (resultado.canceled) {
      return {
        saida: 'Operação cancelada'
      }
    }
    TaskUser.Task.Script.Path = resultado.filePaths[0]
  }
  return {
    saida: resultado.filePaths[0]
  }
})

ipcMain.on('save:config', async (event, automation) => {
  if (!automation?.id) return
  try {
    await ensureConfigDir()
    const task = normalizeTask(automation)
    if (!task.id) return
    const json = await loadJSON()
    if (!Array.isArray(json.Tasks)) json.Tasks = []

    const index = json.Tasks.findIndex((t: any) => String(t?.id ?? '') === task.id)
    if (index !== -1) {
      json.Tasks[index] = { ...json.Tasks[index], ...task }
    } else {
      json.Tasks.push(task)
    }

    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2))
  } catch (e) {
    console.log("Falha ao salvar config.json", e)
  }
})

ipcMain.handle('config:load', async () => {
  try {
    const json = await loadJSON()
    return Array.isArray(json.Tasks) ? json.Tasks : []
  } catch (e) {
    console.log("Falha ao carregar config.json", e)
    return []
  }
})

ipcMain.on('config:delete', async (event, id) => {
  const idStr = String(id ?? '')
  if (!idStr) return
  try {
    const json = await loadJSON()
    if (!Array.isArray(json.Tasks)) json.Tasks = []
    json.Tasks = json.Tasks.filter((t: any) => String(t?.id ?? '') !== idStr)
    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2))
  } catch (e) {
    console.log("Falha ao deletar no config.json", e)
  }
})

ipcMain.on('config:play', async (event, key) => {
  const JSONuser = await loadJSON()
  const tasks = Array.isArray(JSONuser.Tasks) ? JSONuser.Tasks : []
  const keyStr = String(key ?? '')
  const task = tasks.find((t: any) => {
    const nameStr = String(t?.name ?? '')
    const idStr = String(t?.id ?? '')
    return keyStr === idStr || keyStr.toLowerCase() === nameStr.toLowerCase()
  })

  if (!task) {
    console.log("processo nn encontrado")
    return
  }

  const normalized = normalizeTask(task)
  for (const step of normalized.steps ?? []) {
    await executeStep(step)
  }
})

ipcMain.on("get:stack", (event, stack: string) => {
  if (stack == ".py" || stack == ".cs" || stack == ".cpp" || stack == ".c" || stack == ".bat" || stack == ".ps1") {
    if (TaskUser.Task?.Script) {
      TaskUser.Task.Script.Stack = stack
    }
  } else {
    if (TaskUser.Task?.Script) {
      TaskUser.Task.Script.Stack = ".py"
    }
  }
})


app.whenReady().then(createWindow)



