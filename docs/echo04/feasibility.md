# Feasibility: an RDF4J-style JavaScript API over `@factoidal/core` (echo04)

Date: 2026-10-27. Status: feasibility study and stage 0 port, for owner review.
No echo package exists. `echo04` is a neutral placeholder; the owner names
the echo later. Model: the Jena study, `docs/leana/feasibility.md`.

Eclipse RDF4J is a second, independent Java reading of the RDF and SPARQL
specifications. Where Jena and RDF4J agree with each other and not with
Factoidal, Factoidal is the first suspect; where they disagree with each
other, the specification decides and at least one of them diverges.

Inputs (measured):

- Eclipse RDF4J at commit `fe7a441aa3f80f09993178b35f9f1e7a252932cc`
  (2026-10-26), `git clone --depth 1 https://github.com/eclipse-rdf4j/rdf4j`,
  into a scratch directory outside the repository, read only. Maven and RDF4J
  were not run.
- `@factoidal/core` 0.16.0 from npm (the latest on 2026-10-27; 0.17.0 not
  published). Pinned as the root `devDependencies` entry and `package-lock.json`.
- Scripts: `tools/echo04-study/` (`tcount.py`, `classify.py`, `api.py`,
  `count.sh`, `extract-*.{mjs,py}`).

## 1. Result

1. Feasible, and closer to Factoidal than Jena is. RDF4J's `Model` is a set of
   `Statement`s compared by term (`Literal.equals` is label, datatype,
   language), so it maps onto a `Dataset` handle (`has`, `match`, `add`,
   `delete`) with no value-matching mode, which the Jena study needed
   first. The API is smaller too: 290 declared methods on the 16 model types,
   85 on the 10 Rio types, 227 on the 20 repository and query types, 52 on the
   4 SHACL types (section 3.2).
2. The semantics an RDF4J experience needs and Factoidal lacks are few and
   named: the union default graph of a repository (queries and update WHERE
   see every graph), RDF4J's *standard* query evaluation mode (operator
   extensions of SPARQL 1.1 §17.3.1; Factoidal is the *strict* mode),
   `setBinding` substitution, literal value accessors (`intValue`,
   `calendarValue`), IRI namespace/local-name split, syntax from file name or
   media type, the SPARQL algebra/AST (queryparser, sparqlbuilder,
   queryrender), and the RDF4J SHACL extensions (`rsx:targetShape`,
   `dash:`, SHACL-AF targets). Each is a Lean op or an owner decision, not JS
   (rule 1). Section 6.
3. Stage 0 ran RDF4J's own test data, no new API, on `@factoidal/core`
   0.16.0: **2,801 cases from five sources; 2,124 meet RDF4J's expectation,
   377 are Factoidal defects (expected failures with an issue), 300 are
   divergences (RDF4J differs from or extends the specification), 0 gaps.**
   `npm run test:echo04` (repository root): 2,806 tests, 2,806 pass, about 5 s.
