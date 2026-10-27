# Feasibility: an RDFLib-style JavaScript API over @factoidal/core (hardylib)

Date: 2026-10-27. Status: stage 1 (study, a parser and serializer port, a
private prototype). `hardylib` is a working placeholder name; the owner will
choose the real one. In prose: "the RDFLib-style echo".

Request (owner, via the coordinator, 2026-10-27): port RDFLib's tests and
"see what a JS version of their API looks like too". Model: the Jena study,
`docs/leana/feasibility.md`.

Inputs:

- RDFLib at commit `58c3700e5e21b5b833d0e31072f930c665059db2` (2026-10-26,
  version 8.0.0a0 in `pyproject.toml`), `git clone --depth 1
  https://github.com/RDFLib/rdflib`, kept read only outside this repository.
  No RDFLib code was imported or run: the counts read the source with
  Python's `ast` module (`python3 -I`, scripts in `tools/hardylib-study/`).
- `@factoidal/core` 0.16.0 from npm (the newest published on 2026-10-27;
  0.17.0 is not on npm yet).

## 1. Result

1. Feasible for the core of RDFLib: `Graph`, the terms, `Namespace`,
   parse and serialize in the six syntaxes core reads and writes (N-Triples,
   N-Quads, Turtle, TriG, RDF/XML, JSON-LD), SPARQL query and update, and
   isomorphism. The prototype `packages/hardylib` (private) does these over
   public core calls only, synchronously after `await Graph.create()`.
2. RDFLib's term model is not the RDF 1.1 term model, and that, not the API
   shape, is the cost. RDFLib normalises literal lexical forms on
   construction (`"01"^^xsd:integer` becomes `"1"`; rdf:XMLLiteral is
   re-serialised), keeps `Literal("x")` apart from
   `Literal("x", datatype=XSD.string)`, and maps Python values to and from
   literals (`Literal(12)`, `toPython()`). Factoidal follows RDF 1.1
   Concepts 3.3. Each of these is a divergence or an engine op, filed as
   https://github.com/danbri/factoidal/issues/1051.
3. The parser and serializer port found two RDF/XML writer defects in
   Factoidal: https://github.com/danbri/factoidal/issues/1047 (a carriage
   return in a literal is written raw and reads back as a line feed) and
   https://github.com/danbri/factoidal/issues/1048 (predicates such as
   `urn:example:p` are refused). Neither is caught by the W3C suites, which
   test readers, not writers.
4. Of RDFLib's 1,959 test function declarations (3,967 cases counting
   literal `parametrize` lists), 470 (761) are API tests portable to core
   today, 383 (772) need engine semantics core lacks, 1,092 (2,420) are
   Python internals or remote-store clients (the GraphDB client alone: 692),
   and 14 are runners of W3C manifests that Factoidal already runs.
5. No wasm rebuild is needed for stage 1. The ops in section 6 need one.
6. Licence: RDFLib is BSD 3-Clause; derived files keep its copyright and
   licence text (section 7). The RDFLib name is not used in any package or
   directory name.

## 2. RDFLib API surface (measured)

Method: `python3 -I tools/hardylib-study/api.py <rdflib root> [-v]`. Members
declared in each class body (inherited ones are not counted; overloads and
property setters count once). "public" = no leading `_`; "dunder" =
`__x__` (operators, container protocol); 32 types, 191 public and 153 dunder
members, 89 distinct public names.

