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

const TaskUser: configUser = {
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
}


function createWindow() {
  win = new BrowserWindow({
    x: 600,
    y: 100,
    width: 600,
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
  const resultado = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (type == "open") {
    TaskUser.Program.Path = resultado.filePaths[0]
  } else {
    TaskUser.Script.Path = resultado.filePaths[0]
  }
  return {
    saida: resultado.filePaths[0]
  }
})


app.whenReady().then(createWindow)