4. The port found **17 new Factoidal defects** (issues filed, section 5)
   and added evidence to five open ones. No W3C manifest test caught them.
   Largest by case count: SPARQL Update blank-node labels break
   `shaclValidate` (222 SHACL cases, #1074); `SUBSTR` with `xsd:int`
   arguments (#1060), which the Jena port could not see because Jena's
   tests used `xsd:integer` and RDF4J's `createLiteral(int)` makes `xsd:int`.
5. RDF4J and Jena, read side by side: they agree with each other and with
   the specification against Factoidal on the string-argument, XSD-cast and
   directional-string defects already filed from Jena (#1036, #1041, #1042:
   75 RDF4J cases). They disagree with each other on several points where the
   specification sides with RDF4J (section 7).
6. Licence: RDF4J is under the Eclipse Distribution License 1.0, a
   BSD-3-Clause text, compatible with Apache-2.0; confirmed from the files
   (section 2).


## 2. Licence (rule 3)

Measured from the files of the clone:

- `LICENSE` and `edl-v1.0.txt`: the Eclipse Distribution License 1.0, a
  BSD-3-Clause text ("Copyright (c) 2007, Eclipse Foundation, Inc. and its
  licensors. Copyright Aduna ... 2001-2013").
- `about.md`: "Unless otherwise indicated below, the Content is provided to
  you under the terms and conditions of the Eclipse Distribution License
  Version 1.0 ("EDL")". Third-party items listed there (Aduna/Sesame under
  the same BSD text; ASF, JUnit, Yasqe, CodeMirror, jQuery, JSON.org,
  Mockito, FasterXML, Guava, Spatial4J, LMDB) are libraries and UI code, not
  test data.
- SPDX headers: `grep -rhoE "SPDX-License-Identifier: [A-Za-z0-9.-]+" . | sort | uniq -c`
  gives 6,974 `BSD-3-Clause` and 8 `EPL-2.0`. The 8 EPL-2.0 files are Hugo
  layout templates under `site/layouts/` (the web site). Nothing under
  `site/` is used.
- `notice.md` is the generic Eclipse Foundation Software User Agreement; it
  defers to `about.md`.

BSD-3-Clause is compatible with Apache-2.0: keep the copyright notice, the
conditions and the disclaimer. `NOTICE` carries the full EDL text; each
derived file has a header (JSON fixtures: a `_notice` member) naming RDF4J,
the licence and what was changed.

Test material not RDF4J's own, excluded: the W3C test-suite copies
(`testcases-sparql-1.0-w3c`, `-1.1-w3c`, `-1.2-w3c`, `testcases-service`
(a copy of the W3C `data-sparql11/service` suite: its `index.html` is the
W3C directory listing), the Rio W3C syntax suites under
`testsuites/rio/src/main/resources/testcases`, `core/sail/shacl/.../w3c`).
They are under the W3C test-suite licence, and Factoidal runs the W3C suites
directly. `testcases-sparql-1.1/bsbm` (3.8 MB of output of the BSBM data
generator) is not copied. No GPL material was found or used.

Name: "Eclipse" and "RDF4J" are not in any package name, directory or
branding (rule 4). Prose says "in the style of Eclipse RDF4J".

## 3. RDF4J API surface (measured)

### 3.1 Per module

Method: `tools/echo04-study/count.sh <root> <module>...` — files under
`src/main/java`; "public types" are lines that start `public class|interface|
enum|record`; "public methods" are indented lines `public ... (`. RDF4J
interfaces declare methods without `public`, so this undercounts interfaces;
read it as an order of magnitude.

| Module | main files | public types | public methods (regex) | Factoidal relation |
|---|---|---|---|---|
| core/model-api | 29 | 24 | 161 | terms: RDF/JS (`dataFactory`); `Model`: Dataset handle |
| core/model | 50 | 44 | 783 | `Models`, `Values`, `ModelBuilder`, `LinkedHashModel`, `TreeModel`: JS over handles, except value accessors |
| core/model-vocabulary | 58 | 56 | 3 | vocabulary constants: an engine table (section 6) |
| core/rio | 194 | 151 | 872 | `parse`, `serialize`, `formats`; parser settings mostly absent |
| core/query | 65 | 65 | 436 | `query`, `Bindings`; `QueryResults` JS |
| core/queryparser/sparql | 216 | 211 | 1,619 | parse to algebra: no (needs a query AST op) |
| core/queryalgebra/model | 130 | 128 | 1,627 | algebra object model: no |
| core/queryalgebra/evaluation | 439 | 404 | 1,940 | evaluation: covered by the engine; Java extension points: `registerExtensionFunction` only |
| core/queryresultio | 79 | 70 | 361 | write SRJ/SRX/CSV/TSV: `output` option; read results: no op |
| core/repository | 143 | 121 | 1,017 | `Repository`/`RepositoryConnection` over a handle (JS); HTTP/SPARQL repositories: host |
| core/sail/api, base, memory | 139 | 109 | 1,273 | storage layer: out of scope (the handle is the store) |
| core/sail/shacl | 180 | 170 | 1,909 | `shaclValidate`; RDF4J extensions no |
| core/sail/inferencer | 20 | 18 | 105 | `closure('rdfs')` |
| core/sparqlbuilder | 106 | 86 | 436 | query builder: needs the AST op |
| core/queryrender | 94 | 79 | 722 | algebra to text: needs the AST op |
| tools/federation (FedX) | 203 | 195 | 1,206 | out of scope (`registerServiceEndpoint` covers local SERVICE) |

### 3.2 The user-facing types

Method: `python3 -I tools/echo04-study/api.py <root> <Type>...` — methods
declared in the type's own file (interfaces: every declaration; classes:
`public` ones), comments removed, inherited methods not counted.

| Group | Types | Declarations | Distinct type.method |
|---|---|---|---|
| model | Model 14, Statement 6, Value 7, Resource 1, IRI 6, BNode 5, Literal 21, TripleTerm 7, Namespace 4, ValueFactory 27, Models 57, Values 47, Statements 19, ModelBuilder 15, LinkedHashModel 23, TreeModel 31 | 290 | 170 |
| Rio | Rio 38, RDFParser 14, RDFWriter 5, RDFFormat 10, ParserConfig 8, WriterConfig 3, RDFHandler 5, RDFParserRegistry 2 (settings classes: constants only) | 85 | 51 |
| repository and query | Repository 8, RepositoryConnection 69, RepositoryResult 8, SailRepository 15, MemoryStore 14, Repositories 21, Query 3, Operation 10, TupleQuery 2, GraphQuery 2, BooleanQuery 1, Update 1, TupleQueryResult 1, GraphQueryResult 1, BindingSet 10, Binding 4, Dataset 9, QueryResults 19, QueryLanguage 10, QueryResultIO 19 | 227 | 175 |
| SHACL | ShaclSail 15, ShaclSailValidationException 2, ValidationReport 10, ShaclSailConnection 25 | 52 | 43 |

About 440 distinct type.method names, against about 900 for Jena's
corresponding types (Jena study §6). Most RDF4J overloads differ by Java
argument type (`ValueFactory.createLiteral` has 21 overloads, 5 names).

## 4. RDF4J test suites (measured)

### 4.1 Counts

Method: `python3 -I tools/echo04-study/tcount.py <root>` — per file, the
number of `@Test|@ParameterizedTest|@RepeatedTest|@TestFactory`, or, with
none, JUnit 3 `public void test*()`. Declarations, not executions
(parameterized and abstract suites run more). Files under `src/test/java`:
16,614 methods in 2,014 classes; abstract suites under `testsuites/*/src/main/java`:
605 methods in 54 classes. Largest modules: core/sail/lmdb 6,698,
core/queryalgebra/evaluation 2,325, tools/workbench 989, core/rio (all) 848,
core/sail/memory 534, core/queryrender 469, tools/federation 438,
core/sail/shacl 423, core/sail/base 387, core/model 317. Full table:
regenerate with the script.

Manifest data in the tree (`grep -rho mf:action <dir> | wc -l`): W3C copies
— SPARQL 1.0 455, 1.1 543, 1.2 266, SERVICE 7; Rio Turtle 2,224, TriG 396,
N-Quads 155, N-Triples 140, RDF/XML 32; SHACL 98. RDF4J's own:
`testcases-sparql-1.1` 118 and `testcases-sparql-1.2` 9, plus the
non-manifest data sets below.

### 4.2 Classification (counts measured; classification a judgement)

Method: `python3 -I tools/echo04-study/classify.py <root>`, by module and path.

| Class | Methods | Classes | What |
|---|---|---|---|
| a: W3C manifest runners | 16 | 12 | parameterized runners over the W3C copies (one declaration runs hundreds of cases); Factoidal runs those suites directly |
| b-model | 520 | 35 | Model, Values, Models, literals, IRIs |
| b-rio | 848 | 74 | parsers and writers |
| b-query | 680 | 77 | SPARQL compliance (Java), parser, results I/O |
| b-expr | 761 | 72 | SPARQL functions and value comparison |
| b-repo | 1,117 | 127 | Repository/connection behaviour, memory store, abstract store suites |
| b-shacl | 421 | 76 | ShaclSail (its 1,326 data cases run under a few parameterized methods) |
| b-infer | 31 | 11 | RDFS inferencer |
| b-ast | 652 | 55 | sparqlbuilder, queryrender (need a query AST op) |
| c: internals | 12,173 | 1,529 | LMDB and native stores, algebra optimisers, evaluation steps, iterators, HTTP, server, workbench, FedX, Spring, benchmarks |
| total | 17,219 | 2,068 | |

Total b: 5,030 declarations. Compared with Jena (6,842 b of 11,334 in the
modules counted there), RDF4J's portable share is smaller because its
store implementations (LMDB alone 6,698) carry most of its tests.

### 4.3 RDF4J's own test data beyond W3C

| Source | Upstream | Ported here | Notes |
|---|---|---|---|
| SPARQL manifests `testcases-sparql-1.1`, `-1.2` | 127 entries | 126 (`bsbm` not copied) | manifest form; `mf:checkOrder` is an RDF4J term |
| SPARQL compliance (Java) `testsuites/sparql/.../tests/*.java`, `SPARQLUpdateTest` | 420 methods (incl. 134 BNR vectors) | 413 methods, 560 cases | hand port; the BNR vectors come from RDF4J's `conformance-vectors.json` |
| SPARQL function tests `queryalgebra/evaluation/.../function`, `util` | 262 standard-function methods; 550 extension-function methods | 221 methods, 490 cases | the 550 are RDF4J extension families (json, datetime/ext, string/ext, math, aggregate/ext, encoding, text, array, bitwise, support): not ported |
| Rio parser tests | 377 methods in 18 files (writers 150 in 26 files) | 277 methods, 359 cases | the 2,018 files under `testsuites/rio/.../testcases` are W3C copies: 1,848 byte-identical to W3C rdf-tests, the rest older revisions |
| ShaclSail test cases | 1,326 case directories, 195 variants, 34 families | 1,266 cases | 60 not ported: the 8 variants RDF4J itself skips (`ignoredTestCases`) |
| `compliance/sparql` | 50 `@Test` + 4 `@TestFactory` in 40 files | 0 | store bindings of the suites above, Java SPI custom functions/aggregates, SERVICE over embedded HTTP |

## 5. Stage 0: the port and its verdicts

Layout: `conformance/echo04/<suite>/{cases.json, verdicts.json, *.test.mjs}`,
shared `conformance/echo04/lib/harness.mjs`. Each case is data; the engine
decides every comparison: result sets are compared as DAWG result-set graphs
with `isomorphic()` (blank nodes included), graphs with `isomorphic()`,
expression checks as one SPARQL query whose `?ok` the engine computes; JS
reads booleans and counts. A case with no verdict must meet RDF4J's
expectation; a case with a verdict must not, so a fix (or a change in
RDF4J's favour) fails the suite until the verdict is read again. CI:
the root `.github/workflows/ci.yml` (`npm ci && npm test`, Node 22 and 24)
runs these suites with the others; `npm run test:echo04` runs only these.

| Suite | Cases | Meets RDF4J | Defect | Divergence | Gap | Command |
|---|---|---|---|---|---|---|
| sparql (manifests) | 126 | 114 | 5 | 7 | 0 | `node --test sparql/sparql.test.mjs` |
| expr (functions) | 490 | 383 | 89 | 18 | 0 | `node --test expr/expr.test.mjs` |
| rio (parsers) | 359 | 330 | 14 | 15 | 0 | `node --test rio/rio.test.mjs` |
| compliance (Java SPARQL) | 560 | 407 | 36 | 117 | 0 | `node --test compliance/compliance.test.mjs` |
| shacl (ShaclSail) | 1,266 | 890 | 233 | 143 | 0 | `node --test shacl/shacl.test.mjs` |
| **total** | **2,801** | **2,124** | **377** | **300** | **0** | `npm run test:echo04` (2,806 tests incl. one count check per suite) |

All on `@factoidal/core` 0.16.0 (npm, the latest published on 2026-10-27),
Node 22.

On `@factoidal/core` 0.17.0 (published 2026-10-27; now the pinned version)
26 expr defect cases meet RDF4J's expectation and their verdicts were
removed: 23 from https://github.com/danbri/factoidal/issues/1036 (string
function argument types and compatibility: 17 `testCompatibleArguments`
cases, 6 `MD5`/`SHA*` of `"4"^^xsd:integer`) and 3 from
https://github.com/danbri/factoidal/issues/1042 (`LCASE`/`UCASE` keep the
base direction; `STRSTARTS` with a different base direction is an error),
both fixed by the 0.17.0 string-function change (danbri/factoidal-core PR
126). expr is now 490 cases, 409 meet RDF4J, 63 defects, 18 divergences; the
total is 2,801 cases, 2,150 meet RDF4J, 351 defects, 300 divergences, 0 gaps.
No case regressed. `npm test`: 6,464 tests, 6,464 pass.

