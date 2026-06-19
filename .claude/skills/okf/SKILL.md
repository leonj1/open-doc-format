---
name: okf
description: Create, validate, consume, and interview-to-build Open Knowledge Format (OKF v0.1) bundles — portable knowledge represented as Markdown with YAML frontmatter. Use when building, auditing, navigating, or interviewing to create OKF bundles.
when_to_use: Creating or editing .md files with YAML frontmatter representing knowledge concepts, building OKF bundles, validating OKF conformance, generating index.md or log.md files, navigating an existing OKF bundle structure, or interviewing the user to document their personal knowledge (home lab, dev practices, network, tools, etc.) as OKF.
allowed-tools: Bash(git *) Read Glob Grep WebSearch
paths: ["**/*.md", "**/index.md", "**/log.md", "**/okf/**"]
---

# Open Knowledge Format (OKF) Skill

You are an expert in the **Open Knowledge Format (OKF) v0.1** — an open, vendor-neutral specification for representing knowledge as plain Markdown files with YAML frontmatter. OKF bundles are directories of `.md` files that live in git, render anywhere, and feed AI agents natively.

Use this skill when any of these tasks come up:
- Creating a new OKF bundle from scratch
- Adding, editing, or restructuring concept documents in a bundle
- Generating `index.md` files for progressive disclosure
- Adding or updating `log.md` entries
- Validating an existing bundle for conformance
- Navigating or consuming an OKF bundle
- **Interviewing a user** to document their personal knowledge, home lab, dev practices, network, tools, or workflows as OKF concepts

---

## Core Principles

1. **Minimalism**: OKF is just directories of `.md` files with YAML frontmatter. No SDK, no registry, no build step.
2. **Dual-audience**: Content must be readable by humans and parseable by agents. Favor structural Markdown (headings, lists, tables, fenced code blocks) over freeform prose.
3. **Permissive consumption**: Consumers MUST tolerate unknown fields, broken links, missing optional fields, and missing index files. Producers SHOULD be strict with the 3 conformance rules.

---

## Bundle Structure

A bundle is a directory tree. Two filenames are **reserved** — never use them for concept documents:

| File | Purpose |
|------|---------|
| `index.md` | Directory listing for progressive disclosure. No frontmatter (except optional `okf_version` at bundle root). |
| `log.md` | Chronological update history. ISO 8601 date headings, newest first. |

All other `.md` files are **concept documents**.

```
bundle/
├── index.md                        # Root index
├── log.md                          # Optional update log
├── <concept>.md                    # Root-level concept
└── <subdirectory>/
    ├── index.md
    ├── <concept>.md
    └── ...
```

### 3 Conformance Rules (hard rules)

1. Every non-reserved `.md` file must have a parseable YAML frontmatter block (`---` delimiters).
2. Every frontmatter must contain a non-empty `type` field.
3. Reserved filenames (`index.md`, `log.md`), when present, must follow their defined structure.

Everything else is soft guidance. Consumers must not reject bundles for missing optional fields, unknown types, broken links, or absent index files.

---

## Concept Documents

Every concept has two parts: **YAML frontmatter** and a **Markdown body**.

### Frontmatter

```yaml
---
type: <Type name>                  # REQUIRED — short, descriptive string (e.g. "BigQuery Table", "API Endpoint", "Playbook", "Metric")
title: <Display name>              # Recommended — human-readable display name
description: <One-line summary>    # Recommended — single sentence; used by index generators and search
resource: <canonical URI>          # Recommended — URI for the underlying asset; omit for abstract concepts
tags: [tag1, tag2]                 # Recommended — YAML list for cross-cutting categorization
timestamp: <ISO 8601 datetime>     # Recommended — last meaningful change
# Extensions: any additional keys allowed
---
```

**Rules for frontmatter:**
- `type` is the only required field. Pick descriptive, self-explanatory values. There is no central registry.
- `title`, `description`, `resource`, `tags`, and `timestamp` are recommended (in that priority order).
- Producers may add arbitrary extension keys. Consumers must preserve them on round-trip.
- The YAML block starts with `---` on its own line and ends with `---` on its own line.

### Body

Use structural Markdown. The following section headings have **conventional** meaning and SHOULD be used when applicable:

| Heading | Purpose |
|---------|---------|
| `# Schema` | Structured description of columns, fields, or properties |
| `# Examples` | Concrete usage examples, often as fenced code blocks |
| `# Citations` | Numbered external sources backing claims in the body |

### Example: Resource-bound concept

