// Runs the shouldSerialize cases of N3.js test/N3Writer-test.js (extracted
// into writer-cases.mjs; MIT, see that file's notice) against the Writer of
// the N3.js-style echo. As upstream: each quad is added with addQuad, the
// writer is ended, and the output text must equal the expected text.
//
// A failure message starts with a class the triage reads:
//   [relative-iri]   a term is not an absolute IRI; the engine refuses it
//   [layout]         the text differs, but both texts parse to isomorphic
//                    datasets (the engine decides both)
//   [content]        the text differs and is not isomorphic (or does not parse)
// Hand-written `it` blocks (kind 'code') are not ported: counted in
// docs/enthie/feasibility.md.
import * as core from '@factoidal/core';
import { Writer, DataFactory, ready } from '@factoidal/enthie';
import { cases } from './n3js/writer-cases.mjs';
import { termFromId } from './n3js/support.mjs';
import { vtest } from './harness.mjs';

await ready();

// A quad component: an N3.js id string, or a term the test built
// ({term: {termType, value}} from the extractor).
function termOf(t) {
  if (t === null || t === undefined) return undefined;
  if (typeof t === 'string') return termFromId(t, DataFactory);
  const d = t.term || t;
  if (d.termType === 'NamedNode') return DataFactory.namedNode(d.value);
  if (d.termType === 'BlankNode') return DataFactory.blankNode(d.value);
  if (d.termType === 'Id' || d.termType === 'LiteralId') return termFromId(d.value, DataFactory);
  throw new Error(`[content] term not handled by this runner: ${JSON.stringify(t)}`);
}
// N3.js Writer options; a prefix IRI may be a NamedNode.
function optionsOf(o) {
  if (!o) return {};
  const out = { ...o };
  if (o.prefixes) {
    out.prefixes = {};
    for (const [k, v] of Object.entries(o.prefixes)) out.prefixes[k] = typeof v === 'string' ? v : (v.term || v).value;
  }
  return out;
}

async function parsesTo(text) {
  try { return await core.parse(text, 'trig12'); } catch { return null; }
}

const seen = new Map();
for (const c of cases) {
  if (c.kind !== 'serialize') continue;
  let id = `n3js-writer > ${[...c.path, c.name].join(' > ')}`;
  const n = (seen.get(id) || 0) + 1; seen.set(id, n); if (n > 1) id += ` (${n})`;
  vtest(id, async () => {
    const writer = new Writer(optionsOf(c.prefixes));
    for (const q of c.quads) {
      writer.addQuad(DataFactory.quad(termOf(q[0]), termOf(q[1]), termOf(q[2]), termOf(q[3])));
    }
    let text;
    try {
      text = await writer.end();
    } catch (e) {
      if (e.code === 'term.invalid-iri') throw new Error(`[relative-iri] ${e.message}`);
      if (e.name === 'UnsupportedError') throw new Error(`[unsupported] ${e.message}`);
      throw e;
    }
    if (text === c.expected) return;
    const a = await parsesTo(text), e = await parsesTo(c.expected);
    const iso = a && e && await core.isomorphic(a, e);
    a && a.dispose(); e && e.dispose();
    throw new Error(`[${iso ? 'layout' : 'content'}] output ${JSON.stringify(text)}, expected ${JSON.stringify(c.expected)}`);
  });
}
