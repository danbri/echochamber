// Derived from RDFLib (https://github.com/RDFLib/rdflib, commit
// 58c3700e5e21b5b833d0e31072f930c665059db2), test/data/variants/*.py and
// test/utils/namespace/__init__.py. RDFLib: Copyright (c) 2002-2026, RDFLib
// Team. BSD 3-Clause License (see data/LICENSE-RDFLib).
// Changes: each populate_graph() is written as a list of RDF/JS quads.
// Literal(12) is written as the term RDFLib maps it to ("12"^^xsd:integer)
// and Literal("typeless") as a simple literal; no Python value is mapped in JS.
import { dataFactory as df } from '@factoidal/core';
const EGDO = 'http://example.org/', EGSCHEME = 'example:', EGURN = 'urn:example:', EGDC = 'http://example.com/';
const XSD = 'http://www.w3.org/2001/XMLSchema#';
const n = (ns, l) => df.namedNode(ns + l);
const q = (s, p, o, g) => df.quad(s, p, o, g ?? df.defaultGraph());
export const PYTHON_VARIANTS = {
  simple_triple: () => [q(n(EGDO, 'subject'), n(EGDO, 'predicate'), n(EGDO, 'object'))],
  simple_quad: () => [q(n(EGDO, 'subject'), n(EGDO, 'predicate'), n(EGDO, 'object'), n(EGDO, 'graph'))],
  diverse_triples: () => [
    q(n(EGDC, 'subject'), n(EGDC, 'predicate'), df.literal('日本語の表記体系', 'jpx')),
    q(n(EGURN, 'subject'), n(EGSCHEME, 'predicate'), n(EGSCHEME, 'subject')),
    q(n(EGSCHEME, 'object'), n(EGDC, 'predicate'), df.literal('XSD string')),
    q(n(EGSCHEME, 'subject'), n(EGSCHEME, 'predicate'), n(EGSCHEME, 'object')),
    q(n(EGSCHEME, 'subject'), n(EGSCHEME, 'predicate'), df.literal('12', df.namedNode(XSD + 'integer'))),
  ],
  diverse_quads: () => {
    const gs = n(EGSCHEME, 'graph'), gu = n(EGURN, 'graph');
    return [
      q(n(EGSCHEME, 'subject'), n(EGSCHEME, 'predicate'), n(EGSCHEME, 'object')),
      q(n(EGDC, 'subject'), n(EGDC, 'predicate'), df.literal('typeless')),
      q(n(EGURN, 'subject'), n(EGURN, 'predicate'), n(EGURN, 'object')),
      q(n(EGDC, 'subject'), n(EGDC, 'predicate'), df.literal('日本語の表記体系', 'jpx'), gs),
      q(n(EGURN, 'subject'), n(EGSCHEME, 'predicate'), n(EGSCHEME, 'subject'), gs),
      q(n(EGSCHEME, 'subject'), n(EGSCHEME, 'predicate'), n(EGSCHEME, 'object'), gs),
      q(n(EGSCHEME, 'subject'), n(EGSCHEME, 'predicate'), df.literal('12', df.namedNode(XSD + 'integer')), gs),
      q(n(EGSCHEME, 'subject'), n(EGSCHEME, 'predicate'), n(EGSCHEME, 'object'), gu),
      q(n(EGSCHEME, 'subject'), n(EGDC, 'predicate'), n(EGDC, 'object'), gu),
      q(n(EGSCHEME, 'subject'), n(EGDC, 'predicate'), df.literal('XSD string', df.namedNode(XSD + 'string')), gu),
    ];
  },
};