```markdown
---
type: BigQuery Table
title: Customer Orders
description: One row per completed customer order across all channels.
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders
tags: [sales, orders, revenue]
timestamp: 2026-05-28T14:30:00Z
---

# Schema

| Column        | Type      | Description                              |
|---------------|-----------|------------------------------------------|
| `order_id`    | STRING    | Globally unique order identifier.        |
| `customer_id` | STRING    | Foreign key into [customers](/tables/customers.md). |
| `total_usd`   | NUMERIC   | Order total in US dollars.               |
| `placed_at`   | TIMESTAMP | When the customer submitted the order.   |

# Citations

[1] [BigQuery table schema](https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders)
```

### Example: Abstract concept (no resource)

```markdown
---
type: Playbook
title: Incident response — data freshness alert
description: Steps to triage a freshness alert on the orders pipeline.
tags: [oncall, incident]
timestamp: 2026-04-12T09:00:00Z
---

# Trigger

A freshness alert fires when `orders` lags more than 30 minutes.

# Steps

1. Check the [ingestion job dashboard](https://example.com/dash).
2. Verify upstream data sources.
3. Notify on-call if SLA breach is confirmed.
```

---

## Cross-Linking

### Absolute links (recommended)
Begin with `/`, interpreted relative to the bundle root:
```markdown
See the [customers table](/tables/customers.md) for the join key.
```
This form is stable when documents move within their subdirectory.

### Relative links
Standard Markdown relative paths:
```markdown
See the [neighboring concept](./other.md).
```

### Link semantics
A link from concept A to concept B asserts a *relationship*. The meaning is conveyed by surrounding prose, not the link itself. Consumers treat all links as directed edges. Broken links are tolerated — they may represent not-yet-written knowledge. When creating links, always use paths relative to the bundle root (preferred) or relative to the current file.

---

## Index Files (`index.md`)

Index files enable **progressive disclosure** — letting readers see what's available before opening individual documents. They contain no frontmatter (except optional `okf_version` at the root level).

### Format

```markdown
# Section / Group Heading

* [Title 1](relative-url-1) — short description
* [Title 2](relative-url-2) — short description

# Another Section

* [Subdirectory](subdir/) — short description
```

### Rules for index files
- Group concepts under descriptive headings.
- Include the `description` from each concept's frontmatter when available.
- Link to subdirectories with trailing `/`.
- Do NOT use YAML frontmatter (except `okf_version: "0.1"` at the bundle root only).
- May be auto-generated or hand-written.

### Example root `index.md`

```markdown
---
okf_version: "0.1"
---

# Datasets

* [Sales](/datasets/sales.md) — All sales-related tables for the retail business.

# Tables

* [Orders](/tables/orders.md) — One row per completed customer order.
* [Customers](/tables/customers.md) — Customer account master data.

# Playbooks

* [Revenue Review](/playbooks/revenue-review.md) — Monthly revenue review process.
```

---

## Log Files (`log.md`)

Optional. Records the history of changes at any directory level. Newest entries first.

### Format

```markdown
# Directory Update Log

## YYYY-MM-DD
* **Update**: Description of change with [links](/path/to/concept.md).
* **Creation**: Created new concept for [Thing](/path/to/thing.md).

## YYYY-MM-DD
* **Initialization**: Created foundational directory structure.
```

### Rules for log files
- Date headings MUST use ISO 8601 `YYYY-MM-DD` format.
- Leading bold word (`**Update**`, `**Creation**`, `**Deprecation**`, etc.) is a convention, not a requirement.
- Include Markdown links to the affected concepts.
- Newest entries first.
- No YAML frontmatter.

---

## Citations

When a concept's body references external sources, list them under a `# Citations` heading at the bottom, numbered:

```markdown
# Citations

[1] [BigQuery public dataset announcement](https://cloud.google.com/blog/...)
[2] [Internal data quality runbook](https://wiki.acme.internal/data/quality)
```

Citation links may be absolute URLs, bundle-relative paths, or paths into a `references/` subdirectory.

---

## Creating a Bundle: Step-by-Step Checklist

### When asked to create a new OKF bundle

1. **Plan the structure**: Determine the domain (e.g., data catalog, API docs, company knowledge). Decide on the hierarchy (datasets/, tables/, playbooks/, references/, etc.).

2. **Create the root index.md**:
   - Include `okf_version: "0.1"` in frontmatter.
   - List top-level groups with brief descriptions.
   - Link to subdirectories and root-level concepts.

