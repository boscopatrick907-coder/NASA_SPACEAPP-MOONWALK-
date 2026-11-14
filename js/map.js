/* Leaflet adapter: local image coordinates only. Never use Earth distance APIs. */
export async function createMap({ element, manifest, targets, onPoint, onTarget }) {
  if (!globalThis.L) throw new Error('Local Leaflet library could not be loaded.');
  const image = new Image();
  image.src = manifest.map.assetPath;
  await image.decode();
  const width = image.naturalWidth, height = image.naturalHeight;
  if (width !== manifest.map.width || height !== manifest.map.height) {
    throw new Error('Image dimensions differ from the manifest. Verify the asset and its metadata.');
  }
  const bounds = L.latLngBounds([[0, 0], [height, width]]);
  const map = L.map(element, {
    crs: L.CRS.Simple, minZoom: -3, maxZoom: 3,
    zoomSnap: 0.25, zoomDelta: 0.5, maxBounds: bounds.pad(0.1),
    maxBoundsViscosity: 0.8, attributionControl: true, zoomControl: false
  });
  L.control.zoom({position: 'topright'}).addTo(map);
  const imagery = L.imageOverlay(image.src, bounds, {
    alt: 'Historical HiRISE regional view of Mount Sharp boxwork; exact exploration AOI unverified.'
  }).addTo(map);
  map.attributionControl.setPrefix(false);
  map.attributionControl.addAttribution('NASA/JPL-Caltech/University of Arizona · HiRISE · 2006-12-10');
  const markers = L.layerGroup().addTo(map);
  const grid = L.layerGroup();
  const coverage = L.layerGroup().addTo(map);
  const route = L.layerGroup().addTo(map);
  const toLatLng = p => [p.y, p.x];
  const icon = (text, type) => L.divIcon({
    className: 'mission-marker ' + type,
    html: '<span>' + text + '</span>', iconSize: [34, 34], iconAnchor: [17, 17]
  });
  targets.forEach((target, index) => {
    const marker = L.marker(toLatLng(target.point), {
      icon: icon(String(index + 1), 'science-marker'),
      keyboard: true, title: target.title + ' — illustrative position',
      alt: target.title + ' — illustrative position'
    }).addTo(markers);
    const label = document.createElement('span');
    label.textContent = target.title + ' · DEMO';
    marker.bindTooltip(label, {direction: 'top'});
    marker.on('click', event => {
      L.DomEvent.stopPropagation(event);
      onTarget(target);
    });
  });
  const gridStyle = {color: '#c9d3db', weight: 1, opacity: 0.32, interactive: false, dashArray: '3 8'};
  for (let x = 200; x < width; x += 200) L.polyline([[0,x],[height,x]], gridStyle).addTo(grid);
  for (let y = 200; y < height; y += 200) L.polyline([[y,0],[y,width]], gridStyle).addTo(grid);
  L.rectangle(bounds, {
    color: '#d3b87a', weight: 2, fillColor: '#b7a36e',
    fillOpacity: 0.07, dashArray: '8 8', interactive: false
  }).addTo(coverage);
  map.on('click', event => onPoint({x: event.latlng.lng, y: event.latlng.lat}));
  map.fitBounds(bounds);
  const resize = new ResizeObserver(() => map.invalidateSize({pan: false}));
  resize.observe(element);
  return {
    bounds: {width, height},
    fit: () => map.fitBounds(bounds),
    center: () => ({x: map.getCenter().lng, y: map.getCenter().lat}),
    setLayer(name, visible) {
      const layer = {imagery, markers, grid, coverage}[name];
      if (!layer) return;
      if (visible) layer.addTo(map); else map.removeLayer(layer);
    },
    renderRoute(routeState) {
      const points = [];
      if (routeState.start) points.push({point: routeState.start, label: 'S', type: 'start-marker'});
      routeState.waypoints.forEach((point, i) => points.push({point, label: String(i + 1), type: 'waypoint-marker'}));
      if (routeState.destination) points.push({point: routeState.destination, label: 'D', type: 'destination-marker'});
      route.clearLayers();
      if (points.length > 1) L.polyline(points.map(p => toLatLng(p.point)), {
        color: '#ff935b', weight: 4, opacity: 0.95, interactive: false, dashArray: '9 6'
      }).addTo(route);
      points.forEach(({point, label, type}) => {
        L.marker(toLatLng(point), {icon: icon(label, type), interactive: false}).addTo(route);
      });
    }
  };
}
