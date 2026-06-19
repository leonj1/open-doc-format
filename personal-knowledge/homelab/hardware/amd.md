---
type: Server
title: AMD — Secondary Server
description: Headless Ubuntu server with OK performance. 32 GB RAM, NVIDIA RTX 4060 Ti 8 GB VRAM.
tags: [homelab, hardware, server, amd, ubuntu, gpu]
timestamp: 2026-06-19T00:00:00Z
---

# Specs

| Component | Detail |
|-----------|--------|
| OS | Ubuntu Server (headless) |
| CPU | AMD — OK performance |
| RAM | 32 GB |
| GPU | NVIDIA RTX 4060 Ti, 8 GB VRAM |
| Form factor | Headless server |

# Role

Secondary server — handles workloads that don't require the faster CPU in [Intel](/homelab/hardware/intel.md). Suitable for lighter services, redundancy, and overflow.

# Comparison to Intel

| | Intel | AMD |
|---|---|---|
| CPU | Faster | OK |
| RAM | 64 GB | 32 GB |
| GPU | 4060 Ti 8 GB | 4060 Ti 8 GB |
| Priority | Primary workloads | Secondary / overflow |
