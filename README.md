# echochamber

Testing API compatibility and spec interpretations.

Each **echo** is a JavaScript package that gives the API of an existing RDF
library over [`@factoidal/core`](https://www.npmjs.com/package/@factoidal/core),
the Factoidal engine (Lean 4, compiled to WebAssembly). Each echo also ports
that library's own test suite. Where Factoidal and the library disagree, the
specification decides, and the case is recorded as one of:

- a Factoidal defect, with an issue in [danbri/factoidal](https://github.com/danbri/factoidal);
- a divergence: the library extends or differs from the specification (section cited);
- a gap in the echo itself.

Echoes are an application *of* Factoidal. They add no code to
`@factoidal/core` and ship no WebAssembly of their own.

| echo | npm name | in the style of | status |
|---|---|---|---|
| leana | `@factoidal/leana` (private) | Apache Jena (Java) | stages 1 and 2: Graph, Model, events, composition graphs, PrefixMapping, RIOT, Dataset/DatasetGraph, transactions, SPARQL query and update, result sets, extension functions; 1,939 Jena tests ported, 1,236 pass (`conformance/leana`) |
| Hardylib | `@factoidal/hardylib` (prototype, private) | RDFLib (Python) | feasibility study; parser and serializer data tests ported (`conformance/hardylib`); prototype |
| Enthie | `@factoidal/enthie` (prototype, private) | N3.js and RDF/JS (JavaScript) | feasibility study; N3.js parser, writer and store tests and the RDF/JS data model and dataset suites ported (`conformance/enthie`); prototype |
| MoonForge | `@factoidal/moonforge` (no package yet) | Eclipse RDF4J (Java) | feasibility study; stage 0: 2,801 of RDF4J's own test cases (SPARQL, functions, Rio, SHACL) run as data (`conformance/moonforge`) |

Names chosen by the owner, 2026-10-27; `leana` may change after a check with the Apache Jena project. The libraries named above are
trademarks or project names of their owners; an echo is not affiliated with
or endorsed by them. "In the style of" describes API compatibility only.

## Status on `@factoidal/core` 0.18.0

Measured on main d49c5a5 (2026-10-27, after leana stage 2), Node 22.22.2. Each ported case is one
of: pass (the echo gives the answer the upstream test expects), defect,
divergence or gap (see above).

| echo | ported | pass | defect | divergence | gap | details |
|---|---:|---:|---:|---:|---:|---|
| leana (Jena-style) | 1,939 | 1,236 | 5 | 89 | 609 | [feasibility](docs/leana/feasibility.md), [`conformance/leana`](conformance/leana) |
| Hardylib (RDFLib-style) | 1,438 | 511 | 8 | 919 | 0 | [feasibility](docs/hardylib/feasibility.md), [`conformance/hardylib`](conformance/hardylib) |
| Enthie (N3.js/RDF-JS-style) | 1,460 | 1,071 | 29 | 124 | 236 | [feasibility](docs/enthie/feasibility.md), [`conformance/enthie`](conformance/enthie) |
| MoonForge (RDF4J-style) | 2,801 | 2,201 | 300 | 300 | 0 | [feasibility](docs/moonforge/feasibility.md), [`conformance/moonforge`](conformance/moonforge) |

Commands: `npm test`: 7,655 tests, 7,655 pass, 0 fail (a case that is not a
pass is an expected failure with its verdict). leana: `npm run count:leana`.
Hardylib, Enthie, MoonForge: the verdicts in each `verdicts.json`, against
the number of ported cases.

Changes by core version (only MoonForge changed; the other echoes have the
same counts on 0.16.0, 0.17.0 and 0.18.0; leana grew from 748 ported, 317
pass in stage 1 to the counts above in stage 2, https://github.com/danbri/echochamber/pull/9):

| core | MoonForge pass | defect | cause |
|---|---:|---:|---|
| 0.16.0 | 2,124 | 377 | first port |
| [0.17.0](https://github.com/danbri/factoidal-core/releases/tag/v0.17.0) | 2,150 | 351 | 26 cases fixed by the SPARQL string-function types, https://github.com/danbri/factoidal-core/pull/126 (here: https://github.com/danbri/echochamber/pull/5) |
| [0.18.0](https://github.com/danbri/factoidal-core/releases/tag/v0.18.0) | 2,201 | 300 | 51 cases now pass: 44 XSD constructor casts (https://github.com/danbri/factoidal-core/pull/142), 6 base direction in string functions (https://github.com/danbri/factoidal-core/pull/136), 1 JSON-LD keyword-form key (https://github.com/danbri/factoidal/issues/1064) (here: https://github.com/danbri/echochamber/pull/6) |

The next core release (https://github.com/danbri/factoidal-core/pull/148, not
published yet) has fixes for 16 defects that the echoes found. Core releases:
https://github.com/danbri/factoidal-core/releases.

## Layout

    packages/<echo>/      the npm package (JS over public @factoidal/core APIs)
    conformance/<echo>/   the ported test suite and its verdicts
    tools/<echo>-study/   scripts that read the upstream sources and count
    docs/<echo>/          feasibility notes and design records

Licence: Apache License 2.0. Derived material: see NOTICE.
