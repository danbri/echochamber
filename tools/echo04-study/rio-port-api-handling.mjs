// Port of core/rio/api AbstractParserHandlingTest (run by RDF4J through its
// per-format subclasses TurtleHandlingTest, NTriplesHandlingTest,
// NQuadsHandlingTest, TriGHandlingTest, RDFXMLHandlingTest,
// JSONLDParserHandlerTest; TriX, RDF/JSON and BinaryRDF subclasses have no
// core format). Derived from Eclipse RDF4J, EDL 1.0 (BSD-3-Clause).
// Changed: each test model is written out by hand in each format (RDF4J
// produces the input with its own writer; the text here is an equivalent
// serialization of the same model, not the writer's bytes); the expected
// model is the same model as N-Quads (or JSON-LD where N-Quads cannot spell
// the language tag); the error-listener counts are not compared.

const DC = 'http://purl.org/dc/elements/1.1/description';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#comment';
const XSD_INT = 'http://www.w3.org/2001/XMLSchema#integer';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const BASE = 'urn:test:base:';
const FILE_LANGSTRING = {
  ntriples: '_:node1e4498klsx1 <http://purl.org/dc/elements/1.1/description> "G\'day mate"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#langString>.\n',
  nquads: '_:node1e4498klsx1 <http://purl.org/dc/elements/1.1/description> "G\'day mate"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#langString>.\n',
  turtle: '_:node1e4498klsx1 <http://purl.org/dc/elements/1.1/description> "G\'day mate"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#langString>.\n',
  trig: '_:node1e4498klsx1 <http://purl.org/dc/elements/1.1/description> "G\'day mate"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#langString>.\n',
  rdfxml: '<?xml version="1.0" encoding="UTF-8"?>\n<rdf:RDF\n\txmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n\n<rdf:Description rdf:nodeID="node1e44bk4fux1">\n\t<description rdf:datatype="http://www.w3.org/1999/02/22-rdf-syntax-ns#langString" xmlns="http://purl.org/dc/elements/1.1/">G\'day mate</description>\n</rdf:Description>\n\n</rdf:RDF>\n',
  jsonld: '[ {\n  "@id" : "_:node1e44g1jstx2",\n  "http://purl.org/dc/elements/1.1/description" : [ {\n    "@value" : "G\'day mate",\n    "@datatype" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"\n  } ]\n} ]',
};
const LANGSTRING_FILES = {
  ntriples: 'core/rio/ntriples/src/test/resources/testcases/ntriples/ntriples-RDF-langString-no-language-test.nt',
  nquads: 'core/rio/nquads/src/test/resources/testcases/nquads/nquads-RDF-langString-no-language-test.nq',
  turtle: 'core/rio/turtle/src/test/resources/testcases/turtle/turtle-RDF-langString-no-language-test.ttl',
  trig: 'core/rio/trig/src/test/resources/testcases/trig/trig-RDF-langString-no-language-test.trig',
  rdfxml: 'core/rio/rdfxml/src/test/resources/testcases/rdfxml/rdfxml-RDF-langString-no-language-test.rdf',
  jsonld: 'core/rio/jsonld/src/test/resources/testcases/jsonld/jsonld-RDF-langString-no-language-test.jsonld',
};

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const xesc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** One statement _:b <p> literal, written in each format. lit: { value, datatype } | { value, lang } */
function serializations(p, lit) {
  const ntLit = `"${esc(lit.value)}"` + (lit.lang ? `@${lit.lang}` : `^^<${lit.datatype}>`);
  const line = `_:node1 <${p}> ${ntLit} .\n`;
  const i = p.lastIndexOf('/') > p.lastIndexOf('#') ? p.lastIndexOf('/') : p.lastIndexOf('#');
  const ns = p.slice(0, i + 1); const local = p.slice(i + 1);
  const attr = lit.lang ? ` xml:lang="${lit.lang}"` : ` rdf:datatype="${lit.datatype}"`;
  const jv = lit.lang ? { '@value': lit.value, '@language': lit.lang } : { '@value': lit.value, '@type': lit.datatype };
  return {
    turtle: line,
    ntriples: line,
    nquads: line,
    trig: `{\n  ${line}}\n`,
    rdfxml: `<?xml version="1.0" encoding="UTF-8"?>\n<rdf:RDF xmlns:rdf="${RDF}">\n<rdf:Description rdf:nodeID="node1">\n\t<${local}${attr} xmlns="${ns}">${xesc(lit.value)}</${local}>\n</rdf:Description>\n</rdf:RDF>\n`,
    jsonld: JSON.stringify([{ '@id': '_:node1', [p]: [jv] }], null, 2),
  };
}

const FORMATS = ['turtle', 'ntriples', 'nquads', 'trig', 'rdfxml', 'jsonld'];

