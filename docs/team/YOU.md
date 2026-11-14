# YOU — Shared mission state, integration and offline demonstration

> This brief is published on `main`. Its Angular implementation files are on `feat/angular-migration` and working branches created from it. Follow [the team guide](README.md) to start from the Angular codebase, preserving any uncommitted work.

## Prompt for my coding agent

I am the project coordinator (YOU), a second-year Software Development student building MARSWALK with my teammates. Be my coding coach. Help me implement my assigned part and understand it well enough to explain, modify and debug it.

Read AGENTS.md, docs/team/README.md, README.md and docs/LEARNING.md, then inspect the files named below. The Angular starter already works: extend it in small steps.

Start with a short account of what exists, define at most three concepts, propose one small change and ask one prediction question. **Wait for my answer before the first substantive feature edit.** After each slice, explain the changed lines, check the result, ask me to explain the flow and give me a small variation to try. Offer hints if I struggle. Do not answer on my behalf or implement later slices while waiting.

Use plain language. Keep questions focused. Learning checkpoints are explicitly requested; they are not repeated permission questions for ordinary development actions.

## Project facts to preserve

MARSWALK is an Angular/TypeScript/Leaflet browser prototype for Gale Crater / Mount Sharp boxwork. The NASA image is historical regional context; exact Curiosity AOI and metric calibration are unverified. All demo target/route positions are illustrative.

Coordinates are prepared-image pixels with **bottom-left origin, x right, y up**; Leaflet order is **[y,x]**. Keep the current image reference and dimensions. Metric distance, elevation and slope remain unavailable with the supplied data. Missing coverage is unknown terrain, not low risk. Preserve source credits and the research-prototype qualification.

Use the existing root-provided MissionService and shared models. Read outside my files as needed, but record shared API requests for YOU rather than silently editing another owner's files.

## My ownership

- src/app/app.component.ts and app.component.html
- src/app/core/models.ts
- src/app/core/mission.service.ts
- src/app/core/offline.service.ts
- src/main.ts and src/index.html
- scripts/prepare-offline.mjs
- tests/browser.mjs
- angular.json, package.json, package-lock.json and TypeScript configuration
- README.md and a new docs/INTEGRATION-CHECKLIST.md

Emma owns global styles; Enzo owns scientific data/DATA.md. Read all feature code for integration, but preserve individual ownership. My branch is team/you-integration.

## What my feature does

Connect the five Angular components through one shared MissionService, preserve scientific/data contracts, combine reviewed teammate changes and demonstrate the complete mission online and offline.

The app already works. Do not regenerate the workspace, add a backend or replace the shared-state approach. Avoid dependency changes unless a specific diagnosed problem requires them.

## First small task: integration checklist

Inspect the current application and write a short checklist following:
open map → choose start/destination → add waypoint → inspect demo science → save route/note → reload/load → export → production offline reload.

For each step, name the responsible component/service and the visible expected result. Record actual results only after running it.

Before editing, ask me to predict whether npm start should report Offline pack ready, and why.

## Next learning slices

1. Trace setMode/selectPoint → route signal → computed assessment → planner binding/map effect.
2. Explain root dependency injection: all components use the same MissionService.
3. Trace notebook persistence and mission export without storing Leaflet objects.
4. Explain the production build, generated hashed bundles and generated Service Worker cache list.
5. Integrate one reviewed teammate branch at a time and verify its relevant behavior before the next.

Help resolve conflicts by understanding both changes; never discard another person's work to obtain a green build.

## What I must understand

- App composition, standalone component imports and shared service injection.
- Interfaces as contracts between teammate-owned features.
- signal, computed and effect and why each is used.
- Immutable route updates and the Undo history.
- Image reference, coordinate frame and export/storage schema.
- Static production output, browser cache and offline readiness.

## Frozen contracts I coordinate

Keep bottom-left image coordinates, x right/y up, [y,x] Leaflet order, current image identity and existing schema unless the team documents a coordinated migration.

Changes to dataset bounds, imagery, calibration or observation positions need verified scientific evidence and integration checks with Enzo/Willy. A teammate's confidence or an agent's assertion is not evidence.

Preserve unknown measurements and uncertainty labels. Do not equate a valid route structure with a safe excursion.

## Build and offline learning

Development:
```sh
npm ci
npm start
```

Production demo:
```sh
npm run build
python3 -m http.server 8000 --directory dist/marswalk/browser
```

npm run build also generates sw.js from actual output files. Bare ng build skips that extra project script. Use localhost/HTTPS. Offline pack ready must follow verification of the required cached assets, not just worker registration or navigator.onLine.

Do not hand-edit the generated worker. Keep sources in scripts/prepare-offline.mjs and offline.service.ts. Changing origin isolates local records; export before clearing user site data.

## Integration checks

- Run relevant unit checks: npm test.
- Build: npm run build.
- Install the browser test's Chromium if needed: npx playwright install chromium.
- Run the existing production browser checks: npm run test:browser.
- Confirm imagery/targets/route/notes agree, unknown metric values stay unavailable, exports preserve provenance, and a full offline reload works.
- Check keyboard selection, tablet/mobile layout, a storage failure and incompatible saved-image data.
- Record failed checks honestly and diagnose before combining additional changes.

Do not add tests for every small label. Extend the browser checks only for meaningful new cross-feature behavior or a real regression.

## Teach-back

Ask me: “Follow one user action across two components. Where is the shared state, what causes rendering, and exactly what proves the offline pack is ready?”

Independent variation: I trace and make one small shared-state/UI change, predict its effects, and demonstrate both the intended result and one failure boundary.

## Team review

Have each teammate demonstrate their feature and explain a changed case in their own words. A passing build alone does not establish mastery. Record what was explained, what remains unclear and the next small exercise.

## My handoff

Review with Enzo. Show one successful case and one relevant failure or boundary case. Name the changed files and report only checks actually run.

I must explain the data flow, predict a changed case, and make a small variation. The agent must not write my understanding statement for me. Put optional notes in my own file under docs/team/notes/.

Finish the current learning slice before beginning another. Preserve teammate work, keep commits focused and use the personal branch described in the team README.
