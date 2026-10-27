# RDFLib-style echo (echo02) study: scripts

The scripts behind `docs/echo02/feasibility.md`. They read a clone of RDFLib
(the study used commit 58c3700e5e21b5b833d0e31072f930c665059db2) with
Python's `ast` module and never import or run RDFLib. Clone it outside this
repository and run the scripts from here with `python3 -I`:

    git clone --depth 1 https://github.com/RDFLib/rdflib <dir>

- `api.py <dir> [-v]`: members declared by the main types; plugin names.
- `tcount.py <dir> [--files] [--json]`: test declarations and literal
  parametrize cases per file and area.
- `classify.py <tcount --json output>`: groups a, b1, b2, c (a judgement by path).
- `n3-as-turtle.mjs`: how many `n3roundtrip` files core reads as Turtle
  (information only).
- `mkverdicts.cjs <report.json>`: writes `conformance/echo02/verdicts.json`
  from a run with `ECHO02_REPORT=<report.json>`; stops on an unexplained failure.

Licence: the path rules in `classify.py` and the case rules in
`mkverdicts.cjs` describe RDFLib's test suite (BSD 3-Clause, Copyright (c)
2002-2026, RDFLib Team); no RDFLib code is copied.
