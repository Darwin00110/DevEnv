# DevEnv

DevEnv is a desktop automation and development environment orchestrator built with Electron and a native Go backend. It is designed to execute system‑level operations, automate development tasks, and provide a modern graphical interface for developer tooling.

This project showcases real‑world desktop architecture, cross‑language integration, and systems programming using Go.

# 🚀 Key Features
Native backend written in Go for high performance and low‑level system access
Electron + React frontend for a modern cross‑platform desktop UI
Structured IPC communication between Electron and Go
Concurrent task execution using goroutines
Direct system command execution without Node.js wrappers
Packaged as a standalone desktop application
# 🧱 Architecture Overview

The application follows a multi‑process architecture separating UI logic from system execution.
```
[ React UI ]
      │
      ▼
[ Electron Renderer ]
      │ IPC
      ▼
[ Electron Main Process ]
      │ stdio bridge
      ▼
[ Go Backend Binary ]
      │
      ▼
[ Operating System APIs ]
```
Responsibilities by Layer

# React / Renderer

User interface
State and user interactions

# Electron Main Process

Launches and manages the Go backend
Handles IPC and process lifecycle

# Go Backend

Executes system commands
Manages automation tasks
Handles concurrency and task orchestration
Interacts directly with the operating system
# ⚙️ Technical Details
Native Process Management

The Go backend spawns and manages system processes directly using native OS APIs, ensuring predictable execution and improved performance compared to script‑based solutions.

Concurrency with Goroutines

DevEnv executes multiple automation tasks concurrently using Go’s lightweight threading model, enabling efficient parallel operations.

Inter‑Process Communication (IPC)

Electron communicates with the Go backend through a structured IPC pipeline, allowing the UI to trigger and monitor tasks in real time.

# 💻 Tech Stack
Frontend
Electron
React
TailwindCSS
Backend
Go
Native OS process APIs
Build & Packaging
Electron Builder
Go compiler (producing standalone binaries)
# 📁 Project Structure
```
DevEnv/
├── backend/        # Go source code
├── electron/       # Electron main process
├── src/            # React renderer
├── build/          # Compiled assets
└── package.json
```
# 🛠️ Getting Started
Prerequisites
Node.js
Go
Install dependencies
npm install
Build Go backend
go build -o backend/bin/dev-env ./backend
Run in development mode
npm run dev
Build production application
npm run build
# 🔄 Example Workflow
User selects an automation task in the UI
Electron sends an IPC message to the main process
The main process forwards the request to the Go backend
The Go backend executes the command
Output is streamed back to the UI in real time
# 🎯 Use Cases
Automating development environment setup
Running repetitive development commands from a GUI
Managing local tooling and scripts
Serving as a base architecture for desktop automation tools
# 🧠 Why Go Was Chosen

Go was selected for the backend due to:

Fast startup time
Compiled static binaries
Strong concurrency model
Safe and predictable system programming

This makes it ideal for desktop tools that interact directly with the operating system.

---
# Images
![DevEnv Interface](./images/Logo%20futurista%20DevEnv%20com%20símbolos%20tecnológicos.png)
![DevEnv Interface](./images/imagem.png)
![DevEnv Interface](./images/imagem02.png)

---
# 🔮 Future Improvements
Plugin system for custom automation tasks
Profiles for different development stacks
Improved logging and task history
# 🧪 What This Project Demonstrates

# This repository showcases practical experience with:

Desktop application architecture
Cross‑language process orchestration
Systems programming with Go
Concurrent task execution
Packaging and distributing production‑ready software

# 📄 License
MIT
