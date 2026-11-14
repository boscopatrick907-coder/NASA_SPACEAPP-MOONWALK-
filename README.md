# MARSWALK
**Martian Surface Exploration and Safety Planner**

A tablet-friendly research prototype for the team's NASA Space Apps Challenge 2026 project, “Interplanetary Survival Guide: Martian Map.” It combines Martian imagery, scientific context, manual route planning and a local field notebook. The selected region is Mount Sharp's boxwork in Gale Crater. Final AOI boundaries still require verification.

**Research prototype — not a certified astronaut navigation or safety system.**


## Team coding-agent briefs

The personal learning briefs are now on **main**: [Willy, Emma, Gaddielle, Enzo, Longla and YOU](docs/team/README.md). Give each teammate their file and repository access.

The briefs guide Angular development on **feat/angular-migration** and personal branches derived from it. The application described in this README is the original plain JavaScript prototype on main. Follow the team guide for Angular setup and the learner/agent checkpoints.

## What works
- Leaflet pan/zoom viewer with genuine NASA HiRISE regional-context imagery.
- Imagery, illustrative target, pixel-grid and missing-coverage controls.
- Start, destination and ordered waypoints; route drawing, undo/clear and local save/load.
- Sourced geological context with explicitly illustrative marker positions.
- Local field notes and mission JSON export, including provenance and uncertainty.
- Service Worker caching of the application, local dependencies, imagery and reference data.

Distance, elevation and slope remain unavailable with the supplied uncalibrated image. DEM and chemistry controls indicate missing verified data. Unknown terrain is never described as safe. No autonomous routing, live astronaut tracking or hardware integration is included.

The minimum components are an application shell, image-map adapter, dataset registry, manual route model, provenance display and local storage. These remain separate so verified products can replace context/demo data without rebuilding the interface.

## Run
Python 3 and a current browser are sufficient. From the folder containing index.html:

```sh
python3 -m http.server 8000
```

On Windows, try `py -m http.server 8000`. Open [http://localhost:8000](http://localhost:8000).

Do not open index.html through file://: modules, fetch and Service Workers need an HTTP origin. Localhost supports Service Workers; deployment elsewhere requires HTTPS for offline support. Plain HTTP over a LAN may show the interface on a tablet but does not provide the secure context for caching.

No NASA account, API key, npm install or runtime backend is required to run the supplied app. Essential assets are local. External source links require internet.

## Five-minute demonstration
1. Pan/zoom and read the regional-context/AOI disclosure.
2. Toggle imagery, demo targets, grid and missing coverage. Elevation/chemistry remain unavailable.
3. Select start and destination inside the image; add waypoints in walking order. Keyboard users can focus the map, pan with arrows and press Enter in a selection mode.
4. Inspect the route summary: metric distance, elevation and slope must remain unavailable.
5. Inspect a demo science target, review NASA context and optionally use it as destination.
6. Save the route and a field note. Reload, load the saved route and export mission JSON.
7. After **Offline pack ready**, set browser Network to Offline and reload. Check image, science, controls and local notes.

## Structure
```text
index.html                 application shell
css/styles.css             responsive mission interface
js/app.js                  UI and mission export
js/map.js                  Leaflet image-plane adapter
js/route.js                manual route model and calibration gates
js/storage.js              local record handling and validation
js/offline.js              cache preparation and status
data/manifest.json         provenance, image reference and calibration
data/demo-targets.json     illustrative image-plane targets
assets/                    prepared NASA image and app icon
vendor/leaflet/            local Leaflet 1.9.4 and BSD license
sw.js                      required runtime cache and offline responses
manifest.webmanifest       standalone web-app metadata
docs/DATA.md               dataset integration contract
tests/                     Node and browser checks
AGENTS.md                  shared development/scientific rules
```

## Scientific data
The image is a resized derivative of **PIA26306, “HiRISE Views Mount Sharp's Boxwork”**, observed **2006-12-10** by **HiRISE / Mars Reconnaissance Orbiter**. Credit: **NASA/JPL-Caltech/University of Arizona**. [NASA/JPL source and download](https://www.jpl.nasa.gov/images/pia26306-hirise-views-mount-sharps-boxwork/).

The original 7488 × 3813 image was resized to 1600 × 815 pixels (JPEG quality 88). This is genuine **regional context**, with no established exact Curiosity AOI, geographic orientation, metric scale or georeferencing. Image positions are pixels, with origin bottom-left, x right and y up. All target/route positions are illustrative.

Remaining verified data requirements:
1. Exact boxwork AOI established against NASA footprints and rover-localization records.
2. Optical coverage with documented planetary coordinates, projection and prepared-raster scale.
3. Overlapping aligned DEM, with resolution, vertical datum, units, NoData and uncertainty.
4. Overlapping spectral/chemical products or sourced, localized geological observations.

Keep missing values null. Adding a filename or metadata alone does not enable measurements. Follow [docs/DATA.md](docs/DATA.md).

## Tests
Node.js is optional for development:

```sh
npm test
npm install
npx playwright install chromium
npm run test:browser
```

Browser checks start their own temporary server. Screenshots go to test-results/. These dependencies are not required to run the app.

Manual checks: tablet touch targets, route bounds/order/undo, save/load, notebook persistence, JSON export, unavailable measurements and offline reload after successful caching. Test blocked storage and missing local assets before presenting.

## Troubleshooting
- **Directory listing/404:** start the server in the folder containing index.html and check the port.
- **Blank map:** check the visible load error and browser console; confirm local image, JSON and Leaflet files exist.
- **Old code after edits:** bump the version in sw.js, or unregister the worker and clear Cache Storage, then reload online. Export notes before clearing all site data.
- **Offline unavailable:** use localhost/HTTPS, retry while online and verify all runtime assets cached. Browser online status does not establish cache readiness.
- **Storage failure:** keep your note text, export accessible records and inspect storage settings/quota. Private browsing, clearing site data or changing origin may remove or isolate records.

## Six-person work split
Assign map/route interactions; tablet UI/accessibility; optical/AOI verification and QGIS; DEM preparation/coverage; science provenance/localization; and offline/notebook/demo rehearsal. Agree on the manifest first and keep advanced comparisons/profiles behind a working basic mission flow.
