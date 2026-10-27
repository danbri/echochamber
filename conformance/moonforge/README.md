# The RDF4J-style echo (moonforge): ported test data

Eclipse RDF4J's own tests (not its W3C copies) run as data against
`@factoidal/core` (version pinned in `package.json`). Study, counts and
verdict tables: `docs/moonforge/feasibility.md`.

    npm ci && npm run test:moonforge    # from the repository root

| suite | source in RDF4J |
|---|---|
| `sparql/` | `testsuites/sparql/.../testcases-sparql-1.1`, `-1.2` manifests |
| `expr/` | `core/queryalgebra/evaluation/.../function`, `util` tests |
| `rio/` | Rio parser unit tests |
| `compliance/` | `testsuites/sparql/.../tests/*.java`, `SPARQLUpdateTest` |
| `shacl/` | `core/sail/shacl/src/test/resources/test-cases` |

Each `verdicts.json` lists the cases that do not meet RDF4J's expectation:
`defect` (issue URL), `divergence` (specification section) or `gap`. A listed
case that starts to pass fails the suite. Case data is derived from Eclipse
RDF4J, EDL 1.0 (BSD-3-Clause); see each `cases.json` `_notice` and the
repository `NOTICE`. The harness and test files are Apache-2.0.
