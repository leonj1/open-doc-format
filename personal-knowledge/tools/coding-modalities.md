---
type: Convention
title: Coding Modalities
description: The four ways I interface with code — VSCode, Zed, Devboxer, and Telegram — and when I use each.
tags: [tools, ide, coding, modalities]
timestamp: 2026-06-19T00:00:00Z
---

# Overview

I operate across four distinct coding modalities depending on the task, location, and whether I'm working with or without AI assistance. Each has a clear role.

# The Four Modalities

## 1. Visual Studio Code — Primary IDE

My default for writing code by hand (non-AI-assisted coding). VSCode is the most flexible — extensions, terminal integration, debugger, git tooling. It's where I do serious development work when I'm authoring code directly rather than directing an agent.

## 2. Zed — Speed and Aesthetics

I use [Zed](https://zed.dev) when I want a fast, beautiful editor. It's not my daily driver due to VSCode's deeper ecosystem, but I reach for it when responsiveness and clean design matter more than extension breadth.

## 3. Devboxer — Remote AI-Powered Development

[Devboxer](https://devboxer.com) is a cloud-based remote development environment. The workflow:

1. I give it a GitHub repository URL.
2. An AI coding tool (Codex) launches and runs on Devboxer's cloud infrastructure.
3. The AI works on the codebase and produces a **GitHub pull request** as its output.
4. I review and merge the PR — the code never touches my local machine.

Recently I connected Devboxer to my Railway credentials, so it can also **manage deployments directly** — creating, updating, and monitoring services on Railway without me touching a terminal.

**When I use it:** When I need to get something done remotely, without my own IDE or machines, or when I want an AI agent to do the heavy lifting and I just review the PR.

## 4. Telegram — Codebase Exploration and Light Coding

I use Telegram as a lightweight coding interface, primarily for:

- **Exploring a codebase** — reading, searching, understanding structure.
- **Light coding tasks** — small changes, fixes, or experiments that don't warrant opening a full IDE.

It's my quick-access modality — lower friction than launching VSCode or setting up a Devboxer session.

# Default Environment

I default to **Linux** for all coding. Whether on a local machine, remote server, or cloud environment, Linux is the operating system I build on.
