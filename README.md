# JoJosVibeCodedBS — JoJo Journey

A responsive, local-first tracker for the nine main parts of JoJo’s Bizarre Adventure. Built with React, TypeScript, and Vite, with original SVG illustrations, custom part emblems, and bundled fonts. Battle Tendency features a simplified Red Stone of Aja pendant based on the supplied reference, with a shield-shaped stone, central cross, suspension ring, and symmetrical side settings; Stardust Crusaders features a cap, chain, and Joestar star. Both emblems use thin monochrome outlines, inherit their card’s ink color, and share the other parts’ scale and tilt. They are bundled into the standalone HTML for offline use.

## Easiest preview: no setup

**[Download the complete app ZIP](https://github.com/iizepic128/JoJosVibeCodedBS/raw/refs/heads/main/jojo-journey.zip)**

Open **JoJo-Journey.html** from the downloadable bundle directly in your browser. It contains the complete app, including fonts and artwork, and works without Node or a server. Keep the file in the same location for consistent browser storage. Use export/import to move progress between the standalone file and a server preview.

### Opera / Opera GX

Extract the ZIP first. On Windows, double-click **Open in Opera.cmd**. On macOS, use **Open in Opera.command**. These launchers open the included HTML file with an installed Opera or Opera GX.

You can also open it directly from Opera with **Ctrl+O** (**Command+O** on Mac), then select **JoJo-Journey.html**. This works on Linux too. No server or installation is required. Use a current Opera version. If the operating system blocks a launcher, use Opera's Open File command instead.

## One-command project preview

Requires Node.js 22.13+ (validated with Node 24.19.0). Open a terminal in this project folder and run:

```bash
npm start
```

The launcher installs the locked dependencies when needed, builds the current source, and starts the preview on **port 5174**. `npm run preview` is an equivalent command; no separate installation or build command is needed. Keep the terminal running. Use `npm start -- --open` to also open your desktop browser.

If another server already uses port 5174, stop it first or run `npm start -- --port 5175`. The launcher does not silently change ports because browser saves belong to a specific address. Export/import transfers progress between addresses. File-based browser saving varies by browser; the app offers backups if local storage is unavailable.

For development with automatic updates, run `npm run dev` after the first setup. `npm run build` refreshes both `dist/index.html` and `JoJo-Journey.html`; either can be copied on its own without asset folders. No hosted deployment or embedded chat preview is configured.

## Features

- Nine illustrated part cards with independent anime and manga progress, quick logging, notes, favorites, and undo.
- Manga completion weighted by estimated pages, including Steel Ball Run’s weekly-to-monthly chapter-length change and editable page totals per part.
- A visual timeline showing story eras and publication order across the original and alternate continuities.
- Overview totals, per-format completion, searching, status filters, and sorting by publication order or progress.
- Adaptation coverage based on manga chapters covered by anime, independent of personal progress.
- Automatic release estimates for Steel Ball Run every Friday and The JOJOLands monthly on the 19th.
- Editable counts and schedules, including pauses, delayed dates, and monthly day changes.
- Local storage, JSON export/import with validation, and preservation of unreadable stored data.
- Mobile navigation, keyboard-accessible dialogs, reduced-motion support, and no third-party runtime asset requests.

## Manga progress by pages

Continue logging completed chapters. The app estimates the pages read through that chapter and uses **sum of pages read / sum of pages available** for the overall manga percentage. Longer parts contribute more than shorter parts. Anime uses episodes watched / episodes available; All formats averages the anime and manga percentages equally. Per-part manga bars and progress sorting also use page weights.

The current fallback model uses **20 pages per chapter for Parts 1–6**, **20 for Steel Ball Run chapters 1–23 and 40 from chapter 24 onward**, and **40 for JoJolion and The JOJOLands**. These are deliberately labeled rough estimates, not verified page counts. Individual chapters vary, including long opening chapters. Reference-site requests were blocked by this environment’s proxy, so no sourced chapter-by-chapter page dataset is claimed.

In **Release catalog → Manga page totals**, enter the total pages for the currently released chapters in your edition. The app scales its chapter estimates to match that total while retaining SBR’s weekly/monthly distinction. Clearing a field restores the default model. Even with a real total entered, pages read are estimated between chapter boundaries because individual chapter lengths have not been supplied.

Each custom total retains the chapter count it was entered against. Future scheduled chapters add pages using the same scale, so already-read pages do not increase automatically. Editing a page total recalibrates the estimate; it never changes your logged chapters. All overrides are included in backups, and older saves without page fields continue to work. Adaptation coverage remains chapter-based.

## Release schedules and source assumptions

The user supplied **Steel Ball Run episode 6** and **The JOJOLands chapter 41** as the current counts on **October 19, 2026**. Accordingly, the next default updates are October 23, 2026 (episode 7) and November 19, 2026 (chapter 42).

Counts advance on the device’s local calendar at midnight. The app checks on startup, when returning to the tab, and once per minute while open. Missed dates catch up once. Closing the app does not run a background job; the same result is calculated when it is reopened. Pausing stops accumulation. Resuming a past-due schedule selects the next future release date instead of backfilling the pause.

These are **scheduled estimates, not a verified publisher feed**. Adjust the schedule for breaks and delays. Official release sites were unavailable from the build environment. Adapted chapter counts remain manual: anime episodes do not correspond to a fixed number of chapters. Parts 1–6 are cataloged as fully adapted; Steel Ball Run has six episodes but its adapted chapter total is unset, so overall coverage displays a lower bound until that total is supplied. Zero anime totals mean unlisted in this catalog, not confirmation of an unreleased adaptation. OVAs, films, and spin-offs are outside this tracker’s scope.

Personal watched/read counts never advance automatically. The default library is empty of personal progress. `src/model.ts` holds the stable catalog and schedule math; `src/ReleaseSchedule.tsx` provides schedule controls.

## Validation

```bash
npm test
npm run build
```

The 15 model tests cover progress bounds, independent formats, Friday/monthly catch-up, idempotency, pauses, delays, short months, leap years, backup validation, page-weighted totals, SBR’s chapter-23/24 transition, custom page totals, legacy saves, and stable reading progress after new releases.

For browser checks, keep the dev server running and use an environment with Python Playwright and Chromium installed:

```bash
python tests/browser_smoke.py
python tests/ui_audit.py
```

The smoke checks cover editing, undo, notes, favorites, filtering, adaptation, persistence, date advancement, schedule pause/resume, backups, mobile layout, and corrupt storage recovery. The full UI audit runs 25 isolated scenarios covering every navigation route, all 45 part-opening controls, format-specific actions, sorting, all 27 catalog fields, keyboard focus and Escape handling, phone backup actions, empty/completed libraries, storage-failure recovery, editable page totals, page-count backup data, monthly page growth, and phone page-total controls. Each scenario uses a clean profile and a fixed clock. External reference links are tested with controlled destination responses; availability of the actual external services is not asserted.

To test a production preview on a different port, set `JOJO_TEST_URL`, for example `JOJO_TEST_URL=http://127.0.0.1:5175 python tests/ui_audit.py`.

No login, backend, or cloud synchronization is configured. Progress is stored under `jojo-journey-v1` in this browser; export a backup before moving devices or clearing browser data.

This is an unofficial fan tracker. JoJo’s Bizarre Adventure belongs to Hirohiko Araki, Shueisha, and the respective rights holders.
