# MARSWALK team agent briefs

These briefs are for Willy, Emma, Gaddielle, Enzo, Longla and the project coordinator (YOU.md). Each learner works with a coding agent as a coach. Completing an agent-generated change is only one part of finishing a task: the learner also explains the change and makes a small variation.

## Start here

These six briefs and this shared guide are published on **main**. The Angular application is on **feat/angular-migration**, with personal working branches created from that codebase. The runnable app currently on main is the original plain JavaScript prototype.

Read this guide before inspecting Angular implementation paths such as src/app or public/. Start from the Angular codebase using the commands below; those implementation paths are intentionally absent from main until the migration is merged. Preserve uncommitted work when changing branches.

Read AGENTS.md, README.md, docs/LEARNING.md and your personal brief. Each personal file is a complete prompt you can paste into an agent; give that agent repository access too.

Paste this, replacing the name:

```text
Read AGENTS.md, docs/team/README.md and docs/team/WILLY.md.
I am Willy. Act as my coding coach and follow my brief.
Inspect the existing code first. Explain the first small task and ask
one prediction question. Wait for my answer before the first feature edit.
```

If an agent has no repository access, it must say so and request the necessary files. It must not claim to inspect, modify or test code it cannot access.

## Ownership

| Learner | Owns | Review partner | First small change |
| --- | --- | --- | --- |
| [Willy](WILLY.md) | Map component and Leaflet rendering | Emma | Add an accurate marker legend |
| [Emma](EMMA.md) | Layer controls and global styling | Willy | Show visible/hidden text for each available layer |
| [Gaddielle](GADDIELLE.md) | Planner component and pure route rules | Longla | Explain route completeness in the planner |
| [Enzo](ENZO.md) | Science component, provenance and data documentation | YOU | Explain source, age and limitations of the supplied image |
| [Longla](LONGLA.md) | Notebook component and storage helpers | Gaddielle | Add a notebook character counter |
| [YOU](YOU.md) | Shared contracts, app integration and offline behavior | Enzo | Create and run the integration checklist |

This is a starting allocation; the team can reassign ownership explicitly. Read any relevant files. Keep feature edits within your ownership. Record requested shared changes for YOU instead of silently modifying another teammate's files.

Willy renders layers/routes; Emma controls layer state; Gaddielle assesses routes. MissionService connects these responsibilities. Enzo checks scientific evidence. Longla handles note/storage behavior. YOU owns shared state and integration.

## Working branches

From a clean working tree in a cloned repository:

```sh
git fetch origin
git switch feat/angular-migration
git pull --ff-only origin feat/angular-migration
git switch -c team/willy-map
npm ci
npm start
```

Use your own branch: team/willy-map, team/emma-layers, team/gaddielle-planner, team/enzo-science, team/longla-notebook or team/you-integration. If it already exists, switch to it rather than recreating it.

Open http://localhost:4200. Preserve uncommitted work; never reset or overwrite it to follow this example.

Review feature changes against feat/angular-migration. YOU combines reviewed work into that integration branch. Recheck the agreed base if the Angular migration has since been merged into main. Do not merge the top-level Angular migration PR just to start a personal exercise.

## Coaching agreement

The learner explicitly requests these educational checkpoints:

1. Inspect before proposing changes. Identify what already works.
2. Explain at most three unfamiliar concepts in plain language.
3. Describe one small goal, the files it touches and the expected visible result.
4. Ask one prediction question and wait for the learner's answer before the first substantive feature edit.
5. Make one coherent change. Explain the meaningful changed lines and run proportionate checks.
6. Ask for a teach-back and a small variation the learner can perform.
7. If understanding is incomplete, give a hint or simpler example and revisit the same step.

These are learning questions, not repeated permission requests for routine commands. Read-only inspection may continue while a learning question is pending; do not implement future feature stages in the background.

Never invent a learner's answer or record mastery on their behalf. The learner may use hints and notes. Observable understanding means they can explain the data flow, predict a changed case, make a small variation, and demonstrate the result.

Keep the existing working app. Do not replace it with a newly generated project or complete all future stages in one response.

## Frozen shared contracts

- Angular standalone components + TypeScript + CSS + Leaflet. No new backend or state/UI framework.
- Region: Gale Crater / Mount Sharp boxwork. Exact Curiosity AOI remains unverified.
- Map: Leaflet CRS.Simple, prepared image pixels. Origin **bottom-left**; x grows right; y grows **up**. Leaflet receives **[y, x]**.
- Image dimensions come from the actual loaded image and must match metadata.
- Current image reference: PIA26306-prepared-1600x815-v1. The supplied prepared image is 1600 × 815 pixels.
- Route shape: {start: Point|null, destination: Point|null, waypoints: Point[]}. Order is start → waypoints → destination.
- Mode values: inspect, start, destination, waypoint. Layer names: imagery, markers, grid, coverage.
- Keep one root-provided MissionService. Do not add separate component providers.
- Preserve imageReference, coordinate conventions, source metadata and the existing storage/export schema.
- Angular templates display UI and notes. Leaflet DOM work stays in MapComponent.
- Production caching runs after npm run build; npm start deliberately avoids caching.
- Asset replacement, coordinate/schema changes and calibration need documented evidence and coordinated integration with YOU.

## Scientific rules

The supplied NASA image is genuine regional context. Demo target identities and positions, and user-drawn routes, are illustrative. A real image does not validate a marker.

Do not fabricate NASA values, coordinates, hazards or sources. Keep unknown values null/unavailable. Metric distance needs verified calibration for the exact prepared raster. Elevation and slope need an aligned verified DEM. A complete point list does not establish terrain safety.

Keep historical acquisition dates distinct from publication dates and device note timestamps. Preserve credits and uncertainty labels. Do not assume a dataset covering Gale covers the exact selected boxwork AOI.

## Verification and handoff

Use manual browser checks for small template/style changes. Run npm test for relevant route/storage behavior changes, npm run build for Angular/build changes, and the existing production browser checks when integration or offline behavior changes. Add focused tests only for meaningful new behavior or a real gap; do not duplicate implementation details.

Each handoff records:

- Goal and files changed.
- Actual behavior and checks run, including failures.
- Learner's explanation in their own words, supplied by the learner.
- One small independent variation and its result.
- Remaining scientific uncertainties and requested shared changes.

Personal notes may go in docs/team/notes/NAME.md. Do not mark a learning checkpoint complete until the learner has answered.
