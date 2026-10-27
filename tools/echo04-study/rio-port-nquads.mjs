// Port of RDF4J core/rio/nquads AbstractNQuadsParserUnitTest. Derived from
// Eclipse RDF4J, Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c)
// Eclipse RDF4J contributors, Aduna, and others. Changed: test methods
// re-expressed as data (input text and expected outcome); Java string
// literals copied verbatim; the RDF4J resource testcases/nquads/test1.nq
// inlined; term assertions encoded as expected graphs.
const DIRNOTE = 'RDF4J sets FAIL_ON_UNKNOWN_LANGUAGES=true and NORMALIZE_LANGUAGE_TAGS for this test; neither changes the outcome for a recognised BCP 47 tag (RDFParserHelper.createLiteral), and an invalid base direction is a fatal error under every setting, so the default (strict) parse is compared.';
const TEST1 = '<http://example.org/alice/foaf.rdf#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> <http://example.org/alice/foaf1.rdf> .\n'
  + '_:bnode1 <http://xmlns.com/foaf/0.1/Friend> "Michele" <http://example.org/alice/foaf2.rdf> .\n'
  + '_:bnode2 <http://xmlns.com/foaf/0.1/Friend> _:bnode3 <http://example.org/alice/foaf3.rdf> .\n\n\n'
  + '_:bnode3 <http://xmlns.com/foaf/0.1/Friend> "This literal is \\"really\\" useful"@it <http://example.org/alice/foaf4.rdf> .\n'
  + '_:bnode1 <http://test.base.uri#like> "12345"^^<http://www.w3.org/2001/XMLSchema#integer> <http://example.org/alice/foaf5.rdf> .\n'
  + '_:bnode4 <http://test.base.uri#type> "triple"^^<http://www.w3.org/2001/XMLSchema#string> .\n';
const CAVOUR = (dt) => '<http://dbpedia.org/resource/Camillo_Benso,_conte_di_Cavour> ' + '<http://dbpedia.org/property/mandatofine> '
  + `"1380.0"^^<${dt}> ` + '<http://it.wikipedia.org/wiki/Camillo_Benso,_conte_di_Cavour#absolute-line=20> .';