function perFormat(m, p, lit, formats = FORMATS, expectJsonld = false) {
  const s = serializations(p, lit);
  const expect = expectJsonld ? { graph: s.jsonld, format: 'jsonld' } : { graph: s.nquads };
  return formats.map((f) => ({ m, suffix: f, format: f, base: BASE, input: s[f], expect, note: `RDF4J subclass for ${f}; input is a hand serialization of the test model` }));
}

const UNKNOWN_DT = { value: 'test unknown datatype literal value', datatype: 'urn:test:unknowndatatype' };
const KNOWN_DT = { value: '31415926', datatype: XSD_INT };
const UNKNOWN_LANG = { value: 'xsdfsawreaewraew', lang: 'fakelanguage123' };
const KNOWN_LANG = { value: "G'day mate", lang: 'en-AU' };
const NO_JSONLD = FORMATS.filter((f) => f !== 'jsonld');

// testRDF12Compatibility1: three statements with nested triple terms.
const T1 = '<<( <http://example.com/1> <http://example.com/p2> "example"^^<http://example.com/3> )>>';
const T2 = `<<( <http://example.com/s> <http://purl.org/dc/elements/1.1/date> ${T1} )>>`;
const T3 = '<<( <urn:e> <urn:f> <<( <urn:c> <urn:d> <<( <urn:a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <urn:b> )>> )>> )>>';
const RDF12_NQ = `<http://example.com/4> <http://purl.org/dc/elements/1.1/source> ${T1} .\n<http://example.com/5> <http://purl.org/dc/elements/1.1/relation> ${T2} .\n<http://example.com/s2> <urn:same> ${T3} .\n`;
const RDF12_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="${RDF}" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:ex="http://example.com/" xmlns:u="urn:" rdf:version="1.2">
<rdf:Description rdf:about="http://example.com/4">
\t<dc:source rdf:parseType="Triple"><rdf:Description rdf:about="http://example.com/1"><ex:p2 rdf:datatype="http://example.com/3">example</ex:p2></rdf:Description></dc:source>
</rdf:Description>
<rdf:Description rdf:about="http://example.com/5">
\t<dc:relation rdf:parseType="Triple"><rdf:Description rdf:about="http://example.com/s"><dc:date rdf:parseType="Triple"><rdf:Description rdf:about="http://example.com/1"><ex:p2 rdf:datatype="http://example.com/3">example</ex:p2></rdf:Description></dc:date></rdf:Description></dc:relation>
</rdf:Description>
<rdf:Description rdf:about="http://example.com/s2">
\t<u:same rdf:parseType="Triple"><rdf:Description rdf:about="urn:e"><u:f rdf:parseType="Triple"><rdf:Description rdf:about="urn:c"><u:d rdf:parseType="Triple"><rdf:Description rdf:about="urn:a"><rdf:type rdf:resource="urn:b"/></rdf:Description></u:d></rdf:Description></u:f></rdf:Description></u:same>
</rdf:Description>
</rdf:RDF>
`;
const rdf12 = [
  { m: 'testRDF12Compatibility1', suffix: 'turtle', format: 'turtle12', base: BASE, input: RDF12_NQ, expect: { graph: RDF12_NQ, format: 'nquads12' } },
  { m: 'testRDF12Compatibility1', suffix: 'ntriples', format: 'ntriples12', base: BASE, input: RDF12_NQ, expect: { graph: RDF12_NQ, format: 'nquads12' } },
  { m: 'testRDF12Compatibility1', suffix: 'nquads', format: 'nquads12', base: BASE, input: RDF12_NQ, expect: { graph: RDF12_NQ, format: 'nquads12' } },
  { m: 'testRDF12Compatibility1', suffix: 'trig', format: 'trig12', base: BASE, input: `{\n${RDF12_NQ}}\n`, expect: { graph: RDF12_NQ, format: 'nquads12' } },
  { m: 'testRDF12Compatibility1', suffix: 'rdfxml', format: 'rdfxml', base: BASE, input: RDF12_XML, expect: { graph: RDF12_NQ, format: 'nquads12' }, note: 'RDF/XML 1.2 rdf:parseType="Triple"; RDF4J declares RDF/XML SUPPORTS_TRIPLE_TERMS. JSON-LD variant not ported: RDF4J writes triple terms there as RDF4J-specific urn:rdf4j:triple: IRIs (PROCESS_ENCODED_TRIPLE_TERMS)' },
];

const langstring = FORMATS.map((f) => ({
  m: 'testNoLanguageWithRDFLangStringNoFailCase1', suffix: f, format: f, base: BASE, input: FILE_LANGSTRING[f],
  expect: { graph: `_:b <${DC}> "G'day mate" .\n` },
  note: `input: ${LANGSTRING_FILES[f]}; RDF4J sets VERIFY_DATATYPE_VALUES=false, which is its default; the expected model is getTestModel("G'day mate", (IRI) null), a plain xsd:string literal`,
}));

const setting = (s) => `relies on non-default parser setting ${s}; core has no equivalent`;

export default {
  file: 'core/rio/api/src/test/java/org/eclipse/rdf4j/rio/AbstractParserHandlingTest.java',
  class: 'AbstractParserHandlingTest',
  cases: [
    ...perFormat('testUnknownDatatypeNoMessageNoFailCase1', DC, UNKNOWN_DT),
    ...perFormat('testUnknownDatatypeNoMessageNoFailCase2', DC, UNKNOWN_DT),
    ...perFormat('testKnownDatatypeNoMessageNoFailCase1', DC, KNOWN_DT),
    ...perFormat('testKnownDatatypeNoMessageNoFailCase2', DC, KNOWN_DT),
    // JSONLDParserHandlerTest overrides the unknown-language cases with empty bodies.
    ...perFormat('testUnknownLanguageNoMessageNoFailCase1', RDFS, UNKNOWN_LANG, NO_JSONLD, true),
    ...perFormat('testUnknownLanguageNoMessageNoFailCase2', RDFS, UNKNOWN_LANG, NO_JSONLD, true),
    ...perFormat('testKnownLanguageNoMessageNoFailCase1', RDFS, KNOWN_LANG),
    ...perFormat('testKnownLanguageNoMessageNoFailCase2', RDFS, KNOWN_LANG),
    ...langstring,
    ...rdf12,
  ],
  notPorted: [
    ...['testUnknownDatatypeNoMessageNoFailCase3', 'testUnknownDatatypeNoMessageNoFailCase4', 'testUnknownDatatypeNoMessageNoFailCase5']
      .map((m) => ({ m, reason: 'sets FAIL_ON_UNKNOWN_DATATYPES=false (its default) and changes the non-fatal error set; only the default-settings variants Case1/Case2 are ported, which cover the same observable outcome' })),
    ...['testUnknownDatatypeWithMessageNoFailCase1', 'testUnknownDatatypeWithMessageNoFailCase2', 'testUnknownDatatypeWithMessageNoFailCase3', 'testUnknownDatatypeWithMessageWithFailCase1']
      .map((m) => ({ m, reason: setting('FAIL_ON_UNKNOWN_DATATYPES=true (with or without addNonFatalError); the assertion is on error-listener counts') })),
    ...['testKnownDatatypeNoMessageNoFailCase3', 'testKnownDatatypeNoMessageNoFailCase4', 'testKnownDatatypeNoMessageNoFailCase5']
      .map((m) => ({ m, reason: 'sets FAIL_ON_UNKNOWN_DATATYPES=false (its default) and changes the non-fatal error set; covered by the ported Case1/Case2' })),
    ...['testKnownDatatypeWithMessageNoFailCase1', 'testKnownDatatypeWithMessageNoFailCase2', 'testKnownDatatypeWithMessageNoFailCase3', 'testKnownDatatypeWithMessageWhereUnknownWouldFailCase1']
      .map((m) => ({ m, reason: setting('FAIL_ON_UNKNOWN_DATATYPES=true') })),
    ...['testUnknownLanguageNoMessageNoFailCase3', 'testUnknownLanguageNoMessageNoFailCase4', 'testUnknownLanguageNoMessageNoFailCase5']
      .map((m) => ({ m, reason: 'sets FAIL_ON_UNKNOWN_LANGUAGES=false (its default) and changes the non-fatal error set; covered by the ported Case1/Case2' })),
    ...['testUnknownLanguageWithMessageNoFailCase1', 'testUnknownLanguageWithMessageNoFailCase2', 'testUnknownLanguageWithMessageNoFailCase3', 'testUnknownLanguageWithMessageWithFailCase1']
      .map((m) => ({ m, reason: setting('FAIL_ON_UNKNOWN_LANGUAGES=true (BCP47 language handler)') })),
    ...['testKnownLanguageNoMessageNoFailCase3', 'testKnownLanguageNoMessageNoFailCase4', 'testKnownLanguageNoMessageNoFailCase5']
      .map((m) => ({ m, reason: 'sets FAIL_ON_UNKNOWN_LANGUAGES=false (its default) and changes the non-fatal error set; covered by the ported Case1/Case2' })),
    ...['testKnownLanguageWithMessageNoFailCase1', 'testKnownLanguageWithMessageNoFailCase2', 'testKnownLanguageWithMessageNoFailCase3', 'testKnownLanguageWithMessageWhereUnknownWouldFailCase1', 'testKnownLanguageWithMessageWhereUnknownWouldFailCase2', 'testKnownLanguageWithMessageWhereUnknownWouldFailCase3']
      .map((m) => ({ m, reason: setting('FAIL_ON_UNKNOWN_LANGUAGES=true (BCP47 language handler)') })),
    { m: 'testSkolemization', reason: setting('SKOLEMIZE_ORIGIN') },
    { m: 'testRDF12Compatibility2', reason: setting('PROCESS_ENCODED_TRIPLE_TERMS=false (RDF4J-specific urn:rdf4j:triple: encoding)') },
  ],
};
