// Port of RDF4J core/rio/rdfxml RDFXMLParserTest. Derived from Eclipse RDF4J,
// Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse RDF4J
// contributors, Aduna, and others. Changed: re-expressed as data (input text,
// expected outcome); Java string literals copied verbatim; the resources under
// org/eclipse/rdf4j/rio/rdfxml/ inlined.
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const externalParamEntity = "<?xml version='1.0' encoding='utf-8'?>\n<!DOCTYPE rdf:RDF [\n        <!ENTITY % xxe SYSTEM \"external-file-nonexistent.txt\" >\n        %xxe;\n        ]>\n<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n         xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\">\n    <rdf:Description rdf:about=\"http://example.org/foo/bar\">\n        <rdfs:label>Foo Bar</rdfs:label>\n    </rdf:Description>\n</rdf:RDF>";
const whitespaceLiteral = "<?xml version='1.0' encoding='utf-8'?>\n\n<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>\n\n <rdf:Description rdf:about='urn:test:empty-literal'>\n  <label xmlns='http://www.w3.org/2000/01/rdf-schema#'>  Literal with whitespace  </label>\n </rdf:Description>\n</rdf:RDF>\n";
const notAnRdfxmlFile = "# rdf:RDF should not make this an RDF file, and it should fail to parse as one even with <rdf:RDF> or </rdf:RDF> in this comment\n";
const namespaceAddition = "<?xml version=\"1.0\"?>\n\n<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n         >\n\n<rdf:Description\n  xmlns:dc=\"http://purl.org/metadata/dublin_core#\"\n  xmlns:test=\"http://test.org/testing/\"\n  rdf:about=\"http://mycorp.example.com/papers/NobelPaper1\">\n\n  <test:somedata rdf:parseType=\"Literal\"><test:datapart>Literal</test:datapart>\n  <test:datapart>0</test:datapart>\n  <test:datapart>0</test:datapart>\n  </test:somedata>\n  <dc:Creator>David Hume</dc:Creator>\n</rdf:Description>\n\n\n</rdf:RDF>";
const directed = `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/"
         xmlns:its="http://www.w3.org/2005/11/its"
         rdf:version="1.2"
         xml:lang="he"
         its:dir="rtl">
  <rdf:Description rdf:about="http://example.org/s1">
    <ex:label>שלום</ex:label>
  </rdf:Description>
</rdf:RDF>
`;
const undirected = `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/"
         xml:lang="en">
  <rdf:Description rdf:about="http://example.org/s2">
    <ex:label>plain</ex:label>
  </rdf:Description>
</rdf:RDF>
`;
const brokenTriple = `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/"
         rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/s1">
    <ex:label rdf:parseType="Triple">
      <rdf:Description rdf:about="http://example.org/s2">
        <ex:label rdf:resource="http://example.org/o"/>
      </rdf:Description>
  </rdf:Description>
</rdf:RDF>
`;
const valid = `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/">
  <rdf:Description rdf:about="http://example.org/s3">
    <ex:label rdf:resource="http://example.org/o"/>
  </rdf:Description>
</rdf:RDF>
`;
const xmlLit = '<test:datapart xmlns:test=\\"http://test.org/testing/\\">Literal</test:datapart>\\n  <test:datapart xmlns:test=\\"http://test.org/testing/\\">0</test:datapart>\\n  <test:datapart xmlns:test=\\"http://test.org/testing/\\">0</test:datapart>\\n  ';

export default {
  file: 'core/rio/rdfxml/src/test/java/org/eclipse/rdf4j/rio/rdfxml/RDFXMLParserTest.java',
  class: 'RDFXMLParserTest',
  defaults: { format: 'rdfxml' },
  cases: [
    { m: 'testFatalErrorDoctypeDecl', input: externalParamEntity, expect: { reject: true }, note: 'Resource rdfxml-external-param-entity.rdf. RDF4J rejects because XMLParserSettings.DISALLOW_DOCTYPE_DECL defaults to true; the message and the error-listener counts are not compared.' },
    { m: 'testRDFXMLWhitespace', input: whitespaceLiteral, expect: { graph: '<urn:test:empty-literal> <http://www.w3.org/2000/01/rdf-schema#label> "  Literal with whitespace  " .\n' } },
    { m: 'testRDF12DefaultBaseDirectionDoesNotLeakBetweenParses', base: 'urn:rdf12-default-direction:first', input: directed, expect: { format: 'nquads12', graph: '<http://example.org/s1> <http://example.org/label> "שלום"@he--rtl .\n' }, note: 'First of the two parses; RDF4J asserts base direction RTL. Leaking between parses of one parser instance has no core equivalent (each parse is independent); each document is compared on its own.' },
    { m: 'testRDF12DefaultBaseDirectionDoesNotLeakBetweenParses', base: 'urn:rdf12-default-direction:second', input: undirected, expect: { graph: '<http://example.org/s2> <http://example.org/label> "plain"@en .\n' }, note: 'Second parse; RDF4J asserts no base direction.' },
    { m: 'testRDF12TripleStateDoesNotLeakAfterFailedParse', base: 'urn:rdf12-broken-triple', input: brokenTriple, expect: { reject: true }, note: 'First parse (mismatched end tag).' },
    { m: 'testRDF12TripleStateDoesNotLeakAfterFailedParse', base: 'urn:rdf12-after-broken-triple', input: valid, expect: { count: 1 }, note: 'Second parse; RDF4J asserts size 1.' },
    { m: 'testFatalErrorPrologContent', input: notAnRdfxmlFile, expect: { reject: true }, note: 'Resource not-an-rdfxml-file.rdf; the message is not compared.' },
    { m: 'testInsertUsedContextPrefixes', input: namespaceAddition, expect: { graph: `<http://mycorp.example.com/papers/NobelPaper1> <http://test.org/testing/somedata> "${xmlLit}"^^<${RDF}XMLLiteral> .\n<http://mycorp.example.com/papers/NobelPaper1> <http://purl.org/metadata/dublin_core#Creator> "David Hume" .\n` }, note: 'Resource rdfxml-namespace-addition.rdf; RDF4J compares Statement.toString(), here the terms are compared (the XML literal carries the in-scope xmlns:test on each element).' },
  ],
  notPorted: [
    { m: 'rdfXmlLoadedFromInsideAJarResolvesRelativeUris', reason: 'input is a jar: URL into sample-with-rdfxml-data.zip; resolution against a jar: base and opening the resolved resource have no core equivalent' },
    { m: 'testIgnoreExternalGeneralEntity', reason: 'non-default setting XMLParserSettings.DISALLOW_DOCTYPE_DECL=false; also asserts that no external file is read' },
    { m: 'testIgnoreExternalParamEntity', reason: 'non-default setting XMLParserSettings.DISALLOW_DOCTYPE_DECL=false; asserts only error-listener counts' },
  ],
};
