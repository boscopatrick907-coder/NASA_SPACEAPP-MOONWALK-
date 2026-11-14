# MARSWALK development rules

## Project context
MARSWALK — Martian Surface Exploration and Safety Planner — is the team's research prototype for NASA Space Apps Challenge 2026, “Interplanetary Survival Guide: Martian Map.” Six second-year Software Development students have November 14–15, 2026 to produce a functional, scientifically credible demonstration.

The selected region is **Gale Crater, Mount Sharp boxwork formations investigated by Curiosity**. Do not change the location without team approval. Establish final geographic boundaries from verified NASA data; coverage of Gale Crater does not establish coverage of the exact AOI.

## Implementation
- Prioritize interactive imagery, scientific layer controls, geological context, manual start/destination/waypoint selection and supported route assessment.
- The original application on main uses plain HTML, CSS, JavaScript modules, Leaflet, JSON and prepared local assets. Keep map, route, storage and offline responsibilities separate.
- For the original main application, avoid adding frameworks, backends, databases and large browser-side scientific processing. The team's approved Angular migration is described below. Prepare scientific rasters with QGIS/GDAL.
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

Elevation and slope require an aligned verified DEM with units, datum, resolution, NoData and coverage handling. Calibration alone cannot enable terrain measurements. See docs/DATA.md.

## Reliability
- Use safe text DOM APIs for notes and dataset content.
- Show missing-asset, invalid-data and blocked/full-storage errors.
- Announce offline readiness only after verifying every required asset in cache; registration or navigator.onLine is insufficient.
- Reject stored routes and notes belonging to another image reference.
- Browser storage can be cleared or restricted. Support JSON export for backups.
- Run relevant checks after meaningful changes. Do not claim tests passed unless executed. Keep testing proportionate to the hackathon.

## Angular team assignments and learning briefs

The team has approved Angular standalone components and TypeScript for ongoing development. That implementation is on feat/angular-migration; personal feature branches start from that Angular codebase and follow its Angular instructions. The plain JavaScript implementation notes above describe the original application on main.

The six personal briefs are published on main under docs/team/. Read docs/team/README.md and the named learner's brief for assignments, branch setup, file ownership and the explicit prediction/teach-back checkpoints. The copy of docs/LEARNING.md on main explains the Angular codebase; Angular source paths such as src/app and public/ are available after switching to the Angular codebase. Preserve uncommitted work when switching.

The scientific integrity, selected region and coordinate rules apply to both implementations. Documentation-only work on main does not require migrating the application. Do not merge the Angular migration merely to access the briefs.

## Shared context

Read [CONTEXT.md](CONTEXT.md) for the current project snapshot and pending review of MARSWALK Full Team Plan.pdf. The user has chosen that plan, but its contents have not been read; do not infer or claim PDF-derived assignments. Existing briefs describe the current allocation pending reconciliation with the actual plan.
