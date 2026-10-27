// Merge the hand-ported RDF4J compliance parts (compliance-part-*.json,
// compliance-verdicts-*.json) into conformance/echo04/compliance/cases.json
// and verdicts.json. Original to echochamber (Apache-2.0); the case data it
// copies is derived from Eclipse RDF4J (EDL 1.0, BSD-3-Clause).
// Usage: node tools/echo04-study/compliance-merge.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname;
const out = join(here, '../../conformance/echo04/compliance');
const parts = readdirSync(here).filter((f) => /^compliance-part-[A-Z]\.json$/.test(f)).sort();
const cases = []; const notPorted = []; const methods = new Set(); const classes = [];
const verdicts = {};
for (const f of parts) {
  const p = JSON.parse(readFileSync(join(here, f), 'utf8'));
  classes.push(...p.classes);
  for (const m of p.methods) { if (methods.has(m)) throw new Error('duplicate method ' + m); methods.add(m); }
  cases.push(...p.cases); notPorted.push(...p.notPorted);
  const vf = join(here, f.replace('part', 'verdicts'));
  try { Object.assign(verdicts, JSON.parse(readFileSync(vf, 'utf8')).cases); } catch (e) { if (e.code !== 'ENOENT') throw e; }
}
// Every listed method is covered exactly by cases or notPorted, and nothing else is.
const covered = new Set([...cases.map((c) => c.id.split('#').slice(0, 2).join('#')), ...notPorted.map((x) => x.id)]);
for (const m of methods) if (!covered.has(m)) throw new Error('method not covered: ' + m);
for (const m of covered) if (!methods.has(m)) throw new Error('case for unlisted method: ' + m);
for (const id of Object.keys(verdicts)) if (!cases.some((c) => c.id === id)) throw new Error('verdict for unknown case ' + id);

const doc = {
  _notice: 'Derived from Eclipse RDF4J (https://github.com/eclipse-rdf4j/rdf4j), Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse RDF4J contributors, Aduna, and others. Changed: the Java test methods were hand-ported to data: the statements each test adds or loads became TriG/Turtle text (RDF4J contexts as named graphs), the SPARQL strings were kept, with PREFIX declarations added for the prefixes RDF4J declares implicitly (listed per case in implicitPrefixes), Java prepared bindings were rewritten as VALUES or FROM where noted, and the JUnit/AssertJ assertions became the expectations under "expect".',
  source: {
    repository: 'https://github.com/eclipse-rdf4j/rdf4j',
    commit: 'fe7a441aa3f80f09993178b35f9f1e7a252932cc',
    paths: [
      'testsuites/sparql/src/main/java/org/eclipse/rdf4j/testsuite/sparql/tests/',
      'testsuites/sparql/src/main/java/org/eclipse/rdf4j/testsuite/query/parser/sparql/SPARQLUpdateTest.java',
      'testsuites/sparql/src/main/resources/testdata-query/',
      'testsuites/sparql/src/main/resources/testdata-update/',
      'testsuites/sparql/src/main/resources/testdata-bnr/conformance-vectors.json',
    ],
  },
  classes,
  methodCount: methods.size,
  rdf4jSemantics: [
    { topic: 'union default graph', rdf4j: 'With no FROM/FROM NAMED (or USING/WITH), the default graph of a query or update WHERE clause is the union of all graphs in the repository.', spec: 'SPARQL 1.1 Query §13 and §13.2 leave the dataset to the service when the query gives none; @factoidal/core uses the data\'s default graph. Cases marked unionDefaultGraph rely on the RDF4J choice; failures from it are divergence group union-default-graph.' },
    { topic: 'implicit prefixes', rdf4j: 'The SPARQL parser declares rdf, rdfs, rdf4j, sesame, owl, xsd and fn when a query uses them undeclared (PrefixDeclProcessor).', spec: 'SPARQL 1.1 Query §4.1.1.1 / §19.8: a prefixed name needs a PREFIX declaration. The port adds the declarations (implicitPrefixes) so that each case tests its own subject.' },
  ],
  cases,
  notPorted,
};
writeFileSync(join(out, 'cases.json'), JSON.stringify(doc, null, 1) + '\n');
writeFileSync(join(out, 'verdicts.json'), JSON.stringify({ cases: verdicts }, null, 1) + '\n');
console.log(`parts ${parts.join(' ')}: methods ${methods.size}, cases ${cases.length}, notPorted ${notPorted.length}, verdicts ${Object.keys(verdicts).length}`);
