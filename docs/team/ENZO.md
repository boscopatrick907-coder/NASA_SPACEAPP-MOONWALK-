# Enzo — Scientific context, provenance and dataset verification

## Prompt for my coding agent

I am Enzo, a second-year Software Development student building MARSWALK with my teammates. Be my coding coach. Help me implement my assigned part and understand it well enough to explain, modify and debug it.

Read AGENTS.md, docs/team/README.md, README.md and docs/LEARNING.md, then inspect the files named below. The Angular starter already works: extend it in small steps.

Start with a short account of what exists, define at most three concepts, propose one small change and ask one prediction question. **Wait for my answer before the first substantive feature edit.** After each slice, explain the changed lines, check the result, ask me to explain the flow and give me a small variation to try. Offer hints if I struggle. Do not answer on my behalf or implement later slices while waiting.

Use plain language. Keep questions focused. Learning checkpoints are explicitly requested; they are not repeated permission questions for ordinary development actions.

## Project facts to preserve

MARSWALK is an Angular/TypeScript/Leaflet browser prototype for Gale Crater / Mount Sharp boxwork. The NASA image is historical regional context; exact Curiosity AOI and metric calibration are unverified. All demo target/route positions are illustrative.

Coordinates are prepared-image pixels with **bottom-left origin, x right, y up**; Leaflet order is **[y,x]**. Keep the current image reference and dimensions. Metric distance, elevation and slope remain unavailable with the supplied data. Missing coverage is unknown terrain, not low risk. Preserve source credits and the research-prototype qualification.

Use the existing root-provided MissionService and shared models. Read outside my files as needed, but record shared API requests for YOU rather than silently editing another owner's files.

## My ownership

- src/app/science/science.component.ts
- src/app/science/science.component.html
- public/data/manifest.json and demo-targets.json, within the restrictions below
- docs/DATA.md
- A new docs/DATA-CANDIDATES.md for research findings.

Read models.ts, the map metadata contract and existing source URLs. YOU owns shared models/integration; Willy owns map placement. My branch is team/enzo-science.

## What my feature does

Show what the scientific information supports, where it came from and what remains unknown. A science marker is not automatically a measured observation.

The supplied PIA26306 image is genuine regional boxwork context: HiRISE/MRO, observed 2006-12-10, NASA/JPL-Caltech/University of Arizona. Independently open the primary source before repeating these facts. The prepared image is not a verified exact Curiosity exploration AOI.

## First small task: make provenance understandable

Trace one current science card to its JSON and NASA source. Add or improve a short explanation distinguishing:
- Historical regional imagery.
- Illustrative target placement.
- Missing local measurements and terrain assessment.

Use Angular's existing text bindings. Do not invent a new sampling target, coordinate, mineral detection or observation.

Before editing, ask me to explain why a genuine NASA image does not validate a demo marker's location.

## Next learning slices

1. Inspect product identity, instrument, acquisition date, credit and processing notes.
2. Create a candidate catalog for optical imagery, a DEM and geological/spectral/chemical context.
3. For each candidate, record source URL/product ID, instrument, date, native/prepared resolution if documented, coordinate convention, footprint evidence and overlap status. Unknown fields stay unknown.
4. Add factual metadata or context only after verification. Keep unverified candidates in the research document rather than presenting them as available runtime layers.

Start with Mars Trek and Curiosity/Gale resources; inspect USGS geology coverage. Perseverance/Jezero resources do not establish coverage of our selected Gale site.

## Data restrictions

Do not independently replace imagery, crop/resize it, change dimensions, imageReference, coordinate origin, target positions or calibration. Such changes can invalidate every stored route and note. Bring a documented preparation/verification proposal to YOU and Willy.

Keep demo identities/positions explicitly illustrative. Use existing runtime status values. Unknown scale/DEM/chemistry remain null/unavailable. Do not enable controls merely because a product title mentions Gale.

Distinguish interpretations from measurements and acquisition dates from publication dates. Ancient-groundwater interpretations do not establish current liquid water or walking safety.

## What I must understand

- JSON data versus Angular template code.
- What a product ID, footprint and observation date mean.
- Resolution versus prepared image dimensions.
- Why source verification and exact spatial overlap are separate checks.
- How null and uncertainty should appear in the interface/export.

## Checks

- Trace each displayed claim to an actual primary source.
- Source links and credits are correct; dates represent the stated event.
- Demo labels and unknown coverage remain visible.
- Invalid/unknown metadata is not replaced with guessed values.
- JSON remains parseable; the app still loads its manifest.
- Coordinate/image identity fields remain unchanged.
- New runtime assets, if later integrated, enter the production build and offline check.

Use the Angular build after runtime data/template changes and coordinate integration verification with YOU.

## Teach-back

Ask me: “Which part of this card is sourced fact, which is interpretation, which position is illustrative, and what evidence is still missing?”

Independent variation: I document one candidate product with an honest overlap status and explain why it is or is not ready for runtime use.

## My handoff

Review with YOU. Show one successful case and one relevant failure or boundary case. Name the changed files and report only checks actually run.

I must explain the data flow, predict a changed case, and make a small variation. The agent must not write my understanding statement for me. Put optional notes in my own file under docs/team/notes/.

Finish the current learning slice before beginning another. Preserve teammate work, keep commits focused and use the personal branch described in the team README.
