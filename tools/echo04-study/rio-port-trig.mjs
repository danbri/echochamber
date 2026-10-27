// Port of RDF4J core/rio/trig TriGParserCustomTest. Derived from Eclipse RDF4J,
// Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse RDF4J
// contributors, Aduna, and others. Changed: re-expressed as data (input text,
// expected outcome); Java string literals copied verbatim; the resource
// testcases/trig/trig-syntax-minimal-whitespace-01.trig inlined.
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const XSD = 'http://www.w3.org/2001/XMLSchema#';
const fooIn = (g) => `_:b <http://www.example.net/test> "Foo" <${g}> .\n`;
const dirWrap = (t, ctx) => (ctx ? '<http://www.example.org/> { ' : '') + t + ' .' + (ctx ? ' }' : '');
const dirGraph = (lit, ctx) => `<http://example/a> <http://example/b> ${lit}${ctx ? ' <http://www.example.org/>' : ''} .\n`;
const dirNote = 'RDF4J sets FAIL_ON_UNKNOWN_LANGUAGES=true and NORMALIZE_LANGUAGE_TAGS (dirLangStringTestHelper); for this input the outcome does not depend on them (the tag is a recognised, already-normal BCP 47 tag), so the default-settings outcome is compared.';
const badDirNote = 'RDF4J sets FAIL_ON_UNKNOWN_LANGUAGES=true; the rejection does not depend on it: RDFParserHelper.createLiteral reports a fatal error for a base direction other than --ltr/--rtl under any settings.';
const minimalWhitespace = "BASE<http://example/base>\n@base<http://example/base>.\nPREFIX :<http://example/a/>\nPREFIX b:<http://example/b/>\n@prefix:<http://example/c/>.\n@prefix\nd:<http://example/d/>.\n\n{<http://example/s><http://example/p><http://example/o>.<http://example/s><http://example/p>\"Alice\".<http://example/s><http://example/p>_:o.}\n{:s :p :o .:s :p\"Alice\".:s :p _:o.}\n{b:s b:p b:o .b:s b:p\"Alice\".b:s b:p _:o.}\n{_:s:p :o ._:s:p\"Alice\". _:s:p _:o .}\n{[:p :o].[:p\"Alice\"].[:p _:o].}\n{[:p(:o)].[:p(_:o)].[:p(\"Alice\")].[:p(<http://example/o>)].}\n{:s :p :o,:o2 .:s :p\"Alice\",\"Ted\".:s :p _:o,_:o2.}\n{:s :p :o;:p2 :o2 .:s :p\"Alice\";:p2 \"Ted\".:s :p _:o;:p2 _:o2.}\n<http://example/g>{:s :p :o .:s :p\"Alice\".:s :p _:o.}\n:s{:s :p :o .:s :p\"Alice\".:s :p _:o.}\n_:s{:s :p :o .:s :p\"Alice\".:s :p _:o.}\n:{: : :}{: : :}:{: : :}\n:{():()}{():[]}:{[]:[]}\n{b:a\\'s a :Foo}\n";

