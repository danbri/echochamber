# enthie conformance (N3.js-style echo)

Runners (`*.test.mjs`, node:test): the RDF/JS data model and DatasetCore
suites of rdfjs-base (in `rdfjs/`, MIT), RDF/JS spec-text probes, and the
N3.js parser, writer and store tests (`n3js/`, MIT). `verdicts.json` holds
the verdict of every case that does not meet the upstream expectation
(CLAUDE.md rule 2); `harness.mjs` makes those expected failures that fail
when they start passing. Counts and method: `docs/enthie/feasibility.md`.

    npm run test:enthie
