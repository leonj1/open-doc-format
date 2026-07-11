---
type: Convention
title: Docker and Container Strategy
description: Dockerfiles are the default build definition for projects on Railway, locally, and anywhere else that supports containers.
tags: [deployment, docker, containers, local-dev]
timestamp: 2026-07-11T00:00:00Z
---

# Default: Dockerfile

I use a `Dockerfile` to build and run projects by default. The primary motivation is **removing local dependency problems** — no "works on my machine" issues, no language runtime version mismatches, no OS-level library conflicts.

The Dockerfile is the authoritative build recipe. A hosted platform must use it whenever that platform supports container builds; automatic platform build detection does not replace it.

# Where Dockerfiles Run

| Environment | How |
|-------------|-----|
| **Railway** | Platform builds from the Dockerfile and runs the container. |
| **Local** | `docker build` and `docker run` — same image, same behavior as production. |
| **Home lab** | Same Docker image, deployed to local Docker host or Proxmox. |

# Exceptions

I may omit the Dockerfile when the project requires **direct access to the host filesystem** — reading local files, writing to mounted directories, or interacting with devices. Docker's filesystem abstraction gets in the way in those cases, so I run directly on the host.

A deployment target that cannot build or run containers may also require its native build system. Either exception must be explicit in the repository documentation. Dockerfile remains the default and must not be omitted merely because a platform offers automatic build detection.

# No Image Registry

I don't push images to Docker Hub, GHCR, or a local registry. The platforms build from source. Locally, I build from source. The Dockerfile is a build recipe, not a distribution artifact.
