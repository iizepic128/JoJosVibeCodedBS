import { readFileSync } from 'node:fs';
import { CHAPTER_PAGE_COUNTS } from './page-counts.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PARTS, completion, freshState, nextScheduledDate, progressFor, releaseFor, statusFor, syncSchedules, updateProgress, validateImport, validDate, mangaPagesFor, mangaPageTotals, journeyCompletion } from './model.ts';

test('starting catalog uses the supplied SBR 6 / JOJOLands 41 baseline', () => {
  const s = freshState();
  assert.equal(releaseFor(s, PARTS[6]).episodes, 6);
  assert.equal(releaseFor(s, PARTS[8]).chapters, 41);
  assert.equal(PARTS.reduce((n, p) => n + releaseFor(s, p).episodes, 0), 196);
  assert.equal(PARTS.reduce((n, p) => n + releaseFor(s, p).chapters, 0), 998);
});
test('progress stays within totals and does not cross formats', () => {
  let s = updateProgress(freshState(), PARTS[0], 'anime', 50);
  assert.equal(progressFor(s, 1).anime, 9);
  assert.equal(progressFor(s, 1).manga, 0);
  assert.equal(completion(s, PARTS[0], 'both'), 50);
  assert.equal(statusFor(s, PARTS[0], 'anime'), 'complete');
  assert.equal(statusFor(s, PARTS[0]), 'active');
  s = updateProgress(s, PARTS[0], 'manga', 44);
  assert.equal(statusFor(s, PARTS[0]), 'complete');
  s = updateProgress(s, PARTS[0], 'anime', -2);
  assert.equal(progressFor(s, 1).anime, 0);
});
test('unknown anime totals are excluded from format completion', () => {
  const s = updateProgress(freshState(), PARTS[7], 'manga', 110);
  assert.equal(statusFor(s, PARTS[7], 'anime'), 'uncataloged');
  assert.equal(statusFor(s, PARTS[7]), 'complete');
});
test('Friday release catches up exactly once and preserves watched progress', () => {
  const s = updateProgress(freshState(), PARTS[6], 'anime', 6);
  assert.equal(syncSchedules(s, '2026-10-22').state, s);
  const result = syncSchedules(s, '2026-10-23');
  assert.equal(result.added, 1);
  assert.equal(releaseFor(result.state, PARTS[6]).episodes, 7);
  assert.equal(progressFor(result.state, 7).anime, 6);
  assert.equal(result.state.schedules.sbr.nextRelease, '2026-10-30');
  assert.equal(syncSchedules(result.state, '2026-10-23').added, 0);
  assert.equal(syncSchedules(result.state, '2026-10-23').state, result.state);
  assert.equal(statusFor(result.state, PARTS[6], 'anime'), 'active');
});
test('missed Fridays and monthly releases catch up without changing read counts', () => {
  const s = updateProgress(freshState(), PARTS[8], 'manga', 41);
  const { state, added } = syncSchedules(s, '2026-11-20');
  assert.equal(releaseFor(state, PARTS[6]).episodes, 11);
  assert.equal(releaseFor(state, PARTS[8]).chapters, 42);
  assert.equal(progressFor(state, 9).manga, 41);
  assert.equal(state.schedules.jojolands.nextRelease, '2026-12-19');
  assert.equal(added, 6);
});
test('paused schedules do not accumulate releases', () => {
  const s = freshState();
  s.schedules.sbr.enabled = false;
  s.schedules.jojolands.enabled = false;
  const result = syncSchedules(s, '2027-07-19');
  assert.equal(result.state, s);
  assert.equal(result.added, 0);
});
test('monthly dates survive short months, leap years, and year boundaries', () => {
  assert.equal(nextScheduledDate('2026-01-31', 'monthly', 31), '2026-02-28');
  assert.equal(nextScheduledDate('2026-02-28', 'monthly', 31), '2026-03-31');
  assert.equal(nextScheduledDate('2028-01-31', 'monthly', 31), '2028-02-29');
  assert.equal(nextScheduledDate('2026-12-19', 'monthly', 19), '2027-01-19');
  assert.equal(nextScheduledDate('2026-12-25', 'weekly', 5), '2027-01-01');
  assert.equal(nextScheduledDate('2026-10-19', 'monthly', 19), '2026-11-19');
  assert.equal(validDate('2026-02-30'), false);
});
test('delayed releases respect the adjusted next date', () => {
  const s = freshState();
  s.schedules.sbr.nextRelease = '2026-11-06';
  assert.equal(syncSchedules(s, '2026-10-30').added, 0);
  const { state } = syncSchedules(s, '2026-11-06');
  assert.equal(releaseFor(state, PARTS[6]).episodes, 7);
});
test('backup roundtrip retains schedules, notes, favorites, and counts', () => {
  const s = syncSchedules(freshState(), '2026-11-20').state;
  s.progress[1] = { anime: 3, manga: 5, favorite: true, notes: '<script>just text</script>' };
  assert.deepEqual(validateImport(JSON.parse(JSON.stringify(s))), s);
});
test('malformed backups are rejected without mutating the existing state', () => {
  assert.throws(() => validateImport({}));
  const s = freshState();
  s.progress[1] = { anime: 10, manga: 0, favorite: false, notes: '' };
  assert.throws(() => validateImport(s), /exceeds/);
  assert.equal(s.progress[1].anime, 10);
  const badSchedule = freshState();
  badSchedule.schedules.sbr.nextRelease = '2026-10-22';
  assert.throws(() => validateImport(badSchedule), /Friday/);
  const badCoverage = freshState();
  badCoverage.releases[8] = { episodes: 0, chapters: 110, adapted: 3 };
  assert.throws(() => validateImport(badCoverage), /Invalid release/);
});

