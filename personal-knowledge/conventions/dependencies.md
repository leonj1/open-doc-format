---
type: Convention
title: Dependencies and Default Libraries
description: Pinned versions, vendoring rules, and my go-to libraries for Go — mux and zerolog. For other languages, I follow industry standards.
tags: [conventions, dependencies, libraries, go, frameworks]
timestamp: 2026-06-19T00:00:00Z
---

# Dependency Policy

| Rule | Applies to |
|------|------------|
| **Pin versions** | All languages — lockfiles are non-negotiable. Reproducibility matters. |
| **Vendor dependencies** | Go only — the `vendor/` directory and `-mod=vendor` flag are the Go way to ship self-contained builds. |
| **Avoid latest** | Whenever possible. I don't chase the newest release unless there's a specific reason. Stability over novelty. |

# Go-Specific Libraries

When writing Go, I default to these:

| Library | Purpose | Why |
|---------|---------|-----|
| [gorilla/mux](https://github.com/gorilla/mux) | HTTP routing | Simple, explicit, no magic — routes are code. |
| [rs/zerolog](https://github.com/rs/zerolog) | Logging | Zero-allocation, structured JSON logging. Fast and minimal. |

# Other Languages

For TypeScript, Python, Java, and Rust I default to **whatever is common in the industry** for that language at the time. I don't maintain a fixed list — I evaluate the current landscape when starting a new project. The Go defaults are the exception because they've been stable preferences for years.
