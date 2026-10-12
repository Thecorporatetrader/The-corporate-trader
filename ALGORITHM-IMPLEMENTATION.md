# Algorithm suite implementation

## Scope
- `/algo`: Quant (DWM breakout/fakeout), Scalp (M1/M5 automation), and trader-directed Algo.
- `/algo/results/quant`, `/algo/results/scalp`, `/algo/results/algo`: public summary routes; unknown products return 404.
- Original supplied summary screenshots only; raw reports are never copied into this repository.
- Share Results uses the current deployment origin and the product summary route. Native sharing falls back to clipboard, then a selectable URL if clipboard access fails.
- Each product has a calculator. Algo requires a user-entered baseline because no matching historical report was supplied.
- Existing global navigation, authentication, journal, education, community and contact infrastructure remain in place. Legacy section anchors remain valid. The old custom-algo form showed a false success alert without persistence; the custom-development CTA now leads to the existing contact workflow.
- Tutorial slots are explicitly marked coming soon; no video assets were supplied.

## Source verification
The two latest uploaded MT5 HTML files were read privately on 12 October 2026. Only the results summary and test conditions were used. TCT supplied the mapping of the second report to Scalp. No formulas, trade rows, identifiers or private files were copied into the site.

Both: 1 Jan–11 Oct 2026; USD; initial deposit 500; configured fixed lot 0.01; report test period M1. Product strategy timeframes are described separately from the report test timeframe.

| Product | Net profit | Trades | Win rate | PF | Relative equity DD | Max dollar equity DD |
|---|---:|---:|---:|---:|---:|---:|
| Quant | 961.61 | 546 | 71.79% | 2.42 | 4.72% | 27.62 |
| Scalp | 1883.35 | 10350 | 62.22% | 1.16 | 18.99% | 104.56 |

Quant's relative DD is 4.72% (24.59 USD); its maximal dollar DD is 27.62 USD (2.78%). These must not be paired as a single measurement.

Screenshots were visually inspected: the 546-trade summary belongs to Quant; the high-frequency entries summary belongs to Scalp. Neither displays account identifiers or full trade lists.

## Validation
- `npm ci` and `npm run build`: passed with Next.js 15.5.26 and TypeScript checking.
- `node --test tests/*.test.mjs`: 10 passed, including the existing validation tests.
- With `npm start -- --port 3001 --hostname 127.0.0.1`, `node tests/algorithm-routes.mjs`: 4 pages and 27 linked local routes/assets passed; anchors, private-report markers and invalid-product 404 checked.
- Browser checks: desktop and 390px mobile, no horizontal overflow, images loaded, calculator updates for Quant 0.05 and Scalp 0.10, a negative custom baseline, share-dialog response, mobile menu, FAQ expansion, no recorded browser errors.
- Share clipboard/manual fallbacks were reviewed in code; native sharing was the available browser path. No actual external share was sent.
- Existing authentication/contact backend transactions were not exercised without production credentials.

## Deployment / handoff
The repository uses Next.js with Vercel, not a static export. Preserve the existing Vercel integration and environment variables; no new variables or database migrations are needed for these pages.

Publication uses the authenticated GitHub connector because local Git credentials were unavailable. The existing Vercel Git integration handles deployment. Confirm the deployment status and live routes after publication.

The inherited production dependency audit reports 4 findings (3 high, 1 moderate), in next, postcss, sharp and source-map-js. Dependency upgrades were not mixed into this page rebuild; review and patch them before production release. The dependency lockfile is unchanged.

