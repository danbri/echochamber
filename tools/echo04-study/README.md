# The RDF4J-style echo (echo04): study and port scripts

Scripts behind `docs/echo04/feasibility.md` and `conformance/echo04/`. They
read a shallow clone of Eclipse RDF4J (the study used commit
`fe7a441aa3f80f09993178b35f9f1e7a252932cc`), kept outside the repository and
read only. RDF4J and Maven are never run.

    git clone --depth 1 https://github.com/eclipse-rdf4j/rdf4j <dir>

- `tcount.py`, `classify.py`, `count.sh`, `api.py`: counts (section 3 and 4).
- `extract-sparql.mjs`: RDF4J's SPARQL manifests to `sparql/cases.json`
  (run from `conformance/echo04`).
- `extract-expr.py`: the SPARQL function tests to `expr/cases.json`.
- `extract-rio-build.mjs` with `rio-port-*.mjs`, `rio-lib.mjs`,
  `rio-verdicts-*.json`: the hand-ported Rio parser tests to `rio/cases.json`
  and `rio/verdicts.json`; `rio-run.mjs` runs one module;
  `extract-rio-w3c-compare.mjs` checks which Rio resources are W3C copies.
- `compliance-part-*.json`, `compliance-verdicts-*.json`,
  `compliance-merge.mjs`, `compliance-part-D-gen.mjs`, `compliance-run.mjs`:
  the hand-ported SPARQL compliance tests to `compliance/`.
- `shacl-extract.mjs`, `shacl-triage.mjs`, `shacl-report-iso.mjs`: the
  ShaclSail test cases to `shacl/`, their verdicts, and the report-graph
  comparison.

Licence: the case data in `rio-port-*.mjs`, `compliance-part-*.json` and the
files the extractors write are derived from Eclipse RDF4J, Eclipse
Distribution License 1.0 (BSD-3-Clause); Copyright (c) Eclipse RDF4J
contributors, Aduna, and others. Changed: Java tests and resource files
re-expressed as JSON cases for `@factoidal/core`. See the repository
`NOTICE`. The scripts and the verdict files are original to echochamber
(Apache-2.0).
