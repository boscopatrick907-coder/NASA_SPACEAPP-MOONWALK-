export function validPoint(point, bounds) {
  return !!point && !Array.isArray(point) && Number.isFinite(point.x) && Number.isFinite(point.y) &&
    !!bounds && Number.isFinite(bounds.width) && bounds.width > 0 && Number.isFinite(bounds.height) && bounds.height > 0 &&
    point.x >= 0 && point.y >= 0 && point.x <= bounds.width && point.y <= bounds.height;
}
const finitePoint = point => !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
const copy = point => point ? {x: point.x, y: point.y} : null;
export const createRoute = () => ({start: null, destination: null, waypoints: []});
export function orderedPoints(route) {
  return [route.start, ...route.waypoints, route.destination].filter(point => point !== null);
}
export function setRoutePoint(route, mode, point) {
  if (!finitePoint(point)) throw new TypeError('Invalid image point.');
  const next = {start: copy(route.start), destination: copy(route.destination), waypoints: route.waypoints.map(copy)};
  if (mode === 'start') next.start = copy(point);
  else if (mode === 'destination') next.destination = copy(point);
  else if (mode === 'waypoint' && next.start) next.waypoints.push(copy(point));
  else throw new Error('Select a start before adding waypoints.');
  return next;
}
export function undoRoute(route) {
  const next = {start: copy(route.start), destination: copy(route.destination), waypoints: route.waypoints.map(copy)};
  if (next.waypoints.length) next.waypoints.pop();
  else if (next.destination) next.destination = null;
  else next.start = null;
  return next;
}
export function routeAssessment(route, calibration = null) {
  const invalid = {complete: false, pointCount: 0, distanceMeters: null, reason: 'Invalid route data.'};
  if (!route || !Array.isArray(route.waypoints)) return invalid;
  const points = orderedPoints(route);
  if (!points.every(finitePoint)) return invalid;
  const result = {complete: !!route.start && !!route.destination, pointCount: points.length, distanceMeters: null, reason: 'Select a start and destination.'};
  if (!result.complete) return result;
  let pixels = 0;
  for (let i = 1; i < points.length; i++) pixels += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (!Number.isFinite(pixels) || pixels === 0) return {...result, complete: false, reason: 'Select distinct points or add a waypoint to form a loop.'};
  let validSource = false;
  try { validSource = new URL(calibration?.sourceUrl).protocol === 'https:'; } catch { /* Unknown source. */ }
  if (calibration?.verified !== true || !Number.isFinite(calibration.metersPerPixel) || calibration.metersPerPixel <= 0 ||
      !validSource || typeof calibration.method !== 'string' || !calibration.method.trim()) {
    return {...result, reason: 'Metric distance unavailable: the image has no verified calibration.'};
  }
  const distanceMeters = pixels * calibration.metersPerPixel;
  if (!Number.isFinite(distanceMeters)) return {...result, reason: 'Metric calculation exceeds supported range.'};
  return {...result, distanceMeters, reason: 'Planar distance from the documented image calibration; terrain distance remains unknown.'};
}
