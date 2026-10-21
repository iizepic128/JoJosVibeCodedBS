# Manga page-count sources

Retrieved from JoJo Wiki on **October 20, 2026**, through its public MediaWiki API. Only numerical chapter lengths and source identifiers are included. Each entry in `manga-page-sources.json` records its chapter number, wiki title, revision ID, selected page count, and selection basis. Open a saved revision at `https://jojowiki.com/index.php?oldid=REVISION_ID`.

Selection: use the **Volume** value where an entry explicitly distinguishes Volume and Magazine counts; otherwise use its unqualified listed count. All 998 current catalog chapters have a source entry. The runtime arrays in `src/page-counts.ts` match these records, checked by the model tests.

| Part | Chapter entries | Sum of chapter pages |
| --- | ---: | ---: |
| Phantom Blood | 44 | 860 |
| Battle Tendency | 69 | 1,319 |
| Stardust Crusaders | 152 | 2,951 |
| Diamond Is Unbreakable | 174 | 3,355 |
| Golden Wind | 155 | 2,994 |
| Stone Ocean | 158 | 3,119 |
| Steel Ball Run | 95 | 4,367 |
| JoJolion | 110 | 4,713 |
| The JOJOLands | 41 | 1,756 |
| **Total** | **998** | **25,434** |

## Scope and discrepancies

These sums represent the individual chapter infoboxes, not whole-volume page counts. Covers, bonus sections, edition differences, and inconsistent source summaries can affect comparisons. For example, the Steel Ball Run part summary lists 4,394 volume pages, while its individual chapter entries selected under the rule above sum to 4,367. The difference has not been reconciled; the app uses the documented chapter entries consistently for reading progress.

Examples: [SBR chapter 1](https://jojowiki.com/SBR_Chapter_1) lists 53 pages; [chapter 24](https://jojowiki.com/SBR_Chapter_24) lists 23 pages and identifies the move to Ultra Jump; [chapter 25](https://jojowiki.com/SBR_Chapter_25) lists 65 pages. The [chapter list](https://jojowiki.com/Steel_Ball_Run/Chapter_List) describes the publication change. Thus the move to monthly serialization is represented by actual listed chapter lengths, not an assumption that every monthly chapter has the same length.

Future chapters beyond the snapshot are marked as estimates and use the rounded mean of the last six sourced chapters for that part. For The JOJOLands this currently gives 38 pages per additional chapter. New chapter data must be added in a later app update; scheduled release counts do not constitute verified release announcements.