### 5.1 Defects: issues filed by this study (danbri/factoidal, label `echo04`)

| Issue | Cases | What |
|---|---|---|
| https://github.com/danbri/factoidal/issues/1049 | 5 | `IN`/`NOT IN` answer false/true where a comparison is an error (`2 IN (3, 1/0)`; unbound left operand) — SPARQL 1.1 §17.4.1.9-10 |
| https://github.com/danbri/factoidal/issues/1050 | 4 | `ORDER BY DESC(COUNT(?x))` ignored in grouped queries; with `LIMIT` in a subquery it changes the answer — §18.2.4.1, §15.1 |
| https://github.com/danbri/factoidal/issues/1060 | 12 | `SUBSTR` refuses start (and ignores length) of derived integer types (`xsd:int`) — §17.4.3.3 |
| https://github.com/danbri/factoidal/issues/1061 | 1 | EBV of `"abc"^^xsd:integer` is an error, should be false — §17.2.2 |
| https://github.com/danbri/factoidal/issues/1062 | 1 | `xsd:string("foo"@en)` casts — §17.5 |
| https://github.com/danbri/factoidal/issues/1063 | 7 | Turtle/TriG: white space after `^^`; `true:` prefix in object position; TriG accepts a missing final `.` — Turtle §6.5, TriG §5.4 |
| https://github.com/danbri/factoidal/issues/1064 | 1 | JSON-LD: keyword-form key `"@foo"` refused when a base IRI is given — JSON-LD 1.1 API §5.2.2 |
| https://github.com/danbri/factoidal/issues/1067 | 1 | REGEX `i` flag folds ASCII only — F&O 3.1 §5.6.1.1 |
| https://github.com/danbri/factoidal/issues/1068 | 1 | `RAND()` is the constant 0.5 — §17.4.4.5 ("should": owner decision) |
| https://github.com/danbri/factoidal/issues/1069 | 1 | `(1 AS ?z)` refused when `?z` occurs only inside MINUS — §18.2.1 |
| https://github.com/danbri/factoidal/issues/1070 | 4 | `<u> :p? <u>` gives two empty solutions for a node not in the graph — §18.4 |
| https://github.com/danbri/factoidal/issues/1071 | 3 | parsers accept `DELETE WHERE` with FILTER/paths; `CONSTRUCT { GRAPH … }` throws `RangeError` — Update [40], [48]; Query [73] |
| https://github.com/danbri/factoidal/issues/1072 | 3 | SPARQL Update has no 1.2 mode (triple terms, reifiers, annotations, VERSION) — SPARQL 1.2 Update §3.1.1 |
| https://github.com/danbri/factoidal/issues/1074 | 225 | blank nodes written by SPARQL Update get labels with `:`; CONSTRUCT and `shaclValidate` on that Dataset fail (222 SHACL + 3 compliance) |
| https://github.com/danbri/factoidal/issues/1075 | 1 | SPARQL lexer reads `true.` as a prefixed name — §19.8 [134], [140] |
| https://github.com/danbri/factoidal/issues/1076 | 10 | SHACL Core: deactivated shapes in `sh:or`/`sh:not`, `sh:languageIn ("*")`, negative `sh:maxCount`, several `sh:or` lists, `sh:sparql` on a nested property shape — SHACL §2.1.6, §4.4.4, §4.2.2, §2.1.1, §5.3 |

