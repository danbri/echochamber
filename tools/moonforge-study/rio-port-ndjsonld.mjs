// Port of core/rio/jsonld NDJSONLDParserTest. Derived from Eclipse RDF4J,
// Eclipse Distribution License 1.0 (BSD-3-Clause). Changed: re-expressed as data.
const r = 'NDJSON-LD (newline-delimited JSON-LD; testcases/ndjsonld/mates.ndjsonld holds two JSON objects, which is not one JSON-LD document): @factoidal/core has no NDJSON-LD format; also sets BasicWriterSettings.BASE_DIRECTIVE on a parser';
export default {
  file: 'core/rio/jsonld/src/test/java/org/eclipse/rdf4j/rio/ndjsonld/NDJSONLDParserTest.java',
  class: 'NDJSONLDParserTest',
  cases: [],
  notPorted: [{ m: 'testNDJSONLDWriter', reason: r }, { m: 'testNDJSONLDParser', reason: r }],
};
