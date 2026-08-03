// Generates insights.html — a blog of short, data-grounded posts that each
// deep-link into the map (index.html?y=..&pat=..|min=..). Numbers come from analyze.js.
const fs = require('fs');

const POSTS = [
  { id:'swing-counties-rare', cat:'Overview', q:'How many Americans actually live in a “swing” county?',
    view:{y:2024,min:2},
    body:`For all the talk of swing counties, they barely exist. Of roughly 3,100 counties, just <b>73</b> flipped party two or more times between 2008 and 2024 — and only two flipped in four of five elections. A full <b>76.6% of Americans</b> live in a county that voted the same way in every single presidential election over those 16 years. The map is mostly frozen; elections are decided at the margins, in a handful of places. Highlighted here are the 73 genuine double-flippers.` },

  { id:'volatile-profile', cat:'Who swings', q:'What do the most-volatile counties have in common?',
    view:{y:2024,min:2},
    body:`The 73 counties that flip most aren’t sleepy rural outposts — they’re big. They average <b>360,000 residents</b>, more than triple the national county average, and hold 7.5% of the U.S. population. Their GDP per capita ($80k) sits near the national figure, and they cluster in New York, California, Minnesota, New Hampshire and Pennsylvania. In other words, the true swing map is made of populous, economically middle-of-the-road metros and suburbs that move with the national mood rather than against it.` },

  { id:'bellwether-14', cat:'Bellwethers', q:'The 14 true bellwethers: Obama → Trump → Biden → Trump',
    view:{y:2024,pat:'DDRDR'},
    body:`Fourteen counties backed the national winner every time: Obama twice, Trump in 2016, Biden in 2020, Trump again in 2024. Together they hold 3.0M people, average 213,000 residents, and run a GDP per capita of <b>$66,750</b> — about 22% below the national average. Their most common lead industry is health care. These mid-size metros — Pinellas County, Florida is the archetype — are the purest mirror of the country’s mood. If you want to know who’s winning, watch them.` },

  { id:'obama-to-trump-stuck', cat:'Realignment', q:'Obama’s voters who defected to Trump — and never came back',
    view:{y:2016,pat:'DDRRR'},
    body:`<b>181 counties</b> voted for Obama twice, then Trump three straight times. They’re small (average 64,000 people) and below-average in income ($63k per capita) — the Rust Belt and rural North that snapped in 2016 and stayed snapped. This is the durable core of the realignment: not a one-off protest vote, but a permanent party switch that reshaped the electoral map.` },

  { id:'knowledge-economy-blue', cat:'Economy', q:'The knowledge economy is deep blue — and rich',
    view:{y:2024,pat:'DDDDD'},
    body:`In the 33 counties where “professional, scientific & technical services” is the top employer, only <b>24%</b> voted Republican in 2024 — meaning three-quarters went Democratic. They’re huge (average 728,000 people) and wealthy: $158k GDP per capita and $112k income per capita, far above the national $85.7k and $73k. The white-collar economy and the Democratic coalition now live in the same places. Shown here: the counties that voted Democratic all five times.` },

  { id:'manufacturing-red', cat:'Economy', q:'Factory-town America went Republican',
    view:{y:2024,pat:'D...R'},
    body:`Manufacturing is the top employer in 612 counties — and in 2024, <b>96% of them voted Trump</b>. The party that once owned industrial America now loses it in a landslide. Highlighted are the 440 counties that voted Democratic in 2008 but Republican in 2024; the manufacturing belt is the heart of that shift. Open the map and hover the factory towns of the Midwest and South to see the pattern up close.` },

  { id:'resource-wealth', cat:'Economy', q:'The richest counties in America are resource country',
    view:{y:2024,pat:'RRRRR'},
    body:`Where mining, oil and gas lead the economy — 60 counties — GDP per capita hits <b>$184,000</b>, more than double the national average, and <b>97%</b> voted Republican. This is wealth pulled from the ground, not generated in offices, and it’s among the most reliably red terrain in the country. Small in population, enormous in output.` },

  { id:'rich-vs-blue', cat:'Economy', q:'Do rich counties vote Democratic? Not by count',
    view:{y:2024},
    body:`It’s tempting to equate wealth with blue, but by county it’s the opposite. The poorest quarter of counties voted <b>89% Republican</b> in 2024 — and the richest quarter still voted <b>71% Republican</b>. What predicts Democratic votes isn’t income, it’s density: 75 of the 100 most populous counties went Democratic. Money doesn’t make a county blue; crowds do.` },

  { id:'metros-eroding', cat:'Geography', q:'Big metros are still blue — but eroding',
    view:{y:2024},
    body:`Among the 100 most populous counties, <b>82 voted for Obama in 2008</b> but only <b>75 went Democratic in 2024</b>. Democrats still dominate the metros — those 100 counties produce $108k GDP per capita — yet they’ve lost ground even on home turf. Toggle the map between 2008 and 2024 and watch the biggest urban counties fade, county by county.` },

  { id:'south-texas', cat:'2024', q:'The South Texas earthquake',
    view:{y:2024,pat:'...DR'},
    body:`The single largest county shift in America since 2012 happened on the Mexican border: <b>Starr County, Texas moved 89 points toward Republicans</b>. Maverick (+77), Zapata (+66) and Duval (+64) followed. Heavily Hispanic, working-class border counties that were once overwhelmingly Democratic are now competitive or red — the defining surprise of the 2024 realignment. Highlighted: counties Biden won in 2020 and Trump flipped in 2024.` },

  { id:'2024-red-wave', cat:'2024', q:'The 2024 red wave, county by county',
    view:{y:2024,pat:'...DR'},
    body:`<b>86 counties</b> that Biden carried in 2020 flipped to Trump in 2024 — home to <b>32.6M people</b>, nearly 10% of the country. They average 384,000 residents, so this wasn’t a rural story; it was big and suburban. This map is where 2024 was actually won.` },

  { id:'suburbs-blue', cat:'Realignment', q:'The suburbs that traded places with the Rust Belt',
    view:{y:2024,pat:'R...D'},
    body:`Nineteen counties voted Republican in 2008 but Democratic in 2024 — and they’re the mirror image of the factory towns. Big (average 545,000 people) and affluent ($88k GDP per capita), these are educated suburbs that swapped allegiances just as manufacturing counties did the reverse. The great sorting of the last 16 years, in one view.` },

  { id:'utah-shift', cat:'Hidden shifts', q:'Utah’s quiet anti-Trump shift',
    view:{y:2024},
    body:`The biggest moves <i>toward</i> Democrats since 2012 weren’t on the coasts — they were in Utah. Utah County shifted 39 points left, Davis 37, Cache 34. High-income, Mormon-heavy, and notably Trump-skeptical, these counties are a genuine realignment hiding inside a solidly red state. Open the map and compare 2012 to 2024 across Utah.` },

  { id:'atlanta-suburbs', cat:'Hidden shifts', q:'Atlanta’s suburbs flipped Georgia',
    view:{y:2024},
    body:`Henry and Rockdale counties, in metro Atlanta, each swung more than 30 points toward Democrats since 2012 — fast-growing, diversifying suburbs with ordinary retail-and-services economies and an extraordinary political trajectory. Their shift is a big part of why Georgia became a presidential battleground. Hover the counties ringing Atlanta to see it.` },

  { id:'two-economies', cat:'Economy', q:'Solid-blue vs solid-red America: two economies',
    view:{y:2024,pat:'DDDDD'},
    body:`The 395 counties that voted Democratic in all five elections produce <b>$109k</b> GDP per capita and hold 43% of Americans. The 2,201 that voted Republican every time produce <b>$62k</b> and hold 33%. Same country, two economies — one dense, productive and blue; the other broad, smaller-scale and red. Shown: the permanent blue base. Switch the pattern to RRRRR to see its opposite.` },

  { id:'gop-strongholds', cat:'Geography', q:'Where are the reliable Republican strongholds?',
    view:{y:2024,pat:'RRRRR'},
    body:`<b>2,201 counties</b> — roughly two-thirds of all counties — voted Republican in every election from 2008 to 2024. But they’re small, averaging just 52,000 people and holding 33% of the population. Republican strength is broad and rural: it wins the map’s area far more decisively than its people.` },

  { id:'dem-base', cat:'Geography', q:'The permanent blue base is tiny — and enormous',
    view:{y:2024,pat:'DDDDD'},
    body:`Only <b>395 counties</b> voted Democratic every time — about 13% of counties, but <b>43% of Americans</b>. Big, dense, and rich, they show that the Democratic coalition is fundamentally a geography of metros: few places, vast populations.` },

  { id:'healthcare-anchor', cat:'Economy', q:'Health care is the new company town',
    view:{y:2024,pat:'DDRDR'},
    body:`Health care is now the top employer in <b>337 counties</b> — and it’s the most common lead industry among the 14 national bellwethers. These counties lean Republican (70%) but are large and contested. As factories closed, hospitals and clinics became the economic anchor of Middle America — and the ground where elections are fought.` },

  { id:'one-time-flippers', cat:'Overview', q:'The one-and-done flippers',
    view:{y:2016,min:1},
    body:`Of the counties that ever changed party, most did it exactly once. <b>434 counties</b> flipped a single time in 16 years — usually the 2016 Obama-to-Trump break — while just 73 flipped repeatedly. Highlighted are all counties that flipped at least once; the overwhelming majority made one decisive move and then held. Political change, when it comes, tends to be a one-way door.` },

  { id:'find-your-county', cat:'Explore', q:'Does your county follow the nation — or ignore it?',
    view:{y:2024,min:2},
    body:`Three in four Americans live somewhere that never budged from 2008 to 2024 — but the exceptions tell the story of modern politics. Open the map, hover your county to see its 16-year voting sequence and its economic profile, or build a custom pattern (Any / Dem / GOP for each election) to find every county that matches. This post’s view shows the rare repeat-flippers; start there, then go find your own.` },
];

