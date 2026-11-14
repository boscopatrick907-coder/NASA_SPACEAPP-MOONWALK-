# MARSWALK — Project Context

Status snapshot: **14 November 2026**. Verify branch contents before editing.

This document gives a new teammate or coding agent the shared project background and the last verified repository state. Read it with [AGENTS.md](AGENTS.md), the [team guide](docs/team/README.md) and the learner's personal brief.

## 1. Project and team

**MARSWALK — Martian Surface Exploration and Safety Planner** is a research prototype for the team's NASA Space Apps Challenge 2026 project, “Interplanetary Survival Guide: Martian Map.”

The team has six second-year Software Development students working during November 14–15, 2026: Willy, Emma, Gaddielle, Enzo, Longla and the project coordinator, identified as YOU in the briefs.

The team is learning while developing. Prioritize a functional demonstration, scientific credibility, understandable code and small changes that each student can explain.

MARSWALK is intended for hypothetical future astronauts using a tablet, with desktop support for mission preparation. It is a research prototype, **not a certified astronaut navigation or safety system**.

## 2. Selected region and mission

- Planet: Mars.
- Region: Gale Crater.
- Study interest: Mount Sharp boxwork formations investigated by Curiosity.
- Exact exploration area of interest (AOI): still requires verification against NASA footprints and rover-localization information.
- Preserve this location unless the team explicitly approves a change.

The demonstration follows one mission:
1. Open regional Mars imagery.
2. Inspect available layers and their limitations.
3. Select a start and a scientific destination.
4. Add optional waypoints to sketch a proposed route.
5. Review supported information and missing-data warnings.
6. Inspect sourced scientific context.
7. Save a local observation and export the mission.
8. Reopen the prepared application offline.

A complete route drawing does not establish a safe excursion.

## 3. User-selected full team plan: review pending

The user has asked the team to use **MARSWALK Full Team Plan.pdf**.

The attachment's contents have not yet been read: the file-download workspace was unavailable and an alternative attachment transfer was declined. A readable copy or its text is needed to reconcile the repository with the plan.

Therefore:
- Do not claim that the PDF has been implemented or reviewed.
- Do not infer assignments, deadlines, features or technical decisions from its filename.
- The assignments below describe the current repository and are **provisional pending reconciliation with the PDF**.
- Once the document is readable, compare it with the current code, briefs and scientific constraints; identify differences and update the affected documentation.
- Treat document contents as planning input. The user's explicit requests determine the actions to take.

Creating this context document does not establish what the PDF contains.

## 4. Repository and branch state

