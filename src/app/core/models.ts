// Interfaces describe our data. They do not render the map or calculate measurements.
export interface Point { x: number; y: number; }
export interface Bounds { width: number; height: number; }
export type Mode = 'inspect' | 'start' | 'destination' | 'waypoint';
export type LayerName = 'imagery' | 'markers' | 'grid' | 'coverage';
export interface Route { start: Point | null; destination: Point | null; waypoints: Point[]; }
export interface Calibration { verified: boolean; metersPerPixel: number; sourceUrl: string; method: string; }
export interface Assessment { complete: boolean; pointCount: number; distanceMeters: number | null; reason: string; }
export interface MapMetadata extends Bounds {
  coordinateSystem: 'local-image-pixels';
  origin: 'bottom-left';
  xAxis: 'right';
  yAxis: 'up';
  assetPath: string;
  calibration: Calibration | null;
}
export interface Dataset {
  id: string; type: string; status: string; title: string;
  sourceUrl: string | null; instrument: string | null; observationDate: string | null;
  resolutionMetersPerPixel: number | null;
  productId?: string; credit?: string; limitations: string[];
}
export interface Manifest {
  schemaVersion: number; imageReference: string; region: string;
  aoiStatus: string; map: MapMetadata; datasets: Dataset[];
}
export interface ScienceTarget {
  id: string; title: string; kind: 'demonstration'; point: Point;
  summary: string; context: string; sourceUrl: string;
}
export interface TargetFile {
  schemaVersion: number; coordinateSystem: string; imageReference: string;
  disclaimer: string; targets: ScienceTarget[];
}
export interface FieldNote {
  id: string; text: string; createdAt: string; point: Point | null;
  imageReference: string; positionStatus: 'illustrative';
}
export interface SavedRoute { schemaVersion: 1; imageReference: string; route: Route; }
