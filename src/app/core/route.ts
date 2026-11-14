import type { Assessment, Bounds, Calibration, Mode, Point, Route } from './models';

// All these coordinates are image pixels. No Earth/Mars geographic formula is used.
export function validPoint(point: unknown, bounds: Bounds): point is Point {
  if (!point || typeof point !== 'object') return false;
  const p = point as Partial<Point>;
  return !Array.isArray(point) && Number.isFinite(p.x) && Number.isFinite(p.y) &&
    Number.isFinite(bounds.width) && bounds.width > 0 && Number.isFinite(bounds.height) && bounds.height > 0 &&
    p.x! >= 0 && p.y! >= 0 && p.x! <= bounds.width && p.y! <= bounds.height;
}
const finitePoint = (p: Point | null): p is Point => !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
const copy = (p: Point | null): Point | null => p ? {x: p.x, y: p.y} : null;
export const createRoute = (): Route => ({start: null, destination: null, waypoints: []});
export const orderedPoints = (route: Route): Point[] =>
  [route.start, ...route.waypoints, route.destination].filter((point): point is Point => point !== null);

export function setRoutePoint(route: Route, mode: Mode, point: Point): Route {
  if (!finitePoint(point)) throw new TypeError('Invalid image point.');
  const next: Route = {start: copy(route.start), destination: copy(route.destination), waypoints: route.waypoints.map(p => ({...p}))};
  if (mode === 'start') next.start = {...point};
  else if (mode === 'destination') next.destination = {...point};
  else if (mode === 'waypoint' && next.start) next.waypoints.push({...point});
  else throw new Error('Select a start before adding waypoints.');
  return next;
}

export function routeAssessment(route: Route, calibration: Calibration | null = null): Assessment {
  const points = orderedPoints(route);
  const invalid: Assessment = {complete: false, pointCount: points.length, distanceMeters: null, reason: 'Invalid route data.'};
  if (!points.every(finitePoint)) return invalid;
  const result: Assessment = {...invalid, complete: !!route.start && !!route.destination, reason: 'Select a start and destination.'};
  if (!result.complete) return result;
  let pixels = 0;
  for (let i = 1; i < points.length; i++) {
    pixels += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  if (!Number.isFinite(pixels) || pixels === 0) {
    return {...result, complete: false, reason: 'Select distinct points or add a waypoint for a loop.'};
  }
  let sourceValid = false;
  try {sourceValid = new URL(calibration?.sourceUrl ?? '').protocol === 'https:';} catch { /* Unknown source. */ }
  if (!calibration || calibration.verified !== true || !Number.isFinite(calibration.metersPerPixel) ||
      calibration.metersPerPixel <= 0 || !sourceValid || typeof calibration.method !== 'string' || !calibration.method.trim()) {
    return {...result, reason: 'Metric distance unavailable: no verified image calibration.'};
  }
  const distanceMeters = pixels * calibration.metersPerPixel;
  if (!Number.isFinite(distanceMeters)) return {...result, reason: 'Metric calculation exceeds supported range.'};
  return {...result, distanceMeters, reason: 'Calibrated planar distance; terrain distance is unknown.'};
}
export function coordinate(point: Point | null): string {
  return point ? 'x ' + point.x.toFixed(1) + ' · y ' + point.y.toFixed(1) + ' px' : 'Not selected';
}
