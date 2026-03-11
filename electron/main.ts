import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import fs from 'fs/promises'
import path from 'node:path'
import Renderer from 'electron/renderer'
import { exec, spawn } from 'node:child_process'

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
const pathOpenPrograms = isDev ? path.resolve(path.join(MAIN_DIST, "..", "backend", "OpenPrograms", "bin", "Debug", "net10.0", "OpenPrograms.exe")) : path.join(RENDERER_DIST, "backend", "OpenPrograms", "bin", "OpenPrograms.exe")
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
      Stack: "Python" | "python" | "C#" | "c#" | "C++" | "c++" | "C" | "c" | "bat"
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
      Stack: "Python",
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
  try {
    fs.access(pathBackend)
    console.log("O treco existe")
  } catch (e) {
    console.log("O treco nn existe")
  }
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
    let verificacaoTipo = path.extname(pathBackend)
    if (verificacaoTipo != ".py") {
      console.log("O trem nn e python bacana")
      return
    } else {
      let processo = spawn(`${stack} ${pathBackend}`)
      processo.on("close", (code) => {
        console.log("Processo finalizado com código: " + code)
      })
      processo.stderr.on("data", (data) => {
        console.log("Erro: " + data)
      })
    }
  }
}
async function loadJSON() {
  await fs.access(pathJSON)

  const arquivo = await fs.readFile(pathJSON, 'utf-8')
  const json = JSON.parse(arquivo)
  return json
}

ipcMain.handle('get:path', async (event, type) => {
  if (!TaskUser.Task?.Program) return
  if (!TaskUser.Task?.Script) return

  const resultado = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (resultado.canceled) {
    return {
      saida: 'Operação cancelada'
    }
  }
  if (type == "open") {
    TaskUser.Task.Program.Path = resultado.filePaths[0]
  } else {
    TaskUser.Task.Script.Path = resultado.filePaths[0]
  }
  return {
    saida: resultado.filePaths[0]
  }
})

ipcMain.on('save:config', async (event, config) => {
  const { type, name, id, path, x, y, button, text, time, LoopTime } = config
  if (!TaskUser.Task) return
  TaskUser.Task.id = id
  TaskUser.Task.name = name
  if (type == "open") {
    if (TaskUser.Task.Program) TaskUser.Task.Program.Path = path ?? ""
  }
  if (type == "script") {
    if (!TaskUser.Task.Script) return
    TaskUser.Task.Script.Path = path
  }
  if (type == "mouse") {
    if (!TaskUser.Task.Mouse) return
    TaskUser.Task.Mouse.x = x
    TaskUser.Task.Mouse.y = y
  }
  if (type == "click") {
    if (!TaskUser.Task.Mouse) return
    TaskUser.Task.Mouse.click = button
  }
  if (type == "write") {
    if (!TaskUser.Task.WriteText) return
    TaskUser.Task.WriteText.text = text
  }
  if (type == "delay") {
    if (!TaskUser.Task.Delay) return
    TaskUser.Task.Delay.time = time
  }
  if (type == "loop") {
    if (!TaskUser.Task.Loop) return
    TaskUser.Task.Loop.time = LoopTime
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

ipcMain.on('config:play', async (event, name) => {
  const JSONuser = await loadJSON()
  let DataJSON = JSON.stringify(JSONuser, null, 3)
  DataJSON = JSON.parse(DataJSON)
  let ProcessoUser = null
  for (let i = 0; i < DataJSON.Tasks.length; i++) {
    if (name == DataJSON.Tasks[i].name) {
      ProcessoUser = DataJSON.Tasks[i]
      console.log("Encontrei")
      if (ProcessoUser.Program != "") {
        OpenPrograms("File", ProcessoUser.Program.Path, "")
      }
      if (ProcessoUser.Script != "") {
        OpenPrograms("script", ProcessoUser.Script.Path, "python")
      }
      break
    } else {
      console.log("processo nn encontrado")
    }
  }
})

async function teste(name: string) {
  const JSONuser = await loadJSON()
  let DataJSON = JSON.stringify(JSONuser, null, 3)
  DataJSON = JSON.parse(DataJSON)
  let ProcessoUser = null
  for (let i = 0; i < DataJSON.Tasks.length; i++) {
    if (name == DataJSON.Tasks[i].name) {
      ProcessoUser = DataJSON.Tasks[i]
      console.log("Encontrei")
      if (ProcessoUser.Program != "") {
        OpenPrograms("File", ProcessoUser.Program.Path, "")
      }
      if (ProcessoUser.Script != "") {
        OpenPrograms("script", ProcessoUser.Script.Path, "python")
      }
      break
    } else {
      console.log("processo nn encontrado")
    }
  }
}
app.whenReady().then(createWindow)
