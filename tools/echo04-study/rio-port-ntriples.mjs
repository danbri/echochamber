// Port of RDF4J core/rio/ntriples AbstractNTriplesParserUnitTest. Derived from
// Eclipse RDF4J, Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c)
// Eclipse RDF4J contributors, Aduna, and others. Changed: test methods
// re-expressed as data (input text and expected outcome); Java string
// literals copied verbatim; assertions on Model.subjects()/predicates()/
// objects() sizes and literal labels encoded as expected graphs.
const BASE = 'http://www.w3.org/2000/10/rdf-tests/rdfcore/ntriples/test.nt';
const S = '<urn:test:subject> <urn:test:predicate> ';
const one = (o) => ({ graph: `<urn:test:subject> <urn:test:predicate> ${o} .\n` });
const DIRNOTE = 'RDF4J sets FAIL_ON_UNKNOWN_LANGUAGES=true and NORMALIZE_LANGUAGE_TAGS for this test; neither changes the outcome for a recognised BCP 47 tag (RDFParserHelper.createLiteral), and an invalid base direction is a fatal error under every setting, so the default (strict) parse is compared.';
const otherChars = ['-', '·', '̀', 'ͯ', '́', '‿'];
export default {
  file: 'core/rio/ntriples/src/test/java/org/eclipse/rdf4j/rio/ntriples/AbstractNTriplesParserUnitTest.java',
  class: 'AbstractNTriplesParserUnitTest',
  defaults: { format: 'ntriples', base: 'http://example/' },
  cases: [
    { m: 'testExceptionHandlingWithDefaultSettings', base: BASE, input: 'invalid nt', expect: { reject: true }, note: 'error line number (1) not compared' },
    { m: 'testExceptionHandlingWithStopAtFirstError', base: BASE, input: 'invalid nt', expect: { reject: true }, note: 'FAIL_ON_INVALID_LINES=true is the default; error line number not compared' },
    { m: 'testExceptionHandlingWithoutStopAtFirstError', base: BASE, lenient: true, input: 'invalid nt', expect: { count: 0 }, note: 'addNonFatalError(FAIL_ON_INVALID_LINES) mapped to lenient:true' },
    { m: 'testExceptionHandlingWithoutStopAtFirstError2', base: BASE, lenient: true, input: 'invalid nt', expect: { count: 0 }, note: 'FAIL_ON_INVALID_LINES=false mapped to lenient:true' },
    { m: 'testEscapes', input: "<urn:test:subject> <urn:test:predicate> \" \\t \\b \\n \\r \\f \\\" \\' \\\\ \" . ", expect: one('" \\t \\b \\n \\r \\f \\" \' \\\\ "') },
    { m: 'testEndOfLineCommentNoSpace', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> .#endoflinecomment\n', expect: one('<urn:test:object>') },
    { m: 'testEndOfLineCommentWithSpaceBefore', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> . #endoflinecomment\n', expect: one('<urn:test:object>') },
    { m: 'testEndOfLineCommentWithSpaceAfter', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> .# endoflinecomment\n', expect: one('<urn:test:object>') },
    { m: 'testEndOfLineCommentWithSpaceBoth', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> . # endoflinecomment\n', expect: one('<urn:test:object>') },
    { m: 'testEndOfLineCommentsNoSpace', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> .#endoflinecomment\n<urn:test:subject> <urn:test:predicate> <urn:test:secondobject> . # endoflinecomment\n', expect: { count: 2 } },
    { m: 'testEndOfLineCommentsWithSpaceBefore', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> . #endoflinecomment\n<urn:test:subject> <urn:test:predicate> <urn:test:secondobject> . # endoflinecomment\n', expect: { count: 2 } },
    { m: 'testEndOfLineCommentsWithSpaceAfter', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> .# endoflinecomment\n<urn:test:subject> <urn:test:predicate> <urn:test:secondobject> . # endoflinecomment\n', expect: { count: 2 } },
    { m: 'testEndOfLineCommentsWithSpaceBoth', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> . # endoflinecomment\n<urn:test:subject> <urn:test:predicate> <urn:test:secondobject> . # endoflinecomment\n', expect: { count: 2 } },
    { m: 'testEndOfLineEmptyCommentNoSpace', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> .#\n', expect: one('<urn:test:object>') },
    { m: 'testEndOfLineEmptyCommentWithSpaceBefore', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> . #\n', expect: one('<urn:test:object>') },
    { m: 'testEndOfLineEmptyCommentWithSpaceAfter', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> .# \n', expect: one('<urn:test:object>') },
    { m: 'testEndOfLineEmptyCommentWithSpaceBoth', input: '<urn:test:subject> <urn:test:predicate> <urn:test:object> . # \n', expect: one('<urn:test:object>') },
    { m: 'testBlankNodeIdentifiersRDF11', input: '_:123 <urn:test:predicate> _:456 .', expect: { count: 1 } },
    { m: 'testUriWithSpaceShouldFailToParse', base: BASE, input: '<http://example/ space> <http://example/p> <http://example/o> .', expect: { reject: true } },
    { m: 'testUriWithEscapeCharactersShouldFailToParse', base: BASE, input: '<http://example/\\n> <http://example/p> <http://example/o> .', expect: { reject: true } },
    { m: 'testBlankNodeIdentifiersWithUnderScore', base: BASE, input: '_:123_ <urn:test:predicate> _:_456 .', expect: { graph: '_:a <urn:test:predicate> _:b .\n' }, note: 'subjects/predicates/objects sizes 1 each encoded as two distinct blank nodes' },
    { m: 'testBlankNodeIdentifiersWithDot', base: BASE, input: '_:1.23 <urn:test:predicate> _:45.6 .', expect: { graph: '_:a <urn:test:predicate> _:b .\n' } },
    { m: 'testBlankNodeIdentifiersWithDotAsFirstCahracter', base: BASE, input: '_:123 <urn:test:predicate> _:.456 .', expect: { reject: true } },
    { m: 'testBlankNodeIdentifiersWithDotAsLastCahracter', base: BASE, input: '_:123 <urn:test:predicate> _:456. .', expect: { reject: true } },
    ...otherChars.map((ch) => ({ m: 'testBlankNodeIdentifiersWithOtherCharacters', base: BASE, input: '<urn:test:subject> <urn:test:predicate> _:1' + ch + ' . ', expect: one('_:b'), note: `character U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}` })),
    ...otherChars.map((ch) => ({ m: 'testBlankNodeIdentifiersWithOtherCharactersAsFirstCharacter', base: BASE, input: '<urn:test:subject> <urn:test:predicate> _:' + ch + '1 . ', expect: { reject: true }, note: `character U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}` })),
    { m: 'testHandleComment', input: "<s:1> <p:1> <o:1> .\n#some comment in it's own line\n<s:2> <p:2> <o:2> .", expect: { graph: '<s:1> <p:1> <o:1> .\n<s:2> <p:2> <o:2> .\n' }, note: 'the comment callback (handleComment) is not observable via the core API; only the graph is compared' },
    { m: 'testDirLangStringLTR', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> "Hello"@en--ltr .', expect: { graph: '<http://example/a> <http://example/b> "Hello"@en--ltr .\n', format: 'nquads12' }, note: DIRNOTE },
    { m: 'testDirLangStringRTL', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> "שלום"@he--rtl .', expect: { graph: '<http://example/a> <http://example/b> "שלום"@he--rtl .\n', format: 'nquads12' }, note: DIRNOTE },
    { m: 'testDirLangStringLTRWithNormalization', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> "Hello"@en--ltr .', expect: { graph: '<http://example/a> <http://example/b> "Hello"@en--ltr .\n', format: 'nquads12' }, note: DIRNOTE },
    { m: 'testDirLangStringRTLWithNormalization', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> "שלום"@HE--rtl .', expect: { graph: '<http://example/a> <http://example/b> "שלום"@he--rtl .\n', format: 'nquads12' }, note: DIRNOTE + ' RDF4J expects the language "he" (lower case).' },
    { m: 'testBadDirLangString', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> "hello"@en--unk .', expect: { reject: true }, note: DIRNOTE },
    { m: 'testBadCapitalizationDirLangString', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> "Hello"@en--LTR .', expect: { reject: true }, note: DIRNOTE },
    { m: 'testDirLangStringNoLanguage', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> "Hello"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString> .', expect: { graph: '<http://example/a> <http://example/b> "Hello" .\n' }, note: 'RDF4J expects the datatype xsd:string: with VERIFY_DATATYPE_VALUES=false (default) RDFParserHelper.createLiteral drops rdf:dirLangString when there is no language tag' },
    { m: 'testTripleTerm', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> <http://example/c> )>> .', expect: { graph: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> <http://example/c> )>> .\n', format: 'nquads12' } },
    { m: 'testTripleTermNoWhitespace', format: 'ntriples12', base: null, input: '<http://example/a><http://example/b><<(<http://example/a><http://example/b><http://example/c>)>>.', expect: { graph: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> <http://example/c> )>> .\n', format: 'nquads12' } },
    { m: 'testBadTripleTermSubject', format: 'ntriples12', base: null, input: '<<( <http://example/a> <http://example/b> <http://example/c> )>> <http://example/a> <http://example/b> .', expect: { reject: true } },
    { m: 'testBadTripleTermMissingObject', format: 'ntriples12', base: null, input: '<http://example/a> <http://example/b> <<( <http://example/a> <http://example/b> )>> .', expect: { reject: true } },
    { m: 'testSparqlVersionDirectiveDoubleQuotes', format: 'ntriples12', base: null, input: 'VERSION "1.2--basic"', expect: { count: 0 } },
    { m: 'testSparqlVersionDirectiveSingleQuotes', format: 'ntriples12', base: null, input: "VERSION '1.2--basic'", expect: { count: 0 } },
    { m: 'testSparqlVersionDirectiveMismatchedQuotes', format: 'ntriples12', base: null, input: 'VERSION \'1.2--basic"', expect: { reject: true } },
    { m: 'testSparqlVersionDirectiveExtraCharsAfter', format: 'ntriples12', base: null, input: 'VERSION \'1.2--basic" asdfsdf', expect: { reject: true } },
  ],
  notPorted: [
    { m: 'testNTriplesFile', reason: 'input /testcases/ntriples/test.nt is a copy of the W3C RDF Core test file (W3C copyright, Dave Beckett), a W3C copy, not RDF4J-authored; excluded with the other W3C copies' },
    { m: 'testSupportedSettings', reason: 'asserts the number of RDF4J parser settings (getSupportedSettings().size() == 14); API introspection, no parse' },
    { m: 'testLinenumberDatatypeValidation', reason: 'non-default setting VERIFY_DATATYPE_VALUES=true (non-fatal); asserts the error message position only' },
    { m: 'testLinenumberLanguagetagValidation', reason: 'non-default setting FAIL_ON_UNKNOWN_LANGUAGES=true (non-fatal); asserts the error message position only' },
  ],
};
