---
type: Convention
title: Docker and Container Strategy
description: Dockerfiles are the default for running projects — on Railway, locally, and anywhere else. The only exception is filesystem access.
tags: [deployment, docker, containers, local-dev]
timestamp: 2026-06-19T00:00:00Z
---

# Default: Always Docker

I use a `Dockerfile` to build and run projects by default. The primary motivation is **removing local dependency problems** — no "works on my machine" issues, no language runtime version mismatches, no OS-level library conflicts.

# Where Dockerfiles Run

| Environment | How |
|-------------|-----|
| **Railway** | Platform builds from the Dockerfile and runs the container. |
| **Local** | `docker build` and `docker run` — same image, same behavior as production. |
| **Home lab** | Same Docker image, deployed to local Docker host or Proxmox. |

# The Exception: Filesystem Access

I omit the Dockerfile only when the project requires **direct access to the host filesystem** — reading local files, writing to mounted directories, or interacting with devices. Docker's filesystem abstraction gets in the way in those cases, so I run directly on the host.

# No Image Registry

I don't push images to Docker Hub, GHCR, or a local registry. The platforms build from source. Locally, I build from source. The Dockerfile is a build recipe, not a distribution artifact.
