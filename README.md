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
| leana | `@factoidal/leana` | Apache Jena (Java) | feasibility study done; expression tests ported (in core) |
| leanlib | `@factoidal/leanlib` | RDFLib (Python) | planned |
| leaner | `@factoidal/leaner` | N3.js and RDF/JS (JavaScript) | planned |
| lean4j | `@factoidal/lean4j` | Eclipse RDF4J (Java) | planned |

Names are working names and may change. The libraries named above are
trademarks or project names of their owners; an echo is not affiliated with
or endorsed by them. "In the style of" describes API compatibility only.

## Layout

    packages/<echo>/      the npm package (JS over public @factoidal/core APIs)
    conformance/<echo>/   the ported test suite and its verdicts
    tools/<echo>-study/   scripts that read the upstream sources and count
    docs/<echo>/          feasibility notes and design records

Licence: Apache License 2.0. Derived material: see NOTICE.
