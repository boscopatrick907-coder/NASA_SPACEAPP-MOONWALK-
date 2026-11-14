export function readRecord(key, fallback, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    if (!target) throw new Error('Storage unavailable');
    const text = target.getItem(key);
    return {ok: true, value: text === null ? fallback : JSON.parse(text), error: null};
  } catch {
    return {ok: false, value: fallback, error: 'Unable to read local storage. It may be blocked or contain invalid data.'};
  }
}
export function writeRecord(key, value, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    if (!target) throw new Error('Storage unavailable');
    const text = JSON.stringify(value);
    if (text === undefined) throw new Error('Invalid record');
    target.setItem(key, text);
    return {ok: true, error: null};
  } catch {
    return {ok: false, error: 'Unable to save locally. Storage may be blocked or full.'};
  }
}
export function validateSavedRoute(value, imageReference, bounds) {
  const valid = point => !!point && !Array.isArray(point) && Number.isFinite(point.x) && Number.isFinite(point.y) &&
    point.x >= 0 && point.y >= 0 && point.x <= bounds.width && point.y <= bounds.height;
  if (!bounds || !Number.isFinite(bounds.width) || !Number.isFinite(bounds.height) || bounds.width <= 0 || bounds.height <= 0) return false;
  if (!value || value.schemaVersion !== 1 || value.imageReference !== imageReference) return false;
  const route = value.route;
  return !!route && (route.start === null || valid(route.start)) &&
    (route.destination === null || valid(route.destination)) &&
    Array.isArray(route.waypoints) && route.waypoints.length <= 500 &&
    route.waypoints.every(valid) && (route.waypoints.length === 0 || route.start !== null);
}
