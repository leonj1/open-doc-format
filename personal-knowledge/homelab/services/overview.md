---
type: Service
title: Services Overview
description: What runs where — Jarvis on Intel, miscellaneous projects on AMD. Both are bare-metal Docker hosts.
tags: [homelab, services, docker, containers]
timestamp: 2026-06-19T00:00:00Z
---

# Deployment Model

Both [Intel](/homelab/hardware/intel.md) and [AMD](/homelab/hardware/amd.md) are **bare-metal Docker hosts** — no hypervisor, no Proxmox, no VMs. Ubuntu Server runs directly on the hardware, and Docker manages the containers.

# Service Allocation

| Server | Workload | Description |
|--------|----------|-------------|
| [Intel](/homelab/hardware/intel.md) | **Jarvis** project | Primary service — runs on the faster machine with more RAM. |
| [AMD](/homelab/hardware/amd.md) | **Miscellaneous projects** | Overflow and experimental services that don't need Intel's performance. |

# Why Bare Metal

- No hypervisor overhead.
- Direct GPU access for any CUDA workloads.
- Simpler — fewer layers to troubleshoot.
- Docker provides sufficient isolation for personal workloads.