Existing issues that RDF4J cases also hit (evidence added as comments where new):

| Issue | Cases | Found first by |
|---|---|---|
| https://github.com/danbri/factoidal/issues/1036 | 23 | Jena port (string argument types, SUBSTR) |
| https://github.com/danbri/factoidal/issues/1041 | 44 | Jena port (XSD constructor casts) |
| https://github.com/danbri/factoidal/issues/1042 | 9 | Jena port (directional strings) |
| https://github.com/danbri/factoidal/issues/573 | 1 | IRIREF look-ahead; RDF4J shows the other direction (`str(?a)<str(?a)`), comment added |
| https://github.com/danbri/factoidal/issues/1057 | 17 | echo03; RDF4J adds port digits, `%zz`, `<:foo>`, and the SPARQL lexer (`<abc##def>`, `<_:p>`), comments added |
| https://github.com/danbri/factoidal/issues/1055 | 2 | echo03 (N-Triples/N-Quads 1.2 VERSION); comment added |
| https://github.com/danbri/factoidal/issues/472 | 1 | relative IRI with a colon and no base (no comment added) |

Not filed, noted for the owner: core did not finish RDF4J's
`bad-entity-expansion-limit.rdf` (billion laughs) within 60 s (robustness;
the test is not ported because RDF4J's rejection is the JDK's 64,000
expansion limit, not an RDF/XML rule); RDF 1.1 readers accept
`"x"@fakelanguage123` (digits in the first subtag, outside the RDF 1.1
LANGTAG production) with a warning — is that within the 2026-10-24 ruling?

