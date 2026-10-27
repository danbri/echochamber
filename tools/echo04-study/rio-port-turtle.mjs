// Port of core/rio/turtle/src/test/java/org/eclipse/rdf4j/rio/turtle/TurtleParserTest.java
// Derived from Eclipse RDF4J (https://github.com/eclipse-rdf4j/rdf4j), Eclipse
// Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse RDF4J
// contributors, Aduna, and others. Changed: test methods re-expressed as data
// (input text, format, base, expected outcome); Java string literals copied;
// the resource test-newlines.ttl inlined; Java assertions on statements
// re-expressed as expected N-Quads graphs.
const prefixes = '@prefix ex: <http://example.org/ex/> . \n@prefix : <http://example.org/> . \n';
const X = 'http://www.w3.org/2001/XMLSchema#';
const R = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const SPO = '<http://example/s> <http://example/p> <http://example/o>';
const TT = `<<( ${SPO} )>>`;
const RE = `<${R}reifies>`;
const listener = 'only the parse-location listener (line/column) is asserted beyond success; the count is the observable part, the listener is not compared';
const noBase = { base: null };

const cases = [
  { m: 'testParseDots', input: prefixes + ' ex:foo.bar ex:\\~foo.bar ex:foobar. ', expect: { count: 1 } },
  { m: 'testMissingObjectBeforeStatementTerminatorWithTrailingNewline', input: prefixes + ':s :p .\n', expect: { reject: true }, note: 'VERIFY_DATATYPE_VALUES=false is the RDF4J default' },
  ...['.', '. ', '.\t', '.\r\n', '+.', '-. ', '+.\n', '-.\t', '+', '- '].map((t) => ({ m: 'testNumericObjectRequiresADigitEvenWithoutDatatypeValidation', input: prefixes + ':s :p ' + t, expect: { reject: true }, note: 'token ' + JSON.stringify(t) + '; VERIFY_DATATYPE_VALUES=false is the RDF4J default' })),
  ...[['0.', '0', 'integer'], ['+1.\n', '+1', 'integer'], ['-2. ', '-2', 'integer'], ['30.\t', '30', 'integer'],
    ['.5 .', '.5', 'decimal'], ['+.5 .', '+.5', 'decimal'], ['-.5 .', '-.5', 'decimal'], ['1.5 .', '1.5', 'decimal'],
    ['1.e2 .', '1.e2', 'double'], ['1.0e-2 .', '1.0e-2', 'double']].map(([t, lex, dt]) => ({
    m: 'testValidNumericObjectAndStatementTerminator', input: prefixes + ':s :p ' + t,
    expect: { graph: `<http://example.org/s> <http://example.org/p> "${lex}"^^<${X}${dt}> .\n` }, note: 'token ' + JSON.stringify(t),
  })),
  { m: 'testIntegerFollowedByDotAtEOF', input: prefixes + ':alice :age 30.', expect: { graph: `<http://example.org/alice> <http://example.org/age> "30"^^<${X}integer> .\n` } },
  { m: 'testLetterFollowedByDotAtEOF', input: prefixes + ':alice :age "a".', expect: { graph: '<http://example.org/alice> <http://example.org/age> "a" .\n' } },
  { m: 'testParseIllegalURIFatal', input: ' <urn:foo_bar\\r> <urn:foo> <urn:bar> ; <urn:foo2> <urn:bar2> . <urn:foobar> <urn:food> <urn:barf> . ', expect: { reject: true } },
  { m: 'testParseIllegalURINonFatal', input: ' <urn:foo_bar\\r> <urn:foo> <urn:bar> ; <urn:foo2> <urn:bar2> . <urn:foobar> <urn:food> <urn:barf> . ', lenient: true, expect: { count: 1 }, note: 'addNonFatalError(VERIFY_URI_SYNTAX) mapped to lenient: the bad IRI is the subject, so RDF4J drops both triples of the first statement, as statement-level recovery does; error count not compared' },
  { m: 'testParseIllegalDatatypeURIFatal', input: ' <urn:foo_bar> <urn:foo> "a"^^<urn:foo bar> ; <urn:foo2> <urn:bar2> . <urn:foobar> <urn:food> <urn:barf> . ', expect: { reject: true } },
  { m: 'testParseIllegalDatatypeValueFatalIRI', input: ' <urn:foo_bar> <urn:foo> "a"^^"b" ; <urn:foo2> <urn:bar2> . <urn:foobar> <urn:food> <urn:barf> . ', expect: { reject: true } },
  { m: 'testUnparsableIRIFatal', input: ' <http://www:example.org/> <urn:foo> <urn:bar> . ', expect: { reject: true } },
  { m: 'testUnparsableIRINonFatal', input: ' <http://www:example.org/> <urn:foo> <urn:bar> . <urn:foo2> <urn:foo> <urn:bar> .', lenient: true, expect: { count: 1 }, note: 'addNonFatalError(VERIFY_URI_SYNTAX) mapped to lenient; error count not compared' },
  { m: 'testParseBNodes', input: prefixes + ' [ :p  :o1,:2 ] . ', expect: { count: 2 } },
  { m: 'testLineNumberReporting', input: "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n@prefix ex: <http://example.org/> .\n\nex:a a ex:Foo .\nex:b a ex:Foo .\nex:b ex:value '''^M'''.\nex:c\n    :foo ex:Foo .\nrdf:Test\\'s a ex:Foo .\nex:a ex:value 1.0 .\nex:a ex:value 3.0 .\n", expect: { reject: true }, note: 'resource test-newlines.ttl inlined; RDF4J also asserts the error is reported at line 9 (undeclared prefix ":"), not compared' },
  { m: 'testLineNumberReportingNoErrorsSingleLine', input: '<urn:a> <urn:b> <urn:c>.', expect: { count: 1 }, note: listener },
  { m: 'testLineNumberReportingNoErrorsSingleLineEndNewline', input: '<urn:a> <urn:b> <urn:c>.\n', expect: { count: 1 }, note: listener },
  { m: 'testLineNumberReportingNoErrorsMultipleLinesNoEndNewline', input: '<urn:a> <urn:b> <urn:c>.\n<urn:a> <urn:b> <urn:d>.', expect: { count: 2 }, note: listener },
  { m: 'testLineNumberReportingNoErrorsMultipleLinesEndNewline', input: '<urn:a> <urn:b> <urn:c>.\n<urn:a> <urn:b> <urn:d>.\n', expect: { count: 2 }, note: listener },
  { m: 'testLineNumberReportingOnlySingleCommentNoEndline', input: '# This is just a comment', expect: { count: 0 }, note: listener },
  { m: 'testLineNumberReportingOnlySingleCommentEndline', input: '# This is just a comment\n', expect: { count: 0 }, note: listener },
  { m: 'testLineNumberReportingOnlySingleCommentCarriageReturn', input: '# This is just a comment\r', expect: { count: 0 }, note: listener },
  { m: 'testLineNumberReportingOnlySingleCommentCarriageReturnNewline', input: '# This is just a comment\r\n', expect: { count: 0 }, note: listener },
  { m: 'testLineNumberReportingInLongStringLiterals', input: '<urn:a> <urn:b> """is\nallowed\nin\na very long string""" .', expect: { count: 1 }, note: listener },
  { m: 'testParseBooleanLiteralComma', input: '<urn:a> <urn:b> true, false .', expect: { count: 2 } },
  { m: 'testParseBooleanLiteralWhitespaceComma', input: '<urn:a> <urn:b> true , false .', expect: { count: 2 } },
  { m: 'testParseBooleanLiteralSemicolumn', input: '<urn:a> <urn:b> true; <urn:c> false .', expect: { count: 2 } },
  { m: 'testParseBooleanLiteralWhitespaceSemicolumn', input: '<urn:a> <urn:b> true ; <urn:c> false .', expect: { count: 2 } },
  { m: 'testIllegalNewlineInQuotedObjectLiteral', input: '<urn:a> <urn:b> "not\nallowed" .', expect: { reject: true } },
  { m: 'testLegalNewlineInTripleQuotedObjectLiteral', input: '<urn:a> <urn:b> """is\nallowed""" .', expect: { count: 1 } },
  { m: 'testLegalUnicodeInTripleSubject', input: '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n<r:\uD804\uDC9D> a xsd:string .', expect: { count: 1 } },
  { m: 'testOverflowingUnicodeInTripleSubject', input: '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n<r:\uD800\uDF32\uD800\uDF3F\uD800\uDF44\uD800\uDF39\uD800\uDF43\uD800\uDF3A> a xsd:string .', expect: { count: 1 } },
  { m: 'testParseBaseIriParsing', ...noBase, input: '@base <http://example.com/> .\n@prefix my: <https://mydomain.com/> .\n\n<system/x:ABC> a my:Item .\n\n<http://example.com/system/x:DEF> a my:Item .\n\nmy:abc a my:Item .\n',
    expect: { graph: `<http://example.com/system/x:ABC> <${R}type> <https://mydomain.com/Item> .\n<http://example.com/system/x:DEF> <${R}type> <https://mydomain.com/Item> .\n<https://mydomain.com/abc> <${R}type> <https://mydomain.com/Item> .\n` },
    note: 'RDF4J asserts size 3 and the subject set; objects taken from the input' },
  { m: 'testLanguageDirectionLTR', ...noBase, format: 'turtle12', input: '<http://example/a> <http://example/b> "Hello"@en--ltr .', expect: { format: 'nquads12', graph: '<http://example/a> <http://example/b> "Hello"@en--ltr .\n' }, note: 'helper sets FAIL_ON_UNKNOWN_LANGUAGES=true, NORMALIZE_LANGUAGE_TAGS=false; neither changes the outcome for "en"' },
  { m: 'testLanguageDirectionLTRWithNormalization', ...noBase, format: 'turtle12', input: '<http://example/a> <http://example/b> "Hello"@EN--ltr .', expect: { format: 'nquads12', graph: '<http://example/a> <http://example/b> "Hello"@en--ltr .\n' }, note: 'helper sets FAIL_ON_UNKNOWN_LANGUAGES=true, NORMALIZE_LANGUAGE_TAGS=true (default); RDF4J expects language "en"' },
  { m: 'testLanguageDirectionRTL', ...noBase, format: 'turtle12', input: '<http://example/a> <http://example/b> "Hello"@en--rtl .', expect: { format: 'nquads12', graph: '<http://example/a> <http://example/b> "Hello"@en--rtl .\n' }, note: 'helper sets FAIL_ON_UNKNOWN_LANGUAGES=true, NORMALIZE_LANGUAGE_TAGS=false' },
  { m: 'testLanguageDirectionRTLWithNormalization', ...noBase, format: 'turtle12', input: '<http://example/a> <http://example/b> "Hello"@EN--rtl .', expect: { format: 'nquads12', graph: '<http://example/a> <http://example/b> "Hello"@en--rtl .\n' }, note: 'helper sets FAIL_ON_UNKNOWN_LANGUAGES=true, NORMALIZE_LANGUAGE_TAGS=true (default)' },
  { m: 'testBadLanguageDirection', ...noBase, format: 'turtle12', input: '<http://example/a> <http://example/b> "Hello"@en--unk .', expect: { reject: true }, note: 'W3C nt-ttl12-langdir-bad-1; RDF 1.2 Turtle 7.2: the initial text direction MUST be ltr or rtl' },
  { m: 'testBadCapitalizationLanguageDirection', ...noBase, format: 'turtle12', input: '<http://example/a> <http://example/b> "Hello"@en--LTR .', expect: { reject: true }, note: 'W3C nt-ttl12-langdir-bad-2' },
  { m: 'testDirLangStringNoLanguage', ...noBase, format: 'turtle12', input: '<http://example/a> <http://example/b> "Hello"^^rdf:dirLangString .', expect: { graph: '<http://example/a> <http://example/b> "Hello" .\n' }, note: 'RDF4J expects one statement whose literal has datatype xsd:string; the rdf: prefix is not declared in the input' },
  { m: 'testTripleTermInObjectPosition', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + ':s :p <<(:s :p :o )>> .', expect: { format: 'nquads12', graph: `${SPO.replace('<http://example/o>', TT)} .\n` } },
  { m: 'testBadTripleTermInSubjectPosition', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + '<<(:s :p :o )>> :p :o .', expect: { reject: true } },
  { m: 'testNestedTripleTerm', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + ':s :p <<(:s2 :p2 <<( :s3 :p3 :o3 )>> )>> .', expect: { format: 'nquads12', graph: '<http://example/s> <http://example/p> <<( <http://example/s2> <http://example/p2> <<( <http://example/s3> <http://example/p3> <http://example/o3> )>> )>> .\n' } },
  { m: 'testNestedTripleTerm2', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + '_:b :p <<(:s2 :p2 <<( _:b2 :p3 "9"^^xsd:int )>> )>> .', expect: { format: 'nquads12', graph: `_:b <http://example/p> <<( <http://example/s2> <http://example/p2> <<( _:b2 <http://example/p3> "9"^^<${X}int> )>> )>> .\n` }, note: 'PRESERVE_BNODE_IDS=true only fixes labels, compared up to isomorphism; the xsd: prefix is not declared in the input' },
  { m: 'testTripleTermNTriples', ...noBase, format: 'turtle12', input: '<http://example/a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies> <<( <http://example/s> <http://example/p> <http://example/o> )>> .', expect: { format: 'nquads12', graph: `<http://example/a> ${RE} ${TT} .\n` } },
  { m: 'testTripleTermNTriplesNoWhitespace', ...noBase, format: 'turtle12', input: '<http://example/s><http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies><<(<http://example/s2><http://example/p2><http://example/o2>)>>.', expect: { format: 'nquads12', graph: `<http://example/s> ${RE} <<( <http://example/s2> <http://example/p2> <http://example/o2> )>> .\n` } },
  { m: 'testNestedTripleTerms', ...noBase, format: 'turtle12', input: '<http://example/s> <http://example/p> <http://example/o> .\n' + '<http://example/a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies> <<( <http://example/s1> <http://example/p1> <http://example/o1> )>> .\n' + '<http://example/r> <http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies> <<( <http://example/23> <http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies> <<( <http://example/s3> <http://example/p3> <http://example/o3> )>> )>> .',
    expect: { format: 'nquads12', graph: `${SPO} .\n<http://example/a> ${RE} <<( <http://example/s1> <http://example/p1> <http://example/o1> )>> .\n<http://example/r> ${RE} <<( <http://example/23> ${RE} <<( <http://example/s3> <http://example/p3> <http://example/o3> )>> )>> .\n` } },
  { m: 'testSubjectReifiedTriple', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + '\n' + ':s :p :o .\n' + '<<:s :p :o>> :q 123 .', expect: { format: 'nquads12', graph: `${SPO} .\n_:r ${RE} ${TT} .\n_:r <http://example/q> "123"^^<${X}integer> .\n` } },
  { m: 'testObjectReifiedTriple', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + '\n' + ':s :p :o .\n' + ':x :p <<:s :p :o>> .', expect: { format: 'nquads12', graph: `${SPO} .\n_:r ${RE} ${TT} .\n<http://example/x> <http://example/p> _:r .\n` } },
  { m: 'testReifiedTripleNoPredObjList', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + '\n' + ':s :p :o .\n' + '<<:s :p :o>> .', expect: { format: 'nquads12', graph: `${SPO} .\n_:r ${RE} ${TT} .\n` } },
  { m: 'testReifiedTripleInBlankNodePropertyList', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + '\n' + ':s :p :o .\n' + '[ :q <<:s :p :o>> ] :b :c .', expect: { format: 'nquads12', graph: `${SPO} .\n_:r ${RE} ${TT} .\n_:x <http://example/q> _:r .\n_:x <http://example/b> <http://example/c> .\n` } },
  { m: 'testReifiedTripleInCollection', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + '\n' + ':s :p :o1 .\n' + ':s :p :o2 .\n' + '( <<:s :p :o1>> <<:s :p :o2>> )  :q 123 .', expect: { count: 9 } },
  { m: 'testReifierInReifiedTriple', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + ':x :p <<:s :p :o ~ _:b1 >> .', expect: { format: 'nquads12', graph: `_:b1 ${RE} ${TT} .\n<http://example/x> <http://example/p> _:b1 .\n` }, note: 'PRESERVE_BNODE_IDS=true only fixes labels, compared up to isomorphism' },
  { m: 'testReifierWithoutNode', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + ':s :p :o ~ .', expect: { format: 'nquads12', graph: `${SPO} .\n_:r ${RE} ${TT} .\n` }, note: 'PRESERVE_BNODE_IDS=true has no effect on the comparison' },
  { m: 'testReifierAnnotation', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + ':s :p :o ~ _:b1 .', expect: { format: 'nquads12', graph: `${SPO} .\n_:b1 ${RE} ${TT} .\n` }, note: 'PRESERVE_BNODE_IDS=true only fixes labels' },
  { m: 'testReifierAnnotationBlock', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + ':s :p :o ~ _:b1 {| :p2 :o2 |} .', expect: { format: 'nquads12', graph: `${SPO} .\n_:b1 ${RE} ${TT} .\n_:b1 <http://example/p2> <http://example/o2> .\n` }, note: 'PRESERVE_BNODE_IDS=true only fixes labels' },
  { m: 'testAnnotationBlock', ...noBase, format: 'turtle12', input: 'PREFIX : <http://example/>\n' + ':s :p :o {| :p2 :o2 ; :p3 :o3 |} .', expect: { format: 'nquads12', graph: `${SPO} .\n_:r ${RE} ${TT} .\n_:r <http://example/p2> <http://example/o2> .\n_:r <http://example/p3> <http://example/o3> .\n` } },
  { m: 'testVersionDirectiveDoubleQuotes', ...noBase, format: 'turtle12', input: '@version "1.2" .', expect: { count: 0 } },
  { m: 'testVersionDirectiveSingleQuotes', ...noBase, format: 'turtle12', input: "@version '1.2' .", expect: { count: 0 } },
  { m: 'testVersionDirectiveNoPeriod', ...noBase, format: 'turtle12', input: "@version '1.2'", expect: { reject: true } },
  { m: 'testVersionDirectiveMismatchedQuotes', ...noBase, format: 'turtle12', input: "@version '1.2\" .", expect: { reject: true } },
  { m: 'testSparqlVersionDirectiveDoubleQuotes', ...noBase, format: 'turtle12', input: 'VERSION "1.2--basic"', expect: { count: 0 } },
  { m: 'testSparqlVersionDirectiveSingleQuotes', ...noBase, format: 'turtle12', input: "VERSION '1.2--basic'", expect: { count: 0 } },
  { m: 'testSparqlVersionDirectiveMismatchedQuotes', ...noBase, format: 'turtle12', input: "VERSION '1.2--basic\"", expect: { reject: true } },
];

