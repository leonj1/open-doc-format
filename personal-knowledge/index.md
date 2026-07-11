---
okf_version: "0.1"
---

# Jose's Personal Knowledge

Personal software development practices, home lab infrastructure, network topology, and deployment workflows — documented in the Open Knowledge Format (OKF) v0.1.

> **How to use this:** See [USAGE.md](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/USAGE.md) for copy-paste snippets to wire these conventions into Claude Code, Pi, Droid, and any other AI coding agent via GitHub URLs.

## Tools & Modalities

* [Coding Modalities](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/tools/coding-modalities.md) — VSCode, Zed, Devboxer, and Telegram
* [CLI Tools](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/tools/cli-tools.md) — Bash, tmux, vim, jq, curl, git, and AI agents (Codex, Claude, Droid, Forge, Pi)
* [Dotfiles Philosophy](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/tools/dotfiles.md) — Stock defaults for portability
* [Machine Bootstrap](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/tools/machine-bootstrap.md) — First 5 steps on a fresh Linux machine

## Development Conventions

* [Language Preferences](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/conventions/languages.md) — TypeScript, Python, Go, Java, Rust
* [Project Structure](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/conventions/project-structure.md) — Dedicated, separate src/ and tests/ directories; source and test files are never co-located
* [Code Structure and Patterns](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/conventions/code-structure.md) — I/O interfaces, dependency injection, no implicit fallbacks, size limits, route discipline
* [Naming Conventions](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/conventions/naming.md) — Nouns for classes, verbs for functions
* [Configuration Management](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/conventions/configuration.md) — Config files, env vars, .env, explicit function arguments, and required values without implicit fallbacks
* [Git and Commits](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/conventions/git-commits.md) — FEAT/BUG/CHORE prefixes, feature branches
* [Dependencies and Libraries](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/conventions/dependencies.md) — Pinned versions, Go defaults (mux, zerolog)

## Deployment

* [Deployment Strategy](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/deployment/strategy.md) — Vercel, Railway, or local
* [CI/CD and Triggers](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/deployment/ci-cd.md) — Dockerfile-first builds; git webhook on commit = deploy
* [Docker and Containers](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/deployment/docker.md) — Dockerfiles are the default build definition wherever containers are supported
* [Secrets Management](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/deployment/secrets.md) — Platform dashboard env vars
* [Local Development Loop](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/deployment/local-dev-loop.md) — Docker Compose + Makefile
* [Devboxer Deployments](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/deployment/devboxer-deployments.md) — Railway via API token

## References

* [Elegant Objects (Yegor Bugayenko)](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/references/elegant-objects.md) — The 23 practical OOP recommendations from the book (Volume 1, 2017)

## Home Lab

* [Overview](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/homelab/index.md) — Hardware, storage, and services
* [Intel](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/homelab/hardware/intel.md) — Primary server: 64 GB RAM, RTX 4060 Ti
* [AMD](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/homelab/hardware/amd.md) — Secondary server: 32 GB RAM, RTX 4060 Ti
* [Client Devices](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/homelab/hardware/client-devices.md) — Mac Minis, MacBook Pro, iPad Pros
* [Storage and Backup](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/homelab/storage.md) — Local disks, Unraid 40 TB NAS
* [Services](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/homelab/services/overview.md) — Jarvis on Intel, misc on AMD
* [Network Topology](https://github.com/leonj1/open-doc-format/blob/master/personal-knowledge/homelab/network/topology.md) — UniFi Dream Machine SE, Tailscale, Plex
