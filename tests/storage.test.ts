import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecord,writeRecord,validateSavedRoute} from '../src/app/core/storage.js';
import type {SavedRoute} from '../src/app/core/models.js';
const bounds = {width:1600,height:815};
const saved = (): SavedRoute => ({schemaVersion:1,imageReference:'image-v1',route:{start:{x:1,y:2},destination:{x:5,y:6},waypoints:[]}});
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {return this.data.size;}
  clear(): void {this.data.clear();}
  getItem(key: string): string | null {return this.data.get(key) ?? null;}
  key(index: number): string | null {return [...this.data.keys()][index] ?? null;}
  removeItem(key: string): void {this.data.delete(key);}
  setItem(key: string, value: string): void {this.data.set(key,value);}
}
test('saved routes belong to an exact image and contain valid coordinates', () => {
  assert.equal(validateSavedRoute(saved(),'image-v1',bounds),true);
  assert.equal(validateSavedRoute(saved(),'other-image',bounds),false);
  for (const point of [{x:1601,y:2},{x:0,y:-1},{x:NaN,y:2}]) {
    const record=saved();record.route.start=point;
    assert.equal(validateSavedRoute(record,'image-v1',bounds),false);
  }
  const record=saved();record.route.waypoints=Array(501).fill({x:1,y:1});
  assert.equal(validateSavedRoute(record,'image-v1',bounds),false);
});
test('blocked, full, or malformed storage reports failure', () => {
  class BlockedStorage extends MemoryStorage {
    override getItem(): never {throw new Error('blocked');}
    override setItem(): never {throw new Error('quota');}
  }
  assert.equal(readRecord('x',[],new BlockedStorage()).ok,false);
  assert.equal(writeRecord('x',saved(),new BlockedStorage()).ok,false);
  const malformed = new MemoryStorage();malformed.setItem('x','{');
  assert.equal(readRecord('x',null,malformed).ok,false);
});
test('storage round trip and missing record fallback', () => {
  const storage = new MemoryStorage();
  assert.equal(readRecord('x',null,storage).value,null);
  assert.equal(writeRecord('x',saved(),storage).ok,true);
  assert.deepEqual(readRecord<unknown>('x',null,storage).value,saved());
});
