import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const project = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const root = path.join(project, 'dist/marswalk/browser');
const output = path.join(project, 'test-results');
await mkdir(output, {recursive:true});
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server = createServer(async (request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const filename = path.resolve(root, pathname === '/' ? 'index.html' : pathname.slice(1));
    if (!filename.startsWith(root + path.sep)) {response.writeHead(403);response.end();return;}
    const bytes = await readFile(filename);
    response.writeHead(200, {'Content-Type':mime[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-store'});
    response.end(bytes);
  } catch {response.writeHead(404);response.end('Not found');}
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
async function check(label,action) {await action();console.log('PASS',label);}
try {
  browser = await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const page=await context.newPage(); page.setDefaultTimeout(15000);
  const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))external.push(request.url());});
  const text=selector=>page.locator(selector).innerText();
  const expectText=(selector,expected)=>page.waitForFunction(({selector,expected})=>document.querySelector(selector)?.textContent.trim()===expected,{selector,expected});
  async function ready() {
    await page.locator('#map-loading').waitFor({state:'hidden'});
    await page.waitForFunction(()=>document.querySelector('.leaflet-image-layer')?.naturalWidth>0);
  }
  async function mapClick(x,y) {
    const map=page.locator('#map');await map.scrollIntoViewIfNeeded();
    const box=await map.boundingBox();
    await map.click({position:{x:box.width*x,y:box.height*y}});
  }
  await page.goto(origin,{waitUntil:'networkidle'});await ready();
  await check('genuine local image and uncalibrated manifest',async()=>{
    assert.deepEqual(await page.locator('.leaflet-image-layer').evaluate(image=>[image.naturalWidth,image.naturalHeight]),[1600,815]);
    const manifest=await page.evaluate(async()=>(await fetch('data/manifest.json')).json());
    assert.equal(manifest.imageReference,'PIA26306-prepared-1600x815-v1');assert.equal(manifest.map.calibration,null);
    assert.equal(manifest.datasets[0].productId,'PIA26306');
  });
  await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
  await check('imagery toggle',async()=>{
    await page.locator('#layer-imagery').uncheck();await page.locator('.leaflet-image-layer').waitFor({state:'detached'});assert.equal(await page.locator('.leaflet-image-layer').count(),0);
    await page.locator('#layer-imagery').check();await page.locator('.leaflet-image-layer').waitFor();
  });
  await check('manual route and unknown terrain',async()=>{
    await page.locator('[data-mode="start"]').click();await mapClick(.4,.45);
    await page.locator('[data-mode="destination"]').click();await mapClick(.6,.55);
    await expectText('#route-count','2');assert.equal((await text('#route-distance')).trim(),'Unavailable');
    assert.match(await text('#route-elevation'),/Unavailable/);assert.match(await text('#route-slope'),/Unavailable/);assert.match(await text('#route-warning'),/unknown/i);
  });
  await check('waypoint order and undo',async()=>{
    await page.locator('[data-mode="waypoint"]').click();await mapClick(.5,.5);await expectText('#route-count','3');
    await page.locator('#undo-route').click();await expectText('#route-count','2');
  });
  await check('route persistence',async()=>{
    await page.locator('#save-route').click();
    await page.reload({waitUntil:'domcontentloaded'});await ready();
    await page.locator('#load-route').click();await expectText('#route-count','2');
  });
  await check('demo science destination',async()=>{
    await page.locator('[data-target="demo-ridge"]').click();await expectText('#science-title','Example ridge study · DEMO');
    assert.match(await text('#science-metadata'),/illustrative/i);await page.locator('#use-target').click();
    await page.waitForFunction(()=>document.querySelector('#route-end')?.textContent.includes('965.0'));assert.match(await text('#route-end'),/965\.0/);
  });
  const note='<img src=x onerror="globalThis.marswalkInjected=true"> Test field observation';
  await check('safe notebook text and persistence',async()=>{
    await page.locator('#note-text').fill(note);await page.locator('#save-note').click();
    await page.waitForFunction(note=>document.querySelector('#notes-list')?.textContent.includes(note),note);assert.ok((await text('#notes-list')).includes(note));assert.equal(await page.locator('#notes-list img').count(),0);
    assert.equal(await page.evaluate(()=>globalThis.marswalkInjected),undefined);
    await page.reload({waitUntil:'domcontentloaded'});await ready();assert.ok((await text('#notes-list')).includes(note));
  });
  await check('mission export metadata and missing measurements',async()=>{
    await page.locator('#load-route').click();
    const pending=page.waitForEvent('download');await page.locator('#export-mission').click();
    const download=await pending;const payload=JSON.parse(await readFile(await download.path(),'utf8'));
    assert.equal(payload.schemaVersion,1);assert.equal(payload.coordinateSystem,'local-image-pixels');
    assert.equal(payload.coordinateFrame.origin,'bottom-left');assert.equal(payload.terrain.safety,'unknown');
    assert.equal(payload.terrain.slope,null);assert.equal(payload.assessment.distanceMeters,null);
    assert.ok(payload.notes.some(entry=>entry.text===note));
  });
  await check('complete offline reload',async()=>{
    await page.waitForFunction(()=>document.querySelector('#offline-status')?.textContent==='Offline pack ready',null,{timeout:60000});
    await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await ready();
    assert.ok((await text('#notes-list')).includes(note));await page.locator('#load-route').click();await expectText('#route-count','2');
    await context.setOffline(false);
  });
  await check('keyboard point selection and incompatible saved data',async()=>{
    await page.locator('#clear-route').click();await page.locator('[data-mode="start"]').click();
    await page.locator('#map').focus();await page.keyboard.press('Enter');await expectText('#route-count','1');
    await page.evaluate(()=>localStorage.setItem('marswalk.route.v1',JSON.stringify({schemaVersion:1,imageReference:'other',route:{start:{x:1,y:1},destination:{x:2,y:2},waypoints:[]}})));
    await page.locator('#load-route').click();await expectText('#notice','Saved route does not match this image or contains invalid points.');await expectText('#route-count','1');assert.match(await text('#notice'),/match|invalid/i);
  });
  for (const [name,viewport] of [['tablet',{width:1024,height:768}],['mobile',{width:390,height:844}]]) {
    await check(name+' viewport',async()=>{
      await page.setViewportSize(viewport);await page.locator('#map').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});
      const sizes=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
      assert.ok(sizes.scrollWidth<=sizes.width+1,JSON.stringify(sizes));
    });
  }
  await check('no runtime errors or external dependencies',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);});
  console.log('All browser checks passed.');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
