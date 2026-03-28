# DevEnv

DevEnv is a desktop automation orchestrator powered by a native Go backend that performs low-level system interactions and task orchestration.

---

# Overview

## Purpose

DevEnv aims to provide developers with a centralized tool to execute development tasks and system operations efficiently.

The project focuses on:

* Reducing repetitive development tasks
* Integrating development tools
* Automating system actions
* Providing a fast and modern interface

## Concept

DevEnv is built as a hybrid desktop application that merges a web-based interface with a high‑performance native backend written in Go.

It provides:

* Modern Web Interface
* Native System Command Execution via Go

* Key Technical Features
- Native process spawning and management in Go
- Concurrent task orchestration using goroutines
- Direct system command execution without Node wrappers
- IPC bridge between Electron and Go backend

* Task Automation
* Interactive Terminal

---

# Technologies Used

## Frontend

* React
* TypeScript
* TailwindCSS

## Desktop Shell

* Electron / Fenestra

## Backend

* Go (Golang)
* robotgo
* os/exec
* Native process and system control

## Communication Layer

* IPC (Electron ↔ Go backend)
* External process execution and structured command routing

---

# Architecture

## System Architecture

DevEnv uses a layered architecture to separate presentation, orchestration, and system-level execution.

```
React (User Interface)
        ↓
Electron / Fenestra (Bridge Layer)
        ↓
        Go Backend (Core Engine)
        ↓
Operating System
```

## Responsibilities by Layer

### React (UI Layer)

* Handles rendering and user interaction
* Provides terminal interface and command input
* Displays logs, output, and status messages

### Electron / Fenestra (Bridge Layer)

* Manages application window and lifecycle
* Handles IPC between the UI and Go backend
* Spawns and monitors backend processes

### Go Backend (Core Engine)

* Executes system commands
* Automates OS-level tasks
* Handles mouse and keyboard automation via robotgo
* Provides command parsing and execution logic

---

# Key Features

## Integrated Terminal

DevEnv includes a built-in terminal that allows users to execute commands directly from the graphical interface.

Example commands:

```
-help
-build
-run
-open
```

Terminal capabilities:

* Interactive command input
* Terminal-style typing effect
* Asynchronous command execution
* Expandable command system implemented in Go

---

## System Automation via Go

The Go backend provides reliable and high-performance access to system resources.

This enables:

* Opening external applications
* Running scripts and binaries
* Automating development workflows
* Controlling mouse and keyboard input

Go was chosen due to:

* Native compilation
* High performance
* Easy distribution without requiring a runtime

---

## Modern User Interface

The graphical interface is built using React and TailwindCSS to provide a responsive and fluid development experience.

UI goals:

* Simplicity
* Speed
* Minimal latency between command input and execution

---

# Project Structure

```
DevEnv
│
├─ frontend
│   ├─ components
│   ├─ pages
│   ├─ hooks
│   └─ styles
│
├─ backend
│   ├─ core
│   │   ├─ main.go
│   │   ├─ parser.go
│   │   └─ executor.go
│   │
│   ├─ automation
│   │   ├─ clicked.go
│   │   └─ movement.go
│   │
│   └─ services
│       ├─ process.go
│       └─ system.go
│
├─ electron
│   ├─ main
│   └─ preload
│
└─ README.md
```

This structure separates command parsing, automation logic, and system services to keep the backend maintainable and scalable.

---

# Command Flow Example

```
User types command in UI
        ↓
React sends command via IPC
        ↓
Electron forwards to Go backend
        ↓
Go parses command and executes action
        ↓
Output returned to UI
```

---

# Installation

## Clone the repository

```
git clone https://github.com/your-username/devenv.git
```

## Enter the project directory

```
cd devenv
```

## Install frontend dependencies

```
npm install
```

## Run the application in development mode

```
npm run dev
```

---

# Building the Project

## Build Frontend

```
npm run build
```

## Build Go Backend

```
cd backend
go build -o devenv-backend main.go
```

This produces a native executable that Electron will spawn during runtime.

---

# Project Goals

DevEnv aims to evolve into a powerful development environment capable of:

* Centralizing development tools
* Automating repetitive tasks
* Providing fast command execution
* Integrating deeply with the operating system

---

# Roadmap

Planned features:

* Command history
* Terminal autocomplete
* Plugin system for extending Go commands
* Integration with external development tools
* Configurable automation profiles

---

# Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

---
# Images
![DevEnv Interface](./images/Logo%20futurista%20DevEnv%20com%20símbolos%20tecnológicos.png)
![DevEnv Interface](./images/imagem.png)
![DevEnv Interface](./images/imagem02.png)

---

# License

This project is distributed under the MIT License.

---

# Author

Developed by Darwin.
