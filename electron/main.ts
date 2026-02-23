import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

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
    x: 600,
    y: 100,
    width: 700,
    height: 600,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
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

ipcMain.handle('get:path', async (event, type) => {
  if (!TaskUser.Task?.Program) return
  if (!TaskUser.Task?.Script) return

  const resultado = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if(resultado.canceled){
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

ipcMain.handle('save:config', async (event, id, name, type, path, button, x, y, ms, count, text) => {
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
  if (type == "text") {
    if (!TaskUser.Task.WriteText) return
    TaskUser.Task.WriteText.text = text
  }
  if (type == "delay") {
    if (!TaskUser.Task.Delay) return
    TaskUser.Task.Delay.time = ms
  }
  if (type == "loop") {
    if (!TaskUser.Task.Loop) return
    TaskUser.Task.Loop.time = count
  }
})

app.whenReady().then(createWindow)
