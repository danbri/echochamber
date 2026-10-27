# leana: gaps

A Jena method whose semantics `@factoidal/core` does not have throws
`LeanaUnsupportedError` (`.gap` is the key below, `.issue` the danbri/factoidal
issue that asks for the engine op). leana does not reimplement these in
JavaScript (echochamber CLAUDE.md rule 1). `conformance/leana/gaps.test.mjs`
checks that every `unsupported(...)` call in `packages/leana/src` is listed here.

Pinned: `@factoidal/core` 0.18.0 (npm).

## value-matching: Value-based matching of literals

Issue: https://github.com/danbri/factoidal/issues/1052

Jena's default Model (`createDefaultModel`, over `createDefaultGraphSameValue`) finds `"01"^^xsd:integer` with `"1"^^xsd:integer`; `sameValueAs` exposes the relation. @factoidal/core matches by term (RDF 1.1 Concepts section 3.6), which is what leana's Graph and Model do. Ported tests that need value matching and simply get a different answer carry `"noThrow": true`.

- `GraphMemFactory.createDefaultGraphSameValue`
- `Literal.sameValueAs`
- `LiteralLabel.getIndexingValue`
- `LiteralLabel.sameValueAs`
- `ModelFactory.createModelSameValue`
- `Node.getIndexingValue (literal)`
- `Node.sameValueAs`
- `RDFDatatype.isEqual`
- `Triple.Field.fieldObject.filterOn (sameValueAs)`
- `Triple.Field.fieldObject.filterOnConcrete (sameValueAs)`

## js-value-literal: A literal from a JavaScript value

Issue: https://github.com/danbri/factoidal/issues/1051 (item 1)

Jena picks the datatype from the Java class (`99` xsd:int, `99L` xsd:long, `14.0f` xsd:float, ...). A JS number cannot carry that, and the choice is an engine table, not JS. Literals from a lexical form and a datatype IRI work (`createTypedLiteral(lex, dt)`, `NodeFactory.createLiteralDT`).

- `LiteralLabelFactory.createByValue`
- `LiteralLabelFactory.createTypedLiteral(value)`
- `Model.add(Resource, Property, value)`
- `Model.addLiteral(Resource, Property, value)`
- `Model.containsLiteral(Resource, Property, value)`
- `Model.createLiteralStatement(Resource, Property, value)`
- `Model.createTypedLiteral(value, datatype)`
- `Model.createTypedLiteral(value)`
- `Model.listLiteralStatements(Resource, Property, value)`
- `new XSDDateTime(Calendar)`
- `NodeFactory.createLiteralByValue`
- `NodeValue.asNode of a value made from a JavaScript value`
- `RDFDatatype.getJavaClass`
- `RDFDatatype.isValidValue`
- `Resource.addLiteral(Property, value)`
- `Resource.hasLiteral(Property, value)`
- `ResourceFactory.createTypedLiteral(value)`
- `Statement.changeLiteralObject(value)`
- `TypeMapper.getTypeByClass`
- `TypeMapper.getTypeByValue`

## literal-value: The value of a literal

Issue: https://github.com/danbri/factoidal/issues/1051 (item 2)

Lexical-to-value mapping: `getValue`, `getInt`, ..., datatype `isValid`/`parse`. `getLexicalForm`, `getLanguage`, `getDatatypeURI` and a datatype object naming the IRI work.

- `JenaParameters.<flag> = <the other value>`
- `Literal.getBoolean`
- `Literal.getByte`
- `Literal.getChar`
- `Literal.getDouble`
- `Literal.getFloat`
- `Literal.getInt`
- `Literal.getLong`
- `Literal.getShort`
- `Literal.getValue`
- `Literal.isWellFormedXML`
- `LiteralLabel.getValue`
- `LiteralLabel.isWellFormed`
- `Node.getLiteralValue`
- `RDFDatatype.cannonicalise`
- `RDFDatatype.isValid`
- `RDFDatatype.isValidLiteral`
- `RDFDatatype.parse`
- `RDFDatatype.unparse`
- `RDFParser.canonicalValues(true)`
- `Statement.getBoolean`
- `Statement.getByte`
- `Statement.getChar`
- `Statement.getDouble`
- `Statement.getFloat`
- `Statement.getInt`
- `Statement.getLong`
- `Statement.getShort`
- `TypeMapper.registerDatatype`