### 5.2 Divergences (RDF4J differs from or extends the specification)

| Group | Cases | Specification |
|---|---|---|
| `bnr-blank-node-reference`: `<_:id>` refers to a stored blank node (RDF4J BNR-1, 2026) | 62 | SPARQL 1.1 §19.5, §4.1.4 |
| `rsx-targetShape`, `dash-target`, `dash-hasValueIn` (RDF4J and DASH SHACL extensions) | 86 | SHACL 2017 §2.1.3, §4 |
| `shacl-af-sparql-target` (`sh:target`, SHACL-AF Note; core refuses it by design) | 46 | SHACL 2017 §2.1.3; SHACL-AF §5.1 |
| `union-default-graph` (repository default graph = union of all graphs, queries and update WHERE) | 31 | SPARQL 1.1 §13, §13.2; Update §2, §3.1.3 |
| `default-graph-alias`, `default-graph-name`, `rdf4j-nil-default-graph`, `rdf4j-extension-syntax` (`rdf4j:nil`, `sesame:nil`, `FROM DEFAULT`) | 12 | SPARQL 1.1 §13.3, §18.6, §19.8; RDF 1.1 Concepts §4 |
| `lexical-form` (expected lexical form of a numeric or date result) | 7 | SPARQL 1.1 §17.1 |
| `langstring-without-tag` (`"x"^^rdf:langString` read as `xsd:string`) | 8 | RDF 1.1 Concepts §3.3; RDF 1.2 Concepts §3.4 |
| `equality-of-other-terms`, `operator-table` (`=`, `<` on `xsd:gYear` etc.; RDF4J standard mode) | 8 | SPARQL 1.1 §17.3, §17.4.1.7 |
| `shacl12-defaultValue` (core follows the SHACL 1.2 draft; RDF4J the 2017 REC) | 5 | SHACL 2017 §2.3.2.4 vs SHACL 1.2 Core ED; **owner decision** |
| `path-length-range` (`:p{2,4}`), `bindings-keyword` (`BINDINGS`) — pre-REC draft syntax | 5 | SPARQL 1.1 §9.1, §19.8 [7], [93] |
| `order-undefined` | 4 | SPARQL 1.2 §15.1 |
| `rdf4j-update-graph-syntax` (`ex:g { … }` without GRAPH in INSERT DATA) | 4 | SPARQL 1.1 Update [52] |
| `cast-string-lenient`, `cast-date-to-datetime`, `date-cast-from-datetime-string` | 5 | F&O 3.1 §19.2; SPARQL 1.1 §17.5 |
| `predeclared-prefixes` (Rio and the SPARQL parser predeclare rdf, xsd, …) | 3 | Turtle §7.2 |
| `describe-cbd` (DESCRIBE answers incoming and outgoing statements) | 2 | SPARQL 1.1 §16.4 (implementation-defined) |
| `decimal-precision` (AVG to 10 fractional digits in Factoidal, about 44 in RDF4J) | 2 | SPARQL 1.1 §18.5.1.4; F&O §4.2 asks for at least 18: **owner decision** |
| `shapes-graph-subclass` (rdfs:subClassOf read from the shapes graph) | 2 | SHACL §1.1, §2.1.3.2 |
| `nt-nq12-version-single-quotes`, `bnode-label-dot`, `xml-doctype-disallowed` | 4 | N-Triples 1.2 [5]; Turtle §6.5 [41]; XML 1.0 §2.8 [22] |
| `count-star-empty-solution`, `trailing-values-scope`, `absent-named-graph`, `unsignedlong-range` | 4 | §18.5.1.2; §18.2.4.3; §13.2.2; XSD 1.1 §3.4.21 |