test('SBR uses individually sourced lengths across its publication change', () => {
  const s = freshState(), sbr = PARTS[6];
  assert.equal(mangaPagesFor(s, sbr, 22).read, 716);
  assert.equal(mangaPagesFor(s, sbr, 23).read, 753);
  assert.equal(mangaPagesFor(s, sbr, 24).read, 776);
  assert.equal(mangaPagesFor(s, sbr, 95).total, 4367);
  assert.equal(completion(updateProgress(s, sbr, 'manga', 23), sbr, 'manga'), 17);
  assert.equal(mangaPagesFor(s, PARTS[0], 1).read, 31);
  assert.equal(mangaPagesFor(s, PARTS[7], 1).read, 43);
});

test('overall manga weights pages across parts and combines formats equally', () => {
  let s = updateProgress(freshState(), PARTS[0], 'manga', 44);
  assert.deepEqual(mangaPageTotals(s), { read: 860, total: 25434, estimated: false, readEstimated: false });
  assert.equal(journeyCompletion(s, 'manga'), 3);
  const longPart = updateProgress(freshState(), PARTS[7], 'manga', 110);
  assert.equal(journeyCompletion(longPart, 'manga'), 19);
  for (const part of PARTS) s = updateProgress(s, part, 'anime', part.episodes);
  assert.equal(journeyCompletion(s, 'anime'), 100);
  assert.equal(journeyCompletion(s), 52);
  for (const part of PARTS) s = updateProgress(s, part, 'manga', part.chapters);
  assert.equal(journeyCompletion(s), 100);
});

test('custom totals preserve SBR phase weights and migrate through backups', () => {
  let s = updateProgress(freshState(), PARTS[6], 'manga', 23);
  s.mangaPages = { 7: { total: 8734, chapters: 95 } };
  assert.equal(mangaPagesFor(s, PARTS[6]).read, 1506);
  s = updateProgress(s, PARTS[6], 'manga', 24);
  assert.equal(mangaPagesFor(s, PARTS[6]).read, 1552);
  assert.equal(mangaPagesFor(s, PARTS[6]).total, 8734);
  assert.deepEqual(validateImport(JSON.parse(JSON.stringify(s))), s);
  const legacy = freshState();
  assert.deepEqual(validateImport(legacy), legacy);
  assert.equal(mangaPagesFor(validateImport(legacy), PARTS[6]).total, 4367);
});

