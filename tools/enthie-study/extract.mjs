// Extract the data-driven test cases of N3.js's parser and writer suites.
//
// Reads test/N3Parser-test.js and test/N3Writer-test.js of an N3.js checkout
// and parses them with acorn. Nothing from N3.js is imported or executed:
// the extractor reads the syntax tree and evaluates only literal expressions
// (strings, template strings, arrays, objects, `+`, a few named constants).
// It records every `it(name, shouldParse(...))`, `shouldNotParse`,
// `shouldParseWithCommentsEnabled`, `shouldCallbackComments`,
// `shouldNotParseWithComments`, `shouldSerialize` and `itShouldResolve(...)`
// as data with its describe path. Any other `it` is recorded as kind 'code'
// (hand-written; not extracted), and a helper call whose arguments are not
// literal is recorded as kind 'unextracted'.
//
// Usage: node tools/enthie-study/extract.mjs <N3.js checkout> <out dir>

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import * as acorn from 'acorn';

const [root, outDir] = process.argv.slice(2);
if (!root || !outDir) {
  console.error('usage: extract.mjs <N3.js checkout> <out dir>');
  process.exit(2);
}
const commit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD']).toString().trim();

const XSD = 'http://www.w3.org/2001/XMLSchema#';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const HELPERS = new Set(['shouldParse', 'shouldNotParse', 'shouldParseWithCommentsEnabled',
  'shouldCallbackComments', 'shouldNotParseWithComments', 'shouldSerialize']);

class Unevaluable extends Error {}

// Evaluate a literal expression. `env` maps identifiers to values.
function ev(node, env) {
  switch (node.type) {
    case 'Literal':
      if (node.regex) throw new Unevaluable('regex');
      return node.value;
    case 'TemplateLiteral': {
      let s = '';
      node.quasis.forEach((q, i) => {
        s += q.value.cooked;
        if (i < node.expressions.length) s += String(ev(node.expressions[i], env));
      });
      return s;
    }
    case 'BinaryExpression':
      if (node.operator !== '+') throw new Unevaluable(node.operator);
      return ev(node.left, env) + ev(node.right, env);
    case 'ArrayExpression':
      return node.elements.map((e) => (e === null ? null : ev(e, env)));
    case 'ObjectExpression': {
      const o = {};
      for (const p of node.properties) {
        if (p.type !== 'Property' || p.computed) throw new Unevaluable('property');
        const k = p.key.type === 'Identifier' ? p.key.name : p.key.value;
        o[k] = p.shorthand ? ev(p.key, env) : ev(p.value, env);
      }
      return o;
    }
    case 'UnaryExpression':
      if (node.operator === '-') return -ev(node.argument, env);
      if (node.operator === '!') return !ev(node.argument, env);
      throw new Unevaluable(node.operator);
    case 'Identifier':
      if (node.name === 'undefined') return undefined;
      if (node.name === 'Infinity') return Infinity;
      if (node.name in env) return env[node.name];
      throw new Unevaluable(`identifier ${node.name}`);
    case 'MemberExpression': {
      if (!node.computed && node.object.type === 'Identifier' && node.property.type === 'Identifier') {
        if (node.object.name === 'xsd') return XSD + node.property.name;
        if (node.object.name === 'rdf') return RDF + node.property.name;
      }
      throw new Unevaluable('member');
    }
    case 'NewExpression':
    case 'CallExpression': {
      const callee = node.callee.type === 'Identifier' ? node.callee.name
        : node.callee.type === 'MemberExpression' && !node.callee.computed ? `${node.callee.object.name}.${node.callee.property.name}` : null;
      const args = node.arguments.map((a) => ev(a, env));
      switch (callee) {
        case 'termFromId': return args[0];
        case 'NamedNode': case 'DF.namedNode': case 'namedNode': return { term: { termType: 'NamedNode', value: args[0] } };
        case 'BlankNode': case 'DF.blankNode': case 'blankNode': return { term: { termType: 'BlankNode', value: args[0] } };
        case 'Literal': return { term: { termType: 'LiteralId', value: args[0] } };
        case 'DF.literal': case 'literal': return { term: { termType: 'Literal', value: args[0], languageOrDatatype: args[1] === undefined ? null : args[1] } };
        case 'Quad': case 'DF.quad': case 'quad': case 'DF.triple':
          return { term: { termType: 'Quad', subject: args[0], predicate: args[1], object: args[2], graph: args[3] === undefined ? null : args[3] } };
        case 'String.prototype.repeat': throw new Unevaluable('repeat');
        default: break;
      }
      if (node.callee.type === 'MemberExpression' && !node.callee.computed && node.callee.property.name === 'repeat') {
        return String(ev(node.callee.object, env)).repeat(args[0]);
      }
      if (node.callee.type === 'MemberExpression' && !node.callee.computed && node.callee.property.name === 'join') {
        return ev(node.callee.object, env).join(args[0]);
      }
      throw new Unevaluable(`call ${callee}`);
    }
    default:
      throw new Unevaluable(node.type);
  }
}

