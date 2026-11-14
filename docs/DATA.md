# Verified Mars data integration
## Current assets
The supplied NASA/JPL [PIA26306 context image](https://www.jpl.nasa.gov/images/pia26306-hirise-views-mount-sharps-boxwork/) was observed 2006-12-10 by HiRISE/MRO. Credit: NASA/JPL-Caltech/University of Arizona. It was resized from 7488 × 3813 to 1600 × 815 pixels without georeferencing.

It provides regional boxwork context. It does not establish the exact exploration AOI, scale, geographic orientation or target localization. No DEM, slope raster, mineral map, chemistry measurements or verified hazard polygons are supplied.

## Coordinate contract
Leaflet CRS.Simple represents custom local-image points {x,y} in prepared-asset pixels. Origin: bottom-left. x: right. y: up. Leaflet order: [y,x]. Bounds: [[0,0],[height,width]], derived from the loaded image. Convert top-down pixelY with y = height - pixelY.

Pixels are not degrees or meters. Do not assert north-up or export these points as geographic GeoJSON. Mission exports preserve an image reference and coordinate frame.

For calibrated hackathon mapping, prepare one uniformly scaled local planar raster with QGIS/GDAL. Every image/DEM/point layer must share a documented transform. Record crop, reprojection and resampling. Native resolution does not automatically equal prepared-asset scale.

Future geographic Mars support must document reference body/radius/ellipsoid/datum, planetocentric versus planetographic latitude, longitude direction/domain, projection parameters and units. Use the actual planetary CRS, not an Earth EPSG code or Leaflet's Earth distance methods. Validate independent control points.

## Exact AOI verification
1. Locate the Curiosity boxwork study site using primary mission material or archive localization products.
2. Obtain authoritative product IDs, footprints, acquisition dates and projection metadata.
3. Confirm compatible planetary coordinate conventions and real spatial overlap.
4. Delimit the final AOI only after verification. General Gale coverage can miss the actual site.
5. Preserve the selected region; ask the team before changing location.
6. Keep source URLs and reproducible processing notes.

## Manifest
data/manifest.json separates metadata from rendering. Record stable ID/type/title/status, local asset path, primary source/download URL, mission/instrument, observation date (separate from publication), credit, native/prepared resolution, coordinate conventions/transform, footprint, processing, NoData, uncertainty and verification history.

Unknown fields stay null. A download is not scientific verification. Supplied status values are verified-context and unavailable; demo target identities/positions remain explicitly illustrative.

## Route distance
The optional map.calibration contract requires:
```text
verified: true
metersPerPixel: a positive finite number
sourceUrl: an HTTPS primary source supporting the calibration
method: a description of independent validation and raster preparation
```

The supplied value is null. Never fill it with a guessed scale. For an independently validated uniformly scaled local plane, sum hypot(dx,dy) over successive ordered points and multiply by metersPerPixel. This estimates 2D mapped distance, not terrain distance or walking effort.

Invalid/missing calibration, incomplete routes and nonfinite points produce no physical length. Tests use a synthetic calibration only, never NASA measurements.

Changing the image, crop or transform invalidates pixel positions. Change imageReference, reject incompatible saved records or explicitly migrate them. Do not silently place old records on another raster.

## DEM and slope
Require exact AOI overlap and alignment with imagery, horizontal resolution/units, vertical units/datum, valid footprint, NoData and uncertainty. MOLA may provide regional context but is not automatically suitable for ridge-scale walking assessment.

Prepare small rasters or samples outside the browser. NoData is not zero elevation or zero slope. Slope requires a documented algorithm, correct units and appropriate resolution. Route assessment must sample segments, not only clicked vertices; uncovered sections retain an unknown warning.

Adding DEM metadata alone does not implement sampling or justify enabling the controls. Extend the data/map adapter and terrain assessment only after validating the prepared products.

## Geological and chemical observations
CRISM, ChemCam, APXS and CheMin sample different footprints. Verify actual overlap and localization; retain target/product ID, instrument, acquisition date, units, footprint/resolution, uncertainty and source.

Published geological interpretations are useful when labelled as interpretations. Replace illustrative targets only after independently validating their positions. Renaming a demo marker is insufficient.

Historical observations are not live conditions. Ancient groundwater interpretations do not establish current liquid water or terrain safety. Separate scientific interest from mobility assessment.

## Integration checks
- Verify source, footprint and coordinate conventions.
- Prepare lightweight local runtime assets, preserving originals and processing notes elsewhere.
- Update registry, adapter and image-reference version deliberately.
- Add new runtime paths to sw.js required files and bump its version.
- Verify independent calibration and alignment, NoData behavior and route coverage.
- Confirm missing data still displays unavailable/unknown.
- Check attribution, observation dates and uncertainty in UI and exports.
- Prepare the offline pack and test a complete offline reload with the new assets.
