import { computed, Injectable, signal } from '@angular/core';
import type { FieldNote, LayerName, Manifest, Mode, Point, Route, ScienceTarget, TargetFile } from './models';
import { coordinate, createRoute, orderedPoints, routeAssessment, setRoutePoint, validPoint } from './route';
import { readRecord, validateSavedRoute, writeRecord } from './storage';

const ROUTE_KEY = 'marswalk.route.v1';
const NOTES_KEY = 'marswalk.notes.v1';

@Injectable({providedIn: 'root'})
export class MissionService {
  // A signal holds a value. Calling it reads the value; .set() changes it.
  readonly manifest = signal<Manifest | null>(null);
  readonly targets = signal<ScienceTarget[]>([]);
  readonly route = signal<Route>(createRoute());
  readonly mode = signal<Mode>('inspect');
  readonly layers = signal<Record<LayerName, boolean>>({imagery: true, markers: true, grid: false, coverage: true});
  readonly selectedTarget = signal<ScienceTarget | null>(null);
  readonly selectedPoint = signal<Point | null>(null);
  readonly notes = signal<FieldNote[]>([]);
  readonly notice = signal('Choose a start point and a destination to sketch your first route.');
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly mapReady = signal(false);
  readonly history = signal<Route[]>([]);

  // Computed signals are recalculated when their input signals change.
  readonly assessment = computed(() => routeAssessment(this.route(), this.manifest()?.map.calibration ?? null));
  readonly points = computed(() => orderedPoints(this.route()));
  readonly distanceLabel = computed(() => {
    const distance = this.assessment().distanceMeters;
    return distance === null ? 'Unavailable' : distance.toFixed(1) + ' m';
  });
  readonly noteLocation = computed(() => this.selectedPoint() ? coordinate(this.selectedPoint()) + ' · illustrative image position' : 'No position selected');
  readonly modeMessage = computed(() => ({
    inspect: 'Inspect mode · pan the image or select a demo target.',
    start: 'Select a start · tap the image, or press Enter at the map center.',
    destination: 'Select a destination · tap the image or choose a demo target.',
    waypoint: 'Add waypoints in walking order. Select Inspect when finished.'
  }[this.mode()]));
  readonly coordinate = coordinate;

