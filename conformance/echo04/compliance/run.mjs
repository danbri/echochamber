// Case runner for compliance.test.mjs: opens a case's data, runs its query
// or update on @factoidal/core, and judges the answer against the RDF4J
// expectation. Result equality is the engine's: result sets become graphs in
// the DAWG result-set vocabulary and core.isomorphic decides (blank nodes
// included). Original to echochamber (Apache-2.0).
import { core, srjTerm, resultSetQuads } from '../lib/harness.mjs';

const prefixTerm = (t, p) => (t.termType === 'BlankNode' ? core.dataFactory.blankNode(p + t.value) : t);
const show = (rows) => JSON.stringify(rows.map((m) => Object.fromEntries([...m].map(([k, t]) => [k, t.termType === 'Literal' && t.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string' ? `${t.value}^^${t.language ? '@' + t.language : t.datatype.value}` : t.value])))).slice(0, 600);

async function open(data) {
  if (!data) return core.openDataset('', { format: 'turtle' });
  return core.openDataset({ text: data.text, format: data.format, baseIRI: data.base });
}

async function sameRows(expRows, actRows, ordered) {
  if (expRows.length !== actRows.length) return { pass: false, detail: `rows: expected ${expRows.length}, got ${actRows.length}: ${show(actRows)}` };
  const a = await core.fromQuads(resultSetQuads(actRows.map((m) => new Map([...m].map(([k, t]) => [k, prefixTerm(t, 'a_')]))), ordered));
  const b = await core.fromQuads(resultSetQuads(expRows, ordered));
  const same = await core.isomorphic(a, b);
  return { pass: same, detail: same ? '' : 'result sets differ: got ' + show(actRows) };
}

const expRow = (r) => new Map(Object.entries(r).map(([k, t]) => [k, srjTerm(t, 'e_')]));

/** Judge one expectation against an answer (rows, boolean, or Dataset) or an error. */
async function check(exp, actual, error, ds) {
  if (exp.kind === 'error') return { pass: !!error, detail: error ? '' : 'expected an error, got an answer' };
  if (exp.kind === 'all') {
    for (const e of exp.of) { const o = await check(e, actual, error, ds); if (!o.pass) return o; }
    return { pass: true };
  }
  if (error) return { pass: false, detail: `${error.code}: ${error.message}` };
  switch (exp.kind) {
    case 'boolean': return { pass: actual === exp.value, detail: `got ${actual}` };
    case 'count': {
      const n = Array.isArray(actual) ? actual.length : actual?.size;
      return { pass: n === exp.n, detail: `expected ${exp.n}, got ${n}` + (Array.isArray(actual) ? ': ' + show(actual) : '') };
    }
    case 'bindings': {
      if (!Array.isArray(actual)) return { pass: false, detail: 'not a SELECT result' };
      const rows = exp.vars ? actual.map((m) => new Map([...m].filter(([k]) => exp.vars.includes(k)))) : actual;
      return sameRows(exp.rows.map(expRow), rows, !!exp.ordered);
    }
    case 'contains': {
      // Each expected row (no blank nodes) is a solution of the answer, by RDF/JS term equality.
      if (!Array.isArray(actual)) return { pass: false, detail: 'not a SELECT result' };
      for (const r of exp.rows) {
        const want = expRow(r);
        const hit = actual.some((m) => [...want].every(([k, t]) => m.get(k) && t.equals(m.get(k))) &&
          (!exp.exact || [...m.keys()].every((k) => want.has(k))));
        if (!hit) return { pass: false, detail: `missing ${JSON.stringify(r)}: got ${show(actual)}` };
      }
      return { pass: true };
    }
    case 'absent': {
      if (!Array.isArray(actual)) return { pass: false, detail: 'not a SELECT result' };
      for (const r of exp.rows) {
        const want = expRow(r);
        if (actual.some((m) => [...want].every(([k, t]) => m.get(k) && t.equals(m.get(k))))) return { pass: false, detail: `unexpected ${JSON.stringify(r)}` };
      }
      return { pass: true };
    }
    case 'unbound': {
      if (!Array.isArray(actual)) return { pass: false, detail: 'not a SELECT result' };
      const bad = actual.find((m) => exp.vars.some((v) => m.get(v) !== undefined));
      return { pass: !bad, detail: bad ? `bound: ${show([bad])}` : '' };
    }
    case 'graph': {
      if (!actual || typeof actual.size !== 'number') return { pass: false, detail: 'not a graph result' };
      const want = await open(exp);
      const same = await core.isomorphic(actual, want);
      return { pass: same, detail: same ? '' : `graphs differ: got ${actual.size} quads: ${actual.toNQuads().slice(0, 600)}` };
    }
    case 'graphContains': {
      if (!actual || typeof actual.size !== 'number') return { pass: false, detail: 'not a graph result' };
      const want = await open(exp);
      for (const q of want) if (!actual.has(q)) return { pass: false, detail: `missing ${q.subject.value} ${q.predicate.value} ${q.object.value}: got ${actual.toNQuads().slice(0, 600)}` };
      return { pass: true };
    }
    case 'store': {
      const want = await open(exp);
      const same = await core.isomorphic(ds, want);
      return { pass: same, detail: same ? '' : `store differs: ${ds.toNQuads().slice(0, 800)}` };
    }
    case 'asks': {
      for (const a of exp.asks) {
        let got;
        try { got = await ds.query(a.query, { version: '1.1' }); } catch (e) { return { pass: false, detail: `ask ${a.query}: ${e.code}: ${e.message}` }; }
        if (got !== a.value) return { pass: false, detail: `ask ${a.query.replace(/\s+/g, ' ').slice(0, 300)}: expected ${a.value}, got ${got}` };
      }
      return { pass: true };
    }
    default: throw new Error('unknown expectation kind ' + exp.kind);
  }
}

export async function runCase(c) {
  const version = c.sparql12 ? '1.2' : '1.1';
  let ds;
  try { ds = await open(c.data); } catch (e) { return { pass: false, detail: `data: ${e.code}: ${e.message}` }; }
  for (const u of c.setup || []) await ds.update(u);
  let actual; let error;
  try {
    if (c.update !== undefined) for (const u of [].concat(c.update)) await ds.update(u);
    else actual = await ds.query(c.query, { version });
  } catch (e) { error = e; }
  return check(c.expect, actual, error, ds);
}

