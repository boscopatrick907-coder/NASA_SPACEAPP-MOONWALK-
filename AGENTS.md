# MARSWALK development rules

## Project context
MARSWALK — Martian Surface Exploration and Safety Planner — is the team's research prototype for NASA Space Apps Challenge 2026, “Interplanetary Survival Guide: Martian Map.” Six second-year Software Development students have November 14–15, 2026 to produce a functional, scientifically credible demonstration.

The selected region is **Gale Crater, Mount Sharp boxwork formations investigated by Curiosity**. Do not change the location without team approval. Establish final geographic boundaries from verified NASA data; coverage of Gale Crater does not establish coverage of the exact AOI.

## Implementation
- Prioritize interactive imagery, scientific layer controls, geological context, manual start/destination/waypoint selection and supported route assessment.
- Use Angular standalone components, TypeScript, CSS, Leaflet, JSON and prepared local assets. Keep map, route, storage and offline responsibilities separate. Angular is the team's requested stack.
- Avoid extra UI/state frameworks, backends, databases and large browser-side scientific processing. Prepare scientific rasters with QGIS/GDAL.
- Do not implement autonomous routing, real-time astronaut tracking, hardware integration or a helmet HUD.
- Store essential runtime assets locally. Preserve licenses and image credits.
- Inspect existing work and preserve teammates' changes. Do not commit credentials, node_modules or large raw products.

## Scientific integrity
- Never fabricate NASA measurements, coordinates, footprints, observation dates, resolution, distances, slopes, elevations, hazards or current conditions.
- Verify primary sources. Record product ID, source URL, instrument/mission, observation date, resolution, processing history and credit where available.
- Keep unknown measurements null or visibly unavailable; never substitute zero.
- Label demonstration positions and data in the interface, saved records and exports. Genuine imagery does not make illustrative markers geolocated observations.
- Distinguish known hazards, potential concerns and missing coverage. Unknown terrain does not mean safe or low risk.
- Historical measurements are not current conditions. Geological interpretations are not instrument measurements; ancient groundwater interpretations do not establish current liquid water.
- Keep visible that MARSWALK is a research prototype, not a certified astronaut navigation or safety system.

## Coordinates
The starter uses Leaflet CRS.Simple with local prepared-image pixels: origin bottom-left, x right, y up, Leaflet order [y,x]. Read bounds from the actual image dimensions. Do not assume north-up, Earth latitude/longitude, an Earth EPSG code, browser geolocation or Earth-based Leaflet distance functions.

Use custom local-coordinate JSON, not geographic GeoJSON for pixel positions. Records must identify their image reference and coordinate meaning.

Enable metric route distance only after independently validating a uniformly scaled local planar raster and documenting a positive finite metersPerPixel, verified flag, source URL and method. Resizing changes prepared-image scale; native instrument resolution is not automatically output resolution. Planar distance does not describe walking effort or terrain distance.

Elevation and slope require an aligned verified DEM with units, datum, resolution, NoData and coverage handling. Calibration alone cannot enable terrain measurements. See docs/DATA.md. Runtime scientific files live in public/data and public/assets.

## Reliability
- Use safe text DOM APIs for notes and dataset content.
- Show missing-asset, invalid-data and blocked/full-storage errors.
- Announce offline readiness only after verifying every required asset in cache; registration or navigator.onLine is insufficient.
- Reject stored routes and notes belonging to another image reference.
- Browser storage can be cleared or restricted. Support JSON export for backups.
- Run relevant checks after meaningful changes. Do not claim tests passed unless executed. Keep testing proportionate to the hackathon.

## Learning while developing
- Explain each component/service responsibility and keep the learning walkthrough current in docs/LEARNING.md.
- Prefer template bindings, signals and named service methods over global DOM queries.
- Keep Leaflet DOM operations inside MapComponent. Initialize after the container exists; remove the map and resize observer on destroy.
- Keep one root-provided MissionService. Avoid component providers that accidentally split shared state.
- Offline caching runs in the production build; use npm start for development and npm run build for the offline demo.
- Use npm ci, npm test, npm run build and npm run test:browser for relevant verification. Do not force dependency upgrades/downgrades without reviewing compatibility.

- For named teammate assignments, read docs/team/README.md and that learner's brief. Respect the explicit educational checkpoints and file ownership. These do not require permission for routine read-only inspection or ordinary development commands.
