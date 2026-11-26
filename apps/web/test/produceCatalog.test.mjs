import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCE_GROUPS,
  SEASONS,
  catalogSummaryCounts,
  filterProduceCatalog,
  produceCatalog,
} from '../src/produceCatalog.mjs';

test('produce catalog includes comprehensive Indian fruits, vegetables, and staples', () => {
  const counts = catalogSummaryCounts();
  assert.ok(counts.total >= 80, `expected >= 80 crops, got ${counts.total}`);
  assert.ok(counts.fruits >= 25, `expected >= 25 fruit entries, got ${counts.fruits}`);
  assert.ok(counts.vegetables >= 45, `expected >= 45 vegetable entries, got ${counts.vegetables}`);

  for (const group of ['fruits', 'vegetables', 'gourds', 'leafy', 'exotic', 'staples']) {
    assert.ok(
      produceCatalog.some((item) => item.group === group),
      `missing produce group ${group}`,
    );
  }

  for (const item of produceCatalog) {
    assert.ok(item.id && item.name && item.nameHi);
    assert.ok(Array.isArray(item.varieties) && item.varieties.length > 0);
    assert.ok(Array.isArray(item.origins) && item.origins.length > 0);
    assert.ok(['kg', 'quintal', 'tonne', 'crate', 'box'].includes(item.unit));
    assert.ok(item.typicalMoq > 0);
  }
});

test('produce directory search and filters work across English, Hindi, varieties, and seasons', () => {
  assert.ok(PRODUCE_GROUPS.length >= 6);
  assert.ok(SEASONS.length >= 4);

  const mangoes = filterProduceCatalog(produceCatalog, { search: 'Alphonso' });
  assert.equal(mangoes[0].id, 'fruit-mango');

  const hindiSearch = filterProduceCatalog(produceCatalog, { search: 'भिंडी' });
  assert.equal(hindiSearch[0].id, 'veg-okra');

  const winterFruits = filterProduceCatalog(produceCatalog, {
    group: 'fruits',
    season: 'Winter',
  });
  assert.ok(winterFruits.some((item) => item.id === 'fruit-apple'));
  assert.ok(winterFruits.every((item) => item.group === 'fruits' && item.season === 'Winter'));
});
