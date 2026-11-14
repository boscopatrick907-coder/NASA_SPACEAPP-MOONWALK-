import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import * as L from 'leaflet';
import { MissionService } from '../core/mission.service';
import type { LayerName, Point, Route } from '../core/models';

// Leaflet owns only the map container. Angular owns the rest of the page.
@Component({selector: 'app-map', standalone: true, templateUrl: './map.component.html', host: {class: 'panel map-panel'}})
export class MapComponent implements AfterViewInit, OnDestroy {
  readonly mission = inject(MissionService);
  readonly ready = signal(false);
  readonly error = signal('');
  readonly modes = [
    {mode: 'start', label: 'Set start'}, {mode: 'destination', label: 'Set destination'},
    {mode: 'waypoint', label: '＋ Add waypoint'}, {mode: 'inspect', label: '⌖ Inspect / note'}
  ] as const;
  @ViewChild('mapHost', {static: true}) private host!: ElementRef<HTMLElement>;
  private map?: L.Map;
  private routeLayer?: L.LayerGroup;
  private layers?: Record<LayerName, L.Layer>;
  private observer?: ResizeObserver;
  private destroyed = false;

  constructor() {
    effect(() => {
      const route = this.mission.route(), layers = this.mission.layers();
      if (!this.ready()) return;
      this.renderRoute(route);
      for (const [name, visible] of Object.entries(layers)) this.setLayer(name as LayerName, visible);
    });
  }
  ngAfterViewInit(): void {void this.openMap();}
  private async openMap(): Promise<void> {
    try {
      const manifest = this.mission.manifest();
      if (!manifest) throw new Error('Map metadata is unavailable.');
      const image = new Image(); image.src = manifest.map.assetPath; await image.decode();
      if (this.destroyed) return;
      const width = image.naturalWidth, height = image.naturalHeight;
      if (width !== manifest.map.width || height !== manifest.map.height) throw new Error('Image dimensions differ from the manifest.');
      const bounds = L.latLngBounds([[0, 0], [height, width]]);
      const map = L.map(this.host.nativeElement, {
        crs: L.CRS.Simple, minZoom: -3, maxZoom: 3, zoomSnap: .25, zoomDelta: .5,
        maxBounds: bounds.pad(.1), maxBoundsViscosity: .8, zoomControl: false
      });
      this.map = map;
      L.control.zoom({position: 'topright'}).addTo(map);
      map.attributionControl.setPrefix(false);
      map.attributionControl.addAttribution('NASA/JPL-Caltech/University of Arizona · HiRISE · 2006-12-10');
      const imagery = L.imageOverlay(image.src, bounds, {alt: 'Historical HiRISE boxwork regional context. Exact exploration AOI unverified.'}).addTo(map);
      const markers = L.layerGroup().addTo(map), grid = L.layerGroup(), coverage = L.layerGroup().addTo(map);
      this.mission.targets().forEach((target, index) => {
        const marker = L.marker(this.toLatLng(target.point), {
          icon: this.icon(String(index + 1), 'science-marker'),
          title: target.title + ' — illustrative position', alt: target.title + ' — illustrative position'
        }).addTo(markers);
        const label = document.createElement('span'); label.textContent = target.title + ' · DEMO';
        marker.bindTooltip(label, {direction: 'top'});
        marker.on('click', () => this.mission.inspectTarget(target));
      });
      const style: L.PolylineOptions = {color: '#c9d3db', weight: 1, opacity: .32, interactive: false, dashArray: '3 8'};
      for (let x = 200; x < width; x += 200) L.polyline([[0, x], [height, x]], style).addTo(grid);
      for (let y = 200; y < height; y += 200) L.polyline([[y, 0], [y, width]], style).addTo(grid);
      L.rectangle(bounds, {color: '#d3b87a', weight: 2, fillColor: '#b7a36e', fillOpacity: .07, dashArray: '8 8', interactive: false}).addTo(coverage);
      this.layers = {imagery, markers, grid, coverage};
      this.routeLayer = L.layerGroup().addTo(map);
      map.on('click', (event: L.LeafletMouseEvent) => this.mission.selectPoint({x: event.latlng.lng, y: event.latlng.lat}));
      map.fitBounds(bounds);
      this.observer = new ResizeObserver(() => map.invalidateSize({pan: false}));
      this.observer.observe(this.host.nativeElement);
      this.ready.set(true); this.mission.mapReady.set(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load the map.';
      this.error.set(message); this.mission.notice.set(message);
    }
  }
  fit(): void {
    const metadata = this.mission.manifest()?.map;
    if (metadata) this.map?.fitBounds([[0, 0], [metadata.height, metadata.width]]);
  }
  selectCenter(event: Event): void {
    if (event.target !== this.host.nativeElement || this.mission.mode() === 'inspect' || !this.map) return;
    event.preventDefault();
    const center = this.map.getCenter();
    this.mission.selectPoint({x: center.lng, y: center.lat});
  }
  private toLatLng(point: Point): L.LatLngTuple {return [point.y, point.x];}
  private icon(label: string, type: string): L.DivIcon {
    // label is our own fixed letter or number, never user-entered HTML.
    return L.divIcon({className: 'mission-marker ' + type, html: '<span>' + label + '</span>', iconSize: [34, 34], iconAnchor: [17, 17]});
  }
  private setLayer(name: LayerName, visible: boolean): void {
    const layer = this.layers?.[name];
    if (!layer || !this.map) return;
    if (visible) layer.addTo(this.map); else this.map.removeLayer(layer);
  }
  private renderRoute(route: Route): void {
    if (!this.routeLayer) return;
    const points: {point: Point; label: string; type: string}[] = [];
    if (route.start) points.push({point: route.start, label: 'S', type: 'start-marker'});
    route.waypoints.forEach((point, i) => points.push({point, label: String(i + 1), type: 'waypoint-marker'}));
    if (route.destination) points.push({point: route.destination, label: 'D', type: 'destination-marker'});
    this.routeLayer.clearLayers();
    if (points.length > 1) L.polyline(points.map(p => this.toLatLng(p.point)), {color: '#ff935b', weight: 4, dashArray: '9 6', interactive: false}).addTo(this.routeLayer);
    points.forEach(p => L.marker(this.toLatLng(p.point), {icon: this.icon(p.label, p.type), interactive: false, keyboard: false}).addTo(this.routeLayer!));
  }
  ngOnDestroy(): void {
    this.destroyed = true; this.observer?.disconnect(); this.map?.remove();
    this.mission.mapReady.set(false);
  }
}
