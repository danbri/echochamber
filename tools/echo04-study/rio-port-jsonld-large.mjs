// Port of core/rio/jsonld JSONLDLargeLiteralTest. Derived from Eclipse RDF4J,
// Eclipse Distribution License 1.0 (BSD-3-Clause). Changed: re-expressed as
// data; the 16,000,000-character literal ("x".repeat(16000000)) is generated
// at run time from the case's repeat field instead of being stored.
const M = '@@LARGE_LITERAL@@';
export default {
  file: 'core/rio/jsonld/src/test/java/org/eclipse/rdf4j/rio/jsonld/JSONLDLargeLiteralTest.java',
  class: 'JSONLDLargeLiteralTest',
  cases: [
    {
      m: 'preservesLargeLiteralFromReader', format: 'jsonld',
      input: '{"@id":"urn:large-jsonld:subject","urn:large-jsonld:predicate":{"@value":"' + M + '"}}',
      repeat: { marker: M, text: 'x', times: 16000000 },
      expect: { graph: '<urn:large-jsonld:subject> <urn:large-jsonld:predicate> "' + M + '" .\n' },
      note: 'RDF4J parses with base ""; core is given no base. Default LARGE_LITERALS_HANDLING=PRESERVE',
    },
  ],
  notPorted: [
    { m: 'preservesLargeLiteralFromInputStream', reason: 'same generated input as preservesLargeLiteralFromReader, read from a byte stream instead of a Reader; core parse takes a string only, so the two are one case' },
  ],
};