Under the 222 cases of #1074, 30 SHACL cases would still differ after a fix
(RDF4J extensions); their notes say so. Measured with a study-only relabelling
run (`tools/echo04-study/shacl-report-iso.mjs --roundTrip`).

SHACL report graphs (measured, not asserted): after removing the RDF4J
additions the way RDF4J's own TopBraid cross-check does, 869 of 887 reports
are isomorphic to RDF4J's (`node ../../tools/echo04-study/shacl-report-iso.mjs`).

## 6. Semantics that differ (and what the API would need)

| Behaviour | RDF4J | Factoidal (measured on 0.16.0) | Effect |
|---|---|---|---|
| Model equality | `Statement`/`Literal.equals` by term; context part of the statement | `has`/`match` by term | same: Model ports onto a handle; unlike Jena's value-based default Model |
| Model order | `LinkedHashModel` keeps insertion order; `TreeModel` sorts by RDF4J's lexical comparator | sorted canonical N-Quads order | order assertions need a note or an insertion-order view (JS bookkeeping) |
| `Model.filter` | a live view (writes go through) | `match` returns a new Dataset | JS view object holding the pattern over the parent handle |
| Repository default graph | union of all graphs unless the query names a dataset | default graph only (SPARQL 1.1 §13) | `{unionDefaultGraph: true}` query/update option: a Lean op (31 cases) |
| Query evaluation mode | `STANDARD` (default) extends operators per §17.3.1 (e.g. compares more literal types); `STRICT` is minimal | strict | offer STRICT only; STANDARD needs a Lean mode, or is declared out of scope |
| `createLiteral(int)` | `xsd:int` (Java type picks the datatype: byte, short, int, long, float, double, BigInteger, BigDecimal, Date, TemporalAccessor) | JS has number/bigint | explicit typed factories (`literal('4', XSD.INT)`); the JS-value table must be the engine's |
| Literal value accessors | `intValue`, `decimalValue`, `calendarValue`, `getCoreDatatype` | none | lexical-to-value op (also needed by Jena, #1051 from echo02) |
| `IRI.getNamespace`/`getLocalName` | split after the last `#`, `/` or `:` | none | op (qname split, also #1051) |
| `RDFFormat.forFileName`/`forMIMEType` | tables | `detectFormat` by content only | op |
| `setBinding` | substitutes into nested FILTERs, sub-selects and templates | none | substitution op (2 compliance methods not ported for this reason) |
| `ParserConfig` | `VERIFY_DATATYPE_VALUES=false`, `NORMALIZE_LANGUAGE_TAGS` (BCP 47 case), predeclared NAMESPACES, `ACCEPT_TURTLESTAR`, `DISALLOW_DOCTYPE_DECL`, JSON-LD `SECURE_MODE` whitelist | strict or `lenient` | map what exists (`lenient`); the rest: per-setting ops or out of scope |
| Language tags | case kept (or BCP 47 formatted, `en-AU`) | lower-cased | getter output differs; comparisons agree (case-insensitive) |
| DESCRIBE | symmetric bounded description | outgoing statements | §16.4 leaves it open; a `describe` option if wanted |
| SHACL | union data graph; `sh:shapesGraph` read from shapes; `rsx:`, `dash:`, SHACL-AF targets; ignores `sh:defaultValue` | default graph; SHACL Core + SPARQL constraints; SHACL 1.2 `defaultValue` | data-graph choice in JS by an engine update (done in the port); extensions: owner decision |
| SPARQL parser | predeclared prefixes; `rdf4j:nil`; `FROM DEFAULT`; `BINDINGS`; `{n,m}`; `<_:id>` references | SPARQL 1.1/1.2 grammar | divergences; not to be copied |

## 7. RDF4J and Jena compared

Both are Java readings of the same specifications. Where they overlap with
the test data:

- Agree with each other and the specification, against Factoidal: string
  function argument types and SUBSTR positions (#1036), XSD constructor casts
  (#1041), directional language strings (#1042). Independent confirmation of
  three Jena-found defects (75 RDF4J cases).
- RDF4J found what Jena's tests could not: `xsd:int` arguments (#1060),
  IN/NOT IN errors (#1049), ORDER BY aggregates (#1050), EBV of ill-typed
  literals (#1061). Jena's ARQ expression tests use `xsd:integer` and
  constant expressions; RDF4J's use Java-typed literals and data.
- Where Jena diverged and RDF4J follows the specification: `SUBSTR` with
  double arguments (Jena: fn:substring behaviour; RDF4J: error);
  equality of two different literals of unrelated types (Jena: false;
  RDF4J in strict mode: false or error per its comparison table; Factoidal:
  error per §17.4.1.7). RDF4J's own function tests use strict mode. RDF4J's divergences are mostly in its *standard* mode and
  its store model (union default graph), not in its function library.
- Where both diverge the same way: date/time accessors and casts are more
  lenient than F&O in both; both accept some casts from unknown datatypes to
  `xsd:string` (Factoidal too; not flagged).
- Model: Jena's default Model is value-based (`"01"^^xsd:integer` matches
  `1`); RDF4J's is term-based, as Factoidal. An RDF4J-style echo needs no
  value-matching mode.

## 8. Design of a JS API over core (no package yet)

Name: `@factoidal/echo04` (placeholder, `private: true` until named).
Dependency: `@factoidal/core` only; no wasm of its own.

```js
import { Values, Rio, RDFFormat, Repository, MemoryStore, ShaclSail } from '@factoidal/echo04';
await ready();                                  // engine load; everything after is synchronous where core is
const vf = Values;                              // iri(), bnode(), literal(label, datatypeOrLang)
const model = Rio.parse(text, base, RDFFormat.TURTLE);   // Model over a Dataset handle
for (const st of model.filter(s, null, null)) …           // live view, RDF/JS quads as Statements
const repo = new Repository(new MemoryStore());
using conn = repo.getConnection();              // try/finally on Node 22
conn.begin(); conn.add(model); conn.commit();   // transaction = clone + swap of the handle (JS)
const q = conn.prepareTupleQuery('SELECT …');
for (const bs of q.evaluate()) bs.getValue('x');           // BindingSet over core Bindings
```

- Terms: RDF4J `IRI`, `BNode`, `Literal`, `TripleTerm` are thin wrappers of
  RDF/JS terms (`stringValue()`, `getLabel()`, `getDatatype()`,
  `getLanguage()`, `getBaseDirection()` read components). `intValue()` and
  friends: unsupported until the value op exists (gap list).
- `Model` (`LinkedHashModel`, `TreeModel`, `DynamicModel`): a Dataset
  handle plus namespaces; `contains/add/remove/filter/subjects/predicates/
  objects/contexts` are `has/add/delete/match` calls. `Models.isomorphic`
  is `isomorphic()`.
- Rio: `parse` and `write` map to `parse`/`serialize`; `RDFFormat`
  constants name core format tags. `forFileName` waits for the op.
  `ParserConfig`: only settings with a core equivalent (`lenient`); others
  throw `UnsupportedRDFormatException`-style errors chosen by error code.
- Repository/connection: `SailRepository(MemoryStore)` holds one handle;
  `ShaclSail` wraps it and runs `shaclValidate` at `commit()`, throwing
  `ShaclSailValidationException` with the report as a Model.
  `includeInferred` maps to `entail`; the union default graph waits for the
  op, so a repository is strict-SPARQL until then (documented divergence).
- Query: `TupleQuery`, `GraphQuery`, `BooleanQuery`, `Update` over
  `query`/`update`; `setDataset` maps to FROM/FROM NAMED only through an
  engine option (not text rewriting); `setBinding` waits for the
  substitution op. `QueryResultIO.write` uses `output`.
- Exceptions by `FactoidalError.code` (exists in 0.16.0): `parse.syntax` →
  `RDFParseException`; `query.syntax` → `MalformedQueryException`;
  `update.failed` → `UpdateExecutionException`; never by message text.
- Not JS (rule 1): datatype choice for JS values, value accessors, IRI split,
  file-name-to-format, union default graph, standard-mode operators,
  binding substitution, algebra/AST, RDF4J SHACL extensions, vocabulary
  tables. Each is a Lean op request.

Engine ops this needs, in order of value: union-default-graph query/update
option; lexical-to-value accessors and JS-value-to-literal table (shared with
the Jena-style and RDFLib-style echoes, #1051); IRI namespace split;
format by file name/media type; initial-bindings substitution; SPARQL
results reader (SRX/SRJ to Bindings); query AST to JSON and back
(queryparser, sparqlbuilder, queryrender).

## 9. Plan

| Stage | Scope | Works with 0.16.0 | Needs |
|---|---|---|---|
| 0 (done) | RDF4J's own SPARQL manifests, function tests, Java compliance tests, Rio parser tests, ShaclSail cases as data | yes | fixes for the issues in 5.1 |
| 1 | terms, Model, Rio on strings, Repository/connection/transactions, Tuple/Graph/Boolean query, Update; port b-model, b-rio, b-repo tests (2,485 declarations) | mostly | value accessors, IRI split, format table, union default graph |
| 2 | ShaclSail object API, inferencer, results I/O; b-shacl Java tests, b-infer | mostly | results reader; extension decisions |
| 3 | sparqlbuilder, queryrender, algebra (b-ast 652) | no | query AST op |

## 10. Open questions for the owner

1. `sh:defaultValue`: SHACL 2017 says non-validating; core follows the SHACL
   1.2 draft. Keep, or add a spec-version option? (5 cases)
2. AVG decimal precision: 10 fractional digits; F&O 3.1 §4.2 asks
   implementations to support at least 18. Defect or divergence? (2 cases)
3. `RAND()` constant 0.5: deliberate determinism, or defect? (#1068)
4. Union default graph: add a query/update option, so an RDF4J-style
   repository can match RDF4J, or keep it a documented divergence? (31 cases)
5. RDF4J's standard evaluation mode: out of scope, or a Lean "extended
   operators" mode?
6. RDF 1.1 readers accept a language tag with digits in the first subtag
   (`@fakelanguage123`) with a warning: within the 2026-10-24 ruling?
7. The billion-laughs RDF/XML input runs for more than 60 s: file it?
8. The real name of the echo.