export default {
  file: 'core/rio/turtle/src/test/java/org/eclipse/rdf4j/rio/turtle/TurtleParserTest.java',
  class: 'TurtleParserTest',
  defaults: { format: 'turtle', base: 'http://example.org/' },
  cases,
  notPorted: [
    { m: 'testParseIllegalURINoVerify', reason: 'setting VERIFY_URI_SYNTAX=false (accept syntactically illegal IRIs); core has no equivalent' },
    { m: 'testParseIllegalDatatypeURINonFatal', reason: 'addNonFatalError(VERIFY_URI_SYNTAX): RDF4J drops only the triple with the bad datatype IRI and keeps the sibling triple after ";" (2 statements); core lenient recovery skips the whole statement, so the effect differs' },
    { m: 'testParseIllegalDatatypValueINonFatalIRI', reason: 'addNonFatalError(VERIFY_URI_SYNTAX) while still expecting a fatal syntax error; core lenient recovers from every syntax error, no equivalent of a URI-only non-fatal setting (the strict outcome is TurtleParserTest#testParseIllegalDatatypeValueFatalIRI)' },
    { m: 'testParseIllegalDatatypeURINoVerify', reason: 'setting VERIFY_URI_SYNTAX=false; core has no equivalent' },
    { m: 'testParseIllegalDatatypValueINoVerify', reason: 'setting VERIFY_URI_SYNTAX=false; core has no equivalent (the strict outcome is TurtleParserTest#testParseIllegalDatatypeValueFatalIRI)' },
    { m: 'testUnparsableIRINoVerify', reason: 'setting VERIFY_URI_SYNTAX=false; core has no equivalent' },
    { m: 'rdfXmlLoadedFromInsideAJarResolvesRelativeUris', reason: 'input is a zip resource read through a jar: URL (Java URL handler); not observable via core' },
    { m: 'testParseAdditionalDatatypes', reason: 'setting FAIL_ON_UNKNOWN_DATATYPES=true (asserts rdf:JSON, rdf:HTML, rdf:XMLLiteral are known datatypes); core has no datatype-recognition setting' },
    { m: 'testRFC3066LanguageHandler', reason: 'setting LANGUAGE_HANDLERS=[RFC3066LanguageHandler]; core has no language-handler setting' },
  ],
};
