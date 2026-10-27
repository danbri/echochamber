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
| leana | `@factoidal/leana` (private) | Apache Jena (Java) | stage 1: Graph, Model, PrefixMapping, RIOT on strings; 748 Jena tests ported (`conformance/leana`) |
| Hardylib | `@factoidal/hardylib` (prototype, private) | RDFLib (Python) | feasibility study; parser and serializer data tests ported (`conformance/hardylib`); prototype |
| Enthie | `@factoidal/enthie` (prototype, private) | N3.js and RDF/JS (JavaScript) | feasibility study; N3.js parser, writer and store tests and the RDF/JS data model and dataset suites ported (`conformance/enthie`); prototype |
| MoonForge | `@factoidal/moonforge` (no package yet) | Eclipse RDF4J (Java) | feasibility study; stage 0: 2,801 of RDF4J's own test cases (SPARQL, functions, Rio, SHACL) run as data (`conformance/moonforge`) |

Names chosen by the owner, 2026-10-27; `leana` may change after a check with the Apache Jena project. The libraries named above are
trademarks or project names of their owners; an echo is not affiliated with
or endorsed by them. "In the style of" describes API compatibility only.

## Layout

    packages/<echo>/      the npm package (JS over public @factoidal/core APIs)
    conformance/<echo>/   the ported test suite and its verdicts
    tools/<echo>-study/   scripts that read the upstream sources and count
    docs/<echo>/          feasibility notes and design records

Licence: Apache License 2.0. Derived material: see NOTICE.
