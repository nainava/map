// Injects data into template.html -> index.html (self-contained, opens via file://)
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, 'data');
const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const counties = fs.readFileSync(path.join(D, 'counties.json'), 'utf8');
// Drop Alaska (FIPS prefix "02") from the geometry so no grey shape is drawn —
// Alaska has no county-level presidential results (reported by house district).
const topoObj = JSON.parse(fs.readFileSync(path.join(D, 'counties-albers-10m.json'), 'utf8'));
// Also drop Kalawao County, HI (15005): a tiny county whose few presidential
// votes are reported with Maui, so no separate result exists.
const DROP = id => String(id).slice(0, 2) === '02' || String(id) === '15005';
for (const key of ['counties', 'states']) {
  const o = topoObj.objects[key];
  if (o && Array.isArray(o.geometries))
    o.geometries = o.geometries.filter(g => !DROP(g.id));
}
const topo = JSON.stringify(topoObj);
const d3lib = fs.readFileSync(path.join(D, 'd3.min.js'), 'utf8');
const topolib = fs.readFileSync(path.join(D, 'topojson-client.min.js'), 'utf8');
// JSON.parse('...') parses far faster than an equivalent JS object literal for big data
const data = `const COUNTY_DATA=JSON.parse(${JSON.stringify(counties)});\nconst US_TOPO=JSON.parse(${JSON.stringify(topo)});`;
const out = tpl
  .replace('/*D3LIB*/', () => d3lib)
  .replace('/*TOPOLIB*/', () => topolib)
  .replace('/*DATA*/', () => data);
fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('index.html written:', (out.length / 1e6).toFixed(2), 'MB');
