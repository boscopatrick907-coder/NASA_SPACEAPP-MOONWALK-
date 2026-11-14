import type { Bounds, SavedRoute } from './models';
import { validPoint } from './route.js';

interface RecordResult<T> {ok: boolean; value: T; error: string | null;}
export function readRecord<T>(key: string, fallback: T, storage?: Storage): RecordResult<T> {
  try {
    // Access inside try: even reading localStorage can throw in restricted browsers.
    const target = storage ?? globalThis.localStorage;
    if (!target) throw new Error('Storage unavailable');
    const raw = target.getItem(key);
    return {ok: true, value: raw === null ? fallback : JSON.parse(raw) as T, error: null};
  } catch {
    return {ok: false, value: fallback, error: 'Unable to read local storage. It may be blocked or contain invalid data.'};
  }
}
export function writeRecord(key: string, value: unknown, storage?: Storage): {ok: boolean; error: string | null} {
  try {
    const target = storage ?? globalThis.localStorage;
    if (!target) throw new Error('Storage unavailable');
    const raw = JSON.stringify(value);
    if (raw === undefined) throw new Error('Invalid record');
    target.setItem(key, raw);
    return {ok: true, error: null};
  } catch {return {ok: false, error: 'Unable to save locally. Storage may be blocked or full.'};}
}
export function validateSavedRoute(value: unknown, imageReference: string, bounds: Bounds): value is SavedRoute {
  if (!value || typeof value !== 'object') return false;
  const record = value as SavedRoute;
  if (record.schemaVersion !== 1 || record.imageReference !== imageReference || !record.route) return false;
  const route = record.route;
  return (route.start === null || validPoint(route.start, bounds)) &&
    (route.destination === null || validPoint(route.destination, bounds)) &&
    Array.isArray(route.waypoints) && route.waypoints.length <= 500 && route.waypoints.every(p => validPoint(p, bounds)) &&
    (route.waypoints.length === 0 || route.start !== null);
}
