// Ports of core/rio/api BaseURIHandlingTest (run by RDF4J through
// TurtleBaseURIHandlingTest and RDFXMLBaseURIHandlingTest), ResolveUriTest
// and AbstractRDFParserTest. Derived from Eclipse RDF4J, EDL 1.0
// (BSD-3-Clause). Changed: the RDF4J resource files are inlined; RDF4J's
// "statements not empty" is written as the statement the file holds;
// ResolveUriTest calls AbstractRDFParser.resolveURI directly, here each
// reference is written as the object IRI of one Turtle triple parsed with
// the test's base IRI.

const TTL = {
  absolute: '@prefix ex: <http://example.org/>.\n\n<http://example.org/SomeSubject1>  ex:label "label for subject" .\n',
  internal: '@prefix ex: <http://example.org/>.\n@base <http://example.org/> .\n\n</SomeSubject1>  ex:label "label for subject" .\n',
  missing: '@prefix ex: <http://example.org/>.\n\n</SomeSubject1>  ex:label "label for subject" .\n',
};
const XML = {
  absolute: '<?xml version="1.0"?>\n\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n\txmlns:ex="http://example.org/">\n<rdf:Description rdf:about="http://example.org/SomeSubject1">\n\t<ex:label>label for subject</ex:label>\n</rdf:Description>\n</rdf:RDF>\n',
  internal: '<?xml version="1.0"?>\n\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n\txmlns:ex="http://example.org/"\n\txml:base="http://example.org/">\n\t\n<rdf:Description rdf:about="/SomeSubject1">\n\t<ex:label>label for subject</ex:label>\n</rdf:Description>\n</rdf:RDF>\n',
  missing: '<?xml version="1.0"?>\n\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n\txmlns:ex="http://example.org/">\n<rdf:Description rdf:about="/SomeSubject1">\n\t<ex:label>label for subject</ex:label>\n</rdf:Description>\n</rdf:RDF>\n',
};
const G = '<http://example.org/SomeSubject1> <http://example.org/label> "label for subject" .\n';
const files = {
  turtle: { absolute: 'core/rio/turtle/src/test/resources/org/eclipse/rdf4j/rio/turtle/turtle-absolute-iris.ttl', internal: 'core/rio/turtle/src/test/resources/org/eclipse/rdf4j/rio/turtle/turtle-relative-iris-internal-base.ttl', missing: 'core/rio/turtle/src/test/resources/org/eclipse/rdf4j/rio/turtle/turtle-relative-iris-missing-base.ttl' },
  rdfxml: { absolute: 'core/rio/rdfxml/src/test/resources/org/eclipse/rdf4j/rio/rdfxml/rdfxml-absolute-iris.rdf', internal: 'core/rio/rdfxml/src/test/resources/org/eclipse/rdf4j/rio/rdfxml/rdfxml-relative-iris-internal-base.rdf', missing: 'core/rio/rdfxml/src/test/resources/org/eclipse/rdf4j/rio/rdfxml/rdfxml-relative-iris-missing-base.rdf' },
};
function both(m, which, base, expect) {
  return [['turtle', TTL], ['rdfxml', XML]].map(([f, src]) => ({
    m, suffix: f, format: f, base, input: src[which], expect,
    note: `${f === 'turtle' ? 'TurtleBaseURIHandlingTest' : 'RDFXMLBaseURIHandlingTest'}; input ${files[f][which]}`,
  }));
}

const baseTest = {
  file: 'core/rio/api/src/test/java/org/eclipse/rdf4j/rio/BaseURIHandlingTest.java',
  class: 'BaseURIHandlingTest',
  cases: [
    ...both('testParseWithoutBaseUri_Absolute', 'absolute', null, { graph: G }),
    ...both('testParseWithoutBaseUri_Relative', 'missing', null, { reject: true }),
    ...both('testParseWithoutBaseUri_Relative_InternalBase', 'internal', null, { graph: G }),
    // RDF4J also asserts that no term starts with the supplied base: the expected graph says the same.
    ...both('testParseWithBaseUri_Relative_InternalBase', 'internal', 'http://example.org/custom-supplied', { graph: G }),
    ...both('testParseWithBaseUri_Relative', 'missing', 'http://example.org/', { graph: G }),
  ],
  notPorted: [],
};

const B = 'http://example.org/dir/doc';
const r = (m, ref, base, expect) => ({ m, format: 'turtle', base: base || undefined, input: `<urn:s> <urn:p> <${ref}> .\n`, expect: typeof expect === 'string' ? { graph: `<urn:s> <urn:p> <${expect}> .\n` } : expect });
const resolveTest = {
  file: 'core/rio/api/src/test/java/org/eclipse/rdf4j/rio/ResolveUriTest.java',
  class: 'ResolveUriTest',
  cases: [
    r('absoluteIriIsNotResolved', 'http://other.org/x', B, 'http://other.org/x'),
    r('urnIsNotResolved', 'urn:isbn:0451450523', B, 'urn:isbn:0451450523'),
    r('singleLetterSchemeIsNotResolved', 'a:b', B, 'a:b'),
    r('plainRelativePathIsResolved', 'other', B, 'http://example.org/dir/other'),
    r('colonInLaterPathSegmentIsResolved', 'path/foo:bar', B, 'http://example.org/dir/path/foo:bar'),
    r('dotSegmentColonIsResolved', './a:b', B, 'http://example.org/dir/a:b'),
    r('colonInQueryIsResolved', '?q=a:b', B, 'http://example.org/dir/doc?q=a:b'),
    r('colonInFragmentIsResolved', '#a:b', B, 'http://example.org/dir/doc#a:b'),
    r('networkPathReferenceUsesBaseScheme', '//other.org/x', B, 'http://other.org/x'),
    r('emptyStringResolvesToBase', '', B, 'http://example.org/dir/doc'),
    r('fragmentOnlyResolvesAgainstBase', '#frag', B, 'http://example.org/dir/doc#frag'),
    r('relativeIriWithoutBaseFails', 'relative/path', null, { reject: true }),
    r('colonInPathWithoutBaseFails', 'path/foo:bar', null, { reject: true }),
    r('leadingColonInFirstPathSegmentIsRejected', ':foo', B, { reject: true }),
  ],
  notPorted: [],
};

const abstractRdfParser = {
  file: 'core/rio/api/src/test/java/org/eclipse/rdf4j/rio/helpers/AbstractRDFParserTest.java',
  class: 'AbstractRDFParserTest',
  cases: [],
  notPorted: [
    { m: 'testSkolemOrigin', reason: 'relies on non-default parser setting SKOLEMIZE_ORIGIN; no text input (calls createNode directly)' },
    { m: 'testSkolemOriginReset', reason: 'relies on parser setting SKOLEMIZE_ORIGIN; no text input (calls createNode directly)' },
    { m: 'testNodeIdHashing', reason: 'asserts the text of RDF4J-generated blank node identifiers (createNode); not observable through the core API' },
  ],
};

export default [baseTest, resolveTest, abstractRdfParser];