const link = v => {
  const p = [`y=${v.y||2024}`];
  if (v.pat) p.push(`pat=${v.pat}`);
  if (v.min) p.push(`min=${v.min}`);
  return `index.html?${p.join('&')}`;
};
const viewLabel = v => {
  if (v.pat) return `${v.y} map · pattern ${v.pat.replace(/\./g,'·')}`;
  if (v.min) return `${v.y} map · counties that flipped ≥${v.min}×`;
  return `${v.y} map`;
};

const toc = POSTS.map(p => `<li><a href="#${p.id}">${p.q}</a></li>`).join('\n');
const articles = POSTS.map(p => `
  <article id="${p.id}">
    <div class="cat">${p.cat}</div>
    <h2>${p.q}</h2>
    <p>${p.body}</p>
    <a class="cta" href="${link(p.view)}">Explore this view in the map → <span class="vl">${viewLabel(p.view)}</span></a>
  </article>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Insights — What the U.S. County Map Reveals (2008–2024)</title>
<meta name="description" content="Short, data-grounded stories about how American counties voted from 2008 to 2024 — the swing counties, the realignment, and the economics behind the map.">
<style>
  :root{--ink:#1c2026;--muted:#6b7280;--line:#e4e7ec;--dem:#2166ac;--gop:#b2182b;--accent:#2166ac}
  *{box-sizing:border-box}
  body{margin:0;background:#fff;color:var(--ink);
    font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  .wrap{max-width:760px;margin:0 auto;padding:48px 22px 80px}
  header.top{border-bottom:1px solid var(--line);padding-bottom:22px;margin-bottom:30px}
  h1{font-size:30px;margin:0 0 8px;letter-spacing:-.01em}
  .lede{color:var(--muted);font-size:16px;margin:0}
  .toollink{display:inline-block;margin-top:14px;color:var(--accent);text-decoration:none;font-weight:600}
  .toollink:hover{text-decoration:underline}
  nav.toc{background:#f7f8fa;border:1px solid var(--line);border-radius:10px;padding:18px 22px;margin-bottom:40px}
  nav.toc h3{margin:0 0 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
  nav.toc ol{margin:0;padding-left:20px}
  nav.toc li{margin:4px 0}
  nav.toc a{color:var(--ink);text-decoration:none}
  nav.toc a:hover{color:var(--accent);text-decoration:underline}
  article{padding:26px 0;border-top:1px solid var(--line)}
  .cat{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:6px}
  h2{font-size:22px;margin:0 0 10px;letter-spacing:-.01em}
  article p{margin:0 0 16px}
  .cta{display:inline-flex;align-items:baseline;gap:8px;flex-wrap:wrap;
    background:var(--ink);color:#fff;text-decoration:none;font-weight:600;font-size:14px;
    padding:9px 14px;border-radius:8px}
  .cta:hover{background:#000}
  .cta .vl{font-weight:400;opacity:.7;font-size:12px}
  footer{margin-top:48px;color:var(--muted);font-size:13px;border-top:1px solid var(--line);padding-top:20px}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <h1>What the County Map Reveals</h1>
    <p class="lede">Short, data-grounded reads on how America’s ~3,100 counties voted for president from 2008 to 2024 — the swing counties, the realignment, and the economics underneath. Every post opens the exact view in the interactive map so you can dig in yourself.</p>
    <a class="toollink" href="index.html">← Open the interactive map</a>
  </header>

  <nav class="toc">
    <h3>${POSTS.length} questions</h3>
    <ol>${toc}</ol>
  </nav>

  ${articles}

  <footer>
    Data: presidential results via the tonmcg county dataset (2008–2024); population, income, GDP and
    industry via BEA Regional accounts. Averages are per-county unless noted; “per resident” figures are
    population-weighted. Built with the interactive <a href="index.html">US County Presidential Map</a>.
  </footer>
</div>
</body></html>`;

fs.writeFileSync(__dirname + '/insights.html', html);
console.log('insights.html written:', POSTS.length, 'posts,', (html.length/1024|0), 'KB');
