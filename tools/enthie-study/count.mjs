// Count N3.js's API surface and tests, by reading (not running) the sources.
//
// Usage: node tools/enthie-study/count.mjs <N3.js checkout>
//
// API: for each class declared in src/*.js, the methods, getters and static
// methods whose names do not start with '_' (acorn syntax tree).
// Tests: per test/*-test.js, the `it`/`test` calls in the syntax tree plus
// one per `itShouldResolve(...)` call (that helper declares one `it`), and
// the `describe` calls. An `it` inside a loop counts once (as written).

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import * as acorn from 'acorn';

const [root] = process.argv.slice(2);
const commit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD']).toString().trim();
const parseFile = (p) => acorn.parse(readFileSync(p, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' });

function walk(node, f) {
  if (!node || typeof node.type !== 'string') return;
  f(node);
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => walk(c, f));
    else if (v && typeof v.type === 'string') walk(v, f);
  }
}

const api = {};
for (const f of readdirSync(join(root, 'src')).filter((x) => x.endsWith('.js'))) {
  walk(parseFile(join(root, 'src', f)), (n) => {
    if ((n.type === 'ClassDeclaration' || n.type === 'ClassExpression') && n.id) {
      const names = n.body.body.filter((m) => m.type === 'MethodDefinition' && m.key && m.key.name && !m.key.name.startsWith('_') && m.kind !== 'constructor')
        .map((m) => (m.static ? 'static ' : '') + (m.kind === 'get' ? 'get ' : m.kind === 'set' ? 'set ' : '') + m.key.name);
      api[`${f} ${n.id.name}`] = names;
    }
  });
}

const AREA = [
  [/^(Term|NamedNode|BlankNode|Literal|Variable|DefaultGraph|Quad|N3DataFactory)-test/, 'data model (RDF/JS terms, DataFactory)'],
  [/^(N3Parser|N3ParserDirectives|N3ParserTokenCallbacks|N3Lexer|BaseIRI)-test/, 'parser, lexer, IRI resolution'],
  [/^N3Writer-test/, 'writer'],
  [/^N3Stream(Parser|Writer)-test/, 'stream parser and writer (RDF/JS Stream)'],
  [/^N3Store/, 'store (RDF/JS DatasetCore, Source, Sink)'],
  [/^N3Reasoner-test/, 'N3 reasoner'],
  [/^N3Util-test/, 'utilities'],
  [/^(esm-bundle|iife-bundle|Fuzz)-test/, 'bundles and fuzzing'],
];

const tests = [];
for (const f of readdirSync(join(root, 'test')).filter((x) => x.endsWith('-test.js')).sort()) {
  let its = 0, describes = 0;
  walk(parseFile(join(root, 'test', f)), (n) => {
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier') {
      if (n.callee.name === 'it' || n.callee.name === 'test') its++;
      if (n.callee.name === 'itShouldResolve') its++;
      if (n.callee.name === 'describe') describes++;
    }
  });
  // The helper itShouldResolve's own body has one `it`, counted above once.
  if (f === 'N3Parser-test.js') its--;
  const area = (AREA.find(([re]) => re.test(f)) || [null, 'other'])[1];
  tests.push({ file: f, its, describes, area });
}
const byArea = {};
for (const t of tests) byArea[t.area] = (byArea[t.area] || 0) + t.its;
console.log(JSON.stringify({ commit, api, tests, byArea, total: tests.reduce((a, t) => a + t.its, 0) }, null, 1));
