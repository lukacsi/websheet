# WebSheet — Backlog

## Schema / Types
- Add `Feat` type and PocketBase collection (needed for level-up and backgrounds)
- Add `subraces` PocketBase collection (currently only in TS type, no storage)
- Add `page` field to PB spells collection (exists in TS type but not in PB)

## Infrastructure
- Fix PocketBase JS migrations to auto-apply (current Docker image doesn't run them — using setup script as workaround)
- Add 404 / catch-all route with error boundary

## Features (by phase)
See plan at `.claude/plans/atomic-gliding-harp.md` for full phased roadmap.
