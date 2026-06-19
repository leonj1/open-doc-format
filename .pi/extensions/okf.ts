/**
 * OKF Extension — Open Knowledge Format tools for pi
 *
 * Registers tools the LLM can call to create, validate, and manage
 * OKF (Open Knowledge Format) v0.1 bundles — directories of Markdown
 * files with YAML frontmatter.
 *
 * Tools:
 *   okf_create_concept   — Create a conformant OKF concept document
 *   okf_validate_bundle  — Validate a bundle against the 3 conformance rules
 *   okf_scaffold_bundle  — Scaffold a new bundle directory structure
 *   okf_read_frontmatter — Read and return parsed frontmatter from a concept
 *   okf_generate_index   — Auto-generate index.md from concepts in a directory
 *
 * Commands:
 *   /okf-validate  — Validate current bundle (TUI)
 *   /okf-scaffold  — Scaffold a new bundle interactively
 */

import type { ExtensionAPI, ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { matchesKey, Text, truncateToWidth } from "@earendil-works/pi-tui";
import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FrontmatterData {
  type: string;
  title?: string;
  description?: string;
  resource?: string;
  tags?: string[];
  timestamp?: string;
  okf_version?: string;
  [key: string]: unknown;
}

interface ConceptInfo {
  conceptId: string;
  filePath: string;
  frontmatter: FrontmatterData;
  hasFrontmatter: boolean;
  yamlError?: string;
}

interface ValidationResult {
  bundlePath: string;
  conceptCount: number;
  passed: boolean;
  checks: {
    rule1_frontmatter: { pass: boolean; total: number; failures: string[] };
    rule2_type: { pass: boolean; total: number; failures: string[] };
    rule3_reserved: { pass: boolean; details: string[] };
  };
  warnings: string[];
}

// ─── YAML Parsing (minimal frontmatter parser) ───────────────────────────────

function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown> | null;
  body: string;
  error?: string;
} {
  const lines = content.split("\n");
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return { frontmatter: null, body: content, error: "No opening --- delimiter" };
  }

  const closingIdx = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (closingIdx === -1) {
    return { frontmatter: null, body: content, error: "No closing --- delimiter" };
  }

  const yamlBlock = lines.slice(1, closingIdx).join("\n");
  const body = closingIdx + 1 < lines.length ? lines.slice(closingIdx + 1).join("\n") : "";

  try {
    const frontmatter = parseSimpleYaml(yamlBlock);
    return { frontmatter, body };
  } catch (e) {
    return {
      frontmatter: null,
      body: content,
      error: `YAML parse error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

/** Minimal YAML parser for OKF frontmatter — handles scalars, lists, and flat mappings. */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  let currentList: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    // Skip empty lines and comments
    if (line.trim() === "" || line.trim().startsWith("#")) continue;

    // List continuation (indented dash)
    if (currentKey && line.match(/^\s+-\s+(.+)/)) {
      const val = line.replace(/^\s+-\s+/, "").trim();
      // Strip quotes
      currentList.push(val.replace(/^['"](.*)['"]$/, "$1"));
      continue;
    }

    // Flush previous list
    if (currentKey && currentList.length > 0) {
      result[currentKey] = currentList;
      currentList = [];
      currentKey = null;
    }

    // Key: value line
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();

      // Inline list: [a, b, c]
      if (value.startsWith("[") && value.endsWith("]")) {
        const inner = value.slice(1, -1);
        const items =
          inner === ""
            ? []
            : inner.split(",").map((s) => s.trim().replace(/^['"](.*)['"]$/, "$1"));
        result[key] = items;
        continue;
      }

      // Strip outer quotes
      value = value.replace(/^['"](.*)['"]$/, "$1");
      result[key] = value;

      // Check if next line starts a list
      currentKey = key;
      currentList = [];
    }
  }

  // Flush any remaining list
  if (currentKey && currentList.length > 0) {
    result[currentKey] = currentList;
  }

  return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RESERVED_FILES = new Set(["index.md", "log.md"]);

function isReservedFile(filename: string): boolean {
  return RESERVED_FILES.has(filename.toLowerCase());
}

function isoNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function relPath(base: string, target: string): string {
  return path.relative(base, target);
}

/** Format ISO 8601 YYYY-MM-DD from a timestamp string */
function dateFromISO(ts: string): string {
  return ts.slice(0, 10);
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateBundle(bundlePath: string): ValidationResult {
  const result: ValidationResult = {
    bundlePath,
    conceptCount: 0,
    passed: true,
    checks: {
      rule1_frontmatter: { pass: true, total: 0, failures: [] },
      rule2_type: { pass: true, total: 0, failures: [] },
      rule3_reserved: { pass: true, details: [] },
    },
    warnings: [],
  };

  if (!fs.existsSync(bundlePath) || !fs.statSync(bundlePath).isDirectory()) {
    result.checks.rule1_frontmatter.failures.push(
      `Bundle path does not exist or is not a directory: ${bundlePath}`,
    );
    result.checks.rule1_frontmatter.pass = false;
    result.passed = false;
    return result;
  }

  const allMdFiles: string[] = [];
  const conceptPaths: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.endsWith(".md")) {
        allMdFiles.push(full);
        if (!isReservedFile(entry.name)) {
          conceptPaths.push(full);
        }
      } else if (entry.isDirectory() && !entry.name.startsWith(".")) {
        walk(full);
      }
    }
  }
  walk(bundlePath);

  result.conceptCount = conceptPaths.length;

  // Rule 1: Every non-reserved .md file has parseable YAML frontmatter
  const seenConceptIds = new Map<string, string>(); // conceptId -> filePath
  for (const filePath of conceptPaths) {
    result.checks.rule1_frontmatter.total++;
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = parseFrontmatter(content);
    const relative = relPath(bundlePath, filePath);
    const conceptId = relative.replace(/\.md$/, "");

    if (!parsed.frontmatter) {
      result.checks.rule1_frontmatter.failures.push(
        `${relative}: ${parsed.error || "No frontmatter"}`,
      );
      result.checks.rule1_frontmatter.pass = false;
      continue;
    }

    seenConceptIds.set(conceptId, filePath);

    // Rule 2: non-empty type field
    result.checks.rule2_type.total++;
    const typeVal = parsed.frontmatter.type;
    if (!typeVal || (typeof typeVal === "string" && typeVal.trim() === "")) {
      result.checks.rule2_type.failures.push(`${relative}: missing or empty 'type' field`);
      result.checks.rule2_type.pass = false;
    }

    // Soft checks
    if (!parsed.frontmatter.description) {
      result.warnings.push(`${relative}: missing 'description' (recommended)`);
    }

    // Check cross-links
    const linkRegex = /\[([^\]]*)\]\(\/([^)]+\.md)\)/g;
    let match;
    while ((match = linkRegex.exec(parsed.body || "")) !== null) {
      const targetId = match[2].replace(/\.md$/, "");
      if (!seenConceptIds.has(targetId)) {
        // We'll check after collecting all IDs
      }
    }
  }

  // Check cross-links (now that all IDs are collected)
  for (const filePath of conceptPaths) {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = parseFrontmatter(content);
    const linkRegex = /\[([^\]]*)\]\(\/([^)]+\.md)\)/g;
    let match;
    while ((match = linkRegex.exec(parsed.body || "")) !== null) {
      const targetId = match[2].replace(/\.md$/, "");
      if (!seenConceptIds.has(targetId)) {
        const relative = relPath(bundlePath, filePath);
        result.warnings.push(`${relative}: broken cross-link to /${match[2]}`);
      }
    }
  }

  // Rule 3: Reserved files follow spec
  for (const filePath of allMdFiles) {
    const filename = path.basename(filePath).toLowerCase();
    if (!isReservedFile(filename)) continue;

    const relative = relPath(bundlePath, filePath);
    const content = fs.readFileSync(filePath, "utf-8");

    if (filename === "index.md") {
      // index.md: no frontmatter unless it's the root with okf_version
      const parsed = parseFrontmatter(content);
      if (parsed.frontmatter) {
        const keys = Object.keys(parsed.frontmatter);
        const isRootIndex = path.resolve(filePath) === path.resolve(bundlePath, "index.md");
        if (isRootIndex && keys.length === 1 && keys[0] === "okf_version") {
          result.checks.rule3_reserved.details.push(
            `${relative}: valid root index with okf_version`,
          );
        } else {
          result.checks.rule3_reserved.details.push(
            `${relative}: index.md should not have YAML frontmatter (except okf_version at bundle root)`,
          );
          result.checks.rule3_reserved.pass = false;
        }
      }
    }

    if (filename === "log.md") {
      // log.md: check for ISO 8601 date headings
      const hasDateHeading = /^## \d{4}-\d{2}-\d{2}/m.test(content);
      if (!hasDateHeading) {
        result.checks.rule3_reserved.details.push(
          `${relative}: log.md should have ISO 8601 date headings (## YYYY-MM-DD)`,
        );
        result.checks.rule3_reserved.pass = false;
      }
    }
  }

  result.passed =
    result.checks.rule1_frontmatter.pass &&
    result.checks.rule2_type.pass &&
    result.checks.rule3_reserved.pass;

  return result;
}

