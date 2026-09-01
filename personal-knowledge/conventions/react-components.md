---
type: Convention
title: ReactJS Component Authoring
description: "React components stay within 700 total lines, own only their component function, import all other functions, and decompose long JSX into independent components."
tags: [conventions, react, reactjs, typescript, javascript, components, jsx, tsx, frontend]
timestamp: 2026-09-01T00:00:00Z
---

# Scope

These rules apply to ReactJS components written in JavaScript or TypeScript. They extend the general [Code Structure and Patterns](/conventions/code-structure.md), [Project Structure](/conventions/project-structure.md), and [Naming Conventions](/conventions/naming.md).

# Component Size

A React component file must not exceed **700 total physical lines**. The count includes:

- imports and exports;
- prop and local type declarations;
- the component definition;
- JSX markup;
- comments and blank lines; and
- styles embedded in the component file.

Use the file's physical line count, such as `wc -l`, to enforce the limit. Do not make formatting denser to fit beneath the limit. Extract responsibilities instead.

The 700-line limit is a hard ceiling, not a target. Decompose the component earlier when it contains independently understandable UI regions or responsibilities.

# One Function per File

Each function belongs in its own file:

- A component file owns only its component function.
- A child component owns its own component file.
- A custom hook owns its own file.
- A formatter, validator, mapper, selector, event transformation, or other helper owns its own file.
- Import functions where they are used.

The component function itself is the only function defined in its component file. Do not define helpers above or below it, and do not hide helpers inside its body. Avoid inline callback functions in JSX; pass an existing function directly or extract the behavior into an imported function or hook.

Types and immutable constants are not functions. They may stay with a small component when they are private to it, but shared types and constants belong in their own named modules.

# Decompose Long JSX

Long JSX markup must be decomposed into independent React components. Extract a child component when a section:

- has a distinct name or UI purpose;
- has its own props, state, behavior, loading state, or error state;
- is repeated;
- can be tested as an independent user-visible behavior; or
- makes the parent difficult to understand in one reading.

The parent component should communicate composition and data flow. Detailed markup belongs to the child component that owns that UI responsibility.

Do not extract meaningless fragments solely to reduce line count. Each extracted component must represent a coherent UI concept and receive a strongly typed, minimal props object.

# TypeScript Rules

- Prefer TypeScript and `.tsx` for components.
- Give every props object an explicit type.
- Do not use `any` or untyped component arguments.
- Model mutually exclusive UI states with discriminated unions rather than multiple boolean flags.
- Treat props and state as immutable values.
- Never mutate an incoming props object or an object received through props.

These rules follow the bundle's existing [type discipline](/conventions/code-structure.md) and [data-structure guidance](/conventions/data-structures.md).

# File Layout

Keep production components and their functions under `src/`. Keep tests and test-support code under the top-level `tests/` directory as required by [Project Structure](/conventions/project-structure.md).

```text
project/
├── src/
│   ├── components/
│   │   └── ProfilePanel/
│   │       ├── ProfilePanel.tsx
│   │       ├── ProfileHeader.tsx
│   │       ├── ProfileContactDetails.tsx
│   │       └── formatProfileName.ts
│   └── hooks/
│       └── useProfile.ts
└── tests/
    └── components/
        └── ProfilePanel.test.tsx
```

Do not co-locate test files with production component files.

# Examples

## Component with imported behavior

```tsx
// src/components/ProfilePanel/ProfilePanel.tsx
import { ProfileContactDetails } from "./ProfileContactDetails";
import { ProfileHeader } from "./ProfileHeader";
import { formatProfileName } from "./formatProfileName";

type Profile = Readonly<{
  email: string;
  familyName: string;
  givenName: string;
}>;

type ProfilePanelProps = Readonly<{
  profile: Profile;
}>;

export function ProfilePanel({ profile }: ProfilePanelProps): JSX.Element {
  return (
    <section aria-labelledby="profile-heading">
      <ProfileHeader name={formatProfileName(profile)} />
      <ProfileContactDetails email={profile.email} />
    </section>
  );
}
```

```typescript
// src/components/ProfilePanel/formatProfileName.ts
type ProfileName = Readonly<{
  familyName: string;
  givenName: string;
}>;

export function formatProfileName(profile: ProfileName): string {
  return `${profile.givenName} ${profile.familyName}`;
}
```

`ProfilePanel.tsx` owns only the `ProfilePanel` function. The formatting function is defined in its own file and imported. Each independently named JSX region is also a component in its own file.

## Prohibited structure

```tsx
// Do not place multiple functions in one component file.
function formatProfileName(profile: Profile): string {
  return `${profile.givenName} ${profile.familyName}`;
}

export function ProfilePanel({ profile }: ProfilePanelProps): JSX.Element {
  const selectProfile = (): void => {
    // Inline nested function.
  };

  return (
    <section onClick={() => selectProfile()}>
      {/* Hundreds of lines of unrelated JSX regions. */}
    </section>
  );
}
```

This structure combines a component, a formatter, a nested event function, an inline callback, and long markup. Extract each function and each coherent UI region into its own file.

# Review Checklist

- The component file is 700 lines or fewer in total.
- The file defines exactly one function: its React component.
- All helpers and custom hooks are imported from their own files.
- JSX contains no inline function definitions.
- Long or independent JSX regions are named child components.
- Props and function arguments are strongly typed without `any`.
- Props and incoming objects are not mutated.
- Production files live under `src/`; tests live under `tests/`.
