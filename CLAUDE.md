# WebSheet — D&D 5e Character Sheet

Full-lifecycle D&D 5e character sheet web app. Character creation, level-up, gameplay tracking, 5e.tools data, homebrew support.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **UI:** Mantine v8 (dark parchment theme)
- **Forms:** React Hook Form + Zod
- **Backend:** PocketBase (Docker, SQLite)
- **Data:** 5e.tools JSON (seeded into PocketBase)

## Commands

```bash
pnpm dev              # Start frontend dev server
pnpm build            # Build for production
pnpm exec tsc --noEmit  # Type-check

docker compose up -d  # Start PocketBase
docker compose down   # Stop PocketBase
bash scripts/setup-collections.sh  # Create PocketBase collections (run once)

pnpm run import                    # Import 5e.tools data (clones repo on first run)
pnpm run import -- --update        # Pull latest 5e.tools data and re-import
pnpm run import -- --only spells   # Import specific collection(s)
```

## Project Structure

```
src/
├── api/           # PocketBase client and API functions
├── components/    # Shared UI components
├── hooks/         # Custom React hooks
├── pages/         # Route-level page components
├── theme/         # Mantine theme config + global CSS
├── types/         # TypeScript type definitions for D&D entities
└── utils/         # Pure utility functions
```

## PocketBase

- Runs in Docker via `docker-compose.yml`
- Admin UI: http://127.0.0.1:8090/_/
- API: http://127.0.0.1:8090/api/
- Collections: spells, classes, subclasses, class_features, races, items, backgrounds, characters
- All rules are open (no auth required) — characters use name + passphrase for access control

## Conventions

- Types in `src/types/` mirror both 5e.tools JSON structure and PocketBase collections
- Edition field: `"classic"` = 2014 rules, `"one"` = 2024 rules
- Homebrew items use `isHomebrew: true` flag — same storage path as official content
- Path aliases: `@/` maps to `src/`

## Workflow

- **Commit after each completed ticket/task** — don't accumulate uncommitted changes across multiple tickets. Type-check (`pnpm exec tsc --noEmit`) before committing.
- **Mark progress in `docs/ux-tickets.md`** — strike through and mark as **Done** in the priority table when a ticket is completed. Include this in the commit.
