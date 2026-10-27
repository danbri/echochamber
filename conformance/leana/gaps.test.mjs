// Check that packages/leana/GAPS.md lists every unsupported(method, gap) call of
// packages/leana/src under its gap key, and that every key has the issue of GAPS.
// Apache License 2.0. Written for echochamber.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { GAPS } from '@factoidal/leana';

const src = 'packages/leana/src';
const md = readFileSync('packages/leana/GAPS.md', 'utf8');
const sections = Object.fromEntries(md.split(/^## /m).slice(1).map((s) => [s.split(':')[0].trim(), s]));

test('every unsupported() call is listed in GAPS.md under its key', () => {
  const missing = [];
  for (const f of readdirSync(src).filter((f) => f.endsWith('.mjs'))) {
    for (const m of readFileSync(`${src}/${f}`, 'utf8').matchAll(/unsupported\('([^']+)', '([a-z0-9-]+)'\)/g)) {
      const [, method, key] = m;
      assert.ok(key in GAPS, `${f}: unknown gap key ${key}`);
      if (!sections[key] || !sections[key].includes('`' + method + '`')) missing.push(`${key}: ${method}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('every gap key has a section with its issue', () => {
  for (const [k, g] of Object.entries(GAPS)) {
    assert.ok(sections[k], `GAPS.md has no section ${k}`);
    if (g.issue) assert.ok(sections[k].includes(g.issue), `GAPS.md section ${k} does not cite ${g.issue}`);
  }
});
