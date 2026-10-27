# @factoidal/leana

An RDF API in the style of Apache Jena, in JavaScript over the public API of
[`@factoidal/core`](https://www.npmjs.com/package/@factoidal/core). Working
name; not published (`private: true`). Design: `docs/leana/feasibility.md`.

Apache Jena is a project of The Apache Software Foundation. leana is not
affiliated with or endorsed by it; "in the style of" describes the API only.

## What is here (stage 1)

- `Node`, `NodeFactory`, `Triple`, `Node.ANY`, `Triple.ANY`
- `Graph` (Jena's Graph SPI: `add`, `delete`, `remove`, `clear`, `find`,
  `contains`, `size`, `isEmpty`, `isIsomorphicWith`, `getPrefixMapping`),
  `GraphMemFactory`, `GraphUtil`, `ExtendedIterator`
- `Model`, `ModelFactory`, `ResourceFactory`, `Statement`, `RDFNode`,
  `Resource`, `Property`, `Literal`, `StmtIterator`, `ResIterator`, `NodeIterator`
- `PrefixMapping`
- `Lang`, `RDFParser`, `RDFWriter`, `RDFDataMgr`, `RDFLanguages.nameToLang`,
  `StringReader`, `StringWriter`

```js
import { ModelFactory, RDFParser, RDFWriter, Lang } from '@factoidal/leana';

const m = ModelFactory.createDefaultModel();
await RDFParser.fromString('@prefix : <http://example/> . :s :p "o" .', Lang.TTL).parse(m);
const s = m.getResource('http://example/s');
console.log(m.listStatements(s, null, null).toList().map(String));
console.log(RDFWriter.source(m).lang(Lang.NTRIPLES).asString());
```

## How it differs from Jena

- **Term equality.** Every Graph and Model matches by RDF term (RDF 1.1
  Concepts section 3.6), as Jena's `GraphMemFactory.createGraphMem()`. Jena's
  `ModelFactory.createDefaultModel()` matches literals by value; leana's does not.
- **The engine decides.** Node equality is the engine's: two nodes are equal
  when `@factoidal/core` writes them as the same N-Quads term, so language
  tags follow the engine (`"x"@EN-gb` is `"x"@en-gb`). Isomorphism is the
  engine's RDFC-1.0 canonical form. Parse and write are the engine's.
- **Synchronous, except parsing.** Importing leana loads the engine (top-level
  `await`); every Graph and Model call after that is synchronous.
  `RDFParser...parse()`, `RDFDataMgr.read()` and `Model.read()` answer a
  Promise, because `@factoidal/core`'s `parse()` does.
- **Strings, and files with a Lang.** leana reads text, or a file path with an
  explicit `Lang`. It does not choose a syntax from a file name.
- **Generalized triples.** A literal subject, a variable, or a relative IRI is
  refused by the engine (`AddDeniedException`); Jena's in-memory graphs accept them.
- **Unsupported methods.** A Jena method that needs semantics `@factoidal/core`
  does not have throws `LeanaUnsupportedError` (with `.gap` and `.issue`); it
  is not reimplemented in JavaScript. The list is [GAPS.md](GAPS.md).

## Tests

The ported Jena tests are in `conformance/leana` (run `npm test` at the
repository root; `npm run count` prints the verdict counts).

Licence: Apache License 2.0.