3. **Create concept documents**: For each concept:
   - Create the `.md` file at the appropriate path.
   - Add YAML frontmatter with at minimum `type` (required), plus `title`, `description`, `resource`, `tags`, `timestamp` as applicable.
   - Write the body using structural Markdown.
   - Add `# Schema` section if describing structured data.
   - Add `# Citations` section if referencing external sources.
   - Cross-link to related concepts using absolute bundle-relative links.

4. **Create subdirectory index files**: For each subdirectory:
   - Create `index.md` (no frontmatter).
   - Group and list all concepts in that directory with descriptions.

5. **Create log.md** (optional): If the user wants a change history:
   - Create at whatever level(s) make sense.
   - Use today's date, describe the initialization.

6. **Validate**: Check all 3 conformance rules before declaring done.

### When asked to add concepts to an existing bundle

1. Read the relevant `index.md` files to understand current structure.
2. Place new concepts in the appropriate directory.
3. Follow the same concept document rules as above.
4. Update the corresponding `index.md` to include the new concept.
5. Optionally add a `log.md` entry.

---

## Validation Checklist

Run this when asked to validate a bundle:

1. **Rule 1 — Frontmatter presence**: Scan all non-reserved `.md` files. Each must have a `---` opening and `---` closing delimiter with YAML between them. Report any files missing frontmatter.

2. **Rule 2 — `type` field**: Check every frontmatter block. The `type` field must be present and non-empty. Report any concepts with missing or blank `type`.

3. **Rule 3 — Reserved files**: Check any `index.md` files — no YAML frontmatter (except root-level `okf_version`). Check any `log.md` files — ISO 8601 date headings. Report structural violations.

4. **Soft checks** (warnings only, not failures):
   - Broken cross-links (target `.md` does not exist).
   - Concept documents without `description` (affects index quality).
   - Frontmatter YAML parse errors.
   - `index.md` files referencing concepts that don't exist.

Format validation output clearly:
```
## OKF Validation Report for `bundle/`

### ✅ Conformance Checks
- Rule 1 (frontmatter): PASS — 12/12 concept documents have valid frontmatter
- Rule 2 (type field): PASS — all concepts have non-empty `type`
- Rule 3 (reserved files): PASS — 3 index.md files follow spec

### ⚠️ Warnings
- Broken link: `/tables/archived.md` referenced from `/index.md` (target not found)
- Missing description: `references/schema-v2.md`
```

---

## Consuming / Reading a Bundle

When asked to read or navigate a bundle:

1. **Start at `index.md`** at the desired level (root or subdirectory).
2. **Explore progressively**: Follow links to subdirectories or individual concepts as needed.
3. **Extract frontmatter** for structured queries: `type`, `tags`, `resource`, `title`.
4. **Follow cross-links** to understand the relationship graph.
5. **Tolerate gaps**: Missing index files, broken links, and unknown frontmatter fields are all expected and must not cause errors.

## Interview Flow — Documenting Personal Knowledge

When a user wants to document their personal knowledge (home lab, dev practices, network, tools, etc.) as an OKF bundle, use this interview process. **Follow it exactly.**

### Interview Protocol

1. **Start by asking what topics** the user wants to document. Present these options:

   | Topic | What it covers | Suggested directories |
   |---|---|---|
   | Home Lab | Servers, VMs, containers, hardware | `homelab/hardware/`, `homelab/services/` |
   | Network | LAN, VLANs, DNS, firewall, VPN | `homelab/network/` |
   | Services | Self-hosted apps, config, dependencies | `homelab/services/` |
   | Conventions | Coding style, project structure, naming | `conventions/` |
   | Deployment | CI/CD, image builds, secrets, dev loop | `deployment/`, `playbooks/` |
   | Tools | Dotfiles, CLI tools, editor, machine setup | `tools/`, `conventions/` |
   | Knowledge | Notes, bookmarks, references, lessons | `references/`, `conventions/` |

2. **Scaffold the bundle first**: Create the bundle directory and subdirectories. Write the root `index.md` with `okf_version: "0.1"` and a `log.md`.

3. **Ask ONE question at a time.** Never dump all questions at once. After each answer, **immediately create the concept document** before asking the next question. Use `okf_create_concept` if available, otherwise write the file directly following the spec.

4. **Cross-link as you go.** When concept B relates to concept A you just wrote, add a link: `[/path/to/a.md](/path/to/a.md)`.

5. **After all questions in a topic, generate the index.md** for that directory.

6. **Validate** the bundle when done.

### Question Bank by Topic

