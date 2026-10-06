# Domain Docs

_Configuration for the agent skills from [mattpocock/skills](https://github.com/mattpocock/skills)._

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`DESIGN.md`** at the repo root — the primary domain document (prior knowledge, curriculum links, case/culprit/network data, missions, gamification). General contribution rules are in `CONTRIBUTING.md`. It takes precedence; always read it before content work.
- **`CONTEXT.md`** at the repo root — glossary of domain terms.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

If `CONTEXT.md` or `docs/adr/` don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The domain-modeling skill creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── DESIGN.md
├── CONTEXT.md
├── docs/adr/
│   └── 0001-....md
└── spiel/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md` / `DESIGN.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for the domain-modeling skill).

## Flag ADR conflicts

If your output contradicts an existing ADR or a decision in `DESIGN.md`, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (…) — but worth reopening because…_
