// Run one ported RDF4J Rio parser case on @factoidal/core. Original to
// echochamber, Apache-2.0. The cases (cases.json) are derived from Eclipse
// RDF4J, Eclipse Distribution License 1.0 (BSD-3-Clause).
//
// Every judgement is the engine's: core.parse decides accept or reject,
// Dataset.size gives the count, core.isomorphic decides graph equality.
import { core } from '../lib/harness.mjs';

// c.repeat = { marker, text, times }: a generated input (RDF4J builds some
// inputs with String.repeat); the marker in input and expected text is
// replaced by text repeated times.
const gen = (c, s) => (c.repeat && typeof s === 'string' ? s.split(c.repeat.marker).join(c.repeat.text.repeat(c.repeat.times)) : s);

export async function runCase(c) {
  const input = gen(c, c.input);
  const opts = { format: c.format, lenient: !!c.lenient };
  if (c.base) opts.baseIRI = c.base;
  const exp = c.expect;
  let ds;
  try {
    ds = await core.parse(input, opts);
  } catch (e) {
    if (exp.kind === 'reject') return { pass: true, detail: `${e.code}` };
    return { pass: false, detail: `rejected: ${e.code}: ${String(e.message).slice(0, 200)}` };
  }
  try {
    const nq = () => ds.toNQuads().slice(0, 400);
    if (exp.kind === 'reject') return { pass: false, detail: `accepted ${ds.size} quads: ${nq()}` };
    if (exp.kind === 'count') return { pass: ds.size === exp.n, detail: `expected ${exp.n} quads, got ${ds.size}: ${nq()}` };
    if (exp.kind === 'graph') {
      const same = await core.isomorphic(ds, { text: gen(c, exp.text), format: exp.format || 'nquads' });
      return { pass: same, detail: same ? '' : `graph differs: got ${nq()}` };
    }
    throw new Error('unknown expect kind ' + exp.kind);
  } finally {
    ds.dispose();
  }
}
