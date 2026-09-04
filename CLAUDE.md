# CLAUDE.md — `web-game-gomoku`

Guidance for Claude Code working in this repository.

**Two instruction files, deliberately split.** This one is **committed**, so it holds
what must survive a fresh clone: the command reference and the contracts that
automation depends on (releases, deploy, README). The other one,
`.claude/CLAUDE.md`, is **gitignored** and holds the document layout, the docs
contract, the hooks and the design-skill routing. If the two ever disagree, this file
wins for anything CI reads and that one wins for anything about documents.

The map of the documentation itself is [`docs/README.md`](docs/README.md) — the only
file that talks about the other files.

## Commands

```bash
yarn install
yarn dev          # http://localhost:3000
yarn test         # vitest, 89 tests
yarn test:watch
yarn typecheck
yarn lint
yarn build        # static export into out/
```

`yarn build` locally produces a build with **no** `basePath`, so `out/` opens
correctly from the filesystem. Only `.github/workflows/deploy.yml` sets
`GITHUB_PAGES=true`, which is what turns on `basePath: '/web-game-gomoku'`
(ADR-0010). Do not set that variable by hand — see [`.env.example`](.env.example).

## Commit convention (REQUIRED — releases depend on it)

Every push to `main` creates a GitHub Release automatically
(`.github/workflows/release.yml`). The version bump is inferred from Conventional
Commit prefixes across **all** commits since the previous release, so commit subjects
MUST follow this format:

- `fix:`, `chore:`, `docs:`, `ci:`, `refactor:`, `test:`, `style:` → **patch** bump (`v1.0.x`)
- `feat:` → **minor** bump (`v1.x.0`) — use for any new user-facing feature
- `feat!:` (any `type!:`) or a `BREAKING CHANGE:` line in the body → **major** bump
  (`vX.0.0`) — use when existing players are affected. In this project that means: the
  saved-game or stats format changes in a way old data cannot survive (ADR-0006 says
  a key with a different version is dropped, not migrated), or the win rule changes
  (ADR-0003), or a whole mode is removed.

Manual overrides, honored **only in the HEAD commit subject line**:

- `[release minor]` / `[release major]` — force a bigger bump
- `[skip release]` — no release for this push (use for docs- or CI-only pushes where a
  release would be noise)

When merging a feature branch into `main`, make sure the merge/HEAD commit subject
carries the right prefix. With several commits in one push the workflow scans the whole
range, so a single `feat:` anywhere in the push is enough for a minor bump — and a
`[skip release]` marker on the merge subject would cancel the release of feature commits
pushed alongside it.

Subjects, bodies and identifiers are **English**; user-facing conversation is Vietnamese.
Bodies explain reasoning, not the diff.

## README (REQUIRED — keep in sync with features)

Releases are automated, README is not. Every user-facing feature (`feat:` commit) MUST
update the `## Features` section of [`README.md`](README.md) **in the same branch**,
before merging into `main` — one short English bullet in the existing style, grouped
under the existing bold headings.

While touching README, refresh stale counts if you notice them (the test count in Tech
Stack, the milestone line near the top). README-only syncs use a `docs:` prefix and
**never** a `[skip release]` marker — that would cancel the release of feature commits
pushed together with them.

## Deploy

`.github/workflows/deploy.yml` builds and publishes `out/` to GitHub Pages on every
push to `main`. It runs `typecheck` and `test` first, so a broken commit does not reach
the live site.

Live at <https://levananhduc.github.io/web-game-gomoku/>.

Pages itself has to be switched on **once per repository**, with a token that has admin
rights — the workflow's own `GITHUB_TOKEN` can deploy to an existing Pages site but
cannot create one (ADR-0012, learned by running it):

```bash
gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow
```

Already done for this repo. If `configure-pages` ever fails with "Get Pages site failed",
that command is the fix, not a change to the workflow.

## Workflow gates, and why there are three files

| Workflow | Runs on | Gates |
| --- | --- | --- |
| `ci.yml` | pull requests only | typecheck · lint · test · build · audit (report-only) |
| `deploy.yml` | push to `main` | typecheck · test, then build and publish |
| `release.yml` | push to `main` | typecheck · test, then compute the version and tag |

`ci.yml` deliberately does **not** run on `main`: the other two already gate that push,
and a third run would be the same test suite a third time for one push.

## Before touching any code

Read [`docs/03-design/invariants.md`](docs/03-design/invariants.md) — twelve things that
break **silently**: the code still runs, the tests stay green, and the result is wrong.
`docs/decisions/` holds the ADRs, each naming what it rejected and what it costs.
