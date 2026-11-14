import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoute, setRoutePoint, orderedPoints, routeAssessment, validPoint} from '../src/app/core/route.js';
import type {Calibration, Point} from '../src/app/core/models.js';
const p = (x: number, y: number): Point => ({x,y});
const calibration: Calibration = {verified:true, metersPerPixel:2, sourceUrl:'https://example.org/calibration', method:'Synthetic test calibration only'};
function sample() {
  let route = setRoutePoint(createRoute(), 'start', p(0,0));
  route = setRoutePoint(route, 'waypoint', p(3,0));
  return setRoutePoint(route, 'destination', p(3,4));
}
test('pixel routes never infer meters without calibration', () => {
  assert.deepEqual(orderedPoints(sample()), [p(0,0),p(3,0),p(3,4)]);
  assert.equal(routeAssessment(sample()).distanceMeters, null);
  assert.equal(routeAssessment(sample()).complete, true);
});
test('calibrated distance follows all segments and requires evidence', () => {
  assert.equal(routeAssessment(sample(), calibration).distanceMeters, 14);
  for (const value of [null, {...calibration,verified:false}, {...calibration,metersPerPixel:0}, {...calibration,metersPerPixel:NaN}, {...calibration,metersPerPixel:Infinity}, {...calibration,sourceUrl:''}, {...calibration,method:''}]) {
    assert.equal(routeAssessment(sample(),value).distanceMeters,null);
  }
});
test('incomplete, zero-displacement and malformed routes cannot produce a physical distance', () => {
  assert.equal(routeAssessment(createRoute(),calibration).distanceMeters,null);
  assert.equal(routeAssessment({start:p(1,1),destination:p(1,1),waypoints:[]},calibration).complete,false);
  assert.equal(routeAssessment({start:p(0,0),destination:p(NaN,1),waypoints:[]},calibration).distanceMeters,null);
  assert.equal(routeAssessment({start:p(0,0),destination:p(0,0),waypoints:[p(3,4)]},calibration).distanceMeters,20);
});
test('editing preserves earlier states; points must be finite and in image bounds', () => {
  const original = createRoute(), point = p(5,5), next = setRoutePoint(original,'start',point);
  point.x = 99;
  assert.equal(next.start!.x,5); assert.equal(original.start,null);
  const bounds = {width:1600,height:815};
  for (const point of [p(-1,5),p(0,816),p(Infinity,1),p(1,NaN),null]) assert.equal(validPoint(point,bounds),false);
  assert.equal(validPoint(p(1600,815),bounds),true);
});
