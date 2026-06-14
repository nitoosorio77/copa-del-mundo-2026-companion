# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Type-check only (tsc --noEmit) — no ESLint configured
npm run clean     # Remove dist/ and server.js
```

There is no test suite. Type checking (`npm run lint`) is the only automated correctness check.

## Architecture

**Single-page app** with React 19, TypeScript, Vite, and Tailwind CSS v4. No React Router — navigation is managed entirely via a custom `AppState` object in `App.tsx`.

### Navigation model

`AppState` in `src/types.ts` holds the current `page` ("home" | "match" | "team" | "player" | "venue" | "group" | "scorers" | "historical-scorers" | "search") plus selected entity IDs. All navigation goes through `onChangeState(partialState)` callbacks drilled down as props. A `navigationHistory` stack inside `AppState` enables the back button, and `window.history.pushState` keeps the browser history in sync.

### Data pipeline

All tournament data lives as raw text constants in `src/data/raw*.ts`:

- `rawTeams.ts` — markdown-like blocks: `### TEAMID — Name` with `- **key:** value` fields, plus `## Grupo X` sections that assign teams to groups A–L
- `rawMatches.ts` — date headers (`### Day DD mon YYYY`), match lines (`- **partido:** id | time | localId | visitorId | group | venueId | tv1,tv2`), and result lines (`- **resultado:** id | localGoals-visitorGoals | GOLES: (TEAM) Player minute',(P)/(OG)/(EC) | CARDS: (TEAM) Player minute' Y/R`)
- `rawPlayers.ts` — player entries per team: `- **nombre:** Name | **edad:** N | **club:** X | **capitan:** Sí/No | **posicion:** X | **goles_eliminatorias:** X`
- `rawSedes.ts` — same `### ID — Name` format as teams, with venue attributes

`src/data/worldCupParser.ts` → `parseAllData()` parses all four raw strings at app startup (called once via `useMemo` in `App.tsx`) and returns `{ teams, venues, matches, players, groups }`. Teams without a real roster in `rawPlayers.ts` automatically receive generated placeholder players.

### Key conventions

- **Match times** are stored and displayed in UTC-3 (Argentina timezone). `src/utils/calendar.ts` adds +3 hours when converting to UTC for calendar exports.
- **Team IDs** are short uppercase codes (e.g., `ARG`, `MEX`, `COR` for Korea). Venue IDs follow a `XX-NN` pattern (e.g., `MX-01`, `US-03`).
- **Goal/card flags**: `(P)` or `(PEN)` = penalty, `(OG)` or `(EC)` = own goal in match result strings.
- **Placeholders in data**: `⚠️ pendiente` appears in player stats fields when data is not yet confirmed.
- Group phase matches have `phase: "grupo"`, knockout matches have `phase: "eliminatoria"`. `calculateStandings()` in `src/utils/standings.ts` only processes group-phase results.
- The `Flag.tsx` component renders emoji flags. The `motion` package (Framer Motion fork) is used for animations.
