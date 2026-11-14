# Learning MARSWALK
You are learning Angular while building a real prototype. Follow one interaction before reading every file.

## Start here
Run npm ci, then npm start. Open localhost:4200 and keep the app beside your editor.

Angular is the interface framework. TypeScript is JavaScript with type checking. Leaflet draws the map. NASA data remains separate from all three.

A component combines a TypeScript class with an HTML template. A service holds behavior or state shared by several components. An interface describes the shape of data.

## Read these files in order
1. src/app/app.component.html: see how five components assemble the page.
2. src/app/map/map.component.html: inspect one button binding.
3. src/app/core/mission.service.ts: follow setMode and selectPoint.
4. src/app/planner/planner.component.html: find the displayed route count.
5. src/app/core/models.ts: see what Point and Route contain.

## Follow Set start
The toolbar is in MapComponent.

1. Clicking Set start runs `(click)="mission.setMode(item.mode)"`.
2. setMode changes the mode signal to start.
3. Clicking the Leaflet image triggers the map's click callback.
4. The callback converts Leaflet's internal [y,x] order to our {x,y} image point and calls MissionService.selectPoint.
5. selectPoint validates the image bounds, remembers the previous route and updates the route signal.
6. A map effect redraws Leaflet's route/markers.
7. The planner template reads the same route and computed assessment, so its text updates automatically.

You do not query a planner DOM element or manually change its text.

## Four template patterns
```html
<strong>{{ mission.distanceLabel() }}</strong>
<button (click)="mission.saveRoute()">Save</button>
<button [disabled]="!mission.assessment().complete">Save</button>
<textarea [(ngModel)]="noteText" name="observation"></textarea>
```

- {{ ... }} displays a value as text.
- (click) handles an event.
- [disabled] binds an element property to a value.
- [(ngModel)] keeps an input and component field in sync. The notebook imports FormsModule for it.

@if conditionally displays content; @for repeats it. Angular escapes interpolated note text, so a typed HTML tag remains text.

## Signals
A signal holds a changing value. Read it by calling it, such as route(). The service changes signals with set or update.

A computed signal derives a value from others. assessment() depends on route() and calibration; templates read it without recalculating or synchronizing DOM manually.

An effect is appropriate where state must update an external library. MapComponent's effect draws Leaflet geometry. Keep normal derived values in computed, not extra effects.

The root-provided MissionService is shared. Do not add it to a component's providers array: that can create a second independent mission.

## Three kinds of import
- package.json declares packages npm installs.
- A TypeScript import makes a symbol available in that file.
- A standalone component's imports array enables another component, directive or pipe in its template.

Importing FormsModule in TypeScript alone does not enable ngModel. It must also appear in the notebook component's imports array.

## Ownership and cleanup
Angular owns the page and form. Leaflet owns the map container. MapComponent creates it after the view exists and removes it, along with its resize observer, when the component is destroyed.

Keep Leaflet objects out of saved JSON. Save plain points, routes and metadata.

## Three small exercises
1. Change the route-planner introductory sentence in planner.component.html and see the update.
2. Add a notebook character count, such as `{{noteText.length}} / 3000`, below the textarea.
3. Add a planner message based on mission.assessment().complete using @if. Test it with an incomplete and complete route.

Run npm test after changing route/storage rules. Run npm run build before preparing an offline demo.

## Development versus offline
npm start runs the development server and deliberately avoids offline caching. npm run build produces static files and generates sw.js with the actual hashed bundle names.

Serve dist/marswalk/browser over localhost or HTTPS, wait for Offline pack ready, then try an offline reload. An online flag alone does not prove anything is cached.

## Scientific limits
Coordinates are local image pixels with origin bottom-left, not Earth or Mars latitude/longitude. The image is uncalibrated regional context; every route/target position is illustrative.

Distance, elevation and slope need verified scale and terrain data. Do not fill missing measurements with invented values to make the UI look complete. Read DATA.md before changing calibration or adding a dataset.

Official reference: https://angular.dev/guide/components
