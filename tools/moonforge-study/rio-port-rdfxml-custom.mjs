// Port of RDF4J core/rio/rdfxml RDFXMLParserCustomTest. Derived from Eclipse
// RDF4J, Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse
// RDF4J contributors, Aduna, and others. Changed: re-expressed as data (input
// text, expected outcome); Java string literals copied verbatim.
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const lolsReason = 'input testcases/rdfxml/openrdf/bad-entity-expansion-limit.rdf (billion laughs, 10^9 expansions of "lol") is not run: core 0.16.0 has no entity-expansion limit and the parse did not finish within 60 s (measured: timeout 60 node <probe> on the file), so it would hang the suite. RDF4J rejects it through the JDK secure-processing limit of 64000 entity expansions (SECURE_PROCESSING default true), an implementation limit, not an XML 1.0 or RDF/XML rule';

export default {
  file: 'core/rio/rdfxml/src/test/java/org/eclipse/rdf4j/rio/rdfxml/RDFXMLParserCustomTest.java',
  class: 'RDFXMLParserCustomTest',
  defaults: { format: 'rdfxml' },
  cases: [
    { m: 'testParseCollection', input: "<?xml version=\"1.0\"?>\n" + "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" " + " xmlns:ex=\"http://example.org/stuff/1.0/\"> \n" + "  <rdf:Description rdf:about=\"http://example.org/basket\"> \n" + "    <ex:hasFruit rdf:parseType=\"Collection\">\n" + "      <rdf:Description rdf:about=\"http://example.org/banana\"/>\n" + "      <rdf:Description rdf:about=\"http://example.org/apple\"/>\n" + "      <rdf:Description rdf:about=\"http://example.org/pear\"/>\n" + "    </ex:hasFruit>\n" + "  </rdf:Description>\n" + "</rdf:RDF>",
      expect: { graph: `<http://example.org/basket> <http://example.org/stuff/1.0/hasFruit> _:l1 .\n_:l1 <${RDF}first> <http://example.org/banana> .\n_:l1 <${RDF}rest> _:l2 .\n_:l2 <${RDF}first> <http://example.org/apple> .\n_:l2 <${RDF}rest> _:l3 .\n_:l3 <${RDF}first> <http://example.org/pear> .\n_:l3 <${RDF}rest> <${RDF}nil> .\n` },
      note: 'RDF4J asserts 7 statements, 3 rdf:first, 3 rdf:rest, 1 rdf:nil object; the whole graph (RDF/XML 1.1 section 7.2.19) is compared.' },
    { m: 'testParseCommentAtStart', input: "<!-- Test comment for parser to ignore -->\n" + "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" " + " xmlns:ex=\"http://example.org/stuff/1.0/\"> \n" + "  <rdf:Description rdf:about=\"http://example.org/basket\"> \n" + "    <ex:hasFruit>\n" + "    \tMango\n" + "    </ex:hasFruit>\n" + "  </rdf:Description>\n" + "</rdf:RDF>",
      expect: { count: 1 } },
  ],
  notPorted: [
    { m: 'testEntityExpansionDefaultSettings', reason: lolsReason },
    { m: 'testEntityExpansionUnrelatedSettings', reason: lolsReason + ' (a fresh ParserConfig, i.e. default settings)' },
    { m: 'testEntityExpansionSecureProcessing', reason: lolsReason + ' (SECURE_PROCESSING=true, its default)' },
    { m: 'testEntityExpansionNoSecureProcessing', reason: '@Disabled upstream; non-default setting XMLParserSettings.SECURE_PROCESSING=false' },
    { m: 'testSupportedSettings', reason: 'asserts which RioSettings the parser supports; no input' },
    { m: 'tset', reason: 'writer round trip (RDFXMLPrettyWriter output re-parsed) with no assertion; the input is produced by an RDF4J writer' },
  ],
};