  async load(): Promise<void> {
    try {
      const [manifest, demo] = await Promise.all([
        this.readJson<Manifest>('data/manifest.json'), this.readJson<TargetFile>('data/demo-targets.json')
      ]);
      if (manifest.schemaVersion !== 1 || !manifest.imageReference || manifest.map.coordinateSystem !== 'local-image-pixels' ||
          manifest.map.origin !== 'bottom-left' || !Number.isFinite(manifest.map.width) || manifest.map.width <= 0 ||
          !Number.isFinite(manifest.map.height) || manifest.map.height <= 0 || !Array.isArray(manifest.datasets) ||
          demo.coordinateSystem !== 'local-image-pixels' || demo.imageReference !== manifest.imageReference ||
          !Array.isArray(demo.targets) || !demo.targets.every(t => validPoint(t.point, manifest.map))) {
        throw new Error('Dataset image reference, dimensions or coordinate system mismatch.');
      }
      this.manifest.set(manifest); this.targets.set(demo.targets);
      this.restoreNotes(manifest);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown data loading error.';
      this.loadError.set(message); this.notice.set(message);
    } finally {this.loading.set(false);}
  }
  private async readJson<T>(path: string): Promise<T> {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Missing local data: ' + path);
    return response.json() as Promise<T>;
  }
  setMode(mode: Mode): void {
    if (mode === 'waypoint' && !this.route().start) {this.notice.set('Select a start before adding waypoints.'); return;}
    this.mode.set(mode);
  }
  toggleLayer(name: LayerName, checked: boolean): void {
    this.layers.update(current => ({...current, [name]: checked}));
  }
  selectPoint(point: Point): void {
    const manifest = this.manifest();
    if (!manifest || !validPoint(point, manifest.map)) {this.notice.set('Choose a point inside the image.'); return;}
    this.selectedPoint.set({...point});
    const mode = this.mode();
    if (mode === 'inspect') {this.notice.set('Image position attached to your next field note: ' + coordinate(point)); return;}
    if (mode === 'waypoint' && this.route().waypoints.length >= 500) {this.notice.set('Waypoint limit reached.'); return;}
    this.remember();
    this.route.update(route => setRoutePoint(route, mode, point));
    if (mode !== 'waypoint') this.mode.set('inspect');
    this.notice.set('Illustrative ' + mode + ' selected.');
  }
  inspectTarget(target: ScienceTarget): void {
    this.selectedTarget.set(target); this.selectedPoint.set({...target.point});
    if (this.mode() === 'destination') this.selectPoint(target.point);
  }
  useTarget(): void {
    const target = this.selectedTarget();
    if (target) {this.setMode('destination'); this.selectPoint(target.point);}
  }
  private remember(): void {
    this.history.update(history => [...history.slice(-99), structuredClone(this.route())]);
  }
  undo(): void {
    const history = this.history();
    if (!history.length) return;
    this.route.set(structuredClone(history[history.length - 1]));
    this.history.set(history.slice(0, -1));
    this.notice.set('Previous route state restored.');
  }
  clearRoute(): void {
    this.remember(); this.route.set(createRoute()); this.mode.set('inspect');
    this.notice.set('Current route cleared. Saved route remains available.');
  }
  saveRoute(): void {
    const manifest = this.manifest();
    if (!manifest || !this.assessment().complete) {this.notice.set('Select a complete route first.'); return;}
    const saved = writeRecord(ROUTE_KEY, {schemaVersion: 1, imageReference: manifest.imageReference, route: this.route()});
    this.notice.set(saved.ok ? 'Route saved locally on this device.' : saved.error!);
  }
  loadRoute(): void {
    const manifest = this.manifest();
    if (!manifest) return;
    const saved = readRecord<unknown>(ROUTE_KEY, null);
    if (!saved.ok) {this.notice.set(saved.error!); return;}
    if (saved.value === null) {this.notice.set('No saved route on this device.'); return;}
    if (!validateSavedRoute(saved.value, manifest.imageReference, manifest.map)) {
      this.notice.set('Saved route does not match this image or contains invalid points.'); return;
    }
    this.remember(); this.route.set(structuredClone(saved.value.route)); this.mode.set('inspect');
    this.notice.set('Saved illustrative route loaded.');
  }
  saveNote(text: string): boolean {
    const manifest = this.manifest();
    text = text.trim();
    if (!manifest || !text || text.length > 3000) {this.notice.set('Enter an observation of 1–3000 characters.'); return false;}
    if (this.notes().length >= 200) {this.notice.set('Notebook limit reached. Export your mission for a backup.'); return false;}
    const note: FieldNote = {
      id: crypto.randomUUID(), text, createdAt: new Date().toISOString(),
      point: this.selectedPoint() ? {...this.selectedPoint()!} : null,
      imageReference: manifest.imageReference, positionStatus: 'illustrative'
    };
    const next = [...this.notes(), note];
    const saved = writeRecord(NOTES_KEY, next);
    if (!saved.ok) {this.notice.set(saved.error! + ' Your text remains in the editor.'); return false;}
    this.notes.set(next); this.notice.set('Observation saved locally. Export your mission for a backup.'); return true;
  }
  private restoreNotes(manifest: Manifest): void {
    const saved = readRecord<unknown>(NOTES_KEY, []);
    if (!saved.ok) this.notice.set(saved.error!);
    if (!Array.isArray(saved.value)) return;
    const notes = saved.value.filter((note: unknown): note is FieldNote => {
      if (!note || typeof note !== 'object') return false;
      const n = note as FieldNote;
      return typeof n.id === 'string' && typeof n.text === 'string' && n.text.length <= 3000 &&
        typeof n.createdAt === 'string' && Number.isFinite(Date.parse(n.createdAt)) &&
        n.imageReference === manifest.imageReference && n.positionStatus === 'illustrative' &&
        (n.point === null || validPoint(n.point, manifest.map));
    });
    this.notes.set(notes.slice(-200));
    if (notes.length !== saved.value.length) this.notice.set('Some stored notes were incompatible with this image and were not loaded.');
  }
  exportMission(): void {
    const manifest = this.manifest();
    if (!manifest) return;
    const payload = {
      schemaVersion: 1, project: 'MARSWALK', exportedAt: new Date().toISOString(),
      disclaimer: 'Research prototype. All route and marker positions are illustrative local image coordinates. Exact AOI and terrain safety unverified.',
      coordinateSystem: manifest.map.coordinateSystem, imageReference: manifest.imageReference,
      coordinateFrame: {origin: manifest.map.origin, xAxis: manifest.map.xAxis, yAxis: manifest.map.yAxis},
      imageDimensions: {width: manifest.map.width, height: manifest.map.height},
      calibration: manifest.map.calibration, route: this.route(), assessment: this.assessment(),
      terrain: {elevation: null, slope: null, safety: 'unknown'}, notes: this.notes(), datasets: manifest.datasets
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'}));
    const anchor = document.createElement('a'); anchor.href = url;
    anchor.download = 'marswalk-mission-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.notice.set('Mission JSON exported with image reference, source metadata and uncertainty.');
  }
}
