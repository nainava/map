// Injects data into template.html -> index.html (self-contained, opens via file://)
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, 'data');
const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const counties = fs.readFileSync(path.join(D, 'counties.json'), 'utf8');
const topo = fs.readFileSync(path.join(D, 'counties-albers-10m.json'), 'utf8');
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
