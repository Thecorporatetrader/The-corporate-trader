const origin = 'http://127.0.0.1:3001';
const pages = ['/algo','/algo/results/quant','/algo/results/scalp','/algo/results/algo'];
const links = new Set();
for (const path of pages) {
 const response = await fetch(origin+path);
 if (response.status !== 200) throw new Error(`${path}: ${response.status}`);
 const html = await response.text();
 for (const bad of ['LotProgression=','ReportTester-','<th>Orders</th>','<th>Deals</th>']) if(html.includes(bad)) throw new Error(`Private report data in ${path}`);
 for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if(match[1].startsWith('/') && !match[1].startsWith('/_next')) links.add(match[1]);
  if(match[1].startsWith('#') && !html.includes(`id="${match[1].slice(1)}"`)) throw new Error(`Missing anchor ${match[1]} in ${path}`);
 }
}
for(const target of links){
 const [path,hash] = target.split('#');
 const response = await fetch(origin+path);
 if(!response.ok) throw new Error(`Broken link ${target}: ${response.status}`);
 if(hash && !(await response.text()).includes(`id="${hash}"`)) throw new Error(`Missing anchor ${target}`);
}
const missing = await fetch(origin+'/algo/results/not-a-product');
if(missing.status !==404) throw new Error('Unknown products must return 404');
console.log(`PASS: ${pages.length} pages, ${links.size} local routes/assets, anchors, privacy checks, unknown-product 404.`);

