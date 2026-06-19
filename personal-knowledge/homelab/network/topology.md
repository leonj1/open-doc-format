---
type: Network
title: Network Topology
description: UniFi Dream Machine Special Edition handles everything — routing, DHCP, DNS, and firewall. Single flat network, no VLANs.
tags: [homelab, network, unifi, router, dns]
timestamp: 2026-06-19T00:00:00Z
---

# Core Infrastructure

| Function | Device |
|----------|--------|
| Router | [UniFi Dream Machine Special Edition](https://ui.com/cloud-gateways/dream-machine) |
| DHCP | UniFi Dream Machine |
| DNS | UniFi Dream Machine |
| Firewall | UniFi Dream Machine |

A single device handles all core networking functions.

# Network Design

- **Flat network** — no VLANs, no segmentation. Everything is on one subnet.
- **No Pi-hole** — no ad blocking or custom DNS filtering at the network level.
- **No separate DNS server** — UniFi's built-in DNS resolution is sufficient.

# Devices on the Network

| Device | Type |
|--------|------|
| [Intel](/homelab/hardware/intel.md) | Primary server |
| [AMD](/homelab/hardware/amd.md) | Secondary server |
| Unraid NAS | 40 TB bulk storage |
| 2 Mac Minis | Desktop workstations |
| MacBook Pro | Mobile development |
| 2 iPad Pros | Light work / remote access |

# Simplicity Principle

One device, one flat network. No complexity worth managing for a personal lab.

# Exposed Services

| Service | Port | Purpose |
|---------|------|---------|
| Plex | 32400 | Media server accessible from outside the LAN |

# Remote Access

I use [Tailscale](https://tailscale.com) for remote access to the home lab. Both Linux servers ([Intel](/homelab/hardware/intel.md) and [AMD](/homelab/hardware/amd.md)) are on the Tailscale network, allowing secure access from anywhere without exposing additional ports or managing a VPN server.

# WAN

| Detail | Value |
|--------|-------|
| ISP | Verizon |
| Static IP | No — dynamic IP |
