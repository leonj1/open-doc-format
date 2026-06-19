---
type: Convention
title: Dotfiles Philosophy
description: I intentionally avoid dotfiles — stock defaults maximize portability across machines.
tags: [tools, dotfiles, conventions, portability]
timestamp: 2026-06-19T00:00:00Z
---

# Philosophy

I do not maintain dotfiles. Personalization slows me down when I move between machines. Keeping **Bash, vim, tmux, and git as close to stock defaults as possible** means any server, VM, cloud shell, or borrowed laptop feels immediately familiar.

# What I Don't Customize

- **Shell:** No `.bashrc` aliases, no custom prompts, no Oh My Zsh or Starship.
- **Editor:** No `.vimrc` — default vim behavior.
- **Multiplexer:** Stock tmux without keybinding remaps or theme plugins.
- **Git:** Minimal `.gitconfig` — just `user.name` and `user.email`.

# Principle

> Portability over personalization. Familiarity over flair.
