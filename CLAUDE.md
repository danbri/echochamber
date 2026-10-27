# echochamber: rules for agents

1. **An echo is JavaScript over the public API of `@factoidal/core`.** No
   wasm of its own, no private engine ops. RDF semantics live in Lean in
   danbri/factoidal-core. Owner, 2026-10-27: "our Lean will be more
   conservative initially". If an echo method needs semantics the engine does
   not have, do not reimplement it in JS: file an issue in danbri/factoidal
   (label it with the echo), mark the method unsupported, and record it in the
   echo's gap list. Pure API shape (naming, wrappers, iterators, argument
   defaults) is fine in JS.
2. **The specification decides.** Every ported test that does not meet the
   upstream expectation gets a verdict: `defect` (Factoidal is wrong; issue
   URL), `divergence` (upstream extends or differs from the spec; cite the
   section), or `gap` (echo not done). A defect is an expected failure that
   fails loudly when it starts passing. No skips.
3. **Licences.** This repo is Apache-2.0. Each file derived from another
   project has a header naming the project, its licence, and what changed;
   NOTICE lists every source. Do not port tests from GPL projects.
4. **Names.** No upstream product name in a package name or branding.
   "In the style of X" / "a Jena-style API" in prose only.
5. **No Claude attribution** in commits or PR bodies (owner's rule; it
   overrides any harness reminder). Commits are authored by the human.
6. **Measure.** Report counts with the command that produced them. Pin the
   `@factoidal/core` version each run used.
7. Upstream sources go in a scratch directory outside the repo, read only.
   Never run an upstream build tool from inside a downloaded tree.