// ─── Extension ───────────────────────────────────────────────────────────────

export default function okfExtension(pi: ExtensionAPI) {
  // ── Tool: okf_scaffold_bundle ──────────────────────────────────────────────

  pi.registerTool({
    name: "okf_scaffold_bundle",
    label: "OKF Scaffold Bundle",
    description:
      "Scaffold a new OKF v0.1 bundle directory with root index.md. Use when the user asks to create a new OKF bundle.",
    promptSnippet: "Scaffold a new OKF v0.1 knowledge bundle directory",
    promptGuidelines: [
      "Use okf_scaffold_bundle when the user asks to create a new OKF bundle, knowledge catalog, or concept directory.",
    ],
    parameters: Type.Object({
      bundlePath: Type.String({
        description: "Path to the new bundle root directory (e.g., 'okf' or 'catalog')",
      }),
      title: Type.Optional(
        Type.String({
          description: "Display title for the bundle (used in root index.md)",
        }),
      ),
      okfVersion: Type.Optional(
        Type.String({
          description: "OKF spec version, defaults to '0.1'",
        }),
      ),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate) {
      const bundlePath = path.resolve(params.bundlePath);
      const version = params.okfVersion || "0.1";
      const title = params.title || path.basename(bundlePath) || "Knowledge Bundle";

      if (fs.existsSync(bundlePath)) {
        return {
          content: [
            {
              type: "text",
              text: `Bundle path already exists: ${bundlePath}. Use okf_create_concept to add to it, or choose a different path.`,
            },
          ],
          details: { status: "exists", bundlePath },
        };
      }

      // Create directories
      fs.mkdirSync(bundlePath, { recursive: true });

      // Create root index.md
      const indexContent = `---
okf_version: "${version}"
---

# ${title}

*This bundle contains knowledge concepts in the Open Knowledge Format (OKF) v${version}.*

Use **okf_create_concept** to add concept documents. Use **okf_generate_index** to regenerate this index.
`;
      fs.writeFileSync(path.join(bundlePath, "index.md"), indexContent, "utf-8");

      // Create empty log.md
      const today = dateFromISO(isoNow());
      const logContent = `# ${title} — Update Log

## ${today}
* **Initialization**: Created bundle structure.
`;
      fs.writeFileSync(path.join(bundlePath, "log.md"), logContent, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `✅ OKF bundle scaffolded at: ${bundlePath}

Created:
  - index.md (root index with okf_version: "${version}")
  - log.md (initialized with today's date)

Next steps:
  - Use **okf_create_concept** to add concept documents
  - Create subdirectories (e.g., tables/, datasets/, playbooks/) with mkdir
  - Use **okf_generate_index** to regenerate index files
  - Use **okf_validate_bundle** to check conformance`,
          },
        ],
        details: {
          status: "created",
          bundlePath,
          files: ["index.md", "log.md"],
        },
      };
    },

    renderCall(args, theme, _context) {
      return new Text(
        theme.fg("toolTitle", theme.bold("okf scaffold ")) +
          theme.fg("muted", args.bundlePath),
        0,
        0,
      );
    },

    renderResult(result, _options, theme, _context) {
      const text = result.content[0];
      return new Text(
        text?.type === "text" ? text.text.split("\n")[0] : "Done",
        0,
        0,
      );
    },
  });

  // ── Tool: okf_create_concept ──────────────────────────────────────────────

  pi.registerTool({
    name: "okf_create_concept",
    label: "OKF Create Concept",
    description:
      "Create a conformant OKF concept document (.md file with YAML frontmatter). Use this instead of 'write' when creating OKF concept files to ensure proper frontmatter structure.",
    promptSnippet: "Create an OKF concept document with validated frontmatter",
    promptGuidelines: [
      "Use okf_create_concept when creating or overwriting OKF concept .md files. It ensures proper YAML frontmatter with the required 'type' field.",
      "For general file creation that is not an OKF concept, use the 'write' tool instead.",
    ],
    parameters: Type.Object({
      filePath: Type.String({
        description:
          "Path to the concept .md file, relative to the bundle root (e.g., 'tables/orders.md')",
      }),
      type: Type.String({
        description:
          "Concept type — short descriptive string (e.g., 'BigQuery Table', 'API Endpoint', 'Metric', 'Playbook', 'Reference')",
      }),
      title: Type.Optional(
        Type.String({ description: "Human-readable display name for the concept" }),
      ),
      description: Type.Optional(
        Type.String({
          description: "One-sentence summary; used by index generators and search",
        }),
      ),
      resource: Type.Optional(
        Type.String({
          description:
            "Canonical URI for the underlying asset. Omit for abstract concepts (playbooks, metrics, etc.)",
        }),
      ),
      tags: Type.Optional(
        Type.Array(Type.String(), {
          description: "List of short tag strings for cross-cutting categorization",
        }),
      ),
      body: Type.String({
        description:
          "Markdown body content for the concept. Include # Schema, # Examples, # Citations sections as applicable.",
      }),
      overwrite: Type.Optional(
        Type.Boolean({
          description: "Set to true to overwrite an existing file. Defaults to false.",
        }),
      ),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate) {
      const filePath = path.resolve(params.filePath);

      // Ensure .md extension
      if (!filePath.endsWith(".md")) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Concept file path must end with .md. Got: ${params.filePath}`,
            },
          ],
          details: { error: "invalid_extension", filePath },
        };
      }

      // Check reserved filenames
      const filename = path.basename(filePath).toLowerCase();
      if (isReservedFile(filename)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: '${path.basename(filePath)}' is a reserved filename in OKF. Use index.md for directory listings and log.md for change logs. Concept documents must use other filenames.`,
            },
          ],
          details: { error: "reserved_filename", filePath },
        };
      }

      // Check if file exists
      if (fs.existsSync(filePath) && !params.overwrite) {
        return {
          content: [
            {
              type: "text",
              text: `Concept already exists: ${filePath}. Set overwrite: true to replace it.`,
            },
          ],
          details: { error: "already_exists", filePath },
        };
      }

      // Ensure parent directory exists
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });

      // Build YAML frontmatter
      const fm: Record<string, unknown> = { type: params.type };
      if (params.title) fm.title = params.title;
      if (params.description) fm.description = params.description;
      if (params.resource) fm.resource = params.resource;
      if (params.tags && params.tags.length > 0) fm.tags = params.tags;
      fm.timestamp = isoNow();

      // Serialize YAML frontmatter
      const fmLines = stringifyFrontmatter(fm);
      const body = params.body || "";

      // Build the complete document
      const content = `---\n${fmLines}---\n\n${body.trim()}\n`;

      // Write the file
      fs.writeFileSync(filePath, content, "utf-8");

      const action = params.overwrite && fs.existsSync(filePath) ? "Updated" : "Created";
      const conceptId = filePath.endsWith(".md")
        ? filePath.slice(0, -3)
        : filePath;

      return {
        content: [
          {
            type: "text",
            text: `✅ ${action} OKF concept: ${filePath}

Frontmatter:
  - type: ${params.type}
  - title: ${params.title || "(none)"}
  - description: ${params.description || "(none)"}
  - resource: ${params.resource || "(none)"}
  - tags: ${params.tags?.join(", ") || "(none)"}
  - timestamp: ${fm.timestamp}

Concept ID: ${conceptId}
`,
          },
        ],
        details: {
          status: "created",
          filePath,
          conceptId,
          frontmatter: fm,
        },
      };
    },

    renderCall(args, theme, _context) {
      return new Text(
        theme.fg("toolTitle", theme.bold("okf concept ")) +
          theme.fg("accent", args.type) +
          " " +
          theme.fg("muted", args.filePath),
        0,
        0,
      );
    },

    renderResult(result, _options, theme, _context) {
      const d = result.details as { status: string; filePath: string; conceptId: string } | undefined;
      if (!d) return new Text(theme.fg("dim", "Done"), 0, 0);
      return new Text(
        theme.fg("success", "✓ ") +
          theme.fg("muted", `${d.status} ${d.conceptId}`),
        0,
        0,
      );
    },
  });

  // ── Tool: okf_validate_bundle ─────────────────────────────────────────────

  pi.registerTool({
    name: "okf_validate_bundle",
    label: "OKF Validate Bundle",
    description:
      "Validate an OKF bundle against the 3 conformance rules (frontmatter, type field, reserved files) and report soft warnings.",
    promptSnippet: "Validate OKF bundle conformance",
    promptGuidelines: [
      "Use okf_validate_bundle after creating or editing OKF concepts to verify conformance.",
      "Use okf_validate_bundle before committing a bundle to check for issues.",
    ],
    parameters: Type.Object({
      bundlePath: Type.String({
        description: "Path to the bundle root directory to validate",
      }),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate) {
      const bundlePath = path.resolve(params.bundlePath);

      if (!fs.existsSync(bundlePath)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Bundle path does not exist: ${bundlePath}`,
            },
          ],
          details: { error: "not_found", bundlePath },
        };
      }

      const result = validateBundle(bundlePath);
      return formatValidationOutput(result);
    },

    renderCall(args, theme, _context) {
      return new Text(
        theme.fg("toolTitle", theme.bold("okf validate ")) +
          theme.fg("muted", args.bundlePath),
        0,
        0,
      );
    },

    renderResult(result, _options, theme, _context) {
      const d = result.details as ValidationResult | undefined;
      if (!d) return new Text(theme.fg("dim", "Done"), 0, 0);
      const icon = d.passed ? theme.fg("success", "✓") : theme.fg("error", "✗");
      const warnings = d.warnings.length > 0 ? ` (${d.warnings.length} warnings)` : "";
      return new Text(
        `${icon} ${theme.fg("muted", `${d.conceptCount} concepts${warnings}`)}`,
        0,
        0,
      );
    },
  });

  // ── Tool: okf_read_frontmatter ────────────────────────────────────────────

  pi.registerTool({
    name: "okf_read_frontmatter",
    label: "OKF Read Frontmatter",
    description:
      "Read and parse the YAML frontmatter of an OKF concept document. Returns the frontmatter fields and the body separately. Use to inspect concept metadata without reading the raw file.",
    promptSnippet: "Read OKF concept frontmatter and body",
    promptGuidelines: [
      "Use okf_read_frontmatter to inspect concept metadata (type, title, description, tags, resource) without having to parse it yourself.",
    ],
    parameters: Type.Object({
      filePath: Type.String({
        description: "Path to the concept .md file",
      }),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate) {
      const filePath = path.resolve(params.filePath);

      if (!fs.existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: File not found: ${filePath}`,
            },
          ],
          details: { error: "not_found", filePath },
        };
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parseFrontmatter(content);

      if (!parsed.frontmatter) {
        return {
          content: [
            {
              type: "text",
              text: `Error: No parseable frontmatter in ${filePath}\n${parsed.error || ""}`,
            },
          ],
          details: {
            error: "no_frontmatter",
            filePath,
            parseError: parsed.error,
          },
        };
      }

      const fm = parsed.frontmatter as FrontmatterData;
      const info: string[] = [];
      info.push(`## Concept: ${relPath(process.cwd(), filePath)}`);
      info.push("");
      info.push("**Type:** " + (fm.type || "(missing — required!)"));
      if (fm.title) info.push("**Title:** " + fm.title);
      if (fm.description) info.push("**Description:** " + fm.description);
      if (fm.resource) info.push("**Resource:** " + fm.resource);
      if (fm.tags && fm.tags.length > 0) info.push("**Tags:** " + fm.tags.join(", "));
      if (fm.timestamp) info.push("**Timestamp:** " + fm.timestamp);
      if (fm.okf_version) info.push("**OKF Version:** " + fm.okf_version);

      // Show any extension keys
      const knownKeys = new Set([
        "type", "title", "description", "resource", "tags", "timestamp", "okf_version",
      ]);
      const extraKeys = Object.keys(fm).filter((k) => !knownKeys.has(k));
      if (extraKeys.length > 0) {
        info.push("");
        info.push("**Extension fields:**");
        for (const k of extraKeys) {
          info.push(`  - ${k}: ${JSON.stringify(fm[k])}`);
        }
      }

      info.push("");
      info.push("---");
      info.push("**Body preview:**");
      const bodyPreview =
        parsed.body.length > 500
          ? parsed.body.slice(0, 500) + "..."
          : parsed.body || "(empty)";
      info.push(bodyPreview);

      return {
        content: [{ type: "text", text: info.join("\n") }],
        details: {
          filePath,
          frontmatter: fm,
          bodyLength: parsed.body.length,
        },
      };
    },

    renderCall(args, theme, _context) {
      return new Text(
        theme.fg("toolTitle", theme.bold("okf frontmatter ")) +
          theme.fg("muted", args.filePath),
        0,
        0,
      );
    },

    renderResult(result, _options, theme, _context) {
      const d = result.details as { frontmatter?: FrontmatterData; error?: string } | undefined;
      if (d?.error) return new Text(theme.fg("error", d.error), 0, 0);
      const fm = d?.frontmatter;
      if (!fm) return new Text(theme.fg("dim", "Done"), 0, 0);
      return new Text(
        theme.fg("accent", fm.type || "unknown") +
          (fm.title ? " " + theme.fg("muted", fm.title) : ""),
        0,
        0,
      );
    },
  });

  // ── Tool: okf_generate_index ──────────────────────────────────────────────

  pi.registerTool({
    name: "okf_generate_index",
    label: "OKF Generate Index",
    description:
      "Auto-generate an index.md file for a directory in an OKF bundle by scanning all .md concept files, extracting their frontmatter descriptions, and grouping them.",
    promptSnippet: "Auto-generate OKF index.md from concepts in a directory",
    promptGuidelines: [
      "Use okf_generate_index after adding or editing concepts to regenerate index files.",
      "Use okf_generate_index when you need to create or refresh an index.md.",
    ],
    parameters: Type.Object({
      directory: Type.String({
        description:
          "Directory to generate index.md for (e.g., 'tables' or '.' for bundle root)",
      }),
      isBundleRoot: Type.Optional(
        Type.Boolean({
          description: "Set to true if this is the bundle root (adds okf_version frontmatter). Defaults to auto-detect.",
        }),
      ),
      groupBy: Type.Optional(
        StringEnum(["type", "tags", "none"] as const, {
          description: "How to group concepts in the index. Defaults to 'none' (flat list).",
        }),
      ),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate) {
      const dir = path.resolve(params.directory);
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Directory not found: ${dir}`,
            },
          ],
          details: { error: "not_found", directory: dir },
        };
      }

      // Auto-detect if this is a bundle root
      const isRoot =
        params.isBundleRoot ??
        (fs.existsSync(path.join(dir, "index.md")) &&
          !path.resolve(dir).includes(path.sep + "tables") &&
          !path.resolve(dir).includes(path.sep + "datasets") &&
          !path.resolve(dir).includes(path.sep + "playbooks"));

      // Discover concepts in this directory (non-recursive)
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const concepts: { name: string; frontmatter: FrontmatterData | null; isDir: boolean }[] =
        [];
      const subdirs: string[] = [];

      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;

        if (entry.isFile() && entry.name.endsWith(".md") && !isReservedFile(entry.name)) {
          const content = fs.readFileSync(path.join(dir, entry.name), "utf-8");
          const parsed = parseFrontmatter(content);
          concepts.push({
            name: entry.name,
            frontmatter: (parsed.frontmatter as FrontmatterData) || null,
            isDir: false,
          });
        } else if (entry.isDirectory()) {
          // Check if this subdirectory has concepts or an index
          const hasConcepts = fs.readdirSync(path.join(dir, entry.name)).some(
            (f) => f.endsWith(".md") && !isReservedFile(f),
          );
          if (hasConcepts || fs.existsSync(path.join(dir, entry.name, "index.md"))) {
            subdirs.push(entry.name);
          }
        }
      }

      // Group concepts
      const groupBy = params.groupBy || "none";
      let indexBody = "";

      if (isRoot) {
        indexBody = '---\nokf_version: "0.1"\n---\n\n';
      }

      if (groupBy === "type") {
        const byType: Record<string, typeof concepts> = {};
        for (const c of concepts) {
          const t = c.frontmatter?.type || "Other";
          if (!byType[t]) byType[t] = [];
          byType[t].push(c);
        }
        for (const [typeName, items] of Object.entries(byType).sort()) {
          indexBody += `# ${typeName}\n\n`;
          for (const c of items.sort((a, b) => a.name.localeCompare(b.name))) {
            const title = c.frontmatter?.title || c.name.replace(/\.md$/, "");
            const desc = c.frontmatter?.description || "";
            indexBody += `* [${title}](${c.name}) — ${desc}\n`;
          }
          indexBody += "\n";
        }
      } else if (groupBy === "tags") {
        const byTag: Record<string, typeof concepts> = {};
        const untagged: typeof concepts = [];
        for (const c of concepts) {
          const tags = c.frontmatter?.tags;
          if (tags && tags.length > 0) {
            for (const t of tags) {
              if (!byTag[t]) byTag[t] = [];
              byTag[t].push(c);
            }
          } else {
            untagged.push(c);
          }
        }
        for (const [tag, items] of Object.entries(byTag).sort()) {
          indexBody += `# ${tag}\n\n`;
          for (const c of items.sort((a, b) => a.name.localeCompare(b.name))) {
            const title = c.frontmatter?.title || c.name.replace(/\.md$/, "");
            const desc = c.frontmatter?.description || "";
            indexBody += `* [${title}](${c.name}) — ${desc}\n`;
          }
          indexBody += "\n";
        }
        if (untagged.length > 0) {
          indexBody += "# Other\n\n";
          for (const c of untagged.sort((a, b) => a.name.localeCompare(b.name))) {
            const title = c.frontmatter?.title || c.name.replace(/\.md$/, "");
            const desc = c.frontmatter?.description || "";
            indexBody += `* [${title}](${c.name}) — ${desc}\n`;
          }
          indexBody += "\n";
        }
      } else {
        // Flat list
        indexBody += "# Concepts\n\n";
        for (const c of concepts.sort((a, b) => a.name.localeCompare(b.name))) {
          const title = c.frontmatter?.title || c.name.replace(/\.md$/, "");
          const desc = c.frontmatter?.description || "";
          indexBody += `* [${title}](${c.name}) — ${desc}\n`;
        }
        indexBody += "\n";
      }

      // Add subdirectories section
      if (subdirs.length > 0) {
        indexBody += "# Directories\n\n";
        for (const sub of subdirs.sort()) {
          indexBody += `* [${sub}/](${sub}/) — Browse ${sub} concepts\n`;
        }
        indexBody += "\n";
      }

      const indexPath = path.join(dir, "index.md");
      fs.writeFileSync(indexPath, indexBody, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `✅ Generated index.md in ${dir}\n` +
              `  - ${concepts.length} concept(s) indexed\n` +
              `  - ${subdirs.length} subdirector${subdirs.length === 1 ? "y" : "ies"} listed\n` +
              `  - Grouping: ${groupBy}\n` +
              `  - Bundle root: ${isRoot ? "yes" : "no"}`,
          },
        ],
        details: {
          status: "generated",
          directory: dir,
          conceptCount: concepts.length,
          subdirCount: subdirs.length,
          groupBy,
          isRoot,
        },
      };
    },

    renderCall(args, theme, _context) {
      return new Text(
        theme.fg("toolTitle", theme.bold("okf index ")) +
          theme.fg("muted", args.directory) +
          (args.groupBy && args.groupBy !== "none"
            ? " " + theme.fg("dim", `by ${args.groupBy}`)
            : ""),
        0,
        0,
      );
    },

    renderResult(result, _options, theme, _context) {
      const d = result.details as { conceptCount: number; status: string } | undefined;
      if (!d) return new Text(theme.fg("dim", "Done"), 0, 0);
      return new Text(
        theme.fg("success", "✓ ") +
          theme.fg("muted", `${d.conceptCount} concepts indexed`),
        0,
        0,
      );
    },
  });

  // ── Command: /okf-validate ────────────────────────────────────────────────

  pi.registerCommand("okf-validate", {
    description: "Validate the current OKF bundle for conformance",
    handler: async (_args, ctx) => {
      if (ctx.mode !== "tui") {
        ctx.ui.notify("/okf-validate requires TUI mode", "error");
        return;
      }

      const cwd = ctx.cwd;
      const result = validateBundle(cwd);

      await ctx.ui.custom<void>((_tui, theme, _kb, done) => {
        return new ValidationResultComponent(result, theme, () => done());
      });
    },
  });

  // ── Command: /okf-scaffold ────────────────────────────────────────────────

  pi.registerCommand("okf-scaffold", {
    description: "Scaffold a new OKF bundle in the current directory",
    handler: async (_args, ctx) => {
      const cwd = ctx.cwd;

      // Check if already a bundle
      if (
        fs.existsSync(path.join(cwd, "index.md")) &&
        fs.existsSync(path.join(cwd, "log.md"))
      ) {
        const proceed = await ctx.ui.confirm(
          "Bundle exists",
          "An OKF bundle appears to already exist here. Scaffold anyway?",
        );
        if (!proceed) return;
      }

      // Create root index.md
      const dirName = path.basename(cwd) || "knowledge-bundle";
      const indexContent = `---
okf_version: "0.1"
---

# ${dirName}

*This bundle contains knowledge concepts in the Open Knowledge Format (OKF) v0.1.*

Use **okf_create_concept** to add concept documents.
`;
      fs.writeFileSync(path.join(cwd, "index.md"), indexContent, "utf-8");

      // Create log.md
      const today = dateFromISO(isoNow());
      const logContent = `# ${dirName} — Update Log

## ${today}
* **Initialization**: Created bundle structure.
`;
      fs.writeFileSync(path.join(cwd, "log.md"), logContent, "utf-8");

      ctx.ui.notify(`OKF bundle scaffolded: index.md + log.md`, "success");
    },
  });
}

