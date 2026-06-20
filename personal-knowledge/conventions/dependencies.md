---
type: Convention
title: Dependencies and Default Libraries
description: Always use latest library versions with pinned lockfiles. Vendoring for Go. Go defaults: mux and zerolog. For other languages, follow industry standards.
tags: [conventions, dependencies, libraries, go, frameworks, latest]
timestamp: 2026-06-19T00:00:00Z
---

# Dependency Policy

| Rule | Applies to |
|------|------------|
| **Always use latest versions** | All languages — start every project on the newest stable release of every dependency. Don't inherit stale versions from old projects. |
| **Pin with lockfiles** | All languages — lockfiles are non-negotiable. Reproducibility matters, but reproducibility of *the latest* versions, not frozen-to-the-past versions. |
| **Vendor dependencies** | Go only — the `vendor/` directory and `-mod=vendor` flag are the Go way to ship self-contained builds. |

Using latest means: when starting a new project or adding a new dependency, reach for the newest stable version. Don't default to an old version because "that's what we used before." Upgrade existing dependencies regularly.

# Go-Specific Libraries

When writing Go, I default to these:

| Library | Purpose | Why |
|---------|---------|-----|
| [gorilla/mux](https://github.com/gorilla/mux) | HTTP routing | Simple, explicit, no magic — routes are code. |
| [rs/zerolog](https://github.com/rs/zerolog) | Logging | Zero-allocation, structured JSON logging. Fast and minimal. |

# Other Languages

For TypeScript, Python, Java, and Rust I default to **whatever is common in the industry** for that language at the time. I don't maintain a fixed list — I evaluate the current landscape when starting a new project. The Go defaults are the exception because they've been stable preferences for years.
