# MARSWALK — Angular edition
Martian Surface Exploration and Safety Planner. A learning-focused prototype for six second-year Software Development students at NASA Space Apps Challenge 2026.

The selected region remains Gale Crater / Mount Sharp boxwork. Exact AOI boundaries, calibration and terrain observations require verification. **Research prototype, not a certified astronaut navigation or safety system.**

## What changed
The first version used plain HTML/CSS/JavaScript. This edition moves the same working mission flow into Angular 21 standalone components and TypeScript. Leaflet remains the map engine. The vanilla prototype remains on main while this migration is reviewed.

| Previous implementation | Angular equivalent |
| --- | --- |
| One HTML page with panels | App shell plus map/layers/planner/science/notebook components |
| Manual DOM text updates/listeners | Template bindings and event handlers |
| Shared JavaScript variables | MissionService signals and computed values |
| Loose route objects | Interfaces in core/models.ts |
| Route/storage helpers | Typed pure functions in core/route.ts and storage.ts |
| Runtime JS library script | Leaflet installed by npm and bundled locally |
| Fixed Service Worker file list | Build script generates the cache list from actual Angular bundle names |

Start with [docs/LEARNING.md](docs/LEARNING.md) to follow one click through the code. Do not try to understand every file at once.

## Run for development
Use Node 22.12+ within the 22.x line, or Node 24.x. [Official Angular compatibility](https://angular.dev/reference/versions).

From this branch's project root:
```sh
npm ci
npm start
```

Open **http://localhost:4200**. npm installs dependencies; npm start runs Angular's development server. Changes appear as you save. No globally installed Angular CLI is required.

The development server deliberately reports **Development mode** for offline status. It does not prepare an offline pack, so old cached code does not conceal your edits.

## Build and test the offline demo
```sh
npm run build
python3 -m http.server 8000 --directory dist/marswalk/browser
```

On Windows, `py` may replace `python3`. Open **http://localhost:8000**, wait for **Offline pack ready**, then set the browser Network panel to Offline and reload.

The built output is static: no Node server, backend, API key or NASA account is required at runtime. Deploy the contents of dist/marswalk/browser over HTTPS. Localhost also supports Service Workers; ordinary HTTP on a tablet's LAN address does not.

Use `npm run build`, not bare `ng build`, for offline releases. The npm script also runs scripts/prepare-offline.mjs, which fingerprints output files and creates sw.js. It includes local JavaScript/CSS bundles, imagery, reference JSON and other assets. The UI verifies every required cache entry before claiming readiness.

## Try the mission flow
1. Pan/zoom the regional image. Read the exact-AOI and illustrative-position disclosure.
2. Toggle imagery, demo markers, pixel grid and missing coverage.
3. Set start and destination, then add waypoints in walking order. Undo or clear the route.
4. Inspect a demo science target and optionally use it as destination.
5. Save the route locally, record an observation, reload and load the route.
6. Export mission JSON with image reference, sources and unknown terrain fields.
7. After production caching succeeds, repeat offline.

Keyboard: focus the map, use arrows and +/−, press Enter in a selection mode, or Escape to inspect.

Distance, elevation and slope remain **unavailable** with the supplied data. No autonomous routing, astronaut tracking or hardware integration is provided.

## File structure
```text
src/
  main.ts                       starts Angular
  index.html                    hosts <app-root>
  styles.css                    shared mission interface and Leaflet styles
  app/
    app.component.ts/.html      page composition
    core/
      models.ts                 TypeScript data interfaces
      route.ts                  image-coordinate route rules
      storage.ts                local record validation and error handling
      mission.service.ts        shared signals, mission actions and export
      offline.service.ts        production cache preparation/status
    map/                        Leaflet adapter and interaction toolbar
    layers/                     layer toggles and provenance
    planner/                    route summary and save/load
    science/                    sourced context and illustrative targets
    notebook/                   note form and saved observations
public/
  assets/                       prepared NASA image and icon
  data/                         manifest.json and demo-targets.json
  manifest.webmanifest
  vendor/leaflet/LICENSE
scripts/prepare-offline.mjs      production cache generation
tests/                          pure TypeScript and browser checks
docs/DATA.md                     scientific integration requirements
docs/LEARNING.md                 guided explanation and exercises
angular.json                    CLI build/serve configuration
AGENTS.md                       shared development/scientific rules
```

Angular code uses src/; files in public/ are served from the site root. For example public/data/manifest.json is fetched as data/manifest.json.

## Scientific data
The supplied image is a resized derivative of **PIA26306, HiRISE Views Mount Sharp's Boxwork**, observed **2006-12-10** by **HiRISE / Mars Reconnaissance Orbiter**. Credit: **NASA/JPL-Caltech/University of Arizona**. [Primary NASA/JPL source](https://www.jpl.nasa.gov/images/pia26306-hirise-views-mount-sharps-boxwork/).

Original dimensions: 7488 × 3813; prepared asset: 1600 × 815, JPEG quality 88. This is uncalibrated regional context, with no established exact Curiosity AOI, geographic orientation or prepared-raster metric scale. Leaflet CRS.Simple uses image pixels: origin bottom-left, x right, y up. Demo targets and all selected route positions are illustrative.

Still needed: verified exact AOI/footprints, calibrated optical coverage, an aligned DEM with units/datum/NoData/uncertainty, and overlapping localized geological/spectral/chemical observations. Follow [docs/DATA.md](docs/DATA.md). Do not enable measurements by guessing scale or merely adding metadata.

## Storage and migration
Routes and notes use the original image reference and localStorage schema. Compatible records can be reused on the same browser origin. Changing hostname, scheme or port creates a different storage origin; existing records do not automatically follow. Export before moving or clearing site data. JSON import is not implemented.

A saved route is explicitly loaded using Load saved. Notes restore automatically. Blocked/full/corrupt storage is handled visibly; failed note saves keep the editor text. Browser storage is a convenience, not a backup.

## Checks
```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Unit checks cover calibration gates, image coordinates and invalid/blocked storage. Browser checks serve the production output on a temporary port, exercise the mission flow, verify offline reload, and save screenshots in test-results/.

For a preinstalled compatible Chromium executable, CHROMIUM_EXECUTABLE_PATH can point the browser test to it. Normal installations use Playwright's downloaded browser.

The installed runtime dependency audit reports no findings. The development CLI currently inherits moderate transitive advisories; npm's suggested forced downgrade would change Angular major versions and is not applied. Recheck with npm audit when updating dependencies.

## Troubleshooting
- **ng missing:** run npm ci, then npm start; the CLI is installed locally.
- **Blank map:** read the visible load error and verify public/assets, public/data and image dimensions.
- **Offline status says Development mode:** expected under npm start. Build and serve dist/marswalk/browser to test caching.
- **Old app/code appears:** export records, unregister the old Service Worker and clear this origin's Cache Storage, then reload. Clearing all site data also removes notes.
- **404 after deployment:** serve the contents of the browser output folder and include the generated sw.js.
- **Notes missing after changing ports:** localStorage is isolated by origin. Check the original address before clearing anything.

Use the named assignments and review partners in [docs/team/README.md](docs/team/README.md). Read core/models.ts before changing shared data.

## Personal coding-agent briefs

Willy, Emma, Gaddielle, Enzo, Longla and the coordinator each have a [personal Markdown brief](docs/team/README.md). Give your agent the appropriate brief and repository access. The briefs define file ownership, one first task, scientific limits and explicit prediction/teach-back checkpoints so each student can explain and modify their work.