// ─── Helper: Frontmatter Serialization ──────────────────────────────────────

function stringifyFrontmatter(fm: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(fm)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        const items = value.map((v) => {
          const s = String(v);
          // Quote strings containing special chars
          return /[,\[\]{}#&*!|>'"%@`]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
        });
        lines.push(`${key}: [${items.join(", ")}]`);
      }
    } else if (typeof value === "string") {
      // Quote strings containing special YAML chars
      const s = value as string;
      if (
        /[:#\{\}\[\],&*!|>'"%@`]/.test(s) ||
        s.startsWith(" ") ||
        s.endsWith(" ") ||
        s === "true" ||
        s === "false" ||
        s === "null" ||
        s === "yes" ||
        s === "no"
      ) {
        lines.push(`${key}: "${s.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${key}: ${s}`);
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  return lines.join("\n");
}

// ─── Helper: Format Validation Output ───────────────────────────────────────

function formatValidationOutput(result: ValidationResult) {
  const lines: string[] = [];
  lines.push(`## OKF Validation Report for \`${result.bundlePath}\``);
  lines.push("");

  // Conformance checks
  lines.push("### ✅ Conformance Checks");
  lines.push("");

  const r1 = result.checks.rule1_frontmatter;
  const icon1 = r1.pass ? "✅" : "❌";
  lines.push(
    `${icon1} **Rule 1 (frontmatter):** ${r1.pass ? "PASS" : "FAIL"} — ` +
      `${r1.total - r1.failures.length}/${r1.total} concept documents have valid frontmatter`,
  );
  for (const f of r1.failures) {
    lines.push(`   - ${f}`);
  }

  const r2 = result.checks.rule2_type;
  const icon2 = r2.pass ? "✅" : "❌";
  lines.push(
    `${icon2} **Rule 2 (type field):** ${r2.pass ? "PASS" : "FAIL"} — ` +
      `${r2.total - r2.failures.length}/${r2.total} concepts have non-empty type`,
  );
  for (const f of r2.failures) {
    lines.push(`   - ${f}`);
  }

  const r3 = result.checks.rule3_reserved;
  const icon3 = r3.pass ? "✅" : "❌";
  lines.push(
    `${icon3} **Rule 3 (reserved files):** ${r3.pass ? "PASS" : "FAIL"}`,
  );
  for (const d of r3.details) {
    lines.push(`   - ${d}`);
  }

  // Warnings
  if (result.warnings.length > 0) {
    lines.push("");
    lines.push(`### ⚠️ Warnings (${result.warnings.length})`);
    lines.push("");
    for (const w of result.warnings) {
      lines.push(`   - ${w}`);
    }
  }

  // Summary
  lines.push("");
  if (result.passed) {
    lines.push("### ✅ Bundle is conformant with OKF v0.1");
  } else {
    lines.push("### ❌ Bundle is NOT conformant — fix the failures above");
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
    details: result,
  };
}

// ─── TUI Component: Validation Result Viewer ─────────────────────────────────

class ValidationResultComponent {
  private result: ValidationResult;
  private theme: Theme;
  private onClose: () => void;

  constructor(result: ValidationResult, theme: Theme, onClose: () => void) {
    this.result = result;
    this.theme = theme;
    this.onClose = onClose;
  }

  handleInput(data: string): void {
    if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c") || matchesKey(data, "q")) {
      this.onClose();
    }
  }

  render(width: number): string[] {
    const th = this.theme;
    const lines: string[] = [];
    const r = this.result;

    // Header
    const title = ` OKF Validation: ${path.basename(r.bundlePath)} `;
    lines.push(
      truncateToWidth(
        th.fg("borderMuted", "───") + th.fg("accent", th.bold(title)) +
          th.fg("borderMuted", "─".repeat(Math.max(0, width - title.length - 6))),
        width,
      ),
    );
    lines.push("");

    // Conformance
    const passIcon = r.passed
      ? th.fg("success", "✅ Bundle is CONFORMANT")
      : th.fg("error", "❌ Bundle is NOT conformant");
    lines.push(truncateToWidth(`  ${passIcon}`, width));
    lines.push("");

    // Rule 1
    const r1 = r.checks.rule1_frontmatter;
    const r1Icon = r1.pass ? th.fg("success", "✓") : th.fg("error", "✗");
    lines.push(
      truncateToWidth(
        `  ${r1Icon} Frontmatter: ${r1.total - r1.failures.length}/${r1.total} valid`,
        width,
      ),
    );
    for (const f of r1.failures.slice(0, 5)) {
      lines.push(truncateToWidth(`    ${th.fg("error", f)}`, width));
    }
    if (r1.failures.length > 5) {
      lines.push(
        truncateToWidth(
          `    ${th.fg("dim", `... and ${r1.failures.length - 5} more`)}`,
          width,
        ),
      );
    }

    // Rule 2
    const r2 = r.checks.rule2_type;
    const r2Icon = r2.pass ? th.fg("success", "✓") : th.fg("error", "✗");
    lines.push(
      truncateToWidth(
        `  ${r2Icon} Type field: ${r2.total - r2.failures.length}/${r2.total} present`,
        width,
      ),
    );
    for (const f of r2.failures.slice(0, 3)) {
      lines.push(truncateToWidth(`    ${th.fg("error", f)}`, width));
    }

    // Rule 3
    const r3 = r.checks.rule3_reserved;
    const r3Icon = r3.pass ? th.fg("success", "✓") : th.fg("dim", "—");
    lines.push(
      truncateToWidth(
        `  ${r3Icon} Reserved files: ${r3.pass ? "OK" : "issues found"}`,
        width,
      ),
    );

    // Warnings
    if (r.warnings.length > 0) {
      lines.push("");
      lines.push(
        truncateToWidth(
          `  ${th.fg("warning", `⚠ Warnings (${r.warnings.length})`)}`,
          width,
        ),
      );
      for (const w of r.warnings.slice(0, 8)) {
        lines.push(truncateToWidth(`    ${th.fg("muted", w)}`, width));
      }
      if (r.warnings.length > 8) {
        lines.push(
          truncateToWidth(
            `    ${th.fg("dim", `... and ${r.warnings.length - 8} more`)}`,
            width,
          ),
        );
      }
    }

    lines.push("");
    lines.push(
      truncateToWidth(
        `  ${th.fg("dim", "Press Escape or Q to close")}`,
        width,
      ),
    );

    return lines;
  }

  invalidate(): void {}
}
