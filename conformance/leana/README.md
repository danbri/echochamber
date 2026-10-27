# leana conformance: Apache Jena tests on @factoidal/leana

Jena test methods ported to `node:test`, one file per Jena class, under the
Jena module and package they come from (`jena-core/graph`,
`jena-core/rdf-model`, `jena-core/shared`, `jena-arq/riot`, `jena-arq/api`).
Source: Apache Jena at commit `a1164c5dc5c9e1a9c58d94766c13d870e0a8ba98`
(Apache License 2.0). Each file names its Jena source and what was changed.

- `lib/harness.mjs`: `describeJena(cls, source, (t) => ...)`; each `t(name, fn)`
  is one Jena method, run under its verdict (CLAUDE.md rule 2).
- `lib/testlib.mjs`: ports of Jena's test helpers (NodeCreateUtils,
  GraphTestLib, ModelTestLib, JenaTestLib). The prefix tables
  `PrefixMapping.Standard` and `Extended` are test data here.
- `verdicts/<Class>.json`: one entry per method that does not meet Jena's
  expectation: `defect` (with the danbri/factoidal issue), `divergence` (with
  the specification section), or `gap` (with the key of
  `packages/leana/GAPS.md`; `"noThrow": true` when the gap shows as a different
  answer rather than as `LeanaUnsupportedError`). A method with a verdict must
  fail; if it starts to pass, the suite fails until the verdict is removed.
- `not-ported/<Class>.json`: methods of a ported class that are left out, each
  with its reason (Java-only: threads, serialization, reflection).
- `fixtures/`: data files copied from Jena (see `fixtures/NOTICE`).

Run from the repository root:

    npm test                              # every file; must be green
    node conformance/leana/count.mjs      # counts per verdict and class