test('scheduled chapters grow custom page estimates without advancing reading', () => {
  const s = updateProgress(freshState(), PARTS[8], 'manga', 41);
  s.mangaPages = { 9: { total: 1230, chapters: 41 } };
  const next = syncSchedules(s, '2026-11-19').state;
  assert.equal(mangaPagesFor(next, PARTS[8]).total, 1257);
  assert.equal(mangaPagesFor(next, PARTS[8]).read, 1230);
  assert.deepEqual(next.mangaPages, s.mangaPages);
  assert.equal(mangaPagesFor(syncSchedules(next, '2026-11-19').state, PARTS[8]).total, 1257);
  next.releases[9] = { episodes: 0, chapters: 0, adapted: 0 };
  assert.equal(mangaPagesFor(next, PARTS[8]).read, 0);
  assert.equal(mangaPagesFor(next, PARTS[8]).total, 0);
});

test('page totals reject malformed data and empty catalogs stay finite', () => {
  for (const pages of [null, [], { 7: { total: 10, chapters: 95 } }, { 7: { total: 4000, chapters: 0 } },
    { 7: { total: '4000', chapters: 95 } }, { 7: { total: 10000001, chapters: 95 } },
    { 7: { total: 4000.5, chapters: 95 } }, { 10: { total: 4000, chapters: 95 } }]) {
    assert.throws(() => validateImport({ ...freshState(), mangaPages: pages }), /page totals/);
  }
  const s = freshState();
  for (const part of PARTS) s.releases[part.id] = { episodes: 0, chapters: 0, adapted: 0 };
  assert.deepEqual(mangaPageTotals(s), { read: 0, total: 0, estimated: false, readEstimated: false });
  assert.equal(journeyCompletion(s), 0);
});


test('all 998 sourced chapter lengths agree with their saved provenance', () => {
  const source = JSON.parse(readFileSync(new URL('../data/manga-page-sources.json', import.meta.url), 'utf8'));
  let chapters = 0;
  for (const part of PARTS) {
    const rows = source.parts[part.id];
    assert.equal(rows.length, part.chapters);
    assert.deepEqual(CHAPTER_PAGE_COUNTS[part.id], rows.map((row: { pages: number }) => row.pages));
    rows.forEach((row: { chapter: number; pages: number; revision: number }, index: number) => {
      assert.equal(row.chapter, index + 1);
      assert.ok(Number.isInteger(row.revision) && row.revision > 0);
      assert.ok(Number.isInteger(row.pages) && row.pages > 0);
    });
    chapters += rows.length;
  }
  assert.equal(chapters, 998);
  assert.equal(CHAPTER_PAGE_COUNTS[1][18], 18); // Volume value; magazine lists 19.
  assert.equal(CHAPTER_PAGE_COUNTS[7][0], 53);
  assert.equal(CHAPTER_PAGE_COUNTS[7][23], 23);
  assert.equal(CHAPTER_PAGE_COUNTS[7][24], 65);
});

test('only unsourced future chapters add forecast pages; known reading stays exact', () => {
  const s = updateProgress(freshState(), PARTS[8], 'manga', 41);
  assert.equal(mangaPagesFor(s, PARTS[8]).estimated, false);
  const next = syncSchedules(s, '2026-11-19').state;
  const pages = mangaPagesFor(next, PARTS[8]);
  assert.equal(pages.read, 1756);
  assert.equal(pages.total, 1794);
  assert.equal(pages.sourcedChapters, 41);
  assert.equal(pages.estimated, true);
  assert.equal(pages.readEstimated, false);
  const readNew = updateProgress(next, PARTS[8], 'manga', 42);
  assert.equal(mangaPagesFor(readNew, PARTS[8]).readEstimated, true);
  assert.equal(mangaPagesFor(readNew, PARTS[8]).read, 1794);
});
