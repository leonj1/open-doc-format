---
type: Playbook
title: Machine Bootstrap
description: First steps to get productive on a fresh Linux machine — minimal, fast, no heavy tooling.
tags: [tools, playbook, bootstrap, linux]
timestamp: 2026-06-19T00:00:00Z
---

# Process

When I land on a fresh Bash shell, I run these steps in order:

1. **Remove nano** — it's the default editor on most distros and I never use it.
2. **Install vim** — my terminal editor for quick edits.
3. **Install curl** — HTTP client for API calls, downloads, and debugging.
4. **Install git** — version control, cloning repos, the foundation of my workflow.
5. **Install telnet** — quick connectivity checks for network troubleshooting.

# What I Don't Install

- No Zsh, Fish, or shell customizations — stock Bash.
- No language runtimes upfront — install them per-project as needed.
- No IDE — VSCode and Zed get installed later if the machine warrants it.
- No dotfiles, no theme managers, no plugin managers.

# Principle

Get the essentials in 5 minutes and start working. Heavy tooling comes later, only if the machine becomes a daily driver.
