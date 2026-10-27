// Port of core/rio/turtle CustomTurtleParserTest (Eclipse RDF4J, commit
// fe7a441aa3f80f09993178b35f9f1e7a252932cc). Derived from Eclipse RDF4J,
// Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse
// RDF4J contributors, Aduna, and others. Changed: test methods re-expressed
// as data (input text, format, expected outcome); Java string literals copied
// verbatim; the resource turtle-long-literals-test.{ttl,nt} inlined; expected
// models written as N-Quads.
const T = 'http://www.example.net/test';
const fooFr = `<urn:a> <${T}> "Foo"@fr-FR .\n`;
const XSD = 'http://www.w3.org/2001/XMLSchema#';
const RDFT = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const dt = '<urn:a> <urn:b> "testliteral"^^<urn:datatype> .\n';
export default {
  file: 'core/rio/turtle/src/test/java/org/eclipse/rdf4j/rio/turtle/CustomTurtleParserTest.java',
  class: 'CustomTurtleParserTest',
  defaults: { format: 'turtle' },
  cases: [
    { m: 'testSES1887NoLangTagFailure', input: "<urn:a> <http://www.example.net/test> \"Foo\"@.", expect: { reject: true }, note: 'error message text not compared' },
    { m: 'testSES1887Whitespace', input: "<urn:a> <http://www.example.net/test> \"Foo\"@fr-FR .", expect: { graph: fooFr } },
    { m: 'testSES1887Period', input: "<urn:a> <http://www.example.net/test> \"Foo\"@fr-FR.", expect: { graph: fooFr } },
    { m: 'testSES1887Semicolon', input: "<urn:a> <http://www.example.net/test> \"Foo\"@fr-FR;<http://other.example.org>\"Blah\"@en-AU.", expect: { graph: fooFr + '<urn:a> <http://other.example.org> "Blah"@en-AU .\n' } },
    { m: 'testSES1887Comma', input: "<urn:a> <http://www.example.net/test> \"Foo\"@fr-FR,\"Blah\"@en-AU.", expect: { graph: fooFr + `<urn:a> <${T}> "Blah"@en-AU .\n` } },
    { m: 'testSES1887CloseParentheses', input: "<urn:a> <http://www.example.net/test> (\"Foo\"@fr-FR).",
      expect: { graph: `<urn:a> <${T}> _:l .\n_:l <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> "Foo"@fr-FR .\n_:l <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> <http://www.w3.org/1999/02/22-rdf-syntax-ns#nil> .\n` },
      note: 'RDF4J asserts size 3 and the literal; the expected graph is the collection of Turtle 1.1 section 7.2' },
    { m: 'testSES1887CloseSquareBracket', input: "[<http://www.example.net/test> \"Foo\"@fr-FR].", expect: { graph: `_:b <${T}> "Foo"@fr-FR .\n` } },
    { m: 'testSES1988BlankNodePeriodEOF', input: "<urn:a> <urn:b> _:blank.", expect: { count: 1 } },
    { m: 'testSES1988BlankNodePeriodSpace', input: "<urn:a> <urn:b> _:blank. ", expect: { count: 1 } },
    { m: 'testSES1988BlankNodePeriodTab', input: "<urn:a> <urn:b> _:blank.\t", expect: { count: 1 } },
    { m: 'testSES1988BlankNodePeriodNewLine', input: "<urn:a> <urn:b> _:blank.\n", expect: { count: 1 } },
    { m: 'testSES1988BlankNodePeriodCarriageReturn', input: "<urn:a> <urn:b> _:blank.\r", expect: { count: 1 } },
    { m: 'testSES1988BlankNodePeriodURI', input: "<urn:a> <urn:b> _:blank.<urn:c> <urn:d> <urn:e>.", expect: { count: 2 } },
    { m: 'testSES1988BlankNodePeriodBNode', input: "<urn:a> <urn:b> _:blank._:blank <urn:d> <urn:e>.", expect: { count: 2 } },
    { m: 'testSES2013BlankNodeSemiColonBNodeSpaceA', input: "<urn:a> a _:c2; a <urn:b> .", expect: { graph: `<urn:a> <${RDFT}> _:c2 .\n<urn:a> <${RDFT}> <urn:b> .\n` } },
    { m: 'testSES2013BlankNodeSemiColonBNodeA', input: "<urn:a> a _:c2;a <urn:b> .", expect: { graph: `<urn:a> <${RDFT}> _:c2 .\n<urn:a> <${RDFT}> <urn:b> .\n` } },
    { m: 'testSES2013BlankNodeSemiColonBNodeSpaceURI', input: "<urn:a> a _:c2; <urn:b> <urn:c> .", expect: { graph: `<urn:a> <${RDFT}> _:c2 .\n<urn:a> <urn:b> <urn:c> .\n` } },
    { m: 'testSES2013BlankNodeSemiColonBNodeURI', input: "<urn:a> a _:c2;<urn:b> <urn:c> .", expect: { graph: `<urn:a> <${RDFT}> _:c2 .\n<urn:a> <urn:b> <urn:c> .\n` } },
    { m: 'testSES2019ParseLongLiterals',
      input: "@base <http://example.org/> .\n\n<s> <p> ''' ''\\' ''' .\n\n<s> <p> \"\"\" \"\"\\\" \"\"\" .\n\n<s> <p> \"\"\" \"\"\\u0061 \"\"\" .\n\n<s> <p> \"\"\"\"\"\\\"\"\"\" .\n\n<s> <p> \"\"\"\"\"\\u0061\"\"\" .",
      expect: { graph: "<http://example.org/s> <http://example.org/p> \" ''' \" .\n\n<http://example.org/s> <http://example.org/p> \" \\\"\\\"\\\" \" .\n\n<http://example.org/s> <http://example.org/p> \" \\\"\\\"a \" .\n\n<http://example.org/s> <http://example.org/p> \"\\\"\\\"\\\"\" .\n\n<http://example.org/s> <http://example.org/p> \"\\\"\\\"a\" .\n" },
      note: 'resources testcases/turtle/turtle-long-literals-test.ttl and .nt inlined; RDF4J asserts size 5 and no parse errors and calls Models.isomorphic against the .nt without asserting its result; the port compares the graph' },
    { m: 'testSES2086PeriodEndingLocalNamesFailure1', input: "@prefix : <http://example.org> .\n <urn:a> <http://www.example.net/test> :test. .", expect: { reject: true }, note: 'error message text not compared' },
    { m: 'testSES2086PeriodEndingLocalNamesFailure2', input: "@prefix ns: <http://example.org/data/> . ns:uriWithDot. a ns:Product ; ns:title \"An example subject ending with a dot.\" . ", expect: { reject: true }, note: 'error message text not compared' },
    { m: 'testSES2086PeriodEndingLocalNamesFailure3', input: "@prefix ns: <http://example.org/data/> . ns:1 a ns:Product ; ns:affects ns:4 , ns:16 , ns:uriWithDot. ; ns:title \"An example entity with uriWithDot as an object\" . ", expect: { reject: true }, note: 'error message text not compared' },
    { m: 'testSES2086PeriodEndingLocalNamesFailure4', input: "@prefix ns: <http://example.org/data/> . ns:1 a ns:uriWithDot. ; ns:title \"An example entity with uriWithDot as an object\" . ", expect: { reject: true }, note: 'error message text not compared' },
    { m: 'testSES2165LiteralSpaceDatatypeNewline', input: "<urn:a> <urn:b> \"testliteral\"^^\n<urn:datatype> .", expect: { graph: dt } },
    { m: 'testSES2165LiteralSpaceDatatypeTab', input: "<urn:a> <urn:b> \"testliteral\"^^\t<urn:datatype> .", expect: { graph: dt } },
    { m: 'testSES2165LiteralSpaceDatatypeCarriageReturn', input: "<urn:a> <urn:b> \"testliteral\"^^\r<urn:datatype> .", expect: { graph: dt } },
    { m: 'testSES2165LiteralSpaceDatatypeSpace', input: "<urn:a> <urn:b> \"testliteral\"^^ <urn:datatype> .", expect: { graph: dt } },
    { m: 'testSES2165LiteralSpaceDatatypeComment', input: "<urn:a> <urn:b> \"testliteral\"^^#comment\n<urn:datatype> .", expect: { graph: dt } },
    { m: 'testParsingDefaultNamespaces', input: "<urn:a> skos:broader <urn:b>.", expect: { graph: '<urn:a> <http://www.w3.org/2004/02/skos/core#broader> <urn:b> .\n' },
      note: 'relies on the default of BasicParserSettings.NAMESPACES (Namespaces.DEFAULT_RDF4J, which binds skos:)' },
    { m: 'test780IRISpace', input: "_:b25978837	a <http://purl.bioontology.org/ontology/UATC/\\u0020SERINE\\u0020\\u0020> .", expect: { reject: true },
      note: 'first half only (default settings: reject); the second half needs VERIFY_URI_SYNTAX false, which core has no equivalent of' },
    { m: 'testParseTruePrefix', input: "@prefix true: <http://example/c/> . true:s true:p true:o .", expect: { graph: '<http://example/c/s> <http://example/c/p> <http://example/c/o> .\n' },
      note: 'RDF4J asserts only that the parse does not throw' },
    { m: 'testParseBooleanLiteral', base: 'http://ex/', input: "<http://www.ex.com/s> <http://www.ex.com/b> true.\n", expect: { count: 1 } },
    { m: 'testParseBooleanLiteral_space', base: 'http://ex/', input: "<http://www.ex.com/s> <http://www.ex.com/b> true .\n", expect: { count: 1 } },
    { m: 'testParseIntLiteral', base: 'http://ex/', input: "<http://www.ex.com/s> <http://www.ex.com/b> 1.\n", expect: { graph: `<http://www.ex.com/s> <http://www.ex.com/b> "1"^^<${XSD}integer> .\n` },
      note: 'RDF4J asserts intValue() == 1; the Turtle 1.1 section 7.2 term for INTEGER "1" is "1"^^xsd:integer' },
    { m: 'testParseDoubleLiteral', base: 'http://ex/', input: "<http://www.ex.com/s> <http://www.ex.com/b> 1.2.\n", expect: { graph: `<http://www.ex.com/s> <http://www.ex.com/b> "1.2"^^<${XSD}decimal> .\n` },
      note: 'RDF4J asserts doubleValue() == 1.2 +- 0.01; the token 1.2 is DECIMAL, so the term is "1.2"^^xsd:decimal (Turtle 1.1 section 7.2)' },
  ],
  notPorted: [
    { m: 'testSES1887NoLangTagFailure2', reason: 'non-default setting VERIFY_LANGUAGE_TAGS false; asserts the error message text' },
    { m: 'testLiteralWithNewlines', reason: 'writer test (Rio.write to Turtle); no parser input' },
    { m: 'testSupportedSettings', reason: 'API: counts RDFParser.getSupportedSettings(); no input' },
    { m: 'testParsingNamespacesWithOption', reason: 'non-default setting BasicParserSettings.NAMESPACES (caller-supplied prefix map); core parse has no equivalent option' },
    { m: 'testParsingNamespacesWithOverride', reason: 'non-default setting BasicParserSettings.NAMESPACES (caller-supplied prefix map); core parse has no equivalent option' },
  ],
};