**Home Lab Infrastructure** (`type: Server`)

- Q1: What physical machines or devices run in your home lab? List them with hostnames.
- Q2: For each machine: what are the specs? (CPU, RAM, storage, network interfaces)
- Q3: What hypervisor or OS does each machine run?
- Q4: What VMs, containers, or services run on each machine? List with purpose and IPs.
- Q5: How is storage organized? (NAS, local disks, NFS, ZFS pools)
- Q6: What's your backup strategy?
- Q7: Any machines with special roles? (firewall, router, DNS, media server)

**Network Topology** (`type: Network`)

- Q1: What's your primary subnet and router? What handles DHCP?
- Q2: Do you use VLANs? What's on each?
- Q3: How is DNS configured?
- Q4: What firewall rules do you have? Any exposed ports?
- Q5: VPN or Tailscale for remote access? How is it set up?
- Q6: WAN setup: ISP, connection type, static IP or dynamic DNS?
- Q7: Any network segmentation for IoT, guest, or lab traffic?

**Services and Applications** (`type: Service`)

- Q1: What self-hosted services are you running? List them all.
- Q2: For each: where does it run? (which machine/VM/container)
- Q3: How is each deployed? (Docker Compose, Kubernetes, binary, LXC)
- Q4: How do you access each? (local IP, reverse proxy, VPN-only, public)
- Q5: What dependencies exist between services?
- Q6: How do you handle updates?
- Q7: Where is config and persistent data stored for each?

**Development Conventions** (`type: Convention`)

- Q1: What languages do you primarily use? Preferred project structure for each?
- Q2: How do you name things? (files, functions, variables, branches, commits)
- Q3: Preferred toolchain? (editor, formatter, linter, test runner, build system)
- Q4: How do you handle configuration?
- Q5: Commit and PR style? Conventional commits? Squash or merge?
- Q6: Opinions on dependencies? (pinning, lockfiles, vendoring)
- Q7: Default libraries or frameworks?

**Deployment and CI/CD** (`type: Workflow`)

- Q1: Walk me through your deployment flow — code to running service.
- Q2: Do you use CI/CD? What platform and what does it do?
- Q3: How do you build container images?
- Q4: Where do you store images? (Docker Hub, GHCR, local registry)
- Q5: How do you handle secrets?
- Q6: What's your local dev loop? (hot reload, docker compose, tilt)
- Q7: How do you test before deploying?

**Tools and Dotfiles** (`type: Tool`)

- Q1: What OS and shell do you use? Customizations?
- Q2: Essential CLI tools?
- Q3: Dotfiles approach? Where are they?
- Q4: Editor/IDE setup? Key plugins?
- Q5: How do you bootstrap a new machine?
- Q6: What AI/agent tools do you use?

**Personal Knowledge Management** (`type: Reference`)

- Q1: How do you currently store notes, bookmarks, or references?
- Q2: What topics do you frequently look up?
- Q3: Hard-won lessons or gotchas to preserve?
- Q4: Resources you return to often?

### Example Interview Cadence

```
ASSISTANT: Which topics would you like to document? I can cover home lab,
network, services, dev conventions, deployment, tools, or personal knowledge.

USER: Home lab and network.

ASSISTANT: [Creates bundle directory, index.md, log.md]
Let's start with your home lab. What physical machines run in it? Give me
hostnames and a quick description.

USER: Dell Optiplex 7080 named scarif, Pi 4 named yavin, old NUC named hoth.

ASSISTANT: [Creates homelab/hardware/scarif.md with type: Server, title, and
the user's answer in the body]
Got it. Now: what are the specs for scarif?

USER: i7-10700T, 64GB RAM, 1TB NVMe + 2TB SATA SSD.

ASSISTANT: [Updates scarif.md with specs — or creates a new document if
that makes more sense — then moves to the next question]
...
```

### Key rules

- **One question, one answer, one document.** Don't batch.
- **Write concepts immediately.** The user should see their knowledge taking shape in real time.
- **Be conversational.** This is an interview, not an interrogation. Let the user elaborate.
- **Use the user's words.** Don't invent details they haven't provided.
- **Cross-link relentlessly.** Scarif runs Pi-hole → link to the Pi-hole service doc.

---

## Additional Resources

- For the complete specification text, see [spec-reference.md](spec-reference.md).
- For copy-paste templates, see the `templates/` directory:
  - [Concept document template](templates/concept.md)
  - [Index file template](templates/index.md)
  - [Log file template](templates/log.md)
