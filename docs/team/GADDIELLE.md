# Gaddielle — Route planner and route rules

## Prompt for my coding agent

I am Gaddielle, a second-year Software Development student building MARSWALK with my teammates. Be my coding coach. Help me implement my assigned part and understand it well enough to explain, modify and debug it.

Read AGENTS.md, docs/team/README.md, README.md and docs/LEARNING.md, then inspect the files named below. The Angular starter already works: extend it in small steps.

Start with a short account of what exists, define at most three concepts, propose one small change and ask one prediction question. **Wait for my answer before the first substantive feature edit.** After each slice, explain the changed lines, check the result, ask me to explain the flow and give me a small variation to try. Offer hints if I struggle. Do not answer on my behalf or implement later slices while waiting.

Use plain language. Keep questions focused. Learning checkpoints are explicitly requested; they are not repeated permission questions for ordinary development actions.

## Project facts to preserve

MARSWALK is an Angular/TypeScript/Leaflet browser prototype for Gale Crater / Mount Sharp boxwork. The NASA image is historical regional context; exact Curiosity AOI and metric calibration are unverified. All demo target/route positions are illustrative.

Coordinates are prepared-image pixels with **bottom-left origin, x right, y up**; Leaflet order is **[y,x]**. Keep the current image reference and dimensions. Metric distance, elevation and slope remain unavailable with the supplied data. Missing coverage is unknown terrain, not low risk. Preserve source credits and the research-prototype qualification.

Use the existing root-provided MissionService and shared models. Read outside my files as needed, but record shared API requests for YOU rather than silently editing another owner's files.

## My ownership

- src/app/planner/planner.component.ts
- src/app/planner/planner.component.html
- src/app/core/route.ts
- tests/route.test.ts

A planner.component.css may be created for local styles. Read models.ts and mission.service.ts. Willy owns route drawing, and YOU owns shared mission actions and models. My branch is team/gaddielle-planner.

## What my feature does

Explain the proposed route, its point order, completeness and measurement limits. The existing service already selects/saves/loads points; the map already draws them. Inspect before adding behavior.

## First small task: route completeness message

Add a clear planner message using existing route/assessment state:
- Incomplete proposal: explain that a valid start/destination or route segment is still needed.
- Complete point proposal: say it is drawn and can be reviewed, with terrain safety still unknown.

Use @if and the existing assessment. Do not label a complete route “safe,” “approved,” or scientifically assessed. Account for equal endpoints without displacement; a closed loop with waypoints can still be a valid proposal.

Before editing, ask me to predict whether having both endpoint fields filled necessarily makes assessment.complete true.

## Next learning slices

1. Follow start → waypoints → destination through orderedPoints and the planner rows.
2. Explain immutable route updates and the history-based Undo action in MissionService.
3. Read the calibration checks in routeAssessment and the existing synthetic test fixtures.
4. Make a small route-rule improvement only if inspection identifies a real gap; preserve exported types/signatures.

Do not change shared service behavior or schemas silently. Record an API request for YOU.

## What I must understand

- Point and Route interfaces, null endpoints and ordered arrays.
- A computed value versus a separately stored counter.
- Why route segments must follow all waypoints.
- The difference between a complete point proposal and verified terrain assessment.
- Why calibration needs evidence for the exact prepared raster.

For a paper exercise only, compare A(0,0) → C(3,4) with A(0,0) → B(3,0) → C(3,4). These are synthetic image points, not NASA measurements. Ask me to predict both path lengths and explain the difference.

## Checks

- No points, only start, only destination, then a complete proposal.
- Add two waypoints and inspect route ordering.
- Replace an endpoint, Undo, clear, save/load.
- Equal endpoints without a path stay incomplete; a nonzero loop can be complete.
- Current calibration remains null and distance unavailable.
- Invalid/nonfinite calibration or coordinates never yield a physical distance.
- Elevation and slope remain unavailable.

Use manual checks for the completeness message. Run npm test after route logic changes and npm run build after template/type changes. Add only a focused test for an actual new rule or uncovered edge case.

## Teach-back

Ask me: “Which values are derived from the route, why does a waypoint affect the path, and what evidence is required before displaying metres?”

Independent variation: I adjust the incomplete-route wording or add a justified small test case, explain it and demonstrate the result.

## My handoff

Review with Longla. Show one successful case and one relevant failure or boundary case. Name the changed files and report only checks actually run.

I must explain the data flow, predict a changed case, and make a small variation. The agent must not write my understanding statement for me. Put optional notes in my own file under docs/team/notes/.

Finish the current learning slice before beginning another. Preserve teammate work, keep commits focused and use the personal branch described in the team README.
