// Shared code for the hand-ported RDF4J Rio parser cases (echo04).
// Original to echochamber, Apache-2.0. The port modules rio-port-*.mjs hold
// data derived from Eclipse RDF4J (EDL 1.0, BSD-3-Clause).
//
// A port module default-exports:
//   { file: '<path in the rdf4j tree>', class: 'TestClass',
//     defaults: { format, base },            // optional
//     cases: [{ m: 'method', input, expect, format?, base?, lenient?, note?, suffix? }],
//     repeat?: { marker, text, times } replaces marker in input and expected text by text repeated times
//     (several cases of one method get ids Class#method#1.. or Class#method#<suffix>)
//     notPorted: [{ m: 'method', reason }] }
// expect shorthand: { reject: true } | { count: N } | { graph: 'N-Quads', format? }
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const RDF4J = process.env.RDF4J || join(process.env.HOME, 'working/sandbox/october/echo-upstream/rdf4j');
export const HERE = new URL('.', import.meta.url).pathname;

/** Test methods of a Java file: [{ name, line }] in source order. */
export function testMethods(path) {
  const lines = readFileSync(join(RDF4J, path), 'utf8').split('\n');
  const out = []; let pending = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*@(Test|ParameterizedTest|RepeatedTest|TestFactory)\b/.test(l)) pending = true;
    if (pending) {
      const m = l.match(/\b(?:void|Stream<[^>]*>|Collection<[^>]*>)\s+(\w+)\s*\(/);
      if (m) { out.push({ name: m[1], line: i + 1 }); pending = false; }
    }
  }
  return out;
}

export async function loadPorts(names) {
  const files = names && names.length ? names.map((n) => (n.startsWith('rio-port-') ? n : `rio-port-${n}`).replace(/(\.mjs)?$/, '.mjs'))
    : readdirSync(HERE).filter((f) => /^rio-port-.*\.mjs$/.test(f)).sort();
  const mods = [];
  for (const f of files) mods.push((await import(join(HERE, f))).default);
  return mods.flat();
}

function expand(e) {
  if (e.reject) return { kind: 'reject' };
  if (e.count !== undefined) return { kind: 'count', n: e.count };
  if (e.graph !== undefined) return { kind: 'graph', format: e.format || 'nquads', text: e.graph };
  if (e.kind) return e;
  throw new Error('bad expect ' + JSON.stringify(e));
}

/** Build cases and notPorted from port modules; check coverage of every test method. */
export function build(mods) {
  const cases = []; const notPorted = []; const perFile = []; const problems = [];
  for (const mod of mods) {
    const methods = testMethods(mod.file);
    const lineOf = new Map(methods.map((x) => [x.name, x.line]));
    const seen = new Map();
    const byM = new Map();
    for (const c of mod.cases) { if (!byM.has(c.m)) byM.set(c.m, []); byM.get(c.m).push(c); }
    for (const [m, list] of byM) {
      if (!lineOf.has(m)) problems.push(`${mod.class}: case for unknown method ${m}`);
      list.forEach((c, i) => {
        const id = `${mod.class}#${m}` + (c.suffix ? `#${c.suffix}` : list.length > 1 ? `#${i + 1}` : '');
        const d = mod.defaults || {};
        const o = { id, file: mod.file, line: c.line || lineOf.get(m), format: c.format || d.format, base: c.base !== undefined ? c.base : d.base, input: c.input, lenient: !!(c.lenient ?? d.lenient), expect: expand(c.expect) };
        if (o.base === null || o.base === undefined) delete o.base;
        if (c.repeat) o.repeat = c.repeat;
        if (c.note) o.note = c.note;
        if (typeof o.input !== 'string') problems.push(`${id}: input not a string`);
        if (!o.format) problems.push(`${id}: no format`);
        cases.push(o);
      });
      seen.set(m, 'ported');
    }
    for (const n of mod.notPorted || []) {
      if (!lineOf.has(n.m)) problems.push(`${mod.class}: notPorted unknown method ${n.m}`);
      if (seen.has(n.m)) problems.push(`${mod.class}: ${n.m} both ported and notPorted`);
      if (!n.reason) problems.push(`${mod.class}: ${n.m} notPorted without reason`);
      seen.set(n.m, 'not');
      notPorted.push({ id: `${mod.class}#${n.m}`, file: mod.file, line: lineOf.get(n.m), reason: n.reason });
    }
    for (const x of methods) if (!seen.has(x.name)) problems.push(`${mod.class}: method ${x.name} (line ${x.line}) neither ported nor notPorted`);
    perFile.push({ file: mod.file, class: mod.class, methods: methods.length, ported: [...seen.values()].filter((v) => v === 'ported').length, notPorted: (mod.notPorted || []).length, cases: mod.cases.length });
  }
  const ids = new Set(); for (const c of cases) { if (ids.has(c.id)) problems.push('duplicate id ' + c.id); ids.add(c.id); }
  return { cases, notPorted, perFile, problems };
}
