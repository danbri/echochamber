/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 *   SPDX-License-Identifier: Apache-2.0
 */
// Test helper: the parts of Apache Jena's SSE (org.apache.jena.sparql.sse.SSE,
// BuilderGraph, BuilderNode; Apache License 2.0) that the jena-arq
// sparql/core and sparql/transaction tests use to write test data:
// parseNode, parseTriple, parseQuad, parseGraph, parseDatasetGraph and
// buildDataset. Written for echochamber from the SSE syntax; no Jena code.
//
// It builds Nodes with leana's NodeFactory: `<iri>`, `:local` (SSE's default
// prefix ':' is <http://example/>), `_:label`, `_` (in the graph slot of a
// quad: Quad.defaultGraphNodeGenerated), integers (xsd:integer), "strings",
// ?vars.
//
// Changed for echochamber: a relative IRI (`<g>`, `<s>`) is resolved against
// the base `eh:/` (the scheme Jena's own NodeCreateUtils uses for bare names),
// so `<g>` is <eh:/g>. RDF 1.1 Concepts section 3.2 says the IRIs of the
// abstract syntax are absolute and @factoidal/core refuses a relative IRI
// (term.invalid-iri); in these tests the relative IRI is incidental test data.
// rel(x) applies the same rule to Jena's NodeFactory.createURI("g").

import { NodeFactory, Node, Triple, Quad, GraphFactory, DatasetGraphFactory } from '@factoidal/leana';

export const BASE = 'eh:/';
export const EX = 'http://example/';
const XSD = 'http://www.w3.org/2001/XMLSchema#';

/** A relative IRI string, made absolute against BASE (see the header). */
export const relIRI = (x) => (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(x) ? x : BASE + x);
/** NodeFactory.createURI(x) of the Jena test, with a relative x made absolute. */
export const rel = (x) => NodeFactory.createURI(relIRI(x));

function tokenize(str) {
  const toks = [];
  let i = 0;
  while (i < str.length) {
    const c = str[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(' || c === ')') { toks.push(c); i++; continue; }
    if (c === '<') { const j = str.indexOf('>', i); toks.push({ iri: str.slice(i + 1, j) }); i = j + 1; continue; }
    if (c === '"') {
      let j = i + 1, v = '';
      while (str[j] !== '"') { if (str[j] === '\\') { j++; v += ({ n: '\n', t: '\t' })[str[j]] ?? str[j]; } else v += str[j]; j++; }
      i = j + 1;
      let lang = null, dt = null;
      if (str[i] === '@') { const m = /^@[A-Za-z0-9-]+/.exec(str.slice(i)); lang = m[0].slice(1); i += m[0].length; }
      else if (str.startsWith('^^<', i)) { const j2 = str.indexOf('>', i); dt = str.slice(i + 3, j2); i = j2 + 1; }
      toks.push({ lit: v, lang, dt });
      continue;
    }
    const m = /^[^\s()]+/.exec(str.slice(i));
    toks.push({ word: m[0] });
    i += m[0].length;
  }
  return toks;
}

/** SSE.parse: nested arrays of tokens. */
export function parse(str) {
  const toks = tokenize(str);
  let i = 0;
  const item = () => {
    const t = toks[i++];
    if (t === '(') { const xs = []; while (toks[i] !== ')') xs.push(item()); i++; return xs; }
    return t;
  };
  return item();
}

function buildNode(t) {
  if (t.iri !== undefined) return NodeFactory.createURI(relIRI(t.iri));
  if (t.lit !== undefined) {
    if (t.lang) return NodeFactory.createLiteralLang(t.lit, t.lang);
    if (t.dt) return NodeFactory.createLiteralDT(t.lit, t.dt);
    return NodeFactory.createLiteralString(t.lit);
  }
  const w = t.word;
  if (w === '_') return Quad.defaultGraphNodeGenerated;
  if (w.startsWith('_:')) return NodeFactory.createBlankNode(w.slice(2));
  if (w.startsWith('?')) return NodeFactory.createVariable(w.slice(1));
  if (w === 'ANY') return Node.ANY;
  if (/^[+-]?\d+$/.test(w)) return NodeFactory.createLiteralDT(w, XSD + 'integer');
  if (/^[+-]?\d*\.\d+$/.test(w)) return NodeFactory.createLiteralDT(w, XSD + 'decimal');
  if (w === 'true' || w === 'false') return NodeFactory.createLiteralDT(w, XSD + 'boolean');
  if (w.startsWith(':')) return NodeFactory.createURI(EX + w.slice(1));
  throw new Error('sse: cannot read ' + w);
}

const isWord = (t, w) => t && typeof t === 'object' && !Array.isArray(t) && t.word === w;

export const parseNode = (str) => buildNode(tokenize(str)[0]);

function buildTriple(xs) {
  if (isWord(xs[0], 'triple')) xs = xs.slice(1);
  return Triple.create(buildNode(xs[0]), buildNode(xs[1]), buildNode(xs[2]));
}
function buildQuad(xs) {
  if (isWord(xs[0], 'quad')) xs = xs.slice(1);
  return Quad.create(buildNode(xs[0]), buildNode(xs[1]), buildNode(xs[2]), buildNode(xs[3]));
}
export const parseTriple = (str) => buildTriple(parse(str));
export const parseQuad = (str) => buildQuad(parse(str));

/** SSE.parseGraph("(graph (s p o) ...)"): a new in-memory graph. */
export function parseGraph(str) {
  const xs = parse(str);
  const g = GraphFactory.createDefaultGraph();
  for (const t of xs.slice(1)) g.add(buildTriple(t));
  return g;
}

/**
 * BuilderGraph.buildDataset(dsg, item): `(dataset (g s p o) ... (graph (s p o) ...) (graph <g> (s p o) ...))`
 * into `dsg`.
 */
export function buildDataset(dsg, xs) {
  if (typeof xs === 'string') xs = parse(xs);
  for (const x of xs.slice(1)) {
    if (isWord(x[0], 'graph')) {
      let rest = x.slice(1), gn = null;
      if (rest.length > 0 && !Array.isArray(rest[0])) { gn = buildNode(rest[0]); rest = rest.slice(1); }
      for (const t of rest) dsg.add(Quad.create(gn ?? Quad.defaultGraphNodeGenerated, buildTriple(t)));
    } else dsg.add(buildQuad(x));
  }
  return dsg;
}
/** SSE.parseDatasetGraph: a new DatasetGraphFactory.create() dataset. */
export const parseDatasetGraph = (str) => buildDataset(DatasetGraphFactory.create(), str);

// --- test helpers shared by the sparql-core files

/** Java List.contains / equals over leana objects. */
export const has = (xs, x) => xs.some((y) => y.equals(x));
/** Jena ListUtils.equalsUnordered. */
export function equalsUnordered(a, b) {
  if (a.length !== b.length) return false;
  const used = new Array(b.length).fill(false);
  for (const x of a) {
    const i = b.findIndex((y, k) => !used[k] && y.equals(x));
    if (i < 0) return false;
    used[i] = true;
  }
  return true;
}