## syntax-from-name: RDF syntax from a file name or media type

Issue: https://github.com/danbri/factoidal/issues/1053

Give the `Lang`: `RDFParser.source(path).lang(Lang.TTL)` works; `RDFParser.source(path)` alone does not.

- `Lang.getContentType`
- `Lang.getFileExtensions`
- `Lang.getHeaderString`
- `RDFDataMgr.determineLang`
- `RDFLanguages.contentTypeToLang`
- `RDFLanguages.fileExtToLang`
- `RDFLanguages.filenameToLang`
- `RDFLanguages.pathnameToLang`
- `RDFParser.source(path) with no lang (syntax from the file name)`

## iri-split: IRI split, qnames, prefix-name legality

Issue: https://github.com/danbri/factoidal/issues/1051 (item 4)

Namespace/local-name split (Jena `SplitIRI.splitXML`) and the XML 1.1 NCName check. `expandPrefix` and `shortForm` (string prefix table lookups, as Jena defines them) work. `setNsPrefix` does not check the prefix (Jena throws `IllegalPrefixException`): `BaseTestPrefixMapping.testCheckNames` carries `noThrow`.

- `Model.listNameSpaces`
- `Node.getLocalName`
- `Node.getNameSpace`
- `Node.toString(PrefixMapping)`
- `PrefixMapping.qnameFor`
- `Resource.getLocalName`
- `Resource.getNameSpace`

## vocabulary: Vocabulary IRIs

Issue: https://github.com/danbri/factoidal/issues/1051 (item 5)

