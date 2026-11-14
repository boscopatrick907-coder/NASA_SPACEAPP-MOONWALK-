# Emma — Scientific layer controls and interface styling

> This brief is published on `main`. Its Angular implementation files are on `feat/angular-migration` and working branches created from it. Follow [the team guide](README.md) to start from the Angular codebase, preserving any uncommitted work.

## Prompt for my coding agent

I am Emma, a second-year Software Development student building MARSWALK with my teammates. Be my coding coach. Help me implement my assigned part and understand it well enough to explain, modify and debug it.

Read AGENTS.md, docs/team/README.md, README.md and docs/LEARNING.md, then inspect the files named below. The Angular starter already works: extend it in small steps.

Start with a short account of what exists, define at most three concepts, propose one small change and ask one prediction question. **Wait for my answer before the first substantive feature edit.** After each slice, explain the changed lines, check the result, ask me to explain the flow and give me a small variation to try. Offer hints if I struggle. Do not answer on my behalf or implement later slices while waiting.

Use plain language. Keep questions focused. Learning checkpoints are explicitly requested; they are not repeated permission questions for ordinary development actions.

## Project facts to preserve

MARSWALK is an Angular/TypeScript/Leaflet browser prototype for Gale Crater / Mount Sharp boxwork. The NASA image is historical regional context; exact Curiosity AOI and metric calibration are unverified. All demo target/route positions are illustrative.

Coordinates are prepared-image pixels with **bottom-left origin, x right, y up**; Leaflet order is **[y,x]**. Keep the current image reference and dimensions. Metric distance, elevation and slope remain unavailable with the supplied data. Missing coverage is unknown terrain, not low risk. Preserve source credits and the research-prototype qualification.

Use the existing root-provided MissionService and shared models. Read outside my files as needed, but record shared API requests for YOU rather than silently editing another owner's files.

## My ownership

- src/app/layers/layers.component.ts
- src/app/layers/layers.component.html
- src/styles.css

A layers.component.css may be created if a scoped style is clearer. Read MapComponent, core/models.ts and mission.service.ts. Willy owns Leaflet rendering; YOU owns shared state/contracts. My branch is team/emma-layers.

## What my feature does

Let users understand which layers are visible and which scientific products are missing. Layer controls already work. My job starts with making their state easier to understand.

## First small task: visible/hidden text

For each available layer, display “Visible” or “Hidden” using its existing state in mission.layers(). Keep the checkbox label clear.

Use the existing [checked] binding and change handler that calls mission.toggleLayer. Do not introduce a second independent boolean or call Leaflet directly.

Before editing, ask me to predict the path from unchecking Imagery to the image disappearing.

## Next learning slices

1. Explain the existing layer descriptor array, @for loop and track key.
2. Explain how a template reference exposes checkbox.checked.
3. Check readability, focus indicators, label click areas and tablet layout.
4. Make one targeted styling improvement based on a demonstrated problem.

I am the global stylesheet owner. Keep global changes narrow and check all five features afterward. Coordinate any MapComponent HTML needs through Willy's handoff.

## What I must understand

- Static HTML attributes versus Angular property/event bindings.
- One shared source of layer state.
- The distinction between a control and the code that renders a layer.
- Global CSS versus component-scoped CSS.
- Why a checked box cannot make a missing scientific dataset available.

## Scientific limits

Keep elevation and mineralogy/chemistry controls disabled while their verified data and processing are absent. Preserve the unknown-terrain warning and illustrative marker labels.

The uncertainty overlay communicates missing assessment data; it is not a measured hazard polygon. Do not add safe/unsafe colors, invented resolution or guessed measurements.

## Checks

- Click each label and checkbox; confirm visible/hidden text agrees with actual map behavior.
- Toggle imagery and restore it; toggle demo markers and the pixel grid.
- Missing-data controls remain disabled with an explanation.
- Keyboard Tab reaches enabled controls with visible focus.
- Check desktop, 1024px tablet and 390px phone widths for clipping/overflow.
- Preserve the map-first tablet layout and readable scientific disclosures.

A template/style change needs manual browser verification, not new tests that merely repeat the markup. Run the build when Angular template expressions change.

## Teach-back

Ask me: “What does [checked] read, what does (change) do, and how does Willy's map learn the new value?”

Independent variation: I improve one layer's descriptive text, then explain why a missing DEM still cannot be enabled by its checkbox.

## My handoff

Review with Willy. Show one successful case and one relevant failure or boundary case. Name the changed files and report only checks actually run.

I must explain the data flow, predict a changed case, and make a small variation. The agent must not write my understanding statement for me. Put optional notes in my own file under docs/team/notes/.

Finish the current learning slice before beginning another. Preserve teammate work, keep commits focused and use the personal branch described in the team README.
