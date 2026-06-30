# Index File Template

Copy this template for directory-level `index.md` files. For the bundle root `index.md`, add `okf_version` in frontmatter.

## Bundle Root (with version declaration)

```markdown
---
okf_version: "0.1"
---

# {Section Group}

* [{Concept Title}]({path/to/concept.md}) — {Short description from the concept's frontmatter.}
* [{Another Title}]({path/to/another.md}) — {Short description.}

# {Another Group}

* [{Subdirectory}]({subdir}/) — {What this subdirectory contains.}
```

## Subdirectory Index (no frontmatter)

```markdown
# {Section Group}

* [{Concept Title}]({concept.md}) — {Short description from the concept's frontmatter.}
* [{Another Title}]({another.md}) — {Short description.}

# {Another Group}

* [{Subdirectory}]({subdir}/) — {What this subdirectory contains.}
```

## Rules

- **No YAML frontmatter** except `okf_version: "0.1"` at the bundle root only.
- Use `# Heading` to group related concepts.
- Link to concept files with their filenames (e.g., `orders.md`).
- Link to subdirectories with trailing `/` (e.g., `tables/`).
- Include the description from each concept's frontmatter for search/preview quality.
- May be hand-written or auto-generated.
