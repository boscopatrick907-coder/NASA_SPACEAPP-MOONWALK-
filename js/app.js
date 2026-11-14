import { createMap } from './map.js';
import { createRoute, orderedPoints, setRoutePoint, undoRoute, routeAssessment, validPoint } from './route.js';
import { readRecord, writeRecord, validateSavedRoute } from './storage.js';
import { prepareOffline } from './offline.js';

const $ = id => document.getElementById(id);
const ROUTE_KEY = 'marswalk.route.v1';
const NOTES_KEY = 'marswalk.notes.v1';
let route = createRoute(), mode = 'inspect', selectedTarget = null, lastPoint = null;
let mapView, manifest, targets, notes = [], history = [];

function announce(message) { $('notice').textContent = message; }
function coordinate(point) {
  return point ? 'x ' + point.x.toFixed(1) + ' · y ' + point.y.toFixed(1) + ' px' : 'Not selected';
}
function safeSource(element, url) {
  element.removeAttribute('href');
  if (!url) return;
  try {
    if (new URL(url).protocol === 'https:') {
      element.href = url; element.target = '_blank'; element.rel = 'noopener noreferrer';
    }
  } catch { /* Missing or malformed sources stay unavailable. */ }
}
function setMode(next) {
  if (next === 'waypoint' && !route.start) { announce('Select a starting point before adding waypoints.'); return; }
  mode = next;
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  const help = {
    inspect: 'Inspect mode · pan the image or select a demo target.',
    start: 'Select a start · tap the image, or press Enter at the map center.',
    destination: 'Select a destination · tap the image or choose a demo target.',
    waypoint: 'Add waypoints · tap in walking order. Select Inspect when finished.'
  };
  $('mode-status').textContent = help[mode];
}
function remember() { history.push(structuredClone(route)); if (history.length > 100) history.shift(); }
function selectPoint(point) {
  if (!validPoint(point, mapView.bounds)) { announce('Choose a point inside the context image.'); return; }
  lastPoint = point;
  $('note-location').value = coordinate(point) + ' · illustrative image position';
  if (mode === 'inspect') { announce('Image position selected for your next field note: ' + coordinate(point)); return; }
  if (mode === 'waypoint' && route.waypoints.length >= 500) { announce('Waypoint limit reached. Remove a waypoint before adding another.'); return; }
  remember();
  route = setRoutePoint(route, mode, point);
  const wasMode = mode;
  if (mode !== 'waypoint') setMode('inspect');
  renderRoute();
  announce(wasMode === 'waypoint' ? 'Waypoint added in route order.' : 'Illustrative ' + wasMode + ' selected.');
}
function renderRoute() {
  const assessment = routeAssessment(route, manifest.map.calibration);
  const points = orderedPoints(route);
  mapView.renderRoute(route);
  $('route-start').textContent = coordinate(route.start);
  $('route-end').textContent = coordinate(route.destination);
  $('route-count').textContent = String(points.length);
  $('route-distance').textContent = assessment.distanceMeters === null ? 'Unavailable' : assessment.distanceMeters.toFixed(1) + ' m';
  $('route-elevation').textContent = 'Unavailable · DEM needed';
  $('route-slope').textContent = 'Unavailable · DEM needed';
  $('route-warning').textContent = 'Terrain safety unknown. Exact AOI, scale, DEM and geolocated observations are unverified. Optical appearance alone cannot establish safe walking conditions.';
  const labels = [];
  if (route.start) labels.push('Start · ' + coordinate(route.start));
  route.waypoints.forEach((point, i) => labels.push('Waypoint ' + (i + 1) + ' · ' + coordinate(point)));
  if (route.destination) labels.push('Destination · ' + coordinate(route.destination));
  $('route-points').replaceChildren(...labels.map(label => {const li = document.createElement('li'); li.textContent = label; return li;}));
  $('undo-route').disabled = !points.length && !history.length;
  $('clear-route').disabled = points.length === 0;
  $('save-route').disabled = !assessment.complete;
}
function inspectTarget(target) {
  selectedTarget = target;
  lastPoint = target.point;
  $('science-title').textContent = target.title + ' · DEMO';
  $('science-body').textContent = target.summary + ' ' + target.context;
  $('science-metadata').textContent = 'Illustrative position: ' + coordinate(target.point) + '. No instrument measurement is assigned to this marker.';
  $('science-source').textContent = 'NASA/JPL regional context source';
  safeSource($('science-source'), target.sourceUrl);
  $('use-target').disabled = false;
  $('note-location').value = coordinate(target.point) + ' · illustrative target';
  if (mode === 'destination') selectPoint(target.point);
}
function renderSources() {
  const cards = manifest.datasets.map(dataset => {
    const article = document.createElement('article'); article.className = 'source-card';
    const title = document.createElement('h4'); title.textContent = dataset.title;
    const status = document.createElement('p'); status.textContent = dataset.status === 'verified-context' ? 'Verified imagery · regional context only' : 'Unavailable · verified data required';
    const detail = document.createElement('p');
    detail.textContent = [
      dataset.instrument || 'Instrument unknown',
      dataset.observationDate ? 'Observed ' + dataset.observationDate : 'Observation date unavailable',
      dataset.resolutionMetersPerPixel === null ? 'Metric resolution unverified' : dataset.resolutionMetersPerPixel + ' m/px'
    ].join(' · ');
    article.append(title, status, detail);
    if (dataset.credit) {const credit = document.createElement('p'); credit.textContent = dataset.credit; article.append(credit);}
    const limitation = document.createElement('p'); limitation.textContent = dataset.limitations.join(' '); article.append(limitation);
    if (dataset.sourceUrl) {
      const link = document.createElement('a'); link.textContent = dataset.productId + ' · source and provenance'; safeSource(link, dataset.sourceUrl); article.append(link);
    }
    return article;
  });
  $('source-table').replaceChildren(...cards);
}
function renderNotes() {
  if (!notes.length) { const p = document.createElement('p'); p.textContent = 'No local field notes yet.'; $('notes-list').replaceChildren(p); return; }
  $('notes-list').replaceChildren(...notes.slice().reverse().map(note => {
    const article = document.createElement('article'); article.className = 'note-card';
    const time = document.createElement('time'); time.dateTime = note.createdAt;
    time.textContent = 'Device time · ' + new Date(note.createdAt).toLocaleString();
    const location = document.createElement('p'); location.textContent = note.point ? coordinate(note.point) + ' · illustrative image position' : 'No image position attached';
    const body = document.createElement('p'); body.textContent = note.text; body.className = 'note-body';
    article.append(time, location, body); return article;
  }));
}
function initNotebook() {
  const saved = readRecord(NOTES_KEY, []);
  if (!saved.ok) announce(saved.error + ' Export notes to retain a copy.');
  notes = Array.isArray(saved.value) ? saved.value.filter(note =>
    note && typeof note.text === 'string' && note.text.length <= 3000 &&
    typeof note.createdAt === 'string' && Number.isFinite(Date.parse(note.createdAt)) &&
    note.imageReference === manifest.imageReference &&
    (note.point === null || validPoint(note.point, mapView.bounds))
  ).slice(-200) : [];
  renderNotes();
  $('notebook-form').addEventListener('submit', event => {
    event.preventDefault();
    const text = $('note-text').value.trim();
    if (!text) { announce('Enter an observation before saving.'); $('note-text').focus(); return; }
    if (notes.length >= 200) { announce('This device has reached 200 notes. Export your mission before starting a new notebook.'); return; }
    const note = {id: crypto.randomUUID(), text, createdAt: new Date().toISOString(), point: lastPoint ? {...lastPoint} : null, imageReference: manifest.imageReference, positionStatus: 'illustrative'};
    const next = [...notes, note];
    const saved = writeRecord(NOTES_KEY, next);
    if (!saved.ok) { announce(saved.error + ' Your text is still in the editor.'); return; }
    notes = next; $('note-text').value = ''; renderNotes();
    announce('Field note saved locally on this device. Export your mission for a backup.');
  });
}
function exportMission() {
  const payload = {
    schemaVersion: 1, project: 'MARSWALK', exportedAt: new Date().toISOString(),
    disclaimer: 'Research prototype. All route and marker positions are illustrative local image coordinates; exact Curiosity AOI and terrain safety unverified.',
    coordinateSystem: manifest.map.coordinateSystem, imageReference: manifest.imageReference,
    coordinateFrame: {origin: manifest.map.origin, xAxis: manifest.map.xAxis, yAxis: manifest.map.yAxis},
    imageDimensions: mapView.bounds, calibration: manifest.map.calibration,
    route, assessment: routeAssessment(route, manifest.map.calibration),
    terrain: {elevation: null, slope: null, safety: 'unknown'}, notes,
    datasets: manifest.datasets
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'}));
  const a = document.createElement('a'); a.href = url; a.download = 'marswalk-mission-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Mission JSON exported with source metadata and uncertainty labels.');
}
let preparing = false;
async function cacheOffline() {
  if (preparing) return;
  preparing = true;
  $('cache-button').disabled = true;
  $('offline-status').textContent = 'Preparing offline pack';
  await prepareOffline({onStatus: status => {
    $('offline-status').textContent = status.ready ? 'Offline pack ready' : 'Offline pack not ready';
    $('cache-status').textContent = status.message;
  }});
  preparing = false; $('cache-button').disabled = false;
}
async function main() {
  const responses = await Promise.all(['data/manifest.json','data/demo-targets.json'].map(async path => {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Missing local data: ' + path);
    return response.json();
  }));
  manifest = responses[0];
  const demoData = responses[1];
  if (demoData.imageReference !== manifest.imageReference || manifest.map.coordinateSystem !== 'local-image-pixels') throw new Error('Dataset image reference or coordinate system mismatch.');
  targets = demoData.targets;
  if (!targets.every(target => validPoint(target.point, manifest.map))) throw new Error('Demo target outside image bounds.');
  mapView = await createMap({element: $('map'), manifest, targets, onPoint: selectPoint, onTarget: inspectTarget});
  $('map-loading').hidden = true;
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  document.querySelectorAll('[data-target]').forEach(button => button.addEventListener('click', () => {
    const target = targets.find(item => item.id === button.dataset.target);
    if (target) inspectTarget(target);
  }));
  for (const name of ['imagery','markers','grid','coverage']) {
    $('layer-' + name).addEventListener('change', event => mapView.setLayer(name, event.target.checked));
  }
  $('map').addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target === $('map') && mode !== 'inspect') {event.preventDefault(); selectPoint(mapView.center());}
    if (event.key === 'Escape') setMode('inspect');
  });
  $('use-target').addEventListener('click', () => {if (selectedTarget) {setMode('destination'); selectPoint(selectedTarget.point);}});
  $('fit-map').addEventListener('click', () => mapView.fit());
  $('undo-route').addEventListener('click', () => {route = history.length ? history.pop() : undoRoute(route); renderRoute(); announce('Previous route state restored.');});
  $('clear-route').addEventListener('click', () => {remember(); route = createRoute(); setMode('inspect'); renderRoute(); announce('Current route cleared. Saved route remains available.');});
  $('save-route').addEventListener('click', () => {
    const result = writeRecord(ROUTE_KEY, {schemaVersion: 1, imageReference: manifest.imageReference, route});
    announce(result.ok ? 'Route saved locally on this device.' : result.error);
  });
  $('load-route').addEventListener('click', () => {
    const result = readRecord(ROUTE_KEY, null);
    if (!result.ok) {announce(result.error); return;}
    if (!result.value) {announce('No saved route on this device.'); return;}
    if (!validateSavedRoute(result.value, manifest.imageReference, mapView.bounds)) {announce('Saved route does not match this image or contains invalid points.'); return;}
    remember(); route = structuredClone(result.value.route); setMode('inspect'); renderRoute(); announce('Saved illustrative route loaded.');
  });
  $('export-mission').addEventListener('click', exportMission);
  $('cache-button').addEventListener('click', cacheOffline);
  renderSources(); initNotebook(); renderRoute(); setMode('inspect');
  $('science-title').textContent = 'Mount Sharp’s boxwork';
  $('science-body').textContent = 'NASA links these ridge networks to ancient groundwater moving through fractured rock. Select a demo target to practice the science workflow. The target positions are illustrative.';
  $('science-metadata').textContent = 'HiRISE / MRO · observed 2006-12-10 · metric resolution unverified · exact exploration AOI pending.';
  $('science-source').textContent = 'NASA/JPL · PIA26306';
  safeSource($('science-source'), manifest.datasets[0].sourceUrl);
  await cacheOffline();
}
main().catch(error => {
  $('map-loading').hidden = false;
  $('map-loading').textContent = 'Unable to open the map. ' + error.message + ' Serve the project over localhost or HTTPS and confirm all local files are present.';
  announce(error.message);
  $('cache-status').textContent = 'Offline preparation did not complete.';
});
