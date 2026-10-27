// Derived from N3.js (https://github.com/rdfjs/N3.js) at commit
// ce8f71be6af502a7a16193f7fb0fe9ad239f6d8d: termFromId (src/N3DataFactory.js)
// and mapToQuad (test/N3Parser-test.js). Licensed as follows:
//
// The MIT License (MIT)
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
// IN THE SOFTWARE.
//
// What changed: termFromId always builds terms with the given RDF/JS factory
// (N3.js has an internal-literal shortcut); it reads the N3.js test id
// notation only, as a test oracle. mapToQuad also reads the {term} objects
// the extractor (tools/echo03-study/extract.mjs) writes for terms a test
// built with a constructor. Test-side only: the echo does not use this file.

/** An RDF/JS term from an N3.js term id (the notation of N3.js's tests). */
export function termFromId(id, factory) {
  if (!id) return factory.defaultGraph();
  if (Array.isArray(id)) {
    return factory.quad(termFromId(id[0], factory), termFromId(id[1], factory),
      termFromId(id[2], factory), id[3] ? termFromId(id[3], factory) : undefined);
  }
  switch (id[0]) {
    case '?': return factory.variable(id.substr(1));
    case '_': return factory.blankNode(id.substr(2));
    case '"': {
      if (id[id.length - 1] === '"') return factory.literal(id.substr(1, id.length - 2));
      const endPos = id.lastIndexOf('"', id.length - 1);
      let languageOrDatatype;
      if (id[endPos + 1] === '@') {
        languageOrDatatype = id.substr(endPos + 2);
        const dd = languageOrDatatype.lastIndexOf('--');
        if (dd > 0 && dd < languageOrDatatype.length) {
          languageOrDatatype = { language: languageOrDatatype.substr(0, dd), direction: languageOrDatatype.substr(dd + 2) };
        }
      } else {
        languageOrDatatype = factory.namedNode(id.substr(endPos + 3));
      }
      return factory.literal(id.substr(1, endPos - 1), languageOrDatatype);
    }
    case '[':
      return termFromId(JSON.parse(id), factory);
    case '<':
      if (id === '<>') return factory.namedNode('');
      // falls through
    default:
      return factory.namedNode(id);
  }
}

// A term the extractor wrote as {term: {...}}.
function termFromData(t, factory, baseIRI) {
  switch (t.termType) {
    case 'NamedNode': return factory.namedNode(t.value);
    case 'BlankNode': return factory.blankNode(t.value);
    case 'Id': case 'LiteralId': return termFromId(t.value, factory);
    case 'Literal': {
      const l = t.languageOrDatatype;
      return factory.literal(t.value, l && l.term ? termFromData(l.term, factory) : (l === null ? undefined : l));
    }
    case 'Quad':
      return factory.quad(...['subject', 'predicate', 'object', 'graph'].map((k) => itemTerm(t[k], factory, baseIRI)));
    default: throw new Error(`termFromData: ${t.termType}`);
  }
}

function itemTerm(t, factory, baseIRI) {
  if (t === null || t === undefined) return factory.defaultGraph();
  if (typeof t === 'object' && t.term) return termFromData(t.term, factory, baseIRI);
  if (Array.isArray(t)) return mapToQuad(t, factory, baseIRI);
  // N3.js mapToQuad: "Append base to relative IRIs".
  if (!/^$|^["?]|:/.test(t)) t = baseIRI + t;
  return termFromId(t, factory);
}

/** N3.js test/N3Parser-test.js mapToQuad, over an RDF/JS factory. */
export function mapToQuad(item, factory, baseIRI) {
  const t = item.map((x) => itemTerm(x, factory, baseIRI));
  return factory.quad(t[0], t[1], t[2], t[3] && t[3].termType ? t[3] : undefined);
}
