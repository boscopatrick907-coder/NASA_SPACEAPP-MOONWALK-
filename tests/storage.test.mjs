import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecord,writeRecord,validateSavedRoute} from '../js/storage.js';
const bounds = {width:1600,height:815};
const saved = () => ({schemaVersion:1,imageReference:'image-v1',route:{start:{x:1,y:2},destination:{x:5,y:6},waypoints:[]}});
test('stored routes are tied to the exact image and valid image coordinates', () => {
  assert.equal(validateSavedRoute(saved(),'image-v1',bounds),true);
  assert.equal(validateSavedRoute(saved(),'other-image',bounds),false);
  for (const point of [{x:1601,y:2},{x:0,y:-1},{x:NaN,y:2},{x:'1',y:2}]) {
    const record=saved();record.route.start=point;
    assert.equal(validateSavedRoute(record,'image-v1',bounds),false);
  }
  const record=saved();record.route.waypoints=Array(501).fill({x:1,y:1});
  assert.equal(validateSavedRoute(record,'image-v1',bounds),false);
});
test('blocked, malformed, or full storage produces explicit failure', () => {
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('quota');}};
  assert.equal(readRecord('x',[],blocked).ok,false);
  assert.equal(writeRecord('x',saved(),blocked).ok,false);
  assert.equal(readRecord('x',null,{getItem(){return '{';}}).ok,false);
});
test('storage round trip and missing record fallback', () => {
  const map=new Map(), storage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};
  assert.equal(readRecord('x',null,storage).value,null);
  assert.equal(writeRecord('x',saved(),storage).ok,true);
  assert.deepEqual(readRecord('x',null,storage).value,saved());
});
