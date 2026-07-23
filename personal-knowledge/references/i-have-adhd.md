---
type: Reference
title: I Have ADHD — ADHD-Friendly AI Output Style
description: An action-first AI response style that reduces working-memory demands, makes progress visible, and turns answers into concrete next steps.
resource: https://github.com/leonj1/i-have-adhd
tags: [reference, ai, agents, adhd, accessibility, communication, codex, claude-code, cursor]
timestamp: 2026-07-23T00:00:00Z
---

`i-have-adhd` is an output-style skill for Claude Code, Codex, and Cursor. It is designed to make AI responses easier to act on by leading with the next action, externalizing state, limiting distractions, and showing completed progress. It does not require or imply an ADHD diagnosis.

This is an **external reference**, not an automatically applied convention in this bundle. Adopt it explicitly when its response style is useful.

# Core Model

The skill starts from five practical constraints:

1. Working memory is limited, so important state should remain visible.
2. Understanding an answer does not guarantee action; the response should bridge that gap.
3. Starting is often the hardest step, so the first action should be small and obvious.
4. Vague duration estimates are hard to use, so estimates should use concrete units.
5. Visible progress helps sustain momentum, so completed work should be stated plainly.

# Response Rules

## Action and structure

1. Lead with the next concrete action rather than introductory context.
2. Number tasks that require multiple steps, keeping each step bounded.
3. If work remains, end with one action that can be started immediately.

## Attention and continuity

4. Suppress unrelated tangents; finish the active issue before offering another.
5. Restate the current step and overall state on every turn rather than relying on memory of prior messages.
6. Use concrete time ranges such as minutes or an afternoon instead of vague estimates.

## Feedback and tone

7. Make completed work and newly working behavior visible.
8. Describe errors matter-of-factly with the failure, cause, and fix.
9. Keep a single list to five items or fewer; split longer material into ranked groups.
10. Remove conversational preambles, redundant recaps, closing pleasantries, and generic invitations to continue.

# Exceptions

The style yields to the task when:

- The user requests an explanation or walkthrough; provide the necessary depth with skimmable headings.
- A destructive operation is pending; confirm before acting.
- Three consecutive debugging attempts fail; stop iterating, identify the questionable assumption, and ask one diagnostic question.
- Genuine ambiguity would make implementation guesswork; ask one short clarifying question.

# Installation and Use

The linked `leonj1/i-have-adhd` repository currently points installation commands at the upstream `ayghri/i-have-adhd` marketplace source.

## Codex

```bash
codex plugin marketplace add ayghri/i-have-adhd --ref main
codex plugin add i-have-adhd@i-have-adhd
```

Invoke it explicitly with `$i-have-adhd`; Codex may also select it implicitly for suitable tasks.

## Claude Code

```bash
claude plugin marketplace add ayghri/i-have-adhd
claude plugin install i-have-adhd@i-have-adhd
```

Invoke it with `/i-have-adhd`.

## Cursor

```bash
npx skills add ayghri/i-have-adhd
```

Use `-g` for a global installation, then start a new Agent chat and invoke `/i-have-adhd`.

# Customization

Fork the repository and edit `skills/i-have-adhd/SKILL.md` to tune the rules. Install the fork in place of the upstream repository and re-invoke the skill in a new session so the agent reads the updated instructions.

# Citations

[1] [leonj1/i-have-adhd repository](https://github.com/leonj1/i-have-adhd)
[2] [README — purpose, rules, and primary installation commands](https://github.com/leonj1/i-have-adhd/blob/main/README.md)
[3] [Skill definition — full response rules and exceptions](https://github.com/leonj1/i-have-adhd/blob/main/skills/i-have-adhd/SKILL.md)
[4] [Installation, update, and troubleshooting guide](https://github.com/leonj1/i-have-adhd/blob/main/INSTALL.md)