const ERRLINES = '<http://s0> <http://p0> <http://o0> <http://g0> .\n' + '<http://sX>                                     .\n' + '<http://s1> <http://p1> <http://o1> <http://g1> .\n';
const dir = (lit, ctx) => '<http://example/a> <http://example/b> ' + lit + (ctx ? ' <http://www.example.org/>' : '') + ' .';
const dirCase = (m, lit, ctx, exp) => ({ m, format: 'nquads12', base: null, input: dir(lit, ctx), expect: exp ? { graph: dir(exp, ctx) + '\n', format: 'nquads12' } : { reject: true }, note: DIRNOTE });
export default {
  file: 'core/rio/nquads/src/test/java/org/eclipse/rdf4j/rio/nquads/AbstractNQuadsParserUnitTest.java',
  class: 'AbstractNQuadsParserUnitTest',
  defaults: { format: 'nquads', base: 'http://test.base.uri' },
  cases: [
    { m: 'testIncompleteParsingWithoutPeriod', input: '<http://s> <http://p> <http://o> <http://g>', expect: { reject: true } },
    { m: 'testNonWhitespaceAfterPeriodNoContext', base: 'http://base-uri', input: '<http://www.wrong.com> <http://wrong.com/1.1/tt> "x"^^<http://xxx.net/int> . <http://path.to.graph> ', expect: { reject: true }, note: 'error line number not compared' },
    { m: 'testNonWhitespaceAfterPeriodWithContext', base: 'http://base-uri', input: '<http://www.wrong.com> <http://wrong.com/1.1/tt> "x"^^<http://xxx.net/int> <http://path.to.graph> . <thisisnotlegal> ', expect: { reject: true }, note: 'error line number not compared' },
    { m: 'testParseNoContext', base: 'http://base-uri', input: '<http://s> <http://p> <http://o> .', expect: { graph: '<http://s> <http://p> <http://o> .\n' }, note: 'RDF4J asserts only that the parse succeeds' },
    { m: 'testParseEmptyLinesAndComments', input: '  \n\n\n# This is a comment\n\n#this is another comment.', expect: { count: 0 } },
    { m: 'testParseBasic', input: '<http://www.v/dat/4b> <http://www.w3.org/20/ica#dtend> <http://sin/value/2> <http://sin.siteserv.org/def/> .', expect: { graph: '<http://www.v/dat/4b> <http://www.w3.org/20/ica#dtend> <http://sin/value/2> <http://sin.siteserv.org/def/> .\n' } },
    { m: 'testParseBasicBNode', input: '_:a123456768 <http://www.w3.org/20/ica#dtend> <http://sin/value/2> <http://sin.siteserv.org/def/>.', expect: { graph: '_:x <http://www.w3.org/20/ica#dtend> <http://sin/value/2> <http://sin.siteserv.org/def/> .\n' } },
    { m: 'testParseBasicLiteral', input: '_:a123456768 <http://www.w3.org/20/ica#dtend> "2010-05-02" <http://sin.siteserv.org/def/>.', expect: { graph: '_:x <http://www.w3.org/20/ica#dtend> "2010-05-02" <http://sin.siteserv.org/def/> .\n' } },
    { m: 'testParseBasicLiteralLang', input: '<http://www.v/dat/4b2-21> <http://www.w3.org/20/ica#dtend> "2010-05-02"@en <http://sin.siteserv.org/def/>.', expect: { graph: '<http://www.v/dat/4b2-21> <http://www.w3.org/20/ica#dtend> "2010-05-02"@en <http://sin.siteserv.org/def/> .\n' } },
    { m: 'testParseBasicLiteralDatatype', input: '<http://www.v/dat/4b2-21> ' + '<http://www.w3.org/20/ica#dtend> ' + '"2010"^^<http://www.w3.org/2001/XMLSchema#integer> ' + '<http://sin.siteserv.org/def/>.', expect: { graph: '<http://www.v/dat/4b2-21> <http://www.w3.org/20/ica#dtend> "2010"^^<http://www.w3.org/2001/XMLSchema#integer> <http://sin.siteserv.org/def/> .\n' } },
    { m: 'testParseBasicLiteralDatatypePrefix', input: '<http://www.v/dat/4b2-21> ' + '<http://www.w3.org/20/ica#dtend> ' + '"2010"^^xsd:integer ' + '<http://sin.siteserv.org/def/>.', expect: { reject: true }, note: 'error line number not compared' },
    { m: 'testLiteralEscapeManagement1', base: 'http://base-uri', input: '<http://a> <http://b> "\\\\" <http://c> .', expect: { graph: '<http://a> <http://b> "\\\\" <http://c> .\n' }, note: 'parse-location listener (1, 1) not compared' },
    { m: 'testLiteralEscapeManagement2', base: 'http://base-uri', input: '<http://a> <http://b> "Line text 1\\nLine text 2" <http://c> .', expect: { graph: '<http://a> <http://b> "Line text 1\\nLine text 2" <http://c> .\n' } },
    { m: 'testURIDecodingManagement', base: 'http://base-uri', input: '<http://s/\\u306F\\u3080> <http://p/\\u306F\\u3080> <http://o/\\u306F\\u3080> <http://g/\\u306F\\u3080> .', expect: { graph: '<http://s/はむ> <http://p/はむ> <http://o/はむ> <http://g/はむ> .\n' } },
    { m: 'testUnicodeLiteralDecoding', base: 'http://base-uri', input: '<http://a> <http://b> "[\\u306F]" <http://c> .', expect: { graph: '<http://a> <http://b> "[は]" <http://c> .\n' } },
    { m: 'testWrongUnicodeEncodedCharFail', input: '<http://s> <http://p> "\\u123X" <http://g> .', expect: { reject: true } },
    { m: 'testEndOfStreamReached', input: '<http://a> <http://b> "\\" <http://c> .', expect: { reject: true } },
    { m: 'testParserWithAllCases', input: TEST1, expect: { count: 6 }, note: 'input is the RDF4J resource testcases/nquads/test1.nq; parse-location listener (8, 1) not compared' },
    { m: 'testStatementWithInvalidLiteralContentAndIgnoreValidation', base: 'http://base-uri', input: CAVOUR('http://www.w3.org/2001/XMLSchema#int'), expect: { count: 1 }, note: 'sets VERIFY_DATATYPE_VALUES=false and FAIL_ON_UNKNOWN_DATATYPES=false, both RDF4J defaults; RDF4J asserts only that the parse succeeds' },
    { m: 'testStatementWithInvalidDatatypeAndIgnoreValidation', base: 'http://base-uri', input: CAVOUR('http://dbpedia.org/invalid/datatype/second'), expect: { count: 1 }, note: 'sets VERIFY_DATATYPE_VALUES=false and FAIL_ON_UNKNOWN_DATATYPES=false (RDF4J defaults) and marks them non-fatal, which has no effect when they are off' },
    { m: 'testStopAtFirstErrorStrictParsing', input: ERRLINES, expect: { reject: true }, note: 'RDF4J sets FAIL_ON_INVALID_LINES=false without making it non-fatal and still expects the parse to fail; same as the default; error line number (2) not compared' },
    { m: 'testStopAtFirstErrorTolerantParsing', base: 'http://base-uri', lenient: true, input: ERRLINES, expect: { graph: '<http://s0> <http://p0> <http://o0> <http://g0> .\n<http://s1> <http://p1> <http://o1> <http://g1> .\n' }, note: 'FAIL_ON_INVALID_LINES=false plus addNonFatalError mapped to lenient:true' },
    dirCase('testDirLangStringRTLNoContext', '"שלום"@he--rtl', false, '"שלום"@he--rtl'),
    dirCase('testDirLangStringRTLWithContext', '"שלום"@he--rtl', true, '"שלום"@he--rtl'),
    dirCase('testDirLangStringLTRWithNormalizationNoContext', '"Hello"@en--ltr', false, '"Hello"@en--ltr'),
    dirCase('testDirLangStringLTRWithNormalizationWithContext', '"Hello"@en--ltr', true, '"Hello"@en--ltr'),
    dirCase('testBadDirLangStringNoContext', '"hello"@en--unk', false),
    dirCase('testBadDirLangStringWithContext', '"hello"@en--unk', true),
    dirCase('testBadCapitalizationDirLangStringNoContext', '"Hello"@en--LTR', false),
    dirCase('testBadCapitalizationDirLangStringWithContext', '"Hello"@en--LTR', true),
    { m: 'testDirLangStringNoLanguage', format: 'nquads12', base: null, input: '<http://example/a> <http://example/b> "Hello"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString> .', expect: { graph: '<http://example/a> <http://example/b> "Hello" .\n' }, note: 'RDF4J expects the datatype xsd:string: with VERIFY_DATATYPE_VALUES=false (default) RDFParserHelper.createLiteral drops rdf:dirLangString when there is no language tag' },
    { m: 'testTripleTerm', format: 'nquads12', base: null, input: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> <http://example/c> )>> <http://example/context> .', expect: { graph: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> <http://example/c> )>> <http://example/context> .\n', format: 'nquads12' } },
    { m: 'testTripleTermNoWhitespace', format: 'nquads12', base: null, input: '<http://example/a><http://example/b><<(<http://example/a><http://example/b><http://example/c>)>><http://example/context>.', expect: { graph: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> <http://example/c> )>> <http://example/context> .\n', format: 'nquads12' } },
    { m: 'testBadTripleTermSubject', format: 'nquads12', base: null, input: '<<( <http://example/a> <http://example/b> <http://example/c> )>> <http://example/a> <http://example/b> <http://example/context> .', expect: { reject: true } },
    { m: 'testBadTripleTermMissingObject', format: 'nquads12', base: null, input: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> )>> <http://example/context> .', expect: { reject: true } },
    { m: 'testSparqlVersionDirectiveDoubleQuotes', format: 'nquads12', base: null, input: 'VERSION "1.2--basic"', expect: { count: 0 } },
    { m: 'testSparqlVersionDirectiveSingleQuotes', format: 'nquads12', base: null, input: "VERSION '1.2--basic'", expect: { count: 0 } },
    { m: 'testSparqlVersionDirectiveMismatchedQuotes', format: 'nquads12', base: null, input: 'VERSION \'1.2--basic"', expect: { reject: true } },
    { m: 'testSparqlVersionDirectiveExtraCharsAfter', format: 'nquads12', base: null, input: 'VERSION \'1.2--basic" asdfsdf', expect: { reject: true } },
  ],
  notPorted: [
    { m: 'testParserWithRealData', reason: 'input testcases/nquads/test2.nq is 119 KB of third-party crawled data (rkbexplorer.com / dialnet.unirioja.es) whose provenance is outside RDF4J; not copied' },
    { m: 'testStatementWithInvalidLiteralContentAndStrictValidation', reason: 'non-default settings VERIFY_DATATYPE_VALUES=true and FAIL_ON_UNKNOWN_DATATYPES=true; core has no datatype-value verification option' },
    { m: 'testStatementWithInvalidDatatypeAndVerifyValidation', reason: 'non-default settings VERIFY_DATATYPE_VALUES=true and FAIL_ON_UNKNOWN_DATATYPES=true; core has no datatype verification option' },
    { m: 'testSupportedSettings', reason: 'asserts the number of RDF4J parser settings (14); API introspection, no parse' },
  ],
};
