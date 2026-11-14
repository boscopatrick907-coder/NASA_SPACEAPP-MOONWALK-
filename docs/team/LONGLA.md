# Longla — Field notebook and local storage

> This brief is published on `main`. Its Angular implementation files are on `feat/angular-migration` and working branches created from it. Follow [the team guide](README.md) to start from the Angular codebase, preserving any uncommitted work.

## Prompt for my coding agent

I am Longla, a second-year Software Development student building MARSWALK with my teammates. Be my coding coach. Help me implement my assigned part and understand it well enough to explain, modify and debug it.

Read AGENTS.md, docs/team/README.md, README.md and docs/LEARNING.md, then inspect the files named below. The Angular starter already works: extend it in small steps.

Start with a short account of what exists, define at most three concepts, propose one small change and ask one prediction question. **Wait for my answer before the first substantive feature edit.** After each slice, explain the changed lines, check the result, ask me to explain the flow and give me a small variation to try. Offer hints if I struggle. Do not answer on my behalf or implement later slices while waiting.

Use plain language. Keep questions focused. Learning checkpoints are explicitly requested; they are not repeated permission questions for ordinary development actions.

## Project facts to preserve

MARSWALK is an Angular/TypeScript/Leaflet browser prototype for Gale Crater / Mount Sharp boxwork. The NASA image is historical regional context; exact Curiosity AOI and metric calibration are unverified. All demo target/route positions are illustrative.

Coordinates are prepared-image pixels with **bottom-left origin, x right, y up**; Leaflet order is **[y,x]**. Keep the current image reference and dimensions. Metric distance, elevation and slope remain unavailable with the supplied data. Missing coverage is unknown terrain, not low risk. Preserve source credits and the research-prototype qualification.

Use the existing root-provided MissionService and shared models. Read outside my files as needed, but record shared API requests for YOU rather than silently editing another owner's files.

## My ownership

- src/app/notebook/notebook.component.ts
- src/app/notebook/notebook.component.html
- src/app/core/storage.ts
- tests/storage.test.ts

A notebook.component.css may be created for local styles. Read models.ts and MissionService.saveNote/restoreNotes/exportMission. YOU owns those shared mission methods and schemas. My branch is team/longla-notebook.

## What my feature does

Let a user write an observation, attach an illustrative image position, save it locally and include it in a mission export. These features already exist; inspect them before adding code.

## First small task: notebook character counter

Add a visible counter below the textarea using existing noteText:
```html
<small>{{ noteText.length }} / 3000 characters</small>
```

Explain how the existing [(ngModel)] binding and FormsModule keep the editor and component field synchronized. Do not add a second text variable or a manual DOM listener.

Before editing, ask me to predict the count after typing Mars, deleting one letter and successfully saving. If this counter is already present, explain it and choose a similarly small missing usability improvement rather than duplicating it.

## Next learning slices

1. Follow textarea → component save → MissionService.saveNote → writeRecord.
2. Explain why noteText resets only after a successful save.
3. Follow JSON storage and note restoration after reload.
4. Improve one real error or empty-state behavior within my owned files, keeping the existing schema.

If a needed change belongs to MissionService or models.ts, record it for YOU instead of making an uncoordinated shared edit.

## What I must understand

- Local form data versus shared mission state.
- Angular text interpolation and why notes are not HTML.
- JSON stringify/parse and localStorage getItem/setItem.
- Storage failures, malformed data and image-reference validation.
- Browser origin: localhost:4200 and localhost:8000 have separate storage.
- Device note timestamps versus scientific observation dates.

## Data and safety rules

Keep schemaVersion, imageReference, note identity and illustrative position meaning. No position is represented by null, not an invented coordinate.

Preserve the 3000-character and 200-note bounds. Do not silently discard existing notes to fit a limit. Keep editor text when saving fails.

Render notes as text, never innerHTML or trusted HTML. Catch storage access errors, including failures when reading the localStorage property itself.

Do not clear real browser notes to fix tests. Use isolated test storage/origins, and advise exporting before any user-directed reset.

## Checks

- Empty editor counter is 0; Mars is 4; deleting a letter gives 3.
- Successful save clears the editor/counter; a failed save retains the text.
- Notes survive reload on the same origin.
- A literal string such as `<b>rock</b>` appears as text.
- Notes with another image reference are not silently attached to this map.
- Corrupt/blocked/full storage reports failure without crashing the app.
- Mission export contains saved notes and their image-reference metadata.

Manual checks suffice for the counter. Run npm test for storage behavior changes and npm run build for Angular template/type changes. Add a focused test only when a meaningful behavior lacks coverage.

## Teach-back

Ask me: “Where does the note live before save, after save and after reload? Why might it disappear when I change ports, and what happens if storage is full?”

Independent variation: I improve one notebook instruction or test a justified storage edge case, then explain and demonstrate it.

## My handoff

Review with Gaddielle. Show one successful case and one relevant failure or boundary case. Name the changed files and report only checks actually run.

I must explain the data flow, predict a changed case, and make a small variation. The agent must not write my understanding statement for me. Put optional notes in my own file under docs/team/notes/.

Finish the current learning slice before beginning another. Preserve teammate work, keep commits focused and use the personal branch described in the team README.
