// Port of core/rio/jsonld JSONLDParserCustomOldTest (the same cases as
// JSONLDParserCustomTest, with the deprecated settings class). Derived from
// Eclipse RDF4J, Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c)
// Eclipse RDF4J contributors, Aduna, and others. Changed: test methods
// re-expressed as data; Java string literals copied verbatim.
import { port } from './rio-port-jsonld.mjs';
const old = port('core/rio/jsonld/src/test/java/org/eclipse/rdf4j/rio/jsonld/JSONLDParserCustomOldTest.java', 'JSONLDParserCustomOldTest');
old.notPorted = old.notPorted.filter((n) => n.m !== 'testRemoteContextDefaultWhitelist');
old.notPorted.find((n) => n.m === 'testRemoteContext').reason += '; @RepeatedTest(10)';
export default old;
