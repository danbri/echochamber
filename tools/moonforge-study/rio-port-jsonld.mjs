// Port of core/rio/jsonld JSONLDParserCustomTest (RDF4J's own JSON-LD parser
// edge cases). Derived from Eclipse RDF4J, Eclipse Distribution License 1.0
// (BSD-3-Clause). Copyright (c) Eclipse RDF4J contributors, Aduna, and others.
// Changed: test methods re-expressed as data (input string, expectation);
// Java string literals copied verbatim; the RDF4J-authored resource
// testcases/jsonld/localFileContext/data.jsonld inlined with a file: URI.
export const S = {
  BACKSLASH_ESCAPED_TEST_STRING: "[{\"@id\": \"\\http://example.com/Subj1\",\"http://example.com/prop1\": [{\"@id\": \"http://example.com/Obj1\"}]}]",
  COMMENTS_TEST_STRING: "[{/*This is a non-standard java/c++ style comment\n*/\"@id\": \"http://example.com/Subj1\",\"http://example.com/prop1\": [{\"@id\": \"http://example.com/Obj1\"}]}]",
  NON_NUMERIC_NUMBERS_TEST_STRING: "[{\"@id\": \"http://example.com/Subj1\",\"http://example.com/prop1\": NaN}]",
  NUMERIC_LEADING_ZEROES_TEST_STRING: "[{\"@id\": \"http://example.com/Subj1\",\"http://example.com/prop1\": 000042}]",
  SINGLE_QUOTES_TEST_STRING: "[{\'@id\': \"http://example.com/Subj1\",\'http://example.com/prop1\': 42}]",
  UNQUOTED_CONTROL_CHARS_TEST_STRING: "[{\"@id\": \"http://example.com/Subj1\",\"http://example.com/prop1\": \"42\u0009\"}]",
  UNQUOTED_FIELD_NAMES_TEST_STRING: "[{@id: \"http://example.com/Subj1\",\"http://example.com/prop1\": 42}]",
  YAML_COMMENTS_TEST_STRING: "[\n{#This is a non-standard yaml style comment/*\n\"@id\": \"http://example.com/Subj1\",\"http://example.com/prop1\": [{\"@id\": \"http://example.com/Obj1\"}]}]",
  TRAILING_COMMA_TEST_STRING: "[{\"@id\": \"http://example.com/Subj1\",\"http://example.com/prop1\": [{\"@id\": \"http://example.com/Obj1\"},]}]",
  STRICT_DUPLICATE_DETECTION_TEST_STRING: "[{\"@context\": {}, \"@context\": {}, \"@id\": \"http://example.com/Subj1\",\"http://example.com/prop1\": [{\"@id\": \"http://example.com/Obj1\"}]}]",
};
// testcases/jsonld/localFileContext/data.jsonld with "file:./context.jsonld"
// replaced by a file: URI, as the test does with its class-path URL.
export const LOCAL_FILE_DATA = '{\n  "@context":  "file:///rdf4j/core/rio/jsonld/src/test/resources/testcases/jsonld/localFileContext/context.jsonld",\n\n    "@id":"http://example/peter",\n    "@type":"Person"\n\n\n\n}\n';
const ONE = '<http://example.com/Subj1> <http://example.com/prop1> <http://example.com/Obj1> .\n';

export function port(file, cls) {
  const rej = (m, k) => ({ m, input: S[k], expect: { reject: true } });
  return {
    file, class: cls,
    defaults: { format: 'jsonld' },
    cases: [
      rej('testAllowBackslashEscapingAnyCharacterDefault', 'BACKSLASH_ESCAPED_TEST_STRING'),
      rej('testAllowBackslashEscapingAnyCharacterDisabled', 'BACKSLASH_ESCAPED_TEST_STRING'),
      rej('testAllowCommentsDefault', 'COMMENTS_TEST_STRING'),
      rej('testAllowNonNumericNumbersDefault', 'NON_NUMERIC_NUMBERS_TEST_STRING'),
      rej('testAllowNumericLeadingZeroesDefault', 'NUMERIC_LEADING_ZEROES_TEST_STRING'),
      rej('testAllowSingleQuotesDefault', 'SINGLE_QUOTES_TEST_STRING'),
      rej('testAllowUnquotedControlCharactersDefault', 'UNQUOTED_CONTROL_CHARS_TEST_STRING'),
      rej('testAllowUnquotedFieldNamesDefault', 'UNQUOTED_FIELD_NAMES_TEST_STRING'),
      rej('testAllowYamlCommentsDefault', 'YAML_COMMENTS_TEST_STRING'),
      rej('testAllowTrailingCommaDefault', 'TRAILING_COMMA_TEST_STRING'),
      { m: 'testStrictDuplicateDetectionDefault', input: S.STRICT_DUPLICATE_DETECTION_TEST_STRING, expect: { graph: ONE } },
      { m: 'testLocalFileSecurity', input: LOCAL_FILE_DATA, expect: { reject: true },
        note: 'RDF4J default SECURE_MODE=true refuses a context outside WHITELIST; the message text is not compared. The file: URI here names no file, so this case shows only that the parse refuses, not why.' },
    ],
    notPorted: [
      { m: 'testSupportedSettings', reason: 'asserts the number of RDF4J parser settings (API shape, no input)' },
      { m: 'testContext', reason: 'non-default setting JSONLDSettings.EXPAND_CONTEXT (JSON-LD API expandContext option); core parse has no such option' },
      { m: 'testLocalFileSecurityWhiteList', reason: 'non-default setting JSONLDSettings.WHITELIST plus loading a local file: context; core parse has no document loader option' },
      { m: 'testLocalFileSecurityDisableSecurity', reason: 'non-default setting JSONLDSettings.SECURE_MODE=false plus loading a local file: context' },
      { m: 'testLocalFileSecurityDisableSecuritySystemProperty', reason: 'non-default SECURE_MODE=false via a Java system property plus loading a local file: context' },
      { m: 'testRemoteContextDefaultWhitelist', reason: 'non-default setting JSONLDSettings.EXPAND_CONTEXT (the schema.org context supplied by the test); @RepeatedTest(100)' },
      { m: 'testRemoteContext', reason: 'non-default settings JSONLDSettings.WHITELIST and EXPAND_CONTEXT (schema.org context supplied by the test)' },
      { m: 'testRemoteContextSystemProperty', reason: 'non-default WHITELIST via a Java system property and EXPAND_CONTEXT' },
      { m: 'testRemoteContextException', reason: 'non-default setting JSONLDSettings.WHITELIST; asserts a network load failure message for https://example.org/context.jsonld' },
      { m: 'testSPI', reason: 'Java ServiceLoader check for the JSON provider class; no RDF input' },
    ],
  };
}
const custom = port('core/rio/jsonld/src/test/java/org/eclipse/rdf4j/rio/jsonld/JSONLDParserCustomTest.java', 'JSONLDParserCustomTest');
custom.notPorted.push(
  { m: 'testLocalFileSecurityCustomDocumentLoader', reason: 'non-default setting JSONLDSettings.DOCUMENT_LOADER (a Java callback) plus loading a local file: context' },
  { m: 'testLocalFileSecurityCustomDocumentLoader2', reason: 'non-default settings JSONLDSettings.DOCUMENT_LOADER (a Java callback) and SECURE_MODE=false' },
);
export default custom;
