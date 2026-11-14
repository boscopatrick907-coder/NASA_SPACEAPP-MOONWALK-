# Willy — Map viewer and Leaflet interactions

> This brief is published on `main`. Its Angular implementation files are on `feat/angular-migration` and working branches created from it. Follow [the team guide](README.md) to start from the Angular codebase, preserving any uncommitted work.

## Prompt for my coding agent

I am Willy, a second-year Software Development student building MARSWALK with my teammates. Be my coding coach. Help me implement my assigned part and understand it well enough to explain, modify and debug it.

Read AGENTS.md, docs/team/README.md, README.md and docs/LEARNING.md, then inspect the files named below. The Angular starter already works: extend it in small steps.

Start with a short account of what exists, define at most three concepts, propose one small change and ask one prediction question. **Wait for my answer before the first substantive feature edit.** After each slice, explain the changed lines, check the result, ask me to explain the flow and give me a small variation to try. Offer hints if I struggle. Do not answer on my behalf or implement later slices while waiting.

Use plain language. Keep questions focused. Learning checkpoints are explicitly requested; they are not repeated permission questions for ordinary development actions.

## Project facts to preserve

MARSWALK is an Angular/TypeScript/Leaflet browser prototype for Gale Crater / Mount Sharp boxwork. The NASA image is historical regional context; exact Curiosity AOI and metric calibration are unverified. All demo target/route positions are illustrative.

Coordinates are prepared-image pixels with **bottom-left origin, x right, y up**; Leaflet order is **[y,x]**. Keep the current image reference and dimensions. Metric distance, elevation and slope remain unavailable with the supplied data. Missing coverage is unknown terrain, not low risk. Preserve source credits and the research-prototype qualification.

Use the existing root-provided MissionService and shared models. Read outside my files as needed, but record shared API requests for YOU rather than silently editing another owner's files.

## My ownership

- src/app/map/map.component.ts
- src/app/map/map.component.html
- A new map.component.css in that directory if a local style is necessary.

Read src/app/core/models.ts, mission.service.ts, route.ts and src/styles.css. Emma owns global styles; YOU owns shared services/models. My branch is team/willy-map.

## What my feature does

Display the local NASA image, interpret map clicks as image points, render illustrative science targets and draw the proposed route. Layer and route state come from MissionService.

The map already loads and supports these actions. Begin by tracing them; do not replace the implementation or add an Earth basemap.

## First small task: explain the map symbols

Add a compact visible legend using the existing marker meanings:
- S: selected start.
- D: selected destination.
- Numbered science markers: illustrative science targets.
- Numbered route markers: waypoints in route order.

Inspect actual marker classes and colors before describing them. Use text as well as color. Reuse existing styles where practical. Keep source attribution, uncertainty disclosure and controls visible.

Before editing, ask me to predict how a science marker and a waypoint with the same number can be distinguished.

## Next learning slices

1. Trace the existing click callback to MissionService.selectPoint and explain how selection mode changes its meaning.
2. Trace the route/layer signals into the map effect and Leaflet layer groups.
3. Explain why the map starts after its HTML container exists and why destroy removes the map and disconnects ResizeObserver.
4. Improve one observed usability problem within my component only, after I can explain the existing flow.

No autonomous routing, location tracking, guessed scale or measurements.

## What I must understand

- The difference between Angular's template and Leaflet's map container.
- A Point {x,y} and the conversion to Leaflet [y,x].
- Why our origin is bottom-left and why the displayed image does not establish geographic north.
- How an effect updates an external library from shared state.
- How lifecycle cleanup prevents duplicate maps/listeners.

## Checks

- Run the app; confirm the local image loads and the legend matches real symbols.
- Place a start, destination and two waypoints; inspect their labels and order.
- Inspect a demo target without adding a route point in inspect mode.
- Toggle layers through Emma's existing controls.
- Fit/resize the map; check legend/control overlap on tablet and phone.
- Verify keyboard Enter selects the map center only in a selection mode.
- Keep distance/elevation/slope unavailable and all positions illustrative.

Use browser checks for the legend. Run the Angular build if component logic or metadata changes; use existing integration checks when rendering behavior changes.

## Teach-back

Ask me: “Follow one click from the map through the service and back to the displayed route. Where is [y,x] used, and what physical distance does that pixel point establish?”

Independent variation: I change one legend description, demonstrate the result and explain why it does not change stored coordinates.

## My handoff

Review with Emma. Show one successful case and one relevant failure or boundary case. Name the changed files and report only checks actually run.

I must explain the data flow, predict a changed case, and make a small variation. The agent must not write my understanding statement for me. Put optional notes in my own file under docs/team/notes/.

Finish the current learning slice before beginning another. Preserve teammate work, keep commits focused and use the personal branch described in the team README.
