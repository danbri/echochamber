# Provenance of these data files

Byte-for-byte copies from RDFLib (https://github.com/RDFLib/rdflib), commit
58c3700e5e21b5b833d0e31072f930c665059db2 (2026-10-26). RDFLib: Copyright (c)
2002-2026, RDFLib Team. BSD 3-Clause License: `LICENSE-RDFLib` in this
directory. The files carry no per-file header because a header would change
the bytes the parsers read. Unchanged except where listed.

| here | RDFLib path | used upstream by |
|---|---|---|
| `variants/` (72 files; README.md left out) | `test/data/variants/` | `test/test_graph/test_variants.py`, `test/test_roundtrip.py` |
| `roundtrip/` (2) | `test/data/roundtrip/` | `test/test_roundtrip.py` |
| `nt_misc/` (81) | `test/data/suites/nt_misc/` | `test/test_roundtrip.py`, `test/test_nt_misc.py` |
| `n3roundtrip/` (59) | `test/data/suites/n3roundtrip/` | `test/test_roundtrip.py` |
| `misc/example-lots_of_graphs.n3`, `misc/issue156.n3`, `misc/sportquads.trig` | `test/data/` | `test/test_roundtrip.py`, `test/test_trig.py` |
| `misc/multiple-comments.ttl` | `test/data/contrived/` | `test/test_serializers/test_serializer_longturtle.py` |
| `misc/longturtle-target.ttl` | `test/data/longturtle/` | `test/test_serializers/test_serializer_longturtle.py` |
| `misc/test6.nq` | `test/data/nquads.rdflib/` | `test/test_parsers/test_nquads.py` |

The names in `nt_misc/` and `n3roundtrip/` (`anons-01`, `n3-writer-test-01`,
`rdf-test-02`, ...) follow the cwm and N3 test suites; RDFLib distributes them
under its licence and marks no other.
