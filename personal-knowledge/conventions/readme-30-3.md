---
type: Convention
title: README 30-3 Rule
description: Every project README must convey what the project is in 30 seconds and how to get it running in 3 minutes.
tags: [conventions, documentation, readme, onboarding]
timestamp: "2026-06-20T02:21:28Z"
---

# Rule

Every project README.md must pass the **30-3 test**:

| Window | Goal | Reader should be able to... |
|--------|------|-----------------------------|
| **30 seconds** | Understand | Know what the project is, why it exists, and whether it's relevant to them. |
| **3 minutes** | Get working | Clone, install, build, and run the project from a clean machine. |

# The 30-Second Section

The top of every README — above the fold, before any scrolling — must answer:

1. **What is this?** — One sentence. No jargon. A non-technical stakeholder should understand it.
2. **Why does it exist?** — What problem does it solve? What's the alternative?
3. **Who is it for?** — Is this a library? A CLI tool? An internal service?
4. **What does it look like?** — A screenshot, a code snippet, or a diagram. Something visual.

Format this as a tight block:

```markdown
# Project Name

> **30 seconds to understand. 3 minutes to install.** One-line description.

## ⏱️ 30 Seconds: What Is This?

Quick paragraph. Can be 2-3 sentences. Include a visual: screenshot, diagram, or
code snippet showing the happy path.
```

# The 3-Minute Section

Immediately after the 30-second section, a copy-pasteable block that gets to `hello world`:

```markdown
## 🚀 3 Minutes: Install and Run

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
npm install        # or pip install, go build, etc.
npm start          # or the appropriate run command
\`\`\`
```

Rules for the 3-minute section:

- **Every command must work verbatim.** No `$EDITOR`, no `configure X to your environment` without a concrete default.
- **Assume a clean machine.** If a dependency isn't in the commands, it doesn't exist. List prerequisites explicitly.
- **End with visible output.** The user should see something working — a running server, a test passing, a CLI printing help text.
- **One code block.** Copy-paste, hit enter, see results. Split into separate blocks only if there are genuinely separate steps (e.g., "install deps" then "start server").

## Prerequisites

If the 3-minute section needs dependencies beyond the language runtime, list them before the commands:

```markdown
### Prerequisites
- Node.js >= 20
- Docker (if running locally with containers)
```

## Verification

Always include a verification step so the user knows it worked:

```markdown
### Verify

\`\`\`bash
curl http://localhost:3000/health
# → {"status": "ok"}
\`\`\`
```

# Anti-Patterns

| Avoid | Instead |
|-------|---------|
| Walls of text before any code | Lead with the 30-second block, then code |
| "Installation" buried in a docs site | Self-contained in README |
| Configuration that requires reading source | Sensible defaults, `.env.example`, or a setup script |
| "See CONTRIBUTING.md for dev setup" | The 3-minute section IS the dev setup |
| Screenshots of CLI output | Use code blocks — they're searchable and copyable |
| Table of contents as the first thing | 30-second section first, TOC after if needed |

# Example: This Repo

The README for `open-doc-format` follows this rule. The 30-second section explains OKF bundles in one paragraph with a visual directory tree and code snippet. The 3-minute section has copy-paste install commands for each agent platform (Claude Code, Factory Droid, Pi).

# Relationship to Other Conventions

- [/conventions/project-structure.md](/conventions/project-structure.md) — Where README.md lives in the directory tree
- [/conventions/naming.md](/conventions/naming.md) — Naming conventions apply to project names in README titles
