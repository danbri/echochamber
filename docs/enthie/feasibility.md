# Feasibility: an N3.js-style and RDF/JS API over @factoidal/core (enthie)

Date: 2026-10-27. Status: stage 1 done, for owner review. Working name
`enthie` (neutral placeholder; the owner names it later). Package
`packages/enthie` (`@factoidal/enthie`, `private: true`). Ported tests
`conformance/enthie`. Scripts `tools/enthie-study`. Method modelled on
`docs/leana/feasibility.md`.

"N3.js" names the library by the RDF/JS community (https://github.com/rdfjs/N3.js),
MIT licence. The echo is not affiliated with it; "N3.js-style" describes API
shape only. The RDF/JS specifications are W3C Community Group reports
(https://rdf.js.org/).

Inputs (shallow clones, read only, in `~/working/sandbox/october/echo-upstream/`;
no build or `npm install` was run in them):

| source | commit | date | licence |
|---|---|---|---|
| rdfjs/N3.js | `ce8f71be6af502a7a16193f7fb0fe9ad239f6d8d` (package 2.0.1) | 2026-10-26 | MIT |
| rdfjs-base/data-model (RDF/JS data model test suite, `@rdfjs/data-model` 2.1.2) | `66eae148b37e4df11e2a5e445db9fa785546e05b` | 2026-09-14 | MIT |
| rdfjs-base/dataset (RDF/JS DatasetCore test suite, `@rdfjs/dataset`) | `1a62b216c6ce76c809c40e9f1f62126947763808` | 2026-09-14 | MIT |
| rdfjs/data-model-spec | `65d5f5340b2e55a19be8f4b4562ea40f987fb44e` | 2026-03-27 | W3C CG report (read, not copied) |
| rdfjs/dataset-spec | `4bb0ed9b0180c4790f58bd1e3df1967c4eee0a86` | 2023-06-02 | W3C CG report (read, not copied) |
| rdfjs/stream-spec | `5584adea5cbb7e65affc3619cbee5de512b23333` | 2023-06-01 | W3C CG report (read, not copied) |

Engine: `@factoidal/core` 0.16.0 from npm (0.17.0 not published on
2026-10-27; `npm view @factoidal/core dist-tags` gives `latest: 0.16.0`).
Node 22.22.2.

## 1. Result

1. **@factoidal/core already is an RDF/JS data model and DatasetCore
   implementation, and conforms closely.** The rdfjs-base data model suite:
   81 of 83 pass on `core.dataFactory`; the 2 failures are cases where the
   test suite goes beyond the specification (`fromTerm(null)`). The
   rdfjs-base DatasetCore suite on the engine-resident `Dataset`: 36 of 37
   pass; the failure is a quad with a triple term as subject, which RDF 1.2
   does not allow. Spec-text probes written here found one defect:
   `dataFactory.literal('x', 'EN-GB').language` is `'EN-GB'`; the spec says
   lowercase (https://github.com/danbri/factoidal/issues/1054). Terms answered
   by `query()` and `parse()` are the same classes and `equals()` the factory's.
2. **An N3.js-style Parser, Writer and Store are thin.** `packages/enthie/src/index.mjs`
   is about 400 lines of argument and result shaping. Every RDF decision is
   an engine op: parse (`core.parse`), N-Quads text (`quadsToNQuads`),
   Turtle/TriG text (`Dataset.serialize`), matching (`Dataset.match`,
   `has`), isomorphism (tests only).
3. **The engine is more conservative than N3.js, and the specifications
   side with the engine in every measured difference but the defects
   below.** N3.js accepts relative IRIs with no base, names that are not
   IRIs, generalized terms (literals as subjects, triple terms as subjects,
   blank node predicates), Notation3, and a default syntax mixing Turtle,
   TriG and N-Quads statements. Factoidal refuses all of these, and RDF 1.2
   Concepts and the RDF 1.2 grammars back it.
4. **The port found five engine defects**, filed with failing tests
   (section 6): language-tag case in the factory (#1054), the N-Triples 1.2
   and N-Quads 1.2 `VERSION` directive (#1055), TriG accepting a top-level
   triple without `.` (#1056), non-IRIs accepted as IRIs (#1057), and format
   inference refusing valid Turtle/TriG/N-Quads (#1058). One feature issue:
   no Notation3 reader (#1059).
5. **Not possible today without engine work:** synchronous `Parser.parse`
   (the engine parse is asynchronous), streaming (RDF/JS Stream:
   https://github.com/danbri/factoidal/issues/884), Notation3 (#1059), JS
   value to literal (`literal(5)`: https://github.com/danbri/factoidal/issues/1051),
   comments, the N3 reasoner.

## 2. The N3.js API surface (measured)

Method: `node tools/enthie-study/count.mjs <N3.js checkout>`: for each class
in `src/*.js`, the methods, getters and static methods whose names do not
start with `_` (acorn syntax tree; inherited members not counted). Exports
from `src/index.js`: `Lexer, Parser, Writer, Store, StoreFactory,
EntityIndex, StreamParser, StreamWriter, Util, Reasoner, BaseIRI,
DataFactory, Term, NamedNode, Literal, BlankNode, Variable, DefaultGraph,
Quad, Triple, termFromId, termToId, getRulesFromDataset`.

| N3.js class | public members | enthie | engine op behind it |
|---|---|---|---|
| Parser (N3Parser) | 1 (`parse`; options `format`, `baseIRI`, `factory`, `blankNodePrefix`, N3 options) | `parse(input)` answers a Promise (D1); callback and `{onQuad, onPrefix}` forms; `format`, `baseIRI`, `factory` | `parse` (`datasetOpen`); format inference `detectFormat` |
| Writer (N3Writer) | 9 (`quadToString, quadsToString, addQuad, addQuads, addPrefix, addPrefixes, blank, list, end`) | all but `blank`, `list` (G5) | `quadToNQuads`, `quadsToNQuads` (sync after load); `fromQuads` + `Dataset.serialize` (Turtle, TriG, prefixes) |
| Store (N3Store) | 43 | 30: `size, add, addQuad, addQuads, delete, has, removeQuad, removeQuads, removeMatches, deleteGraph, getQuads, readQuads, match, countQuads, forEach, every, some, getSubjects/Predicates/Objects/Graphs, forSubjects/…/forGraphs, [Symbol.iterator], dispose`; `import, remove, createBlankNode` throw (G2, G6); dataset algebra (`union, intersection, difference, equals, filter, map, reduce, toCanonical, toStream, toString, toArray, contains, addAll, deleteMatches, extractLists`) not yet (G8) | an engine `Dataset` handle: `clone` of an empty one (sync), `add`, `delete`, `has`, `match`, `size`, `toArray` |
| DatasetCoreAndReadableStream | 24 | `match` answers a Store (DatasetCore); not a stream (G2) | `Dataset.match` |
| Term, NamedNode, Literal, BlankNode, Variable, DefaultGraph, Quad | 2-8 each (`id`, `toJSON`, `hashCode`, `datatypeString` beyond RDF/JS) | the RDF/JS classes of `@factoidal/core/rdfjs`; N3.js extras not provided (G9) | none (field records) |
| DataFactory | `namedNode, blankNode, literal, variable, defaultGraph, quad, triple, fromTerm, fromQuad` | all; `literal(number|boolean|bigint|Date)` throws (G4) | `core.dataFactory` |
| StreamParser, StreamWriter | 1 each + Node stream API | constructors throw (G2) | none (#884) |
| Reasoner | 1 (`reason`) | constructor throws (G7) | none for N3 rules |
| Lexer, BaseIRI, Util, termFromId, termToId | | not provided (internal or N3.js notation) | |

## 3. N3.js tests (measured)

Method: `node tools/enthie-study/count.mjs`: per `test/*-test.js`, the `it`
and `test` calls in the syntax tree, plus one per `itShouldResolve` call.

| area | files | `it` |
|---|---|---|
| parser, lexer, IRI resolution | N3Parser 1,089 (675 `it` + 414 `itShouldResolve`), N3Lexer 273, N3ParserDirectives 26, N3ParserTokenCallbacks 12, BaseIRI 2 | 1,402 |
| store | N3Store 432, N3Store-observers 4, N3StoreFactory 1 | 437 |
| data model (terms, DataFactory) | Literal 133, Term 70, N3DataFactory 43, Quad 42, NamedNode 25, BlankNode 15, Variable 15, DefaultGraph 13 | 356 |
| writer | N3Writer 152 | 152 |
| utilities | N3Util 64 | 64 |
| stream parser and writer | N3StreamParser 25, N3StreamWriter 23 | 48 |
| N3 reasoner | N3Reasoner 29 | 29 |
| bundles, fuzzing | esm 4, iife 3, Fuzz 3 | 10 |
| total | | 2,498 |

N3.js also runs the W3C manifests (`spec/`, `rdf-test-suite`); Factoidal
runs those directly, so they are not ported again.

Classification (Claude-inferred, by file): portable API tests are the
parser data cases, writer, store and the RDF/JS parts of the data model
tests; N3.js internals are the lexer (273: token stream of N3.js's own
lexer), token callbacks, bundles and the `id`/`toJSON`/`hashCode` parts of
the term tests; N3-language tests (parser N3 mode, reasoner) depend on
#1059.

## 4. What was ported (stage 1) and the result

Command: `npm test` (all echoes) or `npm run test:enthie`; 1,460 enthie
tests, 1,460 pass (each failing case is an expected failure with a verdict,
section 5). Raw outcomes: `ENTHIE_RECORD=$PWD/rec.jsonl node --test 'conformance/enthie/*.test.mjs'`
with an empty `cases` in `verdicts.json`, then
`node tools/enthie-study/triage.mjs rec.jsonl`, which prints the counts
below and writes `verdicts.json`. `@factoidal/core` 0.16.0.

| suite (case prefix) | ported | pass | defect | divergence | gap |
|---|---|---|---|---|---|
| rdfjs-base data model on `core.dataFactory` (`rdfjs-data-model/core`) | 83 | 81 | 0 | 2 | 0 |
| the same on enthie `DataFactory` (`rdfjs-data-model/enthie`) | 83 | 81 | 0 | 2 | 0 |
| rdfjs-base DatasetCore on the engine `Dataset` (`rdfjs-dataset/core`) | 37 | 36 | 0 | 1 | 0 |
| the same on enthie `Store` (`rdfjs-dataset/enthie`) | 37 | 36 | 0 | 1 | 0 |
| RDF/JS spec-text probes (`rdfjs-spec/core`, written here) | 9 | 7 | 2 | 0 | 0 |
| N3.js parser data cases (`n3js-parser`) | 1,044 | 771 | 26 | 23 | 224 |
| N3.js writer `shouldSerialize` cases (`n3js-writer`) | 67 | 1 | 1 | 62 | 3 |
| N3.js store, hand port (`n3js-store`) | 100 | 58 | 0 | 33 | 9 |
| total | 1,460 | 1,071 | 29 | 124 | 236 |

Parser: the 1,044 are every `it(…, shouldParse | shouldNotParse |
shouldParseWithCommentsEnabled | shouldCallbackComments |
shouldNotParseWithComments)` and `itShouldResolve` in N3Parser-test.js
(429 parse, 196 must-not-parse, 414 IRI resolution, 5 comment cases),
extracted as data by `tools/enthie-study/extract.mjs` (syntax tree, no
execution). Not ported: 44 hand-written `it` blocks and one `it` in a loop.
Of the 821 cases that do not use an N3 format option, 771 pass (93.9%).
Adaptations: quads are compared by RDF dataset isomorphism (engine), not by
N3.js's blank node labels; must-not-parse cases check that the parse fails,
not the message text.

Writer: 67 of 152 (`shouldSerialize` cases). Exact text is the upstream
expectation; 53 cases use names that are not IRIs (`<a>`). The 85
hand-written `it` blocks (`quadToString` with relative names, base IRIs,
`blank`/`list`, version directives, end-stream options) are not ported.

Store: 100 of 432, hand-ported in upstream order: 'The Store export', 'An
empty Store', 'A Store with initialized with 5 elements', and the search,
count and remove blocks of 'A Store with 7 elements'. Adaptation: names
`s1` become `http://example.org/s1`, and N3.js id strings and plain
`{subject, predicate, object}` objects are made terms by the test.

Not ported in stage 1: N3StreamParser/Writer (gap G2), N3Reasoner (G7),
N3Lexer (internal), N3Util, the term class tests (RDF/JS part covered by the
rdfjs-base suite; N3.js extras G9), the remaining 332 store tests
(`match` semantics 1,258 lines, lists, RDF-star removal, observers).

## 5. Semantics that differ (measured)

| behaviour | N3.js | Factoidal (measured) | verdict and cases |
|---|---|---|---|
| relative names with no base (`<a>`, `<>`) | kept as `NamedNode('a')` in Parser, Writer and Store | refused: `term.invalid-iri` | divergence, RDF 1.2 Concepts §3.2 and Turtle 1.2 §6.3: parser 2, writer 53; store tests adapted |
| relative base IRI (`./`, `//base/a/b`) | resolves against it | "no base to resolve against" | divergence, RFC 3986 §5.1: 10 |
| default syntax (no format) | one reader for Turtle + TriG + N-Quads statements, mixed | engine infers one syntax (`detectFormat`) | four-term statements in Turtle: divergence (Turtle 1.2 §6.5, TriG 1.2 §5), 7; mis-inference of valid input: defect #1058, 19 |
| triple term as subject | allowed (RDF-star) | refused | divergence, RDF 1.2 Concepts §3.1: dataset 2, store 33 |
| prefix IRI with dot segments | `<http://ex.org/a/bb/ccc/../>` kept as written | dot segments removed | divergence, RFC 3986 §5.2.2 via Turtle 1.2 §6.3: 1 |
| unknown `VERSION "1.2-unknown"` | error | accepted | divergence, N-Triples 1.2 §6.1 (version is a hint): 1 |
| byte order mark in N-Triples | skipped | refused | divergence, N-Triples 1.2 §5.3 grammar: 1 |
| `"c" @en` (white space before the tag) | accepted | refused | divergence, open question (section 8): 1 |
| writer output text | N3.js's layout, `.` without space | engine layout, isomorphic | divergence (Turtle defines no layout): 4 |
| IRI `<a:bc>` with prefix `a:` declared | written as `a:bc` (denotes `http://a.org/bc`) | written as `<a:bc>` | divergence, Turtle 1.2 §2.4: 4 |
| blank node predicate | written | refused | divergence, RDF 1.2 Concepts §3.1: 1 |
| `fromTerm(null)` | (rdfjs-base) `null` | TypeError | divergence, RDF/JS DataFactory IDL takes a Term: 4 |
| language tag case | lowercased | factory keeps case; parser lowercases | defect #1054 |
| `literal(5)`, `literal(true)`, `literal(new Date())` | typed literal | String() in core; enthie throws (G4) | gap G4, #1051 |
| `parse(text)` | synchronous array | Promise of the array | divergence D1 (API shape) |
| blank node labels | `b0_name` per parser | `d1_name` per document | same semantics; tests compare by isomorphism |

## 6. Issues filed (danbri/factoidal, label `enthie`)

- https://github.com/danbri/factoidal/issues/1054: RDF/JS `dataFactory.literal` keeps the case of the language tag (spec: lowercase); parse() lowercases. Also: `index.d.ts` `Literal` lacks `direction`; `literal(v, rdf:langString)` silently becomes xsd:string. 2 cases.
- https://github.com/danbri/factoidal/issues/1055: N-Triples 1.2 and N-Quads 1.2 readers refuse `VERSION` (N-Triples 1.2 §5.3 productions 2-4). 4 cases.
- https://github.com/danbri/factoidal/issues/1056: TriG reader accepts a top-level triple with no final `.`. 1 case.
- https://github.com/danbri/factoidal/issues/1057: non-IRIs accepted as IRIs (`{|^}` characters; `_` in a scheme read as absolute in N-Triples and relative in Turtle); the Turtle writer writes text it cannot read. 3 cases.
- https://github.com/danbri/factoidal/issues/1058: `parse()` with no format infers JSON-LD for Turtle/TriG beginning with `[` or `{`, and Turtle for N-Quads. 19 cases.
- https://github.com/danbri/factoidal/issues/1059: no Notation3 reader (feature; gap G1). 224 parser and 3 writer cases.

Existing issues referenced: #884 (RDF/JS Stream interfaces; G2), #1051
(JS value to literal, filed by hardylib; G4), #883 (N3 writer), #1053
(syntax from media type; see section 8).

## 7. Gap list (enthie)

| id | gap | needs |
|---|---|---|
| G1 | Notation3 reading and writing (`format: 'N3'`, `'N3Star'`, `'text/n3'`) | engine op (#1059, #883) |
| G2 | streams: StreamParser, StreamWriter, `Store.import/remove`, `match()` and `removeMatches()` as readable streams | RDF/JS Stream over the engine's streaming readers (#884) |
| G3 | comment callbacks (`onComment`) are never called | the engine to report comments |
| G4 | `DataFactory.literal` with a JS number, boolean, BigInt or Date | engine JS-value-to-literal table (#1051) |
| G5 | `Writer.blank`, `Writer.list` (N3.js builds Turtle `[ ]` and `( )` text) | JS-side term builders only (no semantics); not done |
| G6 | `Store.createBlankNode` (a label not used in the store) | label supply from the engine |
| G7 | N3 Reasoner (N3 rules) | N3 rules engine, after G1 |
| G8 | Store dataset algebra (`union`, `difference`, `equals`, `toCanonical`, ...) | most map to engine ops (`isomorphic`, `canonicalize`); not done |
| G9 | N3.js term extras (`id`, `toJSON`, `hashCode`, `termFromId`, `termToId`, N3Util) | N3.js's own id notation; not planned |

Divergence D1: `new Parser().parse(text)` answers a Promise; N3.js answers
the array synchronously. The engine parse is asynchronous (it loads the
engine and may resolve extension rounds). A synchronous `parse` after
`await ready()` would need a synchronous core entry point.

## 8. Mapping onto core, and open questions

- Store is an engine `Dataset` handle. N3.js's `new Store()` is synchronous;
  enthie makes it with `Dataset.clone()` of an empty Dataset opened by
  `await ready()`. Without `ready()` the constructor throws.
- `Writer.quadToString` and `quadsToString` are synchronous after `ready()`
  (core's `quadToNQuads` is a synchronous engine call). `end()` is
  asynchronous.
- Distinct `getSubjects()` etc. use the engine's N-Quads token of each term
  as the key; JS does not compare terms itself.
- The `format` option: enthie reproduces N3.js's own option rule (last word,
  substring `turtle`/`trig`/`triple`/`quad`/`n3`), which makes media types
  like `text/turtle` work. That reads N3.js's option, not the input; but it
  is close to "syntax from a media type", which #1053 (leana) asks the
  engine to own. Owner question: keep this rule in the echo, or wait for #1053?
- Open question: is `"c" @en` (white space between a string and its language
  tag) valid Turtle 1.2? The grammar (§6.5 production 22) has no white space
  token there and §6.1 makes only `String` white-space-significant; N3.js
  accepts it. Recorded as divergence pending a ruling.
- Open question: should a Turtle/TriG writer write the caller's prefixes
  when there are no triples (N3.js does; core writes nothing)?
- Name: `enthie` is a placeholder.

## 9. Licence

N3.js, rdfjs-base/data-model and rdfjs-base/dataset are MIT. Every derived
file carries the full MIT notice of its source and says what changed:
`conformance/enthie/n3js/*.mjs` (extracted cases, `support.mjs`),
`conformance/enthie/n3js-store.test.mjs`, `conformance/enthie/rdfjs/**`.
The runners and `packages/enthie` contain no N3.js code (API names only).
NOTICE lists the sources. The RDF/JS specifications were read and cited,
not copied.