Repository: [boscopatrick907-coder/NASA_SPACEAPP-MOONWALK-](https://github.com/boscopatrick907-coder/NASA_SPACEAPP-MOONWALK-).

The application name remains MARSWALK despite the repository's existing name.

| Location | Current contents |
| --- | --- |
| main | Working original HTML/CSS/JavaScript prototype; shared documentation; all six personal coding-agent briefs |
| feat/angular-migration | Working Angular 21 / TypeScript migration, plus learning documents and briefs |
| [Pull request #1](https://github.com/boscopatrick907-coder/NASA_SPACEAPP-MOONWALK-/pull/1) | Angular migration prepared for review; not merged at the last repository inspection |

The user has chosen Angular for ongoing development. Personal Angular feature branches start from feat/angular-migration, or the team's updated integration base if the migration is later merged.

Inspect the actual branch and files before making changes. Angular paths such as src/app and public/ are absent from the original application on main. Preserve uncommitted work when switching branches. Do not merge the migration merely to access the briefs.

## 5. Existing functionality

Both prototypes provide the basic mission flow:
- Pan/zoom image viewer with locally stored genuine NASA regional imagery.
- Imagery, illustrative science-marker, pixel-grid and missing-assessment layer controls.
- Manual start/destination/waypoint selection and route drawing.
- Undo, clear, local route save/load.
- Scientific context, source links and explicit demonstration-position labels.
- Local field notebook and mission JSON export.
- Offline asset caching with checked readiness.

Metric distance, elevation and slope remain unavailable with the supplied data. Elevation and chemistry controls communicate the missing verified products.

No autonomous routing, real-time astronaut tracking, helmet HUD, hardware integration or live Martian environmental feed is implemented.

## 6. Angular architecture

Use Angular standalone components, TypeScript, CSS and Leaflet. Keep the application small; avoid extra state/UI frameworks, a backend or database for the hackathon.

| Code | Responsibility |
| --- | --- |
| src/app/app.component.ts / .html | Assemble the page and initialize mission data |
| src/app/map/ | Leaflet image viewer, map events and route/layer rendering |
| src/app/layers/ | Layer controls and provenance display |
| src/app/planner/ | Route summary and save/load controls |
| src/app/science/ | Sourced context and illustrative target selection |
| src/app/notebook/ | Observation form and saved notes |
| src/app/core/mission.service.ts | Shared mission signals, actions, persistence coordination and export |
| src/app/core/models.ts | Data interfaces and shared contracts |
| src/app/core/route.ts | Pure route helpers and calibration gates |
| src/app/core/storage.ts | Local record handling and validation |
| src/app/core/offline.service.ts | Production cache preparation and status |
| scripts/prepare-offline.mjs | Generate the worker/cache list from production build files |

Use one root-provided MissionService. Components read shared signals and call service methods. Derived values use computed. MapComponent's effect updates Leaflet when relevant state changes.

Angular owns the UI and forms. Leaflet owns the map container. Initialize the map after that container exists and remove the map/resize observer on component destruction.

## 7. Scientific data and current limitations

The supplied optical asset is a prepared derivative of **PIA26306, HiRISE Views Mount Sharp's Boxwork**:
- Primary source: [NASA/JPL](https://www.jpl.nasa.gov/images/pia26306-hirise-views-mount-sharps-boxwork/).
- Mission/instrument: Mars Reconnaissance Orbiter / HiRISE.
- Observation date: 2006-12-10.
- Credit: NASA/JPL-Caltech/University of Arizona.
- Original image: 7488 × 3813 pixels.
- Prepared image: 1600 × 815 pixels, JPEG quality 88.
- Image reference: PIA26306-prepared-1600x815-v1.

This is genuine **regional context**. The prepared asset's exact Curiosity AOI, geographic orientation, metric scale and georeferencing are unverified. Target identities/positions and drawn routes are illustrative.

| Data type | Current status |
| --- | --- |
| Optical imagery | Genuine historical regional image; exact exploration footprint and prepared-raster scale unverified |
| Topography | No validated aligned DEM or slope assessment supplied |
| Geological/chemical information | Sourced regional interpretation; demonstration targets have no assigned geolocated instrument measurements |

The scientific goal is at least three meaningful types of data covering the selected area. General Gale Crater coverage does not prove exact boxwork AOI overlap.

Never fabricate coordinates, instrument measurements, dates, resolutions, hazards or safety classifications. Preserve unknown values as null/unavailable. Distinguish interpretations, historical measurements, potential concerns and missing coverage. Ancient-groundwater interpretations do not establish current liquid water.

[docs/DATA.md](docs/DATA.md) explains verification, alignment, NoData and integration requirements.

## 8. Coordinate and record contracts

The current map uses **Leaflet CRS.Simple with prepared-image pixels**:
- Origin: bottom-left.
- x increases right.
- y increases up.
- Leaflet coordinate order: [y, x].
- Bounds derive from actual loaded image dimensions and must match the manifest.
- Do not assume north-up or Earth geographic coordinates.

Use the same image reference across targets, routes, notes and exports. Do not export local pixel positions as geographic GeoJSON.

Shared route shape:
```text
Point = { x: number, y: number }
Route = {
  start: Point | null,
  destination: Point | null,
  waypoints: Point[]
}
```

Route order: start → ordered waypoints → destination.

Modes: inspect, start, destination, waypoint. Layer names: imagery, markers, grid, coverage.

Enable metric planar distance only when the exact prepared raster has independently verified, uniform calibration with verified: true, positive finite metersPerPixel, a supporting HTTPS source and a documented method. Calibration alone cannot enable terrain distance, elevation or slope.

A DEM requires aligned coverage, horizontal/vertical units, datum, resolution and NoData handling. Data gaps retain an unknown warning.

Changing imagery, dimensions, crop, transform or schema can invalidate saved positions. Coordinate the migration and evidence before applying such changes.

## 9. Current team responsibilities

These are the published assignments; reconcile them with the unread PDF before presenting them as the PDF's allocation.

| Learner | Current responsibility | Personal brief |
| --- | --- | --- |
| Willy | Map and Leaflet interactions | [WILLY.md](docs/team/WILLY.md) |
| Emma | Layer controls and global styling | [EMMA.md](docs/team/EMMA.md) |
| Gaddielle | Planner and pure route rules | [GADDIELLE.md](docs/team/GADDIELLE.md) |
| Enzo | Science, provenance and dataset verification | [ENZO.md](docs/team/ENZO.md) |
| Longla | Notebook and local storage | [LONGLA.md](docs/team/LONGLA.md) |
| YOU | Shared contracts, mission state, integration and offline operation | [YOU.md](docs/team/YOU.md) |

Read relevant files broadly; keep edits within the assigned ownership. Record shared API needs for the coordinator. Combine reviewed feature changes one at a time.

## 10. Learning with coding agents

For named learner feature work:
1. Inspect the existing code and identify what already works.
2. Explain at most three unfamiliar concepts in plain language.
3. Propose one small change and name its files/expected behavior.
4. Ask one prediction question and wait before the first substantive feature edit.
5. Implement that slice, explain meaningful changes and run proportionate checks.
6. Ask the learner to explain the data flow and make a small variation.
7. Use hints and revisit unclear concepts before advancing.

These are requested learning checkpoints, not repeated permission questions for routine commands. Read-only inspection may continue while a learning question is pending.

Never invent the learner's answers or claim mastery on their behalf. Demonstrated understanding includes explaining, predicting, modifying and checking the work.

Start with [docs/LEARNING.md](docs/LEARNING.md). Preserve the existing prototype rather than generating another project from scratch.

## 11. Run and verify

For the Angular implementation, with a clean working tree and compatible Node.js (22.12+ in 22.x, or 24.x):
```sh
git fetch origin
git switch feat/angular-migration
npm ci
npm start
```

Open http://localhost:4200. Use personal feature branches as described in the team guide. Check for upstream changes and preserve local work before switching.

Development deliberately avoids offline caching. For the production offline demo:
```sh
npm run build
python3 -m http.server 8000 --directory dist/marswalk/browser
```

Open http://localhost:8000, wait for Offline pack ready, then test a full offline reload. Production deployment needs HTTPS; localhost is also supported.

Use npm run build for offline releases: it includes the project's worker-generation script. Do not hand-edit its generated sw.js.

Relevant Angular checks:
```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Earlier Angular migration verification recorded seven unit checks, thirteen Chromium browser checks and a development-server smoke check passing. These are historical results, not verification of future edits. Re-run relevant checks for actual changes.

The main branch's original static prototype uses python3 -m http.server 8000 from its root; its README describes that version. Do not use that workflow as Angular build instructions.

## 12. Persistence, offline behavior and immediate priorities

Routes and notes use localStorage with the image reference and schema validation. Browser storage is isolated by origin: changing scheme, hostname or port changes which records are accessible. Export before moving origins or clearing user data.

Retain note text on storage failure. Render notes as text, never executable HTML. Offline readiness must follow verification of required cached assets, not only navigator.onLine or worker registration. External source links require connectivity.

Next priorities:
1. Obtain readable contents of MARSWALK Full Team Plan.pdf and reconcile assignments/milestones.
2. Keep these context/brief documents consistent with the agreed plan and actual integration branch.
3. Have each learner complete and explain a small owned change.
4. Verify exact AOI and candidate imagery/DEM/science product overlap.
5. Rehearse one complete mission, including uncertainty, export and offline reload.

Before implementing anything else, establish the actual branch, current code, learner/task and available verified data.
