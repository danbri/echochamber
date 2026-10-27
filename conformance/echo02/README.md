# Parser and serializer tests of the RDFLib-style echo (echo02)

Ported from RDFLib (BSD 3-Clause; `data/LICENSE-RDFLib`, `data/PROVENANCE.md`)
at commit 58c3700e5e21b5b833d0e31072f930c665059db2, run against
`@factoidal/core` 0.18.0 from npm (pinned in `verdicts.json`; a test checks
the version). No new API is needed: the runner calls `parse`,
`Dataset.serialize`, `Dataset.query`, `fromQuads` and `isomorphic`.

    npm test                                    # from the repository root
    node --test conformance/echo02/parse-serialize.test.mjs

What runs (`cases.mjs`, 1,438 cases):

- `roundtrip/...`: RDFLib's `test_roundtrip.py`. Each input (62 valid
  `nt_misc` files, 59 `n3roundtrip` files, the 12 `EXTRA_FILES`, and 4 more
  RDFLib data files) is read, written in each of RDFLib's 10 round-trip
  formats (xml, n3, turtle, nt, json-ld, nquads, trix, trig, hext, patch),
  read back and compared by the engine's isomorphism. For the triple-only
  writers the union of the graphs is written, as RDFLib's writers do with a
  ConjunctiveGraph; the engine computes the union (SPARQL CONSTRUCT).
- `nt-negative/...`: the 19 files `test_roundtrip.py` leaves out as not
  N-Triples (`INVALID_NT_FILES`); each must be refused.
- `variants/...`: RDFLib's `test_variants.py`. Files that differ only in
  suffix or in `-variant-*` are one graph; each must be isomorphic to the
  preferred one, and `-meta.json` asserts (`quad_count`,
  `has_subject_iris`) must hold. The 4 `.py` variants are hand-ported in
  `python-variants.mjs`. `exact_match` (blank node labels compared) is
  replaced by isomorphism: labels are local to a document (RDF 1.1 Concepts
  3.5).

Verdicts (CLAUDE.md rule 2), `verdicts.json`; each verdict case must fail,
and fails loudly with "now passes" when it stops failing:

| outcome | cases | verdict |
|---|---|---|
| pass | 511 | — |
| N3 has no reader or writer in core | 669 | divergence: N3 is not an RDF Recommendation syntax; reader and writer asked in https://github.com/danbri/factoidal/issues/883 |
| TriX, HexTuples, RDF Patch writers (and 7 HexTuples variant readers) | 235 | divergence: not W3C syntaxes |
| `even_more_literals.nt` uses `\/` (10 formats) | 10 | divergence: N-Triples grammar ECHAR |
| RDF/XML of `qname-02.nt`, `rdflibtest-pnamebrackets.nt` refused | 2 | divergence: RDF/XML section 8 (RDFLib marks them xfail too) |
| RDF/XML writes CR raw (`literals-02`, `literals-05`, `rdflibtest05`, `test.nt`) | 4 | **defect** https://github.com/danbri/factoidal/issues/1047 |
| RDF/XML refuses `<example:predicate>` (`special_chars`, `diverse_triples`, `diverse_quads` x2) | 4 | **defect** https://github.com/danbri/factoidal/issues/1048 |
| `schema_only_base` .ttl, `xml_literal` .rdf, `rdf11trig_eg2` .jsonld | 3 | divergence: RFC 3986 5.2.3; RDF/XML 7.2.17 with Concepts 3.3; JSON-LD 1.1 graph objects |

Measured 2026-10-27 with `@factoidal/core` 0.16.0 and again with 0.17.0 and 0.18.0
(same result): 1,438 cases, 511 pass, 8 defects, 919 divergences; the whole file runs in under 1 s. Upstream xfails
that pass here: the `diverse_quads` .nq and .jsonld variants, and the
JSON-LD round trips of `diverse_quads.trig`, `bnode_refs.trig` and
`keywords-04.nt`.

`verdicts.json` is written by `tools/echo02-study/mkverdicts.cjs` from a run
with `ECHO02_REPORT=<file>`; its rules name every failure, and it stops on
an unexplained one.
