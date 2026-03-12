import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import fs from 'fs/promises'
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
const pathJSON = isDev ? path.join(MAIN_DIST, 'config.json') : path.join(RENDERER_DIST, 'config.json')
const pathICON = isDev ? path.resolve(path.join(MAIN_DIST, "..", "icon", 'icon.ico')) : path.join(RENDERER_DIST, 'icon.ico')
const pathBACKEND = isDev ? path.resolve(path.join(MAIN_DIST, "..", "backend")) : path.join(RENDERER_DIST, 'backend')
const pathAutomation = isDev ? path.resolve(path.join(pathBACKEND, "Automation", "bin", "Release", "net10.0", "win-x64", "publish", "Automation.exe")) : path.join(RENDERER_DIST, 'dist', 'Automation')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

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
    fullscreen: true,
    x: 740,
    icon: pathICON,
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
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
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

function CallAutomationMouse(mode: string, x: string, y: string, button: string, delay: string) {
  const processo = exec(`${pathAutomation} ${mode} ${x} ${y} ${button} ${delay}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`)
    }
    console.log(`stdout: ${stdout}`)
  })
}

function CallAutomationKeyboard(mode: string, text: string, delay: string) {
  exec(`${pathAutomation} ${mode} ${text} ${delay}`, (error, stdout) => {
    if (error) {
      console.log(`Erro do treco aqui parceiro: ${error}`)
    }
    console.log(`stdout: ${stdout}`)
  })
}


async function loadJSON() {
  await fs.access(pathJSON)

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
    await fs.writeFile(pathJSON, JSON.stringify(fallback, null, 2))
    return fallback
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

ipcMain.on('save:config', async (event, config) => {
  const { type, name, id, path, x, y, button, text, time, LoopTime } = config
  if (!id) return

  const defaultTask = () => ({
    id,
    name: name ?? '',
    Program: { Path: '' },
    Script: { Stack: '.py', Path: '' },
    Mouse: { x: 0, y: 0, click: 'left' },
    WriteText: { text: '' },
    Delay: { time: 0 },
    Loop: { time: 0 }
  })

  try {
    await fs.access(pathJSON)

    const arquivo = await fs.readFile(pathJSON, 'utf-8')
    const json = JSON.parse(arquivo)

    if (!json.Tasks) {
      json.Tasks = []
    }

    const index = json.Tasks.findIndex((t: any) => t.id === id)
    const task = index !== -1 ? json.Tasks[index] : defaultTask()

    task.id = id
    if (name !== undefined) task.name = name

    if (type == "open") {
      if (!task.Program) task.Program = { Path: '' }
      if (path !== undefined) task.Program.Path = path ?? ""
    }
    if (type == "script") {
      if (!task.Script) task.Script = { Stack: '.py', Path: '' }
      if (path !== undefined) task.Script.Path = path ?? ""
    }
    if (type == "mouse") {
      if (!task.Mouse) task.Mouse = { x: 0, y: 0, click: 'left' }
      if (x !== undefined) task.Mouse.x = x
      if (y !== undefined) task.Mouse.y = y
    }
    if (type == "click") {
      if (!task.Mouse) task.Mouse = { x: 0, y: 0, click: 'left' }
      if (button !== undefined) task.Mouse.click = button
    }
    if (type == "write") {
      if (!task.WriteText) task.WriteText = { text: '' }
      if (text !== undefined) task.WriteText.text = text ?? ""
    }
    if (type == "delay") {
      if (!task.Delay) task.Delay = { time: 0 }
      if (time !== undefined) task.Delay.time = time ?? 0
    }
    if (type == "loop") {
      if (!task.Loop) task.Loop = { time: 0 }
      if (LoopTime !== undefined) task.Loop.time = LoopTime ?? 0
    }

    if (index !== -1) {
      json.Tasks[index] = task
    } else {
      json.Tasks.push(task)
    }

    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2))
    return
  } catch (e) {
    const novo = { Tasks: [defaultTask()] }
    await fs.writeFile(pathJSON, JSON.stringify(novo, null, 2))
    return
  }
  try {
    await fs.access(pathJSON)

    const arquivo = await fs.readFile(pathJSON, 'utf-8')
    const json = JSON.parse(arquivo)

    if (!json.Tasks) {
      json.Tasks = []
    }

    // verifica se já existe tarefa com mesmo id
    const index = json.Tasks.findIndex((t: any) => t.id === id)

    if (index !== -1) {
      // atualiza existente
      json.Tasks[index] = TaskUser.Task
    } else {
      // adiciona nova
      json.Tasks.push(TaskUser.Task)
    }

    await fs.writeFile(pathJSON, JSON.stringify(json, null, 2))

  } catch (e) {
    // arquivo não existe → cria novo
    const novo = {
      Tasks: [TaskUser.Task]
    }

    await fs.writeFile(pathJSON, JSON.stringify(novo, null, 2))
  }
})

ipcMain.on('config:play', async (event, key) => {
  console.log(key)
  const JSONuser = await loadJSON()
  let DataJSON = JSON.stringify(JSONuser, null, 3)
  DataJSON = JSON.parse(DataJSON)
  let ProcessoUser = null
  let found = false
  for (let i = 0; i < DataJSON.Tasks.length; i++) {
    const task = DataJSON.Tasks[i]
    const keyStr = String(key ?? '')
    const nameStr = String(task?.name ?? '')
    const idStr = String(task?.id ?? '')
    if (keyStr === idStr || keyStr.toLowerCase() === nameStr.toLowerCase()) {
      ProcessoUser = task
      found = true
      const loopCountRaw = Number(ProcessoUser.Loop?.time ?? 1)
      const loopCount = loopCountRaw > 0 ? loopCountRaw : 1
      for (let i = 0; i < loopCount; i++) {
        console.log("Encontrei")
        if (ProcessoUser.Program?.Path) {
          OpenPrograms("File", ProcessoUser.Program.Path, "")
        }
        if (ProcessoUser.Script?.Path) {
          OpenPrograms("script", ProcessoUser.Script.Path, ProcessoUser.Script.Stack ?? ".py")
        }
        if (ProcessoUser.Mouse?.x != 0 && ProcessoUser.Mouse?.y != 0) {
          CallAutomationMouse("mouse", ProcessoUser.Mouse.x, ProcessoUser.Mouse.y, ProcessoUser.Mouse.click, ProcessoUser.Delay?.time ?? 0)
        }
        if (ProcessoUser.WriteText?.text != "") {
          CallAutomationKeyboard("write", ProcessoUser.WriteText.text, ProcessoUser.Delay?.time ?? 0)
        }
      }
      break
    }
  }
  if (!found) {
    console.log("processo nn encontrado")
  }
})

async function teste(texto: string) {
  const processo = spawn(`cmd.exe /c ${texto}`)
  processo.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`)
  })
  processo.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`)
  })
  processo.on("close", (code) => {
    console.log(`Processo finalizado com código: ${code}`)
  })
}

ipcMain.on("get:stack", (event, stack: string) => {
  if (stack == ".py" || stack == ".cs" || stack == ".cpp" || stack == ".c" || stack == ".bat" || stack == ".ps1") {
    if (TaskUser.Task?.Script) {
      TaskUser.Task.Script.Stack = stack
    }
    console.log(stack)
  } else {
    if (TaskUser.Task?.Script) {
      TaskUser.Task.Script.Stack = ".py"
    }
  }
})
teste("dir")
//app.whenReady().then(createWindow)



