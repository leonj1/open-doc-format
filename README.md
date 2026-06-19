# Open Doc Format — OKF Skills for AI Coding Agents

> **30 seconds to understand. 3 minutes to install.** Portable knowledge bundles for humans and AI agents, now with first-class tooling for Claude Code, Factory Droid, and Pi.

## ⏱️ 30 Seconds: What Is This?

This project gives your AI coding agent the ability to create, validate, and navigate **[Open Knowledge Format (OKF) v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)** bundles — directories of Markdown files with YAML frontmatter that represent a knowledge catalog (datasets, tables, APIs, playbooks, metrics, etc.).

```
my-catalog/                  # ← An OKF bundle — plain files, lives in git
├── index.md                 # Progressive disclosure listing
├── log.md                   # Chronological change history
├── datasets/
│   ├── index.md
│   └── sales.md             # Concept: describes the Sales dataset
├── tables/
│   ├── index.md
│   ├── orders.md            # Concept: table schema + joins
│   └── customers.md
└── playbooks/
    └── revenue-review.md
```

**Three things every concept file has:**

```markdown
---
type: BigQuery Table           # ← Only required field
title: Customer Orders
description: One row per completed order across all channels.
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders
tags: [sales, orders, revenue]
timestamp: 2026-06-15T12:00:00Z
---

# Schema
| Column     | Type    | Description              |
|------------|---------|--------------------------|
| order_id   | STRING  | Unique order identifier. |
...
```

**3 conformance rules. No SDK. No lock-in. MIT-licensed spec by Google Cloud.**

---

## 🚀 3 Minutes: Install the Skill

Choose your agent. Each install takes ~60 seconds.

### Claude Code

```bash
# From your project root:
mkdir -p .claude/skills/okf/templates
cp SKILL.md .claude/skills/okf/
cp spec-reference.md .claude/skills/okf/
cp templates/*.md .claude/skills/okf/templates/
```

Or clone into any project and Claude Code auto-discovers it. Verify:
```
/claude-skills    # Should show /okf
```

**Triggers automatically** when you ask Claude to create knowledge catalogs, validate OKF bundles, or write concept documents. Supports:
- Auto-activation on `.md` files and `okf/` directories (`paths`)
- Pre-approved `git *`, `Read`, `Glob`, `Grep`, `WebSearch` tools
- `when_to_use` descriptions for context-aware discovery

### Factory Droid

```bash
# From your project root:
mkdir -p .factory/skills/okf/templates
cp SKILL.md .factory/skills/okf/
cp spec-reference.md .factory/skills/okf/
cp templates/*.md .factory/skills/okf/templates/
```

Restart `droid`. Creates the `/okf` command automatically. Droid invokes the skill when you describe OKF-related tasks.

### Pi

```bash
# From your project root:
mkdir -p .pi/extensions
cp okf.ts .pi/extensions/
```

Or for global availability (all projects):

```bash
mkdir -p ~/.pi/agent/extensions/okf/
cp okf.ts ~/.pi/agent/extensions/okf/index.ts
```

Restart pi. Registers **7 custom tools** the LLM can call plus **3 slash commands**:

| Tool / Command | Description |
|---|---|
| `okf_scaffold_bundle` | Create a new bundle directory with index + log |
| `okf_create_concept` | Create a conformant concept `.md` with validated frontmatter |
| `okf_validate_bundle` | Validate against all 3 OKF conformance rules |
| `okf_generate_index` | Auto-generate `index.md` from concepts in a directory |
| `okf_read_frontmatter` | Parse and display concept metadata |
| `/okf-validate` | TUI validation report viewer |
| `/okf-scaffold` | Quick-scaffold a bundle in the current directory |

---

## 🧪 Quick Start — Try It in 30 Seconds

### Claude Code
```
Create an OKF bundle for our AWS infra. Include tables for EC2 instances,
RDS databases, and a playbook for cost review.
```

### Factory Droid
```
Scaffold an OKF bundle in ./catalog/ and add a concept for the users table
in our PostgreSQL database.
```

### Pi
```
Use okf_scaffold_bundle to create a new bundle at ./knowledge.
Then use okf_create_concept to add a BigQuery Table called "user_events"
with columns: event_id (STRING), user_id (STRING), event_type (STRING),
created_at (TIMESTAMP).
Finally run okf_validate_bundle on ./knowledge.
```

Or try the interview:
```
/okf-interview
```

---

## 📁 Project Structure

```
open-doc-format/
├── README.md
│
├── .claude/skills/okf/          # Claude Code skill
│   ├── SKILL.md                 #   Main instructions (320 lines)
│   ├── spec-reference.md        #   Condensed OKF v0.1 spec
│   └── templates/
│       ├── concept.md           #   Concept document template
│       ├── index.md            #   Index file template
│       └── log.md              #   Log file template
│
├── .factory/skills/okf/         # Factory Droid skill
│   ├── SKILL.md                 #   Main instructions (280 lines)
│   ├── spec-reference.md
│   └── templates/               #   Same templates as above
│
└── .pi/extensions/
    └── okf.ts                   # Pi extension (1284 lines)
                                 #   4 tools + 2 commands + TUI viewer
```

## 📖 What Each Skill Teaches Your Agent

| Capability | Details |
|---|---|
| **Create bundles** | Scaffold directories, root `index.md` with `okf_version`, `log.md` initialization |
| **Write concepts** | YAML frontmatter with required `type`, recommended fields (`title`, `description`, `resource`, `tags`, `timestamp`), structural Markdown body, conventional sections (`# Schema`, `# Examples`, `# Citations`) |
| **Cross-link** | Absolute bundle-relative links (`/tables/orders.md`), relative links |
| **Generate indexes** | Progressive disclosure format, auto-grouping by type, tags, or flat |
| **Validate** | 3 conformance rules (frontmatter presence, `type` field, reserved files) + soft warnings (broken links, missing descriptions) |
| **Consume** | Navigate via `index.md`, extract frontmatter, follow cross-links |

## 🔗 About OKF

The [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) is a vendor-neutral, MIT-licensed specification by Google Cloud for representing knowledge as plain Markdown with YAML frontmatter. It formalizes the "LLM wiki" pattern — teams already dump markdown docs into repos for agents to read — into an interoperable standard.

- **Spec:** [OKF v0.1 SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- **Reference implementation:** [GoogleCloudPlatform/knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog)
- **Community site:** [okf.md](https://okf.md/)

## 📄 License

This skill collection is MIT licensed. OKF itself is a separate specification licensed under MIT by Google Cloud.
