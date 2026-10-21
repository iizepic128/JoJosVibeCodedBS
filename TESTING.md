# UI verification

## Part 2 and Part 3 emblem update

The replacement emblems now use transparent monochrome outline masks so their ink color, tilt, and sizing match the other seven parts. Part 2 follows the supplied pendant reference: shield-shaped stone, central cross, suspension ring, and symmetrical side settings. Part 3 retains its cap/chain/star motif.

The emblems were checked in the rebuilt standalone HTML in Chromium at 1440, 390, and 320 pixels wide, in both library cards and part dialogs. Both embedded PNG masks decoded and inherited the card ink color without external requests, horizontal overflow, or JavaScript errors. Desktop and phone screenshots were visually reviewed. The production build and all 17 model tests passed again. Native Opera remains untested in this environment.

The current production bundle passed **27 UI scenarios** and all **17 model tests**. The UI suite covers sourced page-weighted progress, SBR chapter 23/24 lengths, editable totals, reset/undo, reload, backups, monthly growth without auto-reading, sourced-versus-forecast labels, and phone catalog validation. Model tests also verify every runtime count against the saved provenance for all 998 chapter entries. No unexpected JavaScript exceptions occurred. The TypeScript check and Vite production build passed. The separate original desktop/mobile smoke script passed before this update; the current full UI suite covers those workflows.

## Dedicated progress buttons

All formats now shows separate +1 episode and +1 chapter buttons for parts with cataloged anime, and a chapter button for manga-only parts. Format filters show their matching action. Buttons disable independently at released totals; editing, favorites, notes, undo, and saved progress remain available. Browser coverage checks all nine parts, independent increments, reload persistence, completion limits, and preservation of notes and favorites. Card layouts were checked at 1440, 390, and 320 pixels wide.

## Fixes made during the audit

- Replaced the decorative publication-order dropdown with a working sort control: publication order, most progress, or least progress.
- Kept quick-log actions within the selected format. Anime-only views no longer offer manga logging for uncataloged anime.
- Made import and export accessible on phone layouts, including an accessible name for the icon-only import button.
- Kept keyboard focus inside dialogs and the open mobile navigation drawer, restored focus on close, and added Escape handling for the drawer.
- Prevented the closed mobile sidebar from receiving focus or appearing as available navigation to assistive technology.
- Stopped partial adaptation coverage from rounding up to “Fully adapted.” Updated the explanatory text to reflect the current catalog rather than the initial defaults.

## Coverage

| Area | Checks performed |
| --- | --- |
| Navigation | All sidebar routes, home logo, hero start/continue behavior, completed-journey fallback, adaptation summary link, profile/help controls |
| Parts and timeline | All 45 opening controls across nine parts: artwork, title, detail arrow, timeline node, and adaptation row |
| Personal progress | Both steppers, minimum/maximum bounds, invalid input rejection, completion/caught-up actions, notes, favorite toggles, undo, cancel, and reload persistence |
| Library | All format/status filters, search by title/protagonist/location, keyboard search shortcut, clear search, empty states, and all three sort modes |
| Catalog | All 27 release-count fields, editable page totals, invalid chapter coverage, missing-anime validation, progress clamping, undo, cancel, page-total reset and bounds, and part-to-catalog navigation |
| Manga page weights | Individually sourced SBR chapter lengths, weighted franchise completion, custom totals retained across reload and backups, stable read estimates after a new monthly chapter, and mobile editing |
| Adaptation | Coverage rendering, lower-bound explanation, partial coverage near 100%, and catalog edit links |
| Release schedule | All opening buttons, both automatic-update toggles, counts, dates, Friday validation, monthly day, cancel/save, paused periods, resume behavior, timer-driven updates, and idempotent catch-up |
| Backups and storage | File chooser, malformed/oversized files, confirmation/cancel, export-current, import/undo, downloaded JSON contents, corrupt-save recovery, and storage-write failure with backup recovery |
| Keyboard | Tab wrapping, Escape, dialog backdrop, opener focus restoration, hidden navigation focus exclusion, and mobile drawer dismissal |
| Responsive layout | Page and dialog widths at 320, 390, 768, and 1024 pixels; desktop interactions at 1440 pixels; actual editing and backup actions at phone width |
| External links | Both reference links open the expected destination in a new tab, tested against controlled responses |

## Reproduce

Start the development server, then run:

```bash
npm test
python tests/browser_smoke.py
python tests/ui_audit.py
npm run build
```

To audit the production bundle, start `npm run preview -- --port 5175`, then run:

```bash
JOJO_TEST_URL=http://127.0.0.1:5175 python tests/ui_audit.py
```

Browser checks require Python Playwright and `/usr/bin/chromium`. They use isolated browser profiles and fixed dates, leaving real saved progress untouched.

## Scope

Browser validation used Chromium, including emulated phone layouts. Safari, Firefox, physical devices, and live external reference-site availability were not tested. The app's release updates remain schedule-based estimates; these tests verify the scheduling behavior, not publisher release announcements.

## Portable preview and Opera packaging

The production build now embeds all application code, fonts, styles, and artwork in a single HTML file. The exact packaged HTML was tested with the browser offline and a controlled local HTTP response: all nine parts rendered, progress could be logged and saved across reloads, and no external resources or JavaScript errors were observed.

A clean extracted project successfully installed its locked dependencies, built, and served the app with `npm start`. A subsequent launch reused dependencies and rebuilt successfully. Busy/invalid ports produced clear errors, and stopping the launcher stopped its child server.

The same 23 UI scenarios were rerun against the portable production HTML over HTTP. Direct `file:` navigation is blocked by this environment's administrator policy, so local-file opening could not be tested here. Opera is not installed, and the official Opera download host was blocked by the network proxy. Chromium tests provide engine compatibility evidence, but native Opera, Opera GX, and the Windows/macOS launcher files were not executed in this Linux environment. Manual Opera instructions are included as a fallback to the launchers.

## Reference availability and data scope

JoJo Wiki and VIZ became accessible with HTTP 200 responses after the network settings changed. Chapter page counts were retrieved from JoJo Wiki’s chapter infoboxes through its public API on October 20, 2026. The dataset covers all 998 baseline catalog chapters. Explicit Volume counts take precedence over Magazine counts. Source titles and revision IDs are saved in `data/manga-page-sources.json`; `data/README.md` records per-part sums and source discrepancies.

Future scheduled chapters beyond the dataset still use labeled forecasts. Custom edition totals proportionally scale sourced lengths and are marked as estimates. The verification checks the app’s calculations and agreement with its cited source records; it does not certify every printed edition or live release announcement. The corrected Part 2 emblem follows the user-supplied pendant image.