| Type (rdflib/...) | public | dunder | Factoidal today | Gap |
|---|---|---|---|---|
| graph.py `Graph` | 45 | 21 | Dataset handle: add, delete, has, match, size, query, update, serialize, isomorphic | `compute_qname`/`qname`, `collection`/`items`, `resource`, `transitive_*` (SPARQL paths do it; not wired), `cbd` (DESCRIBE gives CBD), `skolemize` |
| graph.py `ConjunctiveGraph` | 13 | 5 | handle with graph names (`graphs()`, `match(..., g)`) | prototype has none yet; maps onto the same handle |
| graph.py `Dataset` | 11 | 7 | as above | `default_union` option |
| graph.py `QuotedGraph` | 3 | 3 | none | N3 formulae: no N3 in core (#883) |
| graph.py `ReadOnlyGraphAggregate`, `Seq`, `BatchAddGraph` | 18, 1, 3 | 9, 4, 3 | JS over handles | `Seq` walks rdf:_n: op |
| term.py `Node`, `Identifier`, `IdentifiedNode` | 1, 3, 2 | 0, 7, 1 | RDF/JS terms | ordering (`__lt__`): SPARQL ORDER BY order is the engine's |
| term.py `URIRef` | 4 | 6 | `namedNode` | `defrag`, `fragment`: IRI syntax: op |
| term.py `BNode` | 2 | 3 | `blankNode` | `skolemize`: op |
| term.py `Literal` | 9 | 18 | `literal` | `toPython`/`value`, `ill_typed`, `normalize`, value `eq` (SPARQL `=` does it), arithmetic `__add__`/`__neg__` |
| term.py `Variable` | 2 | 3 | `variable` | none |
| namespace `Namespace` | 2 | 5 | JS string concatenation (`term`) | none for the shape |
| namespace `DefinedNamespace(Meta)`, `ClosedNamespace` | 1, 2 | 8, 6 | none | the 29 bundled vocabularies (`RDF`, `XSD`, `OWL`, `SDO`, ...): a vocabulary table op |
| namespace `NamespaceManager` | 12 | 2 | `dataset.prefixes`, writer `prefixes` | `qname`, `curie`, `expand_curie`, `normalizeUri`: qname split op |
| parser.py `Parser`, `InputSource` | 1, 1 | 1, 1 | `parse` | file and URL sources: host I/O (JS) and syntax from file name (op) |
| serializer.py `Serializer` | 2 | 1 | `Dataset.serialize` | `relativize` (writer option) |
| query.py `Processor`, `UpdateProcessor`, `Result`, `ResultRow`, `ResultParser`, `ResultSerializer` | 1, 1, 3, 2, 1, 1 | ... | `query`, `update`, `queryRaw` (SRJ/SRX/CSV/TSV) | `prepareQuery` + `initBindings` (substitution: op); results parsing (op) |
| store.py `Store` | 22 | 2 | the handle | Python store plugin API: out of scope |
| resource.py `Resource`, collection.py `Collection`, paths.py `Path` | 16, 4, 2 | 14, 7, 3 | none | Resource: JS over Graph; Collection: list walk op; Path: SPARQL property paths exist, Python path objects would need a path-to-SPARQL writer (JS shape) |

Plugins registered in `rdflib/plugin.py` (same script): Parser 21 names
(xml, n3, turtle, ttl, ntriples, nt, nt11, json-ld, nquads, trix, trig,
hext, patch, and media types), Serializer 23 (the same plus pretty-xml,
longturtle), Store 8, ResultParser 8, ResultSerializer 7, Processor,
UpdateProcessor and Result 1 each. Core covers 6 of RDFLib's 11 graph
syntaxes; it has no N3, TriX, HexTuples, RDF Patch or longturtle (a Turtle
layout).

## 3. Semantics that differ (RDFLib read from source; Factoidal measured)

| Behaviour | RDFLib | Factoidal 0.16.0 (measured) | Effect |
|---|---|---|---|
| Literal construction | normalises lexical forms of XSD datatypes by default (`NORMALIZE_LITERALS = True`, `rdflib/__init__.py` line 127); `Literal('01', datatype=XSD.integer) == Literal('1', ...)` | keeps the lexical form: `"01"^^xsd:integer` and `"1"^^xsd:integer` are different terms (RDF 1.1 Concepts 3.3) | tests of `==` on numeric literals are divergences; an opt-in canonical-form op (#1051 item 3) |
| `Graph.__contains__` | `(s,p,o) in g` matches through the store's term index, so on normalised literals it is effectively value-based for canonicalisable lexical forms; None is a wildcard | `has` and `match` are term-based: stored `"01"` does not match `"1"` | port with term semantics; divergence where the test relies on normalisation |
| Simple literals | `Literal('x')` has datatype None and is not equal to `Literal('x', datatype=XSD.string)` (test_variants strips xsd:string to compare) | the same term (RDF 1.1) | upstream workarounds become no-ops |
| `Literal.eq`, `<`, `>` | value comparison with Python rules, `NotImplemented` for incompatible types | SPARQL `=` and `<` (17.3), type error for incompatible | the prototype's `valueEquals` uses SPARQL `=`; null for a type error |
| `Literal(12)`, `toPython()` | 13 generic + 6 specific Python-to-XSD rules; `XSDToPython` table of 32 datatypes | no op | NotSupported (#1051 items 1, 2) |
| rdf:XMLLiteral | parsed and re-serialised at construction | `parseType="Literal"` content is exclusive-canonical XML (`<p/>` read as `<p></p>`); N-Triples lexical form kept | `variants/xml_literal` divergence |
| Language tags | compared case-insensitively, kept as given | lower-cased on read (`"x"@EN-gb` is `"x"@en-gb`) | assertions on `language` text differ |
| `Graph.__eq__` | compares graph identifiers, not content | no Graph object; `isomorphic` compares content | prototype keeps `identifier`, has no `equals` |
| Blank node labels | kept from the document (`_:b0` in N-Triples and Turtle is one BNode('b0')); test_variants `exact_match` compares labels | fresh labels per parse (`_:a` read as `_:d4_a`) | the port uses isomorphism (Concepts 3.5: labels are local) |
| N-Triples escapes | accepts `\/` | refuses (N-Triples grammar [153s] ECHAR) | `even_more_literals.nt` divergence |
| Base without `/` | `@base <example:>` then `<x>` gives `example:/x` (the variant's N-Triples says so; RDFLib marks its Turtle reading xfail) | `example:x` (RFC 3986 5.2.3) | divergence |
| Nested `@graph` with no `@id` in JSON-LD | default graph | a named graph with a blank-node name | divergence (Claude-inferred reading of JSON-LD 1.1 API, see verdicts) |

## 4. RDFLib test suite (measured)

Method: `python3 -I tools/hardylib-study/tcount.py <rdflib root> [--files]`
counts `def test*` at module level and in `Test*` classes (declarations);
"cases" multiplies stacked `@pytest.mark.parametrize` decorators whose
argument list is a literal list. 40 files parametrize over a computed list
(marked `dyn` in `--files`), so executed counts are higher (the roundtrip
test alone runs thousands of cases).

| Area (test/...) | files | decl | cases |
|---|---|---|---|
| test_graphdb (GraphDB REST client) | 60 | 692 | 1,650 |
| test_sparql | 24 | 195 | 493 |
| test_issues | 49 | 117 | 117 |
| test_rdf4j (RDF4J REST client) | 34 | 111 | 207 |
| test_graph | 18 | 105 | 124 |
| test_extras (infixowl, SHACL helpers) | 17 | 86 | 115 |
| test_literal | 10 | 86 | 227 |
| test_store | 13 | 82 | 91 |
| test_serializers | 16 | 78 | 90 |
| test_namespace | 5 | 56 | 115 |
| test_parsers | 14 | 53 | 61 |
| jsonld | 14 | 49 | 122 |
| test_util.py | 1 | 41 | 85 |
| test_n3.py | 1 | 34 | 137 |
| test_misc | 11 | 31 | 84 |
| test_dataset, test_conjunctivegraph | 8 | 47 | 47 |
| test_nt_misc.py, test_trig.py, test_turtle_quoting.py, test_roundtrip.py, others | 15 | 77 | 136 |
| test_w3c_spec (manifest runners) | 9 | 10 | 10 |
| utils (tests of test helpers) | 5 | 10 | 64 |
| **total** | **324** | **1,959** | **3,967** |

Classification: `python3 -I tools/hardylib-study/classify.py` (rules by path,
first match wins; a judgement, Claude-inferred, coarse):

| Group | files | decl | cases |
|---|---|---|---|
| (a) runners of W3C manifests Factoidal already runs (test_w3c_spec, jsonld test-suite/1.1/local-suite runners) | 12 | 14 | 14 |
| (b1) API-level, portable over core today (Graph, Dataset, terms, parse/serialize in core syntaxes, SPARQL, issues) | 117 | 470 | 761 |
| (b2) API-level, need engine semantics core lacks (literal values, namespaces/qnames, N3, HexTuples/TriX/Patch, collections, Python paths, initBindings, SERVICE mocks) | 42 | 383 | 772 |
| (c) Python internals and out of scope (GraphDB and RDF4J clients, Python stores, plugins, typing, docs, CLI tools, infixowl) | 153 | 1,092 | 2,420 |

The W3C data RDFLib vendors (`test/data/suites/w3c`, `mf:action` count):
N3 1,678, SPARQL 1.1 543, SPARQL 1.0 (dawg-data-r2) 455, TriG 336, Turtle
292, RDF/XML 170 (+7 non-normative), N-Quads 86, N-Triples 69. Factoidal
runs the current W3C versions of all but N3 directly. RDFLib's own SPARQL
tests in manifest form (`suites/rdflib/sparql`, 29 queries) could run with
the existing manifest runner (not done; section 6).

## 5. A JavaScript shape for the RDFLib API

Rules: JS may choose names, argument shapes, iteration, operators-as-methods
and handle lifetime; every RDF decision is a core call (CLAUDE.md rule 1).
Terms are the RDF/JS terms of `@factoidal/core`, so they work with any RDF/JS
library. One engine, loaded once; after `await Graph.create()` the store
calls are synchronous (core's handle ops are), so `for...of` works.

| RDFLib (Python) | hardylib (JavaScript) | core call |
|---|---|---|
| `g = Graph()` | `const g = await Graph.create()` | `fromQuads([])` |
| `EX = Namespace("http://example.org/")`; `EX.alice`, `EX["alice"]` | `const EX = Namespace('http://example.org/')`; `EX.alice`, `EX['alice']`, `EX.term('then')` | none (string + name) |
| `URIRef(x)`, `BNode()`, `Literal("x", lang="en")` | `URIRef(x)`, `BNode()`, `Literal('x', { lang: 'en' })` | `dataFactory` |
| `Literal(12)` | NotSupported (needs #1051); write `Literal('12', { datatype: XSD.integer })` | — |
| `a == b` | `a.equals(b)` (RDF term equality) | RDF/JS |
| `lit.eq(other)` | `await valueEquals(lit, other)` | `query` with SPARQL `=` |
| `g.add((s, p, o))` | `g.add([s, p, o])` (chainable) | `Dataset.add` |
| `g.remove((s, None, None))` | `g.remove([s, null, null])` | `match` + `delete` |
| `(s, p, None) in g` | `g.contains([s, p, null])` | `has` / `match` |
| `len(g)` | `g.length` | `size` |
| `for s, p, o in g.triples((None, RDF.type, None)):` | `for (const [s, p, o] of g.triples([null, RDF_TYPE, null]))` | `match` (iterator) |
| `g.subjects(RDF.type, FOAF.Person)`, `g.objects(s, p)`, `g.value(s, p)` | same names (camelCase for two-word ones: `subjectObjects`, `predicateObjects`) | `match` |
| `g[s:p:]` (slice) | `g.objects(s, p)` | `match` |
| `g + h`, `g - h`, `g * h`, `g ^ h` | `await g.union(h)`, `difference`, `intersection`, `symmetricDifference` | `clone`, `add`, `delete`, `has` |
| `g += h`, `g -= h` | `g.addAll(h)`, `g.removeAll(h)` | `add`, `delete` |
| `g.parse(data=s, format="turtle", publicID=b)` | `await g.parse({ data: s, format: 'turtle', publicID: b })` | `parse` |
| `g.serialize(format="turtle")` | `await g.serialize({ format: 'turtle' })` | `Dataset.serialize` (bound prefixes passed) |
| `g.query(q)` → rows / bool / graph | `await g.query(q)` → `Map[]` / boolean / `Graph` | `Dataset.query` |
| `g.update(u)` | `await g.update(u)` | `Dataset.update` |
| `isomorphic(g, h)` | `await g.isomorphic(h)` | `isomorphic` |
| `g.bind("ex", EX)`, `g.namespaces()` | `g.bind('ex', EX)`, `g.namespaces()` | writer `prefixes`, `dataset.prefixes` |
| `with Graph() as g:` | `using g = await Graph.create()` (Node 24) or `g.dispose()` | `dispose` |
| `term.n3()` | `n3(term)` | `termToNQuads` (engine) |

Example, side by side:

```python
from rdflib import Graph, Namespace, Literal, RDF
EX = Namespace("http://example.org/")
g = Graph()
g.add((EX.alice, RDF.type, EX.Person))
g.add((EX.alice, EX.name, Literal("Alice", lang="en")))
for s in g.subjects(RDF.type, EX.Person):
    print(g.value(s, EX.name))
print(g.serialize(format="turtle"))
```

```js
import { Graph, Namespace, Literal, URIRef } from '@factoidal/hardylib';
const EX = Namespace('http://example.org/');
const RDF_TYPE = URIRef('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'); // no RDF table in JS (#1051 item 5)
const g = await Graph.create();
g.add([EX.alice, RDF_TYPE, EX.Person]).add([EX.alice, EX.name, Literal('Alice', { lang: 'en' })]);
for (const s of g.subjects(RDF_TYPE, EX.Person)) console.log(g.value(s, EX.name).value);
console.log(await g.serialize({ format: 'turtle' }));
```

Choices and why:

- Triples are arrays, not tuples: `[s, p, o]` destructures like Python's
  tuple unpacking, and `null` (or `undefined`) is RDFLib's `None` wildcard.
- No operator overloading in JS: each Python operator is a method named in
  the table. The set operations are async only because a new graph needs
  `Graph.create()`.
- `Namespace` is a Proxy. RDFLib's Namespace is a `str` subclass, so
  `str` method names shadow terms there (it overrides `title` so that
  `DCTERMS.title` is a URIRef, and tests it); in JS the
  reserved names are `term`, `toString`, `valueOf`, `toJSON`, `uri` and
  `then` (so that `await EX` does not treat the namespace as a promise).
- `Graph.create()` instead of `new Graph()`: the engine loads
  asynchronously once; everything after is synchronous.
- Errors: core's `FactoidalError` (with its engine-decided `code`) passes
  through; RDFLib's `BadSyntax`/`ParserError` names could be mapped by code
  in JS (a table of names, no semantics). `NotSupported` marks a gap.
- Not in the prototype: `ConjunctiveGraph`/`Dataset` (map onto the same
  handle with graph names), `Resource`, file and URL sources, results
  formats.

## 6. Plan

| Stage | Scope | Tests (section 4) | Works with 0.16.0 | Needs |
|---|---|---|---|---|
| 1 (this PR) | study; parser/serializer data port (1,438 cases, `conformance/hardylib`); prototype Graph/terms/Namespace | data files of test_roundtrip, test_variants | yes | fixes #1047, #1048 |
| 2 | port b1: test_graph, test_dataset, test_conjunctivegraph, test_parsers, test_serializers (core syntaxes), test_sparql (b1 part), test_issues, test_trig, test_turtle_quoting, test_nt_misc; ConjunctiveGraph/Dataset in the package; RDFLib's SPARQL manifest suite with the manifest runner | 470 decl (761 cases) | yes | none known |
| 3 | b2: literals, namespaces, collections, initBindings | 383 decl (772 cases) | no | #1051 ops; N3 reader and writer (#883) for test_n3 and n3roundtrip; TriX, HexTuples, RDF Patch only if the owner wants non-W3C syntaxes |

Risks: RDFLib's literal normalisation is visible in many b1 assertions
(`Literal("01", datatype=XSD.integer) == Literal(1)`); each becomes a
divergence note unless the engine gets a canonical-form option. N3 is 669
of the 1,438 stage-1 cases (all divergences now; 45 of the 58 `.n3`
files are also Turtle that core reads, measured with
`node tools/hardylib-study/n3-as-turtle.mjs`).

## 7. Licence and name

- RDFLib: BSD 3-Clause, "Copyright (c) 2002-2026, RDFLib Team" (its
  `LICENSE`, read at the pinned commit). Compatible with this repository's
  Apache-2.0: clause 1 (keep the notice in source redistributions) is met
  by the header of each derived file and by `conformance/hardylib/data/LICENSE-RDFLib`;
  clause 3 forbids using the RDFLib name to endorse or promote: "in the
  style of RDFLib" in prose only, no RDFLib name in package, scope or
  directory names.
- The data files under `conformance/hardylib/data/` are byte-for-byte copies
  (a header would change what is parsed); the directory carries the licence
  and a provenance list. Some files RDFLib distributes may come from
  earlier projects (the `nt_misc` and `n3roundtrip` names follow the cwm/N3
  test suites, W3C); RDFLib distributes them under its licence and does not
  mark another one. No GPL source.
- API names and signatures are facts of interface; the prototype copies no
  RDFLib code.