// The options of `function name() { return new Parser({...}) }`.
function parserFactory(fn, env) {
  const body = fn.body.body;
  if (body.length !== 1 || body[0].type !== 'ReturnStatement') return null;
  const r = body[0].argument;
  if (!r || r.type !== 'NewExpression' || r.callee.name !== 'Parser') return null;
  try {
    return { parserOptions: r.arguments.length ? ev(r.arguments[0], env) : {} };
  } catch (e) {
    if (e instanceof Unevaluable) return { parserOptions: { unextracted: true } };
    throw e;
  }
}

function extract(file) {
  const src = readFileSync(join(root, 'test', file), 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const cases = [];
  let counter = 0;
  const top = {};
  // Top-level `const X = <literal>`.
  for (const st of ast.body) {
    if (st.type === 'VariableDeclaration') {
      for (const d of st.declarations) {
        if (d.id.type !== 'Identifier' || !d.init) continue;
        try { top[d.id.name] = ev(d.init, top); } catch (e) { if (!(e instanceof Unevaluable)) throw e; }
      }
    }
  }
  const BASE_IRI = top.BASE_IRI;

  function helperCase(name, args, env, line) {
    const vals = [];
    for (const a of args) {
      if (a.type === 'Identifier' && env[a.name] && env[a.name].parserOptions) vals.push(env[a.name]);
      else vals.push(ev(a, env));
    }
    if (name === 'shouldSerialize') {
      const expected = vals.pop();
      const prefixes = Array.isArray(vals[0]) ? null : vals.shift();
      return { kind: 'serialize', prefixes, quads: vals, expected };
    }
    // The upstream helpers construct `new parser({ baseIRI: BASE_IRI })`: the
    // default Parser gets BASE_IRI; a factory function ignores the argument.
    let options = { baseIRI: BASE_IRI };
    if (vals[0] && vals[0].parserOptions) options = vals.shift().parserOptions;
    const input = vals.shift();
    switch (name) {
      case 'shouldParse': return { kind: 'parse', options, input, expected: vals };
      case 'shouldParseWithCommentsEnabled': return { kind: 'parse-comments', options, input, expected: vals };
      case 'shouldCallbackComments': return { kind: 'comments', options, input, expected: vals };
      case 'shouldNotParse': return { kind: 'not-parse', options, input, expectedError: vals[0], expectedContext: vals[1] === undefined ? null : vals[1] };
      case 'shouldNotParseWithComments': return { kind: 'not-parse-comments', options, input, expectedError: vals[0], expectedContext: vals[1] === undefined ? null : vals[1] };
      default: throw new Error(name);
    }
  }

  // Walk statements; `path` is the describe path, `env` the identifier scope.
  function walkStatements(stmts, path, env, dynamic) {
    const local = Object.create(env);
    for (const st of stmts) {
      if (st.type === 'FunctionDeclaration' && st.id) {
        const pf = parserFactory(st, local);
        if (pf) local[st.id.name] = pf;
      }
      if (st.type === 'VariableDeclaration') {
        for (const d of st.declarations) {
          if (d.id.type === 'Identifier' && d.init) {
            try { local[d.id.name] = ev(d.init, local); } catch (e) { if (!(e instanceof Unevaluable)) throw e; }
          }
        }
      }
    }
    for (const st of stmts) walkNode(st, path, local, dynamic);
  }

  function bodyOf(fn) {
    if (!fn || (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression')) return null;
    return fn.body.type === 'BlockStatement' ? fn.body.body : [{ type: 'ExpressionStatement', expression: fn.body }];
  }

  function nameOf(node, env) {
    try { return String(ev(node, env)); } catch (e) { if (e instanceof Unevaluable) return '(dynamic name)'; throw e; }
  }

  function walkNode(node, path, env, dynamic) {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
      const fname = node.callee.name;
      if (fname === 'describe' && node.arguments.length >= 2) {
        const body = bodyOf(node.arguments[1]);
        if (body) { walkStatements(body, [...path, nameOf(node.arguments[0], env)], env, dynamic); return; }
      }
      if (fname === 'it' || fname === 'test') {
        const id = `${file}#${++counter}`;
        const name = nameOf(node.arguments[0], env);
        const line = node.loc.start.line;
        const arg = node.arguments[1];
        if (dynamic) { cases.push({ id, path, name, line, kind: 'code-dynamic' }); return; }
        if (arg && arg.type === 'CallExpression' && arg.callee.type === 'Identifier' && HELPERS.has(arg.callee.name)) {
          try {
            cases.push({ id, path, name, line, ...helperCase(arg.callee.name, arg.arguments, env, line) });
          } catch (e) {
            if (!(e instanceof Unevaluable)) throw e;
            cases.push({ id, path, name, line, kind: 'unextracted', helper: arg.callee.name, reason: e.message });
          }
        } else {
          cases.push({ id, path, name, line, kind: 'code' });
        }
        return;
      }
      if (fname === 'itShouldResolve') {
        const id = `${file}#${++counter}`;
        const line = node.loc.start.line;
        try {
          const [baseIRI, relativeIri, expected] = node.arguments.map((a) => ev(a, env));
          cases.push({ id, path, name: `resolving <${relativeIri}> against <${baseIRI}>`, line, kind: 'resolve', baseIRI, relativeIri, expected });
        } catch (e) {
          if (!(e instanceof Unevaluable)) throw e;
          cases.push({ id, path, name: '(itShouldResolve)', line, kind: 'unextracted', helper: 'itShouldResolve', reason: e.message });
        }
        return;
      }
    }
    const isLoop = ['ForStatement', 'ForOfStatement', 'ForInStatement', 'WhileStatement'].includes(node.type) ||
      (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && ['forEach', 'map'].includes(node.callee.property && node.callee.property.name));
    if (node.type === 'FunctionDeclaration' && path.length === 0) return; // top-level helpers
    for (const key of Object.keys(node)) {
      if (key === 'loc') continue;
      const v = node[key];
      if (Array.isArray(v)) v.forEach((c) => walkNode(c, path, env, dynamic || isLoop));
      else if (v && typeof v.type === 'string') walkNode(v, path, env, dynamic || isLoop);
    }
  }

  walkStatements(ast.body, [], top, false);
  return cases;
}

const MIT = `The MIT License (MIT)
// Copyright ©2012–present N3.js contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.`;

const header = (file) => `// Derived from N3.js test/${file} at commit ${commit}
// (https://github.com/rdfjs/N3.js), licensed as follows:
//
// ${MIT}
//
// What changed: the test inputs and expectations were extracted as data by
// tools/enthie-study/extract.mjs (generated file; do not edit by hand). The
// test logic is re-implemented in the node:test runners beside this file.
`;

mkdirSync(outDir, { recursive: true });
const summary = {};
for (const [file, out] of [['N3Parser-test.js', 'parser-cases.mjs'], ['N3Writer-test.js', 'writer-cases.mjs']]) {
  const cases = extract(file);
  const byKind = {};
  for (const c of cases) byKind[c.kind] = (byKind[c.kind] || 0) + 1;
  summary[file] = { total: cases.length, byKind };
  writeFileSync(join(outDir, out),
    `${header(file)}\nexport const commit = ${JSON.stringify(commit)};\nexport const cases = ${JSON.stringify(cases, null, 1)};\n`);
}
console.log(JSON.stringify({ commit, summary }, null, 2));
