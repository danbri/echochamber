// Build conformance/moonforge/rio/cases.json and verdicts.json from the
// hand-ported RDF4J Rio parser tests (rio-port-*.mjs) and the triage files
// (rio-verdicts-*.json), and count every Java test file in the Rio modules
// taken: parser files ported, writer files counted, other files listed with
// a reason. Original to echochamber, Apache-2.0; the data it writes is
// derived from Eclipse RDF4J (EDL 1.0, BSD-3-Clause).
// Usage (from the repo root): node tools/moonforge-study/extract-rio-build.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { RDF4J, HERE, loadPorts, build, testMethods } from './rio-lib.mjs';

const COMMIT = 'fe7a441aa3f80f09993178b35f9f1e7a252932cc';
const OUT = join(HERE, '../../conformance/moonforge/rio');
const MODULES = ['turtle', 'ntriples', 'nquads', 'trig', 'rdfxml', 'jsonld', 'trix', 'n3', 'languages', 'datatypes', 'api'];

const mods = await loadPorts();
const { cases, notPorted, perFile, problems } = build(mods);
const taken = new Set(perFile.map((f) => f.file));

// Every Java test file of the modules in scope.
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const otherFiles = []; const writerFiles = [];
const SUBCLASS = 'per-format subclass with no test methods of its own; its inherited methods are ported under the abstract class';
const reasonFor = (name, n) => {
  if (/HandlingTest|HandlerTest|ParserUnitTest$|BaseURIHandlingTest/.test(name) && n === 0) return SUBCLASS;
  if (n === 0) return 'no test methods (helper, fixture or benchmark class)';
  if (/MimeType|FileTypeDetector|Compression|InputDispatcher|RioTest$|RioConfigTest|ParserConfigTest|Setting/.test(name)) return 'Rio API test (format registry, MIME types, settings objects, input dispatch); no document parse';
  if (/Util|StatementCollector|ParserHelper|TripleTermUtil/.test(name)) return 'unit test of a Java helper class (term-level utility or statement collector); no document parse through a parser';
  if (/LanguageHandler|DatatypeHandler/.test(name)) return 'unit test of a pluggable language or datatype handler (LANGUAGE_HANDLERS / DATATYPE_HANDLERS settings); no document parse';
  return 'not a parser test';
};
for (const m of MODULES) {
  const root = join(RDF4J, 'core/rio', m, 'src/test/java');
  let files = []; try { files = walk(root).filter((f) => f.endsWith('.java')); } catch { continue; }
  for (const f of files.sort()) {
    const rel = relative(RDF4J, f); if (taken.has(rel)) continue;
    const name = f.split('/').pop().replace(/\.java$/, '');
    const n = testMethods(rel).length;
    if (/Writer/.test(name)) writerFiles.push({ file: rel, methods: n });
    else otherFiles.push({ file: rel, methods: n, reason: reasonFor(name, n) });
  }
}

const verdicts = { cases: {} };
for (const f of readdirSync(HERE).filter((x) => /^rio-verdicts-.*\.json$/.test(x)).sort()) {
  for (const [id, v] of Object.entries(JSON.parse(readFileSync(join(HERE, f), 'utf8')).cases)) {
    if (verdicts.cases[id]) problems.push(`verdict ${id} twice`);
    verdicts.cases[id] = v;
  }
}
const ids = new Set(cases.map((c) => c.id));
for (const id of Object.keys(verdicts.cases)) if (!ids.has(id)) problems.push(`verdict for unknown case ${id}`);

const W3C = {
  root: 'testsuites/rio/src/main/resources/testcases',
  tool: 'tools/moonforge-study/extract-rio-w3c-compare.mjs, against a W3C rdf-tests checkout (rdf/rdf11, rdf/rdf12)',
  files: 2018,
  reason: 'W3C test-suite copies (manifest-driven by testsuites/rio AbstractParserTestSuite; not RDF4J-authored edge cases): byte-identical to W3C rdf-tests, or an older or newer W3C revision of a file of the same name, or an earlier W3C test since withdrawn (turtle-eval-bad-01..04, trig-eval-bad-01..04, older rdfxml rdfs-* files); rdfjson/ is the RDF/JSON suite (52 files), a format core does not read',
  extra: [
    { file: 'core/rio/ntriples/src/test/resources/testcases/ntriples/test.nt', reason: 'W3C RDF Core N-Triples test file (W3C copyright, Dave Beckett); used by AbstractNTriplesParserUnitTest#testNTriplesFile, listed in notPorted' },
  ],
};

const totalMethods = perFile.reduce((a, f) => a + f.methods, 0);
const out = {
  _notice: 'Derived from Eclipse RDF4J (https://github.com/eclipse-rdf4j/rdf4j), core/rio/*/src/test/java and core/rio/*/src/test/resources, Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse RDF4J contributors, Aduna, and others. Changed: each parser test method re-expressed by hand as data (input text, format, base IRI, expected outcome) in tools/moonforge-study/rio-port-*.mjs and gathered here by tools/moonforge-study/extract-rio-build.mjs; Java string literals copied verbatim and decoded; RDF4J-authored resource files inlined; assertions on RDF4J objects (Model size, getLabel, getLanguage, getDatatype, Models.isomorphic) re-expressed as an expected statement count or an expected graph in N-Quads; inputs that RDF4J produces with its own writers re-written by hand as an equivalent serialization of the same model; a 16,000,000-character generated literal stored as a repeat field; error positions, listener callbacks and error-listener counts not compared (each such case says so in its note).',
  source: {
    repository: 'https://github.com/eclipse-rdf4j/rdf4j',
    commit: COMMIT,
    paths: perFile.map((f) => f.file),
  },
  counts: {
    parserFiles: perFile.length, parserMethods: totalMethods,
    ported: perFile.reduce((a, f) => a + f.ported, 0), notPorted: notPorted.length, cases: cases.length,
    writerFiles: writerFiles.length, writerMethods: writerFiles.reduce((a, f) => a + f.methods, 0),
    otherFiles: otherFiles.length, otherMethods: otherFiles.reduce((a, f) => a + f.methods, 0),
  },
  perFile,
  cases,
  notPorted,
  writerTests: writerFiles,
  filesNotTaken: otherFiles,
  excludedResources: W3C,
};

for (const p of problems) console.error('PROBLEM', p);
if (problems.length) process.exitCode = 1;
console.table(perFile.map(({ class: c, methods, ported, notPorted: np, cases: n }) => ({ class: c, methods, ported, notPorted: np, cases: n })));
console.log(JSON.stringify(out.counts));
if (!process.argv.includes('--check') && !problems.length) {
  writeFileSync(join(OUT, 'cases.json'), JSON.stringify(out, null, 1) + '\n');
  writeFileSync(join(OUT, 'verdicts.json'), JSON.stringify(verdicts, null, 1) + '\n');
  console.log(`wrote ${cases.length} cases, ${Object.keys(verdicts.cases).length} verdicts`);
}
