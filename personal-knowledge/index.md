---
okf_version: "0.1"
---

# Jose's Personal Knowledge

Personal software development practices, home lab infrastructure, network topology, and deployment workflows — documented in the Open Knowledge Format (OKF) v0.1.

> **How to use this:** See [USAGE.md](/USAGE.md) for copy-paste snippets to wire these conventions into Claude Code, Pi, Droid, and any other AI coding agent via GitHub URLs.

## Tools & Modalities

* [Coding Modalities](/tools/coding-modalities.md) — VSCode, Zed, Devboxer, and Telegram
* [CLI Tools](/tools/cli-tools.md) — Bash, tmux, vim, jq, curl, git, and AI agents (Codex, Claude, Droid, Forge, Pi)
* [Dotfiles Philosophy](/tools/dotfiles.md) — Stock defaults for portability
* [Machine Bootstrap](/tools/machine-bootstrap.md) — First 5 steps on a fresh Linux machine

## Development Conventions

* [Language Preferences](/conventions/languages.md) — TypeScript, Python, Go, Java, Rust
* [Project Structure](/conventions/project-structure.md) — Standard backend layout: services, clients, models, routes
* [Code Structure and Patterns](/conventions/code-structure.md) — I/O interfaces, dependency injection, no implicit fallbacks, size limits, route discipline
* [Naming Conventions](/conventions/naming.md) — Nouns for classes, verbs for functions
* [Configuration Management](/conventions/configuration.md) — Config files, env vars, .env, required values without implicit defaults
* [Git and Commits](/conventions/git-commits.md) — FEAT/BUG/CHORE prefixes, feature branches
* [Dependencies and Libraries](/conventions/dependencies.md) — Pinned versions, Go defaults (mux, zerolog)

## Deployment

* [Deployment Strategy](/deployment/strategy.md) — Vercel, Railway, or local
* [CI/CD and Triggers](/deployment/ci-cd.md) — Git webhook on commit = deploy
* [Docker and Containers](/deployment/docker.md) — Dockerfiles are the default
* [Secrets Management](/deployment/secrets.md) — Platform dashboard env vars
* [Local Development Loop](/deployment/local-dev-loop.md) — Docker Compose + Makefile
* [Devboxer Deployments](/deployment/devboxer-deployments.md) — Railway via API token

## References

* [Elegant Objects (Yegor Bugayenko)](/references/elegant-objects.md) — The 23 practical OOP recommendations from the book (Volume 1, 2017)

## Home Lab

* [Overview](/homelab/index.md) — Hardware, storage, and services
* [Intel](/homelab/hardware/intel.md) — Primary server: 64 GB RAM, RTX 4060 Ti
* [AMD](/homelab/hardware/amd.md) — Secondary server: 32 GB RAM, RTX 4060 Ti
* [Client Devices](/homelab/hardware/client-devices.md) — Mac Minis, MacBook Pro, iPad Pros
* [Storage and Backup](/homelab/storage.md) — Local disks, Unraid 40 TB NAS
* [Services](/homelab/services/overview.md) — Jarvis on Intel, misc on AMD
* [Network Topology](/homelab/network/topology.md) — UniFi Dream Machine SE, Tailscale, Plex
