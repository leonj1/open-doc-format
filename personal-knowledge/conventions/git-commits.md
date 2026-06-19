---
type: Convention
title: Git and Commit Conventions
description: Branch strategy, commit message format, and PR workflow for personal and professional projects.
tags: [conventions, git, commits, branching]
timestamp: 2026-06-19T00:00:00Z
---

# Branch Strategy

- **Default branch:** `main` or `master` — used interchangeably depending on when the repo was created.
- **Feature branches:** Short-lived branches for features and hotfixes. Created from main, merged back quickly.
- **Direct commits to main:** On occasion, for quick easy fixes that don't warrant a branch. Rare but acceptable.

# Commit Message Format

```
FEAT: <description>
BUG: <description>
CHORE: <description>
```

| Prefix | When to use |
|--------|-------------|
| `FEAT` | New features, enhancements, additions |
| `BUG` | Bug fixes |
| `CHORE` | Trivial changes — dependency bumps, formatting, comments, typos |

No conventional commits spec, no scope tokens, no body/footer format. Just the prefix and a clear description.
