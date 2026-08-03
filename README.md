# US County Presidential Map (2008–2024)

An interactive county-level map of US presidential results from 2008 to 2024, with:

- **Flip-finder** — highlight counties by their voting sequence (e.g. Obama→Trump→Biden→Trump = `DDRDR`), by preset, custom sequence, or number of party flips.
- **County profiles** — hover any county for population, GDP, GDP/capita, income/capita, and its top industry.
- **Comparison averages** — for any highlighted set, see simple (per-county) and population-weighted averages vs. the national average.
- **Insights blog** (`insights.html`) — 20 short, data-grounded posts that each deep-link into the exact map view.

The map is rendered on `<canvas>` (smooth pan/zoom for ~3,100 counties) with a hidden picking layer for hover. The output `index.html` is fully self-contained — open it directly in a browser, no server needed.

## Quick start

```bash
open index.html          # the map
open insights.html       # the blog
```

## Deep links

Any view is shareable via URL params on `index.html`:

- `?y=2016` — set the map year (2008, 2012, 2016, 2020, 2024)
- `?pat=DDRDR` — highlight counties matching a 5-char sequence (`D`/`R`/`.` per election, `.` = any)
- `?min=2` — highlight counties that flipped party at least N times

Example: `index.html?y=2024&pat=DDRDR`

## Rebuilding

```bash
npm run build:site      # rebuild index.html from data/counties.json + template.html
npm run build:insights  # rebuild insights.html from build-insights.js
npm run build:data      # rebuild data/counties.json from the raw sources in data/
```

`build.js` merges the raw election + BEA data into `data/counties.json`; `assemble.js`
inlines that plus the map geometry and D3 into a single `index.html`.

### Data sources

- **Election results (2008–2024):** [tonmcg/US_County_Level_Election_Results_08-24](https://github.com/tonmcg/US_County_Level_Election_Results_08-24)
- **Population, income, GDP, industry:** [BEA Regional accounts](https://apps.bea.gov/regional/) — tables `CAINC1`, `CAGDP1`, `CAEMP25N` (keyless ZIP downloads). This ~79MB raw dump lives in `data/bea/` and is gitignored; the merged `data/counties.json` is committed, so the site builds without it. To regenerate from scratch, re-download the BEA ZIPs into `data/bea/`.
- **County geometry:** [us-atlas](https://github.com/topojson/us-atlas) `counties-albers-10m` (pre-projected).

## License

MIT
