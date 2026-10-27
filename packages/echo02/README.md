# @factoidal/echo02 (working placeholder name; private prototype)

An API in the style of RDFLib (Python) over `@factoidal/core`: `Graph`,
`URIRef`, `BNode`, `Literal`, `Namespace`. Design and the RDFLib-to-JS
table: `docs/echo02/feasibility.md` section 5. Not published
(`"private": true`); the name is a placeholder until the owner chooses one.

```js
import { Graph, Namespace, Literal, URIRef } from '@factoidal/echo02';
const EX = Namespace('http://example.org/');
const g = await Graph.create();
g.add([EX.alice, EX.name, Literal('Alice', { lang: 'en' })]);
for (const [s, p, o] of g.triples([null, EX.name, null])) console.log(o.value);
console.log(await g.serialize({ format: 'turtle' }));
```

Every RDF decision is a call of `@factoidal/core` (CLAUDE.md rule 1). Terms
are core's RDF/JS terms.

## Gaps

Each throws `NotSupported` (with `.issue`) until the engine has an op:

| RDFLib | needs | issue |
|---|---|---|
| `Literal(12)`, `Literal(True)`, `Literal(date)` (Python value to literal) | datatype and lexical form chosen by the engine | https://github.com/danbri/factoidal/issues/1051 item 1 |
| `Literal.toPython()`, `.value`, `.ill_typed` (here `toValue`) | literal-to-value op | #1051 item 2 |
| literal normalisation (`NORMALIZE_LITERALS`) | canonical lexical form op | #1051 item 3 |
| `Graph.qname`, `compute_qname`, `NamespaceManager.qname/curie/expand_curie` | IRI split op | #1051 item 4 |
| `rdflib.namespace.RDF`, `RDFS`, `XSD`, `OWL`, ... (29 modules) | vocabulary table op | #1051 item 5 |
| `Graph.collection`, `Graph.items`, `Collection`, `Seq` | RDF list walk op | #1051 item 6 |
| N3 parse/serialize, `QuotedGraph` | N3 reader and writer | https://github.com/danbri/factoidal/issues/883 |
| TriX, HexTuples, RDF Patch, longturtle, pretty-xml formats | not W3C syntaxes; not asked | — |

Not yet written in the prototype (JS shape only, no engine gap):
`ConjunctiveGraph`/`Dataset`, `Resource`, file and URL sources,
`transitive_objects` (SPARQL property paths), `prepareQuery`.

Derived from RDFLib's API (names and signatures) at commit
58c3700e5e21b5b833d0e31072f930c665059db2; RDFLib: Copyright (c)
2002-2026, RDFLib Team, BSD 3-Clause License. No RDFLib code is copied.
