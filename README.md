# ReLeaf homepage: problem section (draft)

A standalone draft of the expanded problem section for the ReLeaf (GEMS Taiwan, iGEM 2026) wiki homepage. It is built to be lifted into `wiki/index.html` between the hero and the dark act.

The five problem beats are grouped into three sections, followed by the existing chain as the handoff:

| Section | Beats | Requirement it earns |
|---|---|---|
| 01 The threat, and who it lands on | GIS climate volatility × farm parcels; smallholders with no instruments | On demand · Right time · Right amount |
| 02 The gap, and what it costs | Bioprotectants exist; "why not just buy them?"; central vs on-site ledger | On site |
| 03 The catch | Live engineered bacteria on the farm; containment | Sealed · Biosafe |
| Handoff | Nine-step chain collapses onto the farmer → ReLeaf | all five lit |

## Baking into the wiki

- `assets/css/tokens.css` is a copy of `wiki/assets/css/tokens.css`. Don't ship this copy.
- `assets/css/problem.css`: delete the block marked `STANDALONE ONLY`. Everything else is prefixed `.pb-`.
- `assets/js/problem.js`: three self-contained pieces (map toggle, drawing reveal, chain collapse).
- The map layers in `assets/img/` are the same files as `wiki/assets/img/bigpicture/map/`.
- Sources for every number are listed in the HTML comment above each section.

Run locally: `python3 -m http.server` in this folder.