export default {
  file: 'core/rio/trig/src/test/java/org/eclipse/rdf4j/rio/trig/TriGParserCustomTest.java',
  class: 'TriGParserCustomTest',
  defaults: { format: 'trig' },
  cases: [
    { m: 'testSPARQLGraphKeyword', input: "GRAPH <urn:a> { [] <http://www.example.net/test> \"Foo\" }", expect: { graph: fooIn('urn:a') } },
    { m: 'testGraph', input: "<urn:a> { [] <http://www.example.net/test> \"Foo\" }", expect: { graph: fooIn('urn:a') } },
    { m: 'testGraphLocalNameGraph', input: "@prefix graph: <urn:> .\n graph:a { [] <http://www.example.net/test> \"Foo\" }", expect: { graph: fooIn('urn:a') } },
    { m: 'testGraphLocalNameIntegerGraph', input: "@prefix graph: <urn:> .\n graph:1 { [] <http://www.example.net/test> \"Foo\" }", expect: { graph: fooIn('urn:1') } },
    { m: 'testGraphLocalNameNotGraph', input: "@prefix ex: <urn:> .\n ex:a { [] <http://www.example.net/test> \"Foo\" }", expect: { graph: fooIn('urn:a') } },
    { m: 'testGraphLocalNameIntegerNotGraph', input: "@prefix ex: <urn:> .\n ex:1 { [] <http://www.example.net/test> \"Foo\" }", expect: { graph: fooIn('urn:1') } },
    { m: 'testTrailingSemicolon', input: "{<http://example/s> <http://example/p> <http://example/o> ;}", expect: { count: 1 }, note: 'RDF4J asserts only that the parse succeeds; one triple by reading the input.' },
    { m: 'testAnonymousGraph1', input: "PREFIX : <http://example/>\n GRAPH [] { :s :p :o }", expect: { graph: '<http://example/s> <http://example/p> <http://example/o> _:g .\n' }, note: 'RDF4J asserts only that the parse succeeds.' },
    { m: 'testAnonymousGraph2', input: "PREFIX : <http://example/>\n [] { :s :p :o }", expect: { graph: '<http://example/s> <http://example/p> <http://example/o> _:g .\n' }, note: 'RDF4J asserts only that the parse succeeds.' },
    { m: 'testTurtle', input: "<urn:a> <urn:b> <urn:c>", expect: { count: 1 }, note: 'RDF4J asserts only that the parse succeeds (a triple with no final dot, outside a graph block).' },
    { m: 'testMinimalWhitespace', input: minimalWhitespace, expect: { count: 48 }, note: 'Resource testcases/trig/trig-syntax-minimal-whitespace-01.trig: the W3C test of that name plus one RDF4J line {b:a\\\'s a :Foo}. RDF4J asserts only success; 48 quads counted by hand (duplicates and the document-scoped _:o merged).' },
    { m: 'testMinimalWhitespaceLine12', input: "@prefix : <http://example/c/> . {_:s:p :o ._:s:p\"Alice\". _:s:p _:o .}", expect: { count: 3 }, note: 'RDF4J asserts only success.' },
    { m: 'testBadPname02', input: "@prefix : <http://example/> . {:a%2 :p :o .}", expect: { reject: true } },
    { m: 'testParseTruePrefix', input: "@prefix true: <http://example/c/> . {true:s true:p true:o .}", expect: { graph: '<http://example/c/s> <http://example/c/p> <http://example/c/o> .\n' }, note: 'RDF4J asserts only success.' },
    { m: 'testParseTrig_booleanLiteral', base: 'http://ex/', input: "{\n" + "  <http://www.ex.com/s> <http://www.ex.com/b> true.\n" + "}", expect: { count: 1 } },
    { m: 'testParseTrig_booleanLiteral_space', base: 'http://ex/', input: "{\n" + "  <http://www.ex.com/s> <http://www.ex.com/b> true .\n" + "}", expect: { count: 1 } },
    { m: 'testParseTrig_intLiteral', base: 'http://ex/', input: "{\n" + "  <http://www.ex.com/s> <http://www.ex.com/b> 1.\n" + "}", expect: { graph: `<http://www.ex.com/s> <http://www.ex.com/b> "1"^^<${XSD}integer> .\n` }, note: 'RDF4J asserts intValue() == 1; the term is compared.' },
    { m: 'testParseTrig_doubleLiteral', base: 'http://ex/', input: "{\n" + "  <http://www.ex.com/s> <http://www.ex.com/b> 1.2.\n" + "}", expect: { graph: `<http://www.ex.com/s> <http://www.ex.com/b> "1.2"^^<${XSD}decimal> .\n` }, note: 'RDF4J asserts doubleValue() == 1.2 (+-0.01); the term (xsd:decimal 1.2) is compared.' },
    { m: 'testDirLangStringRTLNoContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"שלום\"@he--rtl", false), expect: { graph: dirGraph('"שלום"@he--rtl', false), format: 'nquads12' }, note: dirNote },
    { m: 'testDirLangStringRTLWithContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"שלום\"@he--rtl", true), expect: { graph: dirGraph('"שלום"@he--rtl', true), format: 'nquads12' }, note: dirNote },
    { m: 'testDirLangStringLTRWithNormalizationNoContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"Hello\"@en--ltr", false), expect: { graph: dirGraph('"Hello"@en--ltr', false), format: 'nquads12' }, note: dirNote },
    { m: 'testDirLangStringLTRWithNormalizationWithContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"Hello\"@en--ltr", true), expect: { graph: dirGraph('"Hello"@en--ltr', true), format: 'nquads12' }, note: dirNote },
    { m: 'testBadDirLangStringNoContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"hello\"@en--unk", false), expect: { reject: true }, note: badDirNote },
    { m: 'testBadDirLangStringWithContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"hello\"@en--unk", true), expect: { reject: true }, note: badDirNote },
    { m: 'testBadCapitalizationDirLangStringNoContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"Hello\"@en--LTR", false), expect: { reject: true }, note: badDirNote },
    { m: 'testBadCapitalizationDirLangStringWithContext', format: 'trig12', input: dirWrap("<http://example/a> <http://example/b> \"Hello\"@en--LTR", true), expect: { reject: true }, note: badDirNote },
    { m: 'testDirLangStringNoLanguage', format: 'trig12', input: "<http://example/a> <http://example/b> \"Hello\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString> .", expect: { graph: '<http://example/a> <http://example/b> "Hello" .\n' }, note: 'RDF4J (VERIFY_DATATYPE_VALUES=false, the default) drops rdf:dirLangString from a literal with no language tag and makes it xsd:string.' },
    { m: 'testSubjectReifiedTriple', format: 'trig12', input: "PREFIX : <http://example/>\n" + "<<:s :p :o>> :q 123 .", expect: { format: 'nquads12', graph: `_:r <${RDF}reifies> <<( <http://example/s> <http://example/p> <http://example/o> )>> .\n_:r <http://example/q> "123"^^<${XSD}integer> .\n` } },
    { m: 'testSubjectReifiedTripleNoPredicateObjectList', format: 'trig12', input: "PREFIX : <http://example/>\n" + "<<:s :p :o >> .", expect: { format: 'nquads12', graph: `_:r <${RDF}reifies> <<( <http://example/s> <http://example/p> <http://example/o> )>> .\n` } },
    { m: 'testVersionDirectiveDoubleQuotes', format: 'trig12', input: "@version \"1.2\" .", expect: { count: 0 } },
    { m: 'testVersionDirectiveSingleQuotes', format: 'trig12', input: "@version '1.2' .", expect: { count: 0 } },
    { m: 'testVersionDirectiveNoPeriod', format: 'trig12', input: "@version '1.2'", expect: { reject: true } },
    { m: 'testVersionDirectiveMismatchedQuotes', format: 'trig12', input: "@version '1.2\" .", expect: { reject: true } },
    { m: 'testSparqlVersionDirectiveDoubleQuotes', format: 'trig12', input: "VERSION \"1.2--basic\"", expect: { count: 0 } },
    { m: 'testSparqlVersionDirectiveSingleQuotes', format: 'trig12', input: "VERSION '1.2--basic'", expect: { count: 0 } },
    { m: 'testSparqlVersionDirectiveMismatchedQuotes', format: 'trig12', input: "VERSION '1.2--basic\"", expect: { reject: true } },
  ],
  notPorted: [
    { m: 'testSupportedSettings', reason: 'asserts the number of RioSettings the parser supports (15); no input, an API property of RDF4J' },
  ],
};
