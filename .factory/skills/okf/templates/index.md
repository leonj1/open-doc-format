# Index File Template

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

* [{Concept Title}]({concept.md}) — {Short description.}
* [{Another Title}]({another.md}) — {Short description.}

# {Another Group}

* [{Subdirectory}]({subdir}/) — {What this subdirectory contains.}
```

## Rules

- **No YAML frontmatter** except `okf_version: "0.1"` at the bundle root.
- Group concepts under `# Headings`.
- Link concepts with `.md` filenames; link subdirectories with trailing `/`.
- Include `description` from each concept's frontmatter.
- May be hand-written or auto-generated.
