// Runs the data-driven cases of N3.js test/N3Parser-test.js (extracted into
// parser-cases.mjs; MIT, see that file's notice) against the Parser of the
// N3.js-style echo. The upstream helpers are re-implemented here:
//
// - shouldParse: N3.js compares the sorted JSON of the quads, blank node
//   labels included. Here the comparison is RDF dataset isomorphism, decided
//   by the engine (core.isomorphic), because blank node labels are the
//   parser's choice (RDF 1.2 Concepts section 3.5) and N3.js's tests pin
//   N3.js's own label scheme (b0_..., reset between tests).
// - shouldNotParse: the parse must fail. N3.js also compares the message
//   text; messages are not compared here (the engine's messages differ, and
//   no specification fixes them). An UnsupportedError is not a rejection.
// - itShouldResolve: the object IRI of `<urn:ex:s> <urn:ex:p> <rel>.` parsed
//   with the base must equal the expected IRI (as upstream).
// - Hand-written `it` blocks (kind 'code') are not ported: counted in
//   docs/echo03/feasibility.md.
import { before } from 'node:test';
import * as core from '@factoidal/core';
import { Parser, DataFactory, UnsupportedError, ready } from '@factoidal/echo03';
import { cases } from './n3js/parser-cases.mjs';
import { mapToQuad } from './n3js/support.mjs';
import { vtest } from './harness.mjs';

const BASE_IRI = 'http://example.org/';
await ready();

function parseAll(options, input) {
  return new Promise((resolve, reject) => {
    const quads = [];
    new Parser(options).parse(input, (error, quad) => {
      if (error) reject(error);
      else if (quad) quads.push(quad);
      else resolve(quads);
    });
  });
}

async function sameDataset(actual, expected) {
  const a = await core.fromQuads(actual);
  const e = await core.fromQuads(expected);
  try {
    if (!(await core.isomorphic(a, e))) {
      throw new Error(`not isomorphic.\nactual:\n${a.toNQuads()}\nexpected:\n${e.toNQuads()}`);
    }
  } finally { a.dispose(); e.dispose(); }
}

const seen = new Map();
export function caseId(prefix, c) {
  let id = `${prefix} > ${[...c.path, c.name].join(' > ')}`;
  const n = (seen.get(id) || 0) + 1;
  seen.set(id, n);
  if (n > 1) id += ` (${n})`;
  return id;
}

for (const c of cases) {
  if (c.kind === 'code' || c.kind === 'code-dynamic') continue;
  const id = caseId('n3js-parser', c);
  switch (c.kind) {
    case 'parse':
    case 'parse-comments':
      vtest(id, async () => {
        const actual = await parseAll(c.options, c.input);
        const expected = c.expected.map((item) => mapToQuad(item, DataFactory, BASE_IRI));
        await sameDataset(actual, expected);
      });
      break;
    case 'comments':
      vtest(id, async () => {
        const comments = [];
        await new Promise((resolve, reject) => new Parser(c.options).parse(c.input, {
          onQuad: (e, q) => { if (e) reject(e); else if (!q) resolve(); },
          onComment: (x) => comments.push(x),
        }));
        if (JSON.stringify(comments) !== JSON.stringify(c.expected)) {
          throw new Error(`comments ${JSON.stringify(comments)}, expected ${JSON.stringify(c.expected)}`);
        }
      });
      break;
    case 'not-parse':
    case 'not-parse-comments':
      vtest(id, async () => {
        let error = null;
        try { await parseAll(c.options, c.input); } catch (e) { error = e; }
        if (!error) throw new Error(`parsed; expected the error ${JSON.stringify(c.expectedError)}`);
        if (error instanceof UnsupportedError) throw error;
      });
      break;
    case 'resolve':
      vtest(id, async () => {
        const quads = await parseAll({ baseIRI: c.baseIRI }, `<urn:ex:s> <urn:ex:p> <${c.relativeIri}>.`);
        if (!quads.length || quads[0].object.value !== c.expected) {
          throw new Error(`resolved to ${quads.length ? quads[0].object.value : '(nothing)'}, expected ${c.expected}`);
        }
      });
      break;
    default:
      throw new Error(`unknown case kind ${c.kind}`);
  }
}
