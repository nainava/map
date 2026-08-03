// Builds data/counties.json — one record per county FIPS, merging:
//   - Election winners/margins 2008-2024 (tonmcg)
//   - BEA population, per-capita personal income, GDP, key industry (single source)
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, 'data');

function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.length) continue;
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (q && line[i+1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === ',' && !q) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    rows.push(out.map(s => s.trim()));
  }
  return rows;
}
const pad5 = f => String(f).replace(/[^0-9]/g, '').padStart(5, '0');
const num = v => { const n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : null; };

const C = {}; // fips -> record
const rec = f => (C[f] = C[f] || { e: {}, m: {} });

// ---- Elections 2008/2012 from combined file ----
{
  const rows = parseCSV(fs.readFileSync(path.join(D, 'combined_08-16.csv'), 'utf8'));
  const h = rows[0];
  const idx = n => h.indexOf(n);
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (r.length < h.length) continue;
    const fips = pad5(r[idx('fips_code')]);
    for (const y of [2008, 2012, 2016]) {
      const dem = num(r[idx('dem_' + y)]), gop = num(r[idx('gop_' + y)]), tot = num(r[idx('total_' + y)]);
      if (dem == null || gop == null || !tot) continue;
      const rr = rec(fips);
      rr.e[y] = gop > dem ? 'R' : 'D';
      rr.m[y] = +((gop - dem) / tot).toFixed(4); // + => R lead
    }
    const nm = r[idx('county')];
    if (nm) rec(fips).n = rec(fips).n || nm.replace(/ County$/, '');
  }
}
// ---- Elections 2016/2020/2024 individual files ----
for (const y of [2020, 2024]) {
  const rows = parseCSV(fs.readFileSync(path.join(D, `results_${y}.csv`), 'utf8'));
  const h = rows[0]; const idx = n => h.indexOf(n);
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (r.length < h.length) continue;
    const fips = pad5(r[idx('county_fips')]);
    const pg = num(r[idx('per_gop')]), pd = num(r[idx('per_dem')]);
    if (pg == null || pd == null) continue;
    const rr = rec(fips);
    rr.e[y] = pg > pd ? 'R' : 'D';
    rr.m[y] = +(pg - pd).toFixed(4);
    rr.n = rr.n || (r[idx('county_name')] || '').replace(/ County$/, '');
    rr.s = rr.s || r[idx('state_name')];
  }
}

// ---- BEA helpers: read per-state files, pick LineCode, latest numeric year ----
function beaLoad(prefix, lineCodes, want) {
  // want: 'latest' single value per fips for given lineCode(s)
  const files = fs.readdirSync(path.join(D, 'bea')).filter(f => f.startsWith(prefix) && f.endsWith('.csv'));
  const result = {}; // fips -> {lineCode -> {year->val}}
  for (const file of files) {
    const rows = parseCSV(fs.readFileSync(path.join(D, 'bea', file), 'utf8'));
    const h = rows[0];
    const yearCols = h.map((c, i) => (/^(19|20)\d\d$/.test(c) ? { y: +c, i } : null)).filter(Boolean);
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]; if (r.length < 8) continue;
      const fips = pad5(r[0]); const lc = r[4];
      if (!lineCodes.includes(lc)) continue;
      // latest year with a numeric value
      let best = null;
      for (let k = yearCols.length - 1; k >= 0; k--) {
        const v = num(r[yearCols[k].i]);
        if (v != null) { best = { y: yearCols[k].y, v }; break; }
      }
      if (!best) continue;
      result[fips] = result[fips] || {};
      result[fips][lc] = best;
    }
  }
  return result;
}

const INDUSTRY = {
  '100': 'Forestry & fishing', '200': 'Mining & oil/gas', '300': 'Utilities', '400': 'Construction',
  '500': 'Manufacturing', '600': 'Wholesale trade', '700': 'Retail trade', '800': 'Transport & warehousing',
  '900': 'Information', '1000': 'Finance & insurance', '1100': 'Real estate', '1200': 'Professional/scientific/technical',
  '1300': 'Management of companies', '1400': 'Administrative & waste svcs', '1500': 'Educational services',
  '1600': 'Health care & social assist.', '1700': 'Arts & recreation', '1800': 'Accommodation & food svcs',
  '1900': 'Other services', '2000': 'Government'
};

// GDP: CAGDP1 lineCode 3 = current-dollar GDP (thousands)
const gdp = beaLoad('CAGDP1', ['3'], 'latest');
// Population (lc 2) + per-capita personal income (lc 3): CAINC1
const inc = beaLoad('CAINC1', ['2', '3'], 'latest');
// Employment by industry: CAEMP25N sector line codes
const indCodes = Object.keys(INDUSTRY);
const emp = beaLoad('CAEMP25N', indCodes, 'latest');

for (const fips of Object.keys(C)) {
  const rr = C[fips];
  if (inc[fips]) {
    if (inc[fips]['2']) rr.pop = Math.round(inc[fips]['2'].v);
    if (inc[fips]['3']) rr.pci = Math.round(inc[fips]['3'].v);
  }
  if (gdp[fips] && gdp[fips]['3']) {
    rr.gdp = Math.round(gdp[fips]['3'].v * 1000); // thousands -> dollars
    if (rr.pop) rr.gdppc = Math.round(rr.gdp / rr.pop);
  }
  if (emp[fips]) {
    let bestLc = null, bestV = -1;
    for (const lc of indCodes) if (emp[fips][lc] && emp[fips][lc].v > bestV) { bestV = emp[fips][lc].v; bestLc = lc; }
    if (bestLc) rr.ind = INDUSTRY[bestLc];
  }
}

// ---- flip sequence string across 5 elections ----
const YEARS = [2008, 2012, 2016, 2020, 2024];
for (const fips of Object.keys(C)) {
  const rr = C[fips];
  rr.seq = YEARS.map(y => rr.e[y] || '-').join('');
}

const out = {};
for (const f of Object.keys(C)) out[f] = C[f];
fs.writeFileSync(path.join(D, 'counties.json'), JSON.stringify(out));
const n = Object.keys(out).length;
const withFacts = Object.values(out).filter(r => r.gdppc).length;
const withInd = Object.values(out).filter(r => r.ind).length;
console.log(`counties: ${n} | with gdppc: ${withFacts} | with industry: ${withInd}`);
// flip stats
const stats = {};
for (const r of Object.values(out)) stats[r.seq] = (stats[r.seq] || 0) + 1;
console.log('top sequences (2008,2012,2016,2020,2024 -> D/R):');
Object.entries(stats).sort((a,b)=>b[1]-a[1]).slice(0,12).forEach(([k,v])=>console.log('  '+k+' : '+v));
