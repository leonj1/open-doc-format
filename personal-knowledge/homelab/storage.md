---
type: Server
title: Storage and Backup
description: Local 1 TB disks on Intel and AMD servers, a separate Unraid NAS with 40 TB HDD, and no backup strategy — code lives in git.
tags: [homelab, storage, unraid, nas, backup]
timestamp: 2026-06-19T00:00:00Z
---

# Storage Layout

| Machine | Storage | Type |
|---------|---------|------|
| [Intel](/homelab/hardware/intel.md) | 1 TB | Local disk |
| [AMD](/homelab/hardware/amd.md) | 1 TB | Local disk |
| Unraid server | 40 TB | HDD array — bulk network storage |

The Unraid server provides centralized bulk storage accessible from both servers and all client devices over the network. Intel and AMD use local disks for OS, Docker images, and active project files.

# Backup Strategy

**None.** I don't back up Intel or AMD. My reasoning:

- All code is committed to GitHub — the repository is the backup.
- Configuration is minimal (no dotfiles, stock defaults) — a fresh Ubuntu install plus `git clone` restores the working state.
- Docker images are rebuilt from Dockerfiles, not preserved.

The Unraid server's 40 TB array is the only storage that would be painful to lose, but it's not backed up either.

# Recovery

If either server dies:

1. Reinstall Ubuntu Server.
2. [Bootstrap the machine](/tools/machine-bootstrap.md) — remove nano, install vim, curl, git, telnet.
3. Install Docker.
4. `git clone` the relevant repos.
5. `make start`.
