# enthie study scripts

Read the N3.js sources (never run them; acorn parses them) and count.
`npm install` here installs acorn only.

- `count.mjs <N3.js checkout>`: N3.js API surface and test counts per file
  (docs/enthie/feasibility.md sections 2 and 3).
- `extract.mjs <N3.js checkout> conformance/enthie/n3js`: writes
  `parser-cases.mjs` and `writer-cases.mjs` (the data-driven test cases).
- `triage.mjs <rec.jsonl>`: writes `conformance/enthie/verdicts.json` from
  recorded outcomes (see the file header).
