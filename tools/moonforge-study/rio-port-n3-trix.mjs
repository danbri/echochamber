// Ports of core/rio/n3 N3ParserTest and core/rio/trix TriXParserTest.
// Derived from Eclipse RDF4J, EDL 1.0 (BSD-3-Clause). Changed: re-expressed
// as data. Core reads neither N3 nor TriX, so every method is listed as not
// ported with that reason.
const NO_N3 = 'N3 input ("=" for owl:sameAs is N3 syntax, not Turtle); core has no N3 reader';
const NO_TRIX = 'TriX input; core has no TriX reader (formats(): nquads, ntriples, turtle, trig, rdfxml, jsonld)';
export default [
  {
    file: 'core/rio/n3/src/test/java/org/eclipse/rdf4j/rio/n3/N3ParserTest.java',
    class: 'N3ParserTest', cases: [],
    notPorted: [{ m: 'testParseEquals', reason: NO_N3 }],
  },
  {
    file: 'core/rio/trix/src/test/java/org/eclipse/rdf4j/rio/trix/TriXParserTest.java',
    class: 'TriXParserTest', cases: [],
    notPorted: ['testFatalErrorDoctypeDecl', 'testIgnoreExternalDTDWhenParserConfigAllowsDoctype', 'testLoadExternalDTDConfigured', 'testIgnoreExternalGeneralEntity', 'testIgnoreExternalParameterEntity', 'testFatalErrorPrologContent', 'testDirectedLanguageLiteralRoundTripsBaseDirection'].map((m) => ({ m, reason: NO_TRIX })),
  },
];
