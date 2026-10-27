// Bring the method lists of packages/leana/GAPS.md in line with the
// unsupported(method, gap) calls in packages/leana/src: add each missing
// method under its key, and (with --prune) drop bullets that no call names.
// Bullets that name no call are kept unless --prune is given; check them by
// hand (some name a "noThrow" case, a different answer rather than an error).
// Usage, from the repository root: node tools/leana-study/gaps-sync.mjs [--prune]
// Apache License 2.0. Written for echochamber.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const src = 'packages/leana/src';
const calls = {};
for (const f of readdirSync(src).filter((f) => f.endsWith('.mjs'))) {
  for (const m of readFileSync(`${src}/${f}`, 'utf8').matchAll(/unsupported\('([^']+)', '([a-z0-9-]+)'\)/g)) {
    (calls[m[2]] ||= new Set()).add(m[1]);
  }
}
const prune = process.argv.includes('--prune');
const md = readFileSync('packages/leana/GAPS.md', 'utf8');
const parts = md.split(/^(?=## )/m);
const out = parts.map((part) => {
  const key = /^## ([a-z0-9-]+):/.exec(part)?.[1];
  if (!key || !calls[key] && !prune) return part;
  const lines = part.split('\n');
  const first = lines.findIndex((l) => l.startsWith('- `'));
  if (first < 0) return part;
  let last = first;
  while (last + 1 < lines.length && lines[last + 1].startsWith('- `')) last++;
  const have = lines.slice(first, last + 1).map((l) => /^- `(.*)`$/.exec(l)?.[1]).filter(Boolean);
  const want = new Set(calls[key] || []);
  let keep = prune ? have.filter((h) => want.has(h)) : have;
  for (const w of want) if (!keep.includes(w)) keep.push(w);
  keep = [...new Set(keep)].sort((a, b) => a.localeCompare(b));
  for (const h of have) if (!want.has(h)) console.log(`${prune ? 'drop' : 'keep (no call)'} ${key}: ${h}`);
  return [...lines.slice(0, first), ...keep.map((k) => '- `' + k + '`'), ...lines.slice(last + 1)].join('\n');
});
writeFileSync('packages/leana/GAPS.md', out.join(''));