leana holds no rdf:, rdfs:, xsd:, owl: IRIs (the ported tests hold Jena's `Standard` and `Extended` tables as test data in `conformance/leana/lib/testlib.mjs`).

- `Model.createLiteral(String, true) (rdf:XMLLiteral)`
- `Model.createReifiedStatement`
- `Model.createReifier`
- `Model.createResource(Resource type)`
- `Model.createResource(String, Resource type)`
- `Model.getAnyReifiedStatement`
- `Model.isReified`
- `Model.listReifiedStatements`
- `Model.removeAllReifications`
- `Model.removeReification`
- `new XSDDouble(name, Class)`
- `OWL.<term>`
- `OWL2.<term>`
- `PrefixMapping.Extended`
- `PrefixMapping.Standard`
- `Property.getOrdinal`
- `RDF.<term>`
- `ReifierStd.allNodes`
- `ReifierStd.findEither`
- `ReifierStd.findExposed`
- `ReifierStd.getTriple`
- `ReifierStd.hasTriple`
- `ReifierStd.reifyAs`
- `ReifierStd.remove`
- `Statement.createReifiedStatement`
- `Statement.getStatementProperty`
- `Statement.isReified`
- `Triple.toString(PrefixMapping) (datatype written with PrefixMapping.Standard)`

## collections: RDF collections and containers

Issue: https://github.com/danbri/factoidal/issues/1051 (item 6)

`rdf:first`/`rdf:rest` lists, `rdf:Seq`/`Bag`/`Alt`.

- `Model.createAlt`
- `Model.createBag`
- `Model.createList`
- `Model.createSeq`
- `Model.getAlt`
- `Model.getBag`
- `Model.getList`
- `Model.getSeq`
- `new Container`
- `new RDFList`
- `RDFNode.as(RDFList | Container | Seq | Bag | Alt)`
- `RDFNode.canAs(RDFList | Container | Seq | Bag | Alt)`
- `Statement.getAlt`
- `Statement.getBag`
- `Statement.getList`
- `Statement.getSeq`

## isomorphism-rdf12: Isomorphism with blank nodes and triple terms

Issue: https://github.com/danbri/factoidal/issues/957

`isIsomorphicWith` is decided by the engine's RDFC-1.0 canonical form, which has no rule for RDF 1.2 triple terms. Without blank nodes leana compares the triple sets.

- `Graph.isIsomorphicWith (blank nodes and triple terms)`

## syntaxes: RIOT syntaxes and parser/writer options

Issue: https://github.com/danbri/factoidal/issues/1088

`@factoidal/core` reads and writes N-Triples, N-Quads, Turtle, TriG, RDF/XML and JSON-LD (`formats()`). `Lang.RDFJSON`, `TRIX`, `RDFTHRIFT`, `RDFPROTO`, `SHACLC`, `CSV` and `TSV` exist as names (`nameToLang` finds them); reading or writing them is this gap. `Lang.N3` reads with the Turtle reader, as in Jena. Blank node labels as given and relative IRIs on output need parse and write options.

- `LabelToNode.createUseLabelAsGiven`
- `Model.write(out, lang, base)`
- `RDFWriter.base`
- `RIOT read of a syntax the engine does not read (RDF/JSON, TriX, RDF Thrift, RDF Protobuf, SHACLC, CSV)`
- `RIOT write of a syntax the engine does not write (RDF/JSON, TriX, RDF Thrift, RDF Protobuf, SHACLC, CSV)`

## query: SPARQL object model, substitution, timeouts, property functions

Issue: https://github.com/danbri/factoidal/issues/1089

Queries and updates run in the engine (`Dataset.query`, `Dataset.update`); `execSelect`, `execAsk`, `execConstruct`, `execDescribe`, `UpdateExecution.execute` and the `ResultSetFormatter` writers answer a Promise. `QueryFactory.create` keeps the text, so a syntax error is a `QueryParseException` when the query runs, not when it is created. Initial bindings (`initialBinding`, `QueryExecutionFactory.create(q, m, qsm)`) are a trailing `VALUES` clause. Result sets of SPARQL 1.2 queries and result sets made in code have no formatter output (the engine's results writers read SPARQL 1.1 queries).

- `initial binding of a blank node (SPARQL VALUES has no blank nodes)`
- `PropertyFunctionRegistry (property functions)`
- `Query.getPrefixMapping (syntax tree)`
- `Query.getQueryPattern (syntax tree)`
- `Query.getResultVars / getProjectVars`
- `Query.isSelectType and the query form`
- `Query.serialize (query syntax tree)`
- `Query.setLimit / setOffset / setDistinct (syntax tree)`
- `QueryExecution.execJson (ARQ JSON query form)`
- `QueryExecution.substitution (syntax substitution)`
- `QueryExecution.timeout`
- `ResultSetFormatter output of a result set not made by a SPARQL 1.1 query`
- `UpdateRequest.getOperations (update syntax tree)`

## inference: Jena rules and a live inference graph

Issue: https://github.com/danbri/factoidal/issues/1087

Jena's rule language (`Rule.parseRules`, `GenericRuleReasoner`) has no reader or engine in @factoidal/core, and Jena's `InfModel` is live and synchronous, where the core closures (`closure`, `Dataset.closure`) answer a Promise of a snapshot. `InfModel`, `Rule`, `GenericRuleReasoner` and `ReasonerRegistry` exist as names only.

- `GenericRuleReasoner`
- `ModelFactory.createInfModel`
- `ModelFactory.createOntologyModel`
- `ModelFactory.createRDFSModel`
- `ReasonerRegistry.getOWLMicroReasoner`
- `ReasonerRegistry.getOWLMiniReasoner`
- `ReasonerRegistry.getOWLReasoner`
- `ReasonerRegistry.getRDFSReasoner`
- `ReasonerRegistry.getTransitiveReasoner`
- `Rule.parseRule`
- `Rule.parseRules`
- `Rule.rulesFromURL`

## echo: Not done in leana (no engine semantics missing)

Issue: none (echo gap).

API that stage 1 does not cover: listeners and events, transactions, query (stage 2), inference (stage 3), datasets, error handlers, HTTP sources, N3/RDF-JSON/TriX and other syntaxes the engine does not read, Jena 2 reader adapters, `Node_Graph`.

- `DatasetFactory (stage 2)`
- `DatasetGraphFactory (stage 2)`
- `ErrorHandlerFactory.getDefaultErrorHandler`
- `ErrorHandlerFactory.setDefaultErrorHandler`
- `FactoryRDFStd`
- `Graph.getCapabilities`
- `Graph.getEventManager`
- `Graph.getTransactionHandler`
- `LabelToNode.createScopeByDocumentHash`
- `LabelToNode.createUseLabelAsGiven`
- `Lang.CSV`
- `Lang.N3`
- `Lang.RDFJSON`
- `Lang.RDFPROTO`
- `Lang.RDFTHRIFT`
- `Lang.SHACLC`
- `Lang.TRIX`
- `LocatorFile`
- `Model.begin (transactions)`
- `Model.createReifiedStatement`
- `Model.getLock`
- `Model.listReifiedStatements`
- `Model.listStatements(Selector)`
- `Model.notifyEvent`
- `Model.query(Selector)`
- `Model.register (listeners)`
- `Model.unregister (listeners)`
- `Model.write(out, lang, base)`
- `ModelFactory.createInfModel (stage 3)`
- `ModelFactory.createMemModelMaker`
- `ModelFactory.createOntologyModel`
- `ModelFactory.createRDFSModel (stage 3)`
- `ModelFactory.createUnion`
- `Node_Graph`
- `QueryExecution (stage 2)`
- `QueryFactory (stage 2)`
- `QuerySolutionMap (stage 2)`
- `RDFDataMgr.loadDataset (datasets: stage 2)`
- `RDFDataMgr.loadDatasetGraph (datasets: stage 2)`
- `RDFLanguages.N3`
- `RDFLanguages.RDFJSON`
- `RDFLanguages.TRIX`
- `RDFNode.as(<class>) for a class other than RDFNode, Resource, Property, Literal, StatementTerm`
- `RDFNode.canAs(<class>) for those classes`
- `RDFParser.checking`
- `RDFParser.errorHandler`
- `RDFParser.factory`
- `RDFParser.labelToNode`
- `RDFParser.prefixes (initial prefix map)`
- `RDFParser.source(URL) (HTTP)`
- `RDFParser.streamManager`
- `RDFParser.strict`
- `RDFParser.toDataset (datasets: stage 2)`
- `RDFParser.toDatasetGraph (datasets: stage 2)`
- `RDFReaderFactoryRIOT.getReader`
- `RDFWriter.base`
- `RDFWriter.output(path)`
- `ResourceFactory.setInstance`
- `Statement.createReifiedStatement`
- `Statement.getStatementProperty`
- `Statement.isReified`
- `StreamManager`

## Divergences (not gaps)

Where Jena and the specification differ, the ported test carries a `divergence` verdict with the section. Recurring ones:

- Language tag case: `@factoidal/core` lowercases (`en-UK` is `en-uk`); RDF 1.1 Concepts section 3.3 allows it. Jena formats per BCP 47.
- Generalized triples: a literal or blank-node predicate, a literal subject or a variable is refused (RDF 1.1 Concepts section 3.1); Jena's memory graphs store them.
- Relative IRIs in N-Triples and a missing final `.` in Turtle are refused (RDF 1.1 N-Triples section 2.3; RDF 1.1 Turtle section 6.5, rule [2]); Jena's parsers accept them.
- `"abc"^^rdf:langString` without a language and `"abc"^^rdf:dirLangString` without a direction (RDF 1.1 Concepts section 3.3, RDF 1.2 Concepts section 3.4).

## API shape that differs from Jena (not gaps)

- Parsing answers a Promise (`RDFParser...parse()`, `RDFDataMgr.read()`, `Model.read()`), because `@factoidal/core` `parse()` does. Everything else is synchronous after `import`.
- `Model` and `Graph` match by term; `ModelFactory.createDefaultModel()` is a same-term model.
- Java `Set`/`Map` results are `JenaSet` (equals/hashKey semantics) and JS `Map`.
- Datatype objects (`BaseDatatype`) name an IRI only.
