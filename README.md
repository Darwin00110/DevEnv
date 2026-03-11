# DevEnv

DevEnv is a modern development environment designed to simplify common programming tasks and system automation.
The application combines modern web technologies with native system integration, allowing developers to execute commands, automate workflows, and manage projects from a single interface.

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

DevEnv combines multiple technologies to create a hybrid development environment:

* Modern Web Interface
* Native System Command Execution
* Task Automation
* Interactive Terminal

---

# Technologies Used

## Frontend

* React
* TypeScript
* TailwindCSS
* Electron / Fenestra

## Backend / System Integration

* C#
* .NET
* ProcessStartInfo
* Native system process execution

## Communication Layer

* IPC (Electron ↔ Backend)
* External process execution

---

# Architecture

## System Architecture

DevEnv follows a layered architecture separating the user interface, application logic, and system-level operations.

```
React (User Interface)
        ↓
Electron / Node (Bridge Layer)
        ↓
C# Backend (.NET)
        ↓
Operating System
```

## Architecture Benefits

* Clear separation of responsibilities
* Modern UI built with web technologies
* Native system integration
* Better control over process execution

---

# Features

## Integrated Terminal

DevEnv includes an internal terminal that allows users to execute commands directly from the graphical interface.

Example commands:

```
-help
-build
-run
-open
```

Terminal features include:

* Interactive command input
* Terminal-style typing effect
* Asynchronous command execution
* Expandable command system

---

## System Process Execution

The C# backend enables the application to execute operating system processes with greater reliability and control.

This enables:

* Opening external applications
* Running scripts
* Automating development workflows
* Managing system tools

---

## Modern Interface

The graphical interface is built using React and TailwindCSS.

The UI design prioritizes:

* Simplicity
* Speed
* Responsiveness
* Immersive user experience

---

# Project Structure

## Folder Organization

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
│   ├─ commands
│   ├─ services
│   └─ system
│
├─ electron
│   ├─ main
│   └─ preload
│
└─ README.md
```

---

# Pictures

## Application Interface

![DevEnv Interface](assets/interface.png)

## Integrated Terminal

![DevEnv Terminal](assets/terminal.png)

## Command Execution Example

![DevEnv Commands](assets/commands.png)

*(Replace these images with actual screenshots from your project.)*

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

## Install dependencies

```
npm install
```

## Run the application

```
npm run dev
```

---

# Build

## Build frontend

```
npm run build
```

## Build backend (.NET)

```
dotnet publish
```

---

# Project Goals

DevEnv aims to evolve into a powerful development environment capable of:

* Centralizing development tools
* Automating repetitive tasks
* Providing fast command execution
* Improving developer workflow

---

# Roadmap

## Planned Features

* Command history
* Terminal autocomplete
* Plugin system
* Integration with development tools
* Configurable automation

---

# Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request


# 📸 Image
<img width="1536" height="1024" alt="Logo futurista DevEnv com símbolos tecnológicos" src="https://github.com/user-attachments/assets/97189ca8-73ed-48ae-a53d-a7f73990a3a3" />
<img width="1440" height="900" alt="Captura de tela 2026-03-02 165325" src="https://github.com/user-attachments/assets/f332c353-3e8b-4925-bf07-ea8a0272628f" />
<img width="1440" height="900" alt="Captura de tela 2026-03-02 165345" src="https://github.com/user-attachments/assets/7260059c-91f4-4da5-a820-9474f48fd92f" />

---

# License

This project is distributed under the MIT License.

---

# Author

Developed by Darwin.
