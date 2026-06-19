---
type: Convention
title: Language Preferences
description: Which programming languages I use and the decision framework for choosing one over another.
tags: [conventions, languages, typescript, python, go, java, rust]
timestamp: 2026-06-19T00:00:00Z
---

# Decision Framework

I choose languages based on the problem, not out of loyalty. Each has a clear lane.

# Primary Languages

## TypeScript

**When:** Backend development focused on **AI or LLMs**. Also when I must have **strong types**.

TypeScript is my go-to for AI-heavy backends — the Node.js ecosystem has the richest AI/LLM library support, and TypeScript's type system catches errors early in complex async workflows.

## Python

**When:** Backends requiring **extensibility** — plugin systems, scripting surfaces, data science integrations, or when the library ecosystem for a domain is Python-native.

Python's dynamic nature and import system make it ideal when the code needs to be extended by users or composed dynamically. Lower ceremony than TypeScript for rapid iteration.

## Go

**When:** I need a backend that compiles into a **statically linked binary** — CLI tools, daemons, services where a single deployable artifact matters more than runtime flexibility.

Go's cross-compilation and zero-dependency binaries make it the right choice when deployment simplicity is the priority.

# Secondary Languages

## Java

**Optional.** I can work in it when a project or ecosystem demands it, but I don't reach for it by default. The JVM and its tooling add ceremony I prefer to avoid.

## Rust

**Rare.** Only when the project or goal explicitly requires it — performance-critical systems, WebAssembly targets, or when joining an existing Rust codebase. Not a default choice.
