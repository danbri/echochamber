// Derived from N3.js test/N3Writer-test.js at commit ce8f71be6af502a7a16193f7fb0fe9ad239f6d8d
// (https://github.com/rdfjs/N3.js), licensed as follows:
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
// What changed: the test inputs and expectations were extracted as data by
// tools/echo03-study/extract.mjs (generated file; do not edit by hand). The
// test logic is re-implemented in the node:test runners beside this file.

export const commit = "ce8f71be6af502a7a16193f7fb0fe9ad239f6d8d";
export const cases = [
 {
  "id": "N3Writer-test.js#1",
  "path": [
   "Writer",
   "The Writer export"
  ],
  "name": "should be a function",
  "line": 23,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#2",
  "path": [
   "Writer",
   "The Writer export"
  ],
  "name": "should be a Writer constructor",
  "line": 27,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#3",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a single triple",
  "line": 33,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#4",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a single quad",
  "line": 40,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#5",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a quad with an empty named node as graph",
  "line": 47,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#6",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with empty named nodes",
  "line": 54,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#7",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an array of triples",
  "line": 61,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#8",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a blank node from another library through its term type",
  "line": 68,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#9",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a variable from another library through its term type",
  "line": 76,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#10",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize 0 triples",
  "line": 84,
  "kind": "serialize",
  "quads": [],
  "expected": ""
 },
 {
  "id": "N3Writer-test.js#11",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize 1 triple",
  "line": 86,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi"
   ]
  ],
  "expected": "<abc> <def> <ghi>.\n"
 },
 {
  "id": "N3Writer-test.js#12",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize 2 triples",
  "line": 89,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi"
   ],
   [
    "jkl",
    "mno",
    "pqr"
   ]
  ],
  "expected": "<abc> <def> <ghi>.\n<jkl> <mno> <pqr>.\n"
 },
 {
  "id": "N3Writer-test.js#13",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize 3 triples",
  "line": 94,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi"
   ],
   [
    "jkl",
    "mno",
    "pqr"
   ],
   [
    "stu",
    "vwx",
    "yz"
   ]
  ],
  "expected": "<abc> <def> <ghi>.\n<jkl> <mno> <pqr>.\n<stu> <vwx> <yz>.\n"
 },
 {
  "id": "N3Writer-test.js#14",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal",
  "line": 101,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"cde\""
   ]
  ],
  "expected": "<a> <b> \"cde\".\n"
 },
 {
  "id": "N3Writer-test.js#15",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal with a type",
  "line": 104,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"cde\"^^fgh"
   ]
  ],
  "expected": "<a> <b> \"cde\"^^<fgh>.\n"
 },
 {
  "id": "N3Writer-test.js#16",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal with a language",
  "line": 110,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"cde\"@en-us"
   ]
  ],
  "expected": "<a> <b> \"cde\"@en-us.\n"
 },
 {
  "id": "N3Writer-test.js#17",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal with a language and direction",
  "line": 116,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"cde\"@en-us--ltr"
   ]
  ],
  "expected": "<a> <b> \"cde\"@en-us--ltr.\n"
 },
 {
  "id": "N3Writer-test.js#18",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing \"--\" with a language",
  "line": 122,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"bla bla -- more bla bla\"@en"
   ]
  ],
  "expected": "<a> <b> \"bla bla -- more bla bla\"@en.\n"
 },
 {
  "id": "N3Writer-test.js#19",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal with an artificial language",
  "line": 129,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"cde\"@qqq-002"
   ]
  ],
  "expected": "<a> <b> \"cde\"@qqq-002.\n"
 },
 {
  "id": "N3Writer-test.js#20",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a single quote",
  "line": 135,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c'de\""
   ]
  ],
  "expected": "<a> <b> \"c'de\".\n"
 },
 {
  "id": "N3Writer-test.js#21",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a double quote",
  "line": 141,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\"de\""
   ]
  ],
  "expected": "<a> <b> \"c\\\"de\".\n"
 },
 {
  "id": "N3Writer-test.js#22",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a backspace",
  "line": 147,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\\de\""
   ]
  ],
  "expected": "<a> <b> \"c\\\\de\".\n"
 },
 {
  "id": "N3Writer-test.js#23",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a tab character",
  "line": 153,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\tde\""
   ]
  ],
  "expected": "<a> <b> \"c\\tde\".\n"
 },
 {
  "id": "N3Writer-test.js#24",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a newline character",
  "line": 159,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\nde\""
   ]
  ],
  "expected": "<a> <b> \"c\\nde\".\n"
 },
 {
  "id": "N3Writer-test.js#25",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a cariage return character",
  "line": 165,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\rde\""
   ]
  ],
  "expected": "<a> <b> \"c\\rde\".\n"
 },
 {
  "id": "N3Writer-test.js#26",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a backspace character",
  "line": 171,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\bde\""
   ]
  ],
  "expected": "<a> <b> \"c\\bde\".\n"
 },
 {
  "id": "N3Writer-test.js#27",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a form feed character",
  "line": 177,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\fde\""
   ]
  ],
  "expected": "<a> <b> \"c\\fde\".\n"
 },
 {
  "id": "N3Writer-test.js#28",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a line separator",
  "line": 183,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c de\""
   ]
  ],
  "expected": "<a> <b> \"c de\".\n"
 },
 {
  "id": "N3Writer-test.js#29",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing a paragraph separator",
  "line": 189,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c de\""
   ]
  ],
  "expected": "<a> <b> \"c de\".\n"
 },
 {
  "id": "N3Writer-test.js#30",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a literal containing special unicode characters",
  "line": 195,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"c\u0000\u0001\""
   ]
  ],
  "expected": "<a> <b> \"c\\u0000\\u0001\".\n"
 },
 {
  "id": "N3Writer-test.js#31",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a true boolean literal",
  "line": 201,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ],
  "expected": "<a> <b> true.\n"
 },
 {
  "id": "N3Writer-test.js#32",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a false boolean literal",
  "line": 207,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"false\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ],
  "expected": "<a> <b> false.\n"
 },
 {
  "id": "N3Writer-test.js#33",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an invalid boolean literal",
  "line": 213,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"invalid\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ],
  "expected": "<a> <b> \"invalid\"^^<http://www.w3.org/2001/XMLSchema#boolean>.\n"
 },
 {
  "id": "N3Writer-test.js#34",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an integer literal",
  "line": 219,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"123\"^^http://www.w3.org/2001/XMLSchema#integer"
   ]
  ],
  "expected": "<a> <b> 123.\n"
 },
 {
  "id": "N3Writer-test.js#35",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a positive integer literal",
  "line": 225,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"+123\"^^http://www.w3.org/2001/XMLSchema#integer"
   ]
  ],
  "expected": "<a> <b> +123.\n"
 },
 {
  "id": "N3Writer-test.js#36",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a negative integer literal",
  "line": 231,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"-123\"^^http://www.w3.org/2001/XMLSchema#integer"
   ]
  ],
  "expected": "<a> <b> -123.\n"
 },
 {
  "id": "N3Writer-test.js#37",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an invalid integer literal",
  "line": 237,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"invalid\"^^http://www.w3.org/2001/XMLSchema#integer"
   ]
  ],
  "expected": "<a> <b> \"invalid\"^^<http://www.w3.org/2001/XMLSchema#integer>.\n"
 },
 {
  "id": "N3Writer-test.js#38",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a decimal literal",
  "line": 243,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"123.456\"^^http://www.w3.org/2001/XMLSchema#decimal"
   ]
  ],
  "expected": "<a> <b> 123.456.\n"
 },
 {
  "id": "N3Writer-test.js#39",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a positive decimal literal",
  "line": 249,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"+123.456\"^^http://www.w3.org/2001/XMLSchema#decimal"
   ]
  ],
  "expected": "<a> <b> +123.456.\n"
 },
 {
  "id": "N3Writer-test.js#40",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a negative decimal literal",
  "line": 255,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"-123.456\"^^http://www.w3.org/2001/XMLSchema#decimal"
   ]
  ],
  "expected": "<a> <b> -123.456.\n"
 },
 {
  "id": "N3Writer-test.js#41",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an invalid decimal literal",
  "line": 261,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"invalid\"^^http://www.w3.org/2001/XMLSchema#decimal"
   ]
  ],
  "expected": "<a> <b> \"invalid\"^^<http://www.w3.org/2001/XMLSchema#decimal>.\n"
 },
 {
  "id": "N3Writer-test.js#42",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a double literal",
  "line": 267,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"123.456E10\"^^http://www.w3.org/2001/XMLSchema#double"
   ]
  ],
  "expected": "<a> <b> 123.456E10.\n"
 },
 {
  "id": "N3Writer-test.js#43",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a positive double literal",
  "line": 273,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"+123.456E10\"^^http://www.w3.org/2001/XMLSchema#double"
   ]
  ],
  "expected": "<a> <b> +123.456E10.\n"
 },
 {
  "id": "N3Writer-test.js#44",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a negative double literal",
  "line": 279,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"-123.456E10\"^^http://www.w3.org/2001/XMLSchema#double"
   ]
  ],
  "expected": "<a> <b> -123.456E10.\n"
 },
 {
  "id": "N3Writer-test.js#45",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an invalid double literal",
  "line": 285,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "b",
    "\"invalid\"^^http://www.w3.org/2001/XMLSchema#double"
   ]
  ],
  "expected": "<a> <b> \"invalid\"^^<http://www.w3.org/2001/XMLSchema#double>.\n"
 },
 {
  "id": "N3Writer-test.js#46",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize blank nodes",
  "line": 291,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "_:a",
    "b",
    {
     "termType": "BlankNode",
     "value": "c"
    }
   ]
  ],
  "expected": "_:a <b> _:c.\n"
 },
 {
  "id": "N3Writer-test.js#47",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not leave leading whitespace if the prefix set is empty",
  "line": 297,
  "kind": "serialize",
  "prefixes": {},
  "quads": [
   [
    "a",
    "b",
    "c"
   ]
  ],
  "expected": "<a> <b> <c>.\n"
 },
 {
  "id": "N3Writer-test.js#48",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize prefixes",
  "line": 304,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a": "http://a.org/",
    "b": {
     "term": {
      "termType": "NamedNode",
      "value": "http://a.org/b#"
     }
    },
    "c": "http://a.org/c"
   }
  },
  "quads": [],
  "expected": "@prefix a: <http://a.org/>.\n@prefix b: <http://a.org/b#>.\n@prefix c: <http://a.org/c>.\n\n"
 },
 {
  "id": "N3Writer-test.js#49",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should use prefixes when possible",
  "line": 312,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a": "http://a.org/",
    "b": "http://a.org/b#",
    "c": "http://a.org/b"
   }
  },
  "quads": [
   [
    "http://a.org/bc",
    "http://a.org/b#ef",
    "http://a.org/bhi"
   ],
   [
    "http://a.org/bc/de",
    "http://a.org/b#e#f",
    "http://a.org/b#x/t"
   ],
   [
    "http://a.org/3a",
    "http://a.org/b#3a",
    "http://a.org/b#a3"
   ]
  ],
  "expected": "@prefix a: <http://a.org/>.\n@prefix b: <http://a.org/b#>.\n@prefix c: <http://a.org/b>.\n\na:bc b:ef a:bhi.\n<http://a.org/bc/de> <http://a.org/b#e#f> <http://a.org/b#x/t>.\na:3a b:3a b:a3.\n"
 },
 {
  "id": "N3Writer-test.js#50",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should use prefixes for local names with dots",
  "line": 326,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a": "http://a.org/",
    "b": "http://a.org/b#"
   }
  },
  "quads": [
   [
    "http://a.org/v1.0",
    "http://a.org/b#a.b.c",
    "http://a.org/a-1.b-2"
   ],
   [
    "http://a.org/vocab.",
    "http://a.org/b#.a",
    "http://a.org/b#a..b"
   ]
  ],
  "expected": "@prefix a: <http://a.org/>.\n@prefix b: <http://a.org/b#>.\n\na:v1.0 b:a.b.c a:a-1.b-2.\n<http://a.org/vocab.> <http://a.org/b#.a> <http://a.org/b#a..b>.\n"
 },
 {
  "id": "N3Writer-test.js#51",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should round-trip prefixed names with dots through the parser",
  "line": 337,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#52",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should apply a prefix whose IRI contains a regular expression metacharacter",
  "line": 350,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "ex": "http://ex/a[b"
   }
  },
  "quads": [
   [
    "http://ex/a[bs",
    "http://ex/a[bp",
    "http://ex/a[bo"
   ]
  ],
  "expected": "@prefix ex: <http://ex/a[b>.\n\nex:s ex:p ex:o.\n"
 },
 {
  "id": "N3Writer-test.js#53",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should apply prefixes whose IRIs contain regular expression metacharacters",
  "line": 358,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a": "http://a.org/x[y",
    "b": "http://a.org/d{|^}-e"
   }
  },
  "quads": [
   [
    "http://a.org/x[ys",
    "http://a.org/d{|^}-ep",
    "http://a.org/x[yo"
   ]
  ],
  "expected": "@prefix a: <http://a.org/x[y>.\n@prefix b: <http://a.org/d{|^}-e>.\n\na:s b:p a:o.\n"
 },
 {
  "id": "N3Writer-test.js#54",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should only treat IRIs with an exact prefix name as prefixed names",
  "line": 367,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a.b": "http://a.org/"
   }
  },
  "quads": [
   [
    "a.b:s",
    "axb:p",
    "http://a.org/o"
   ]
  ],
  "expected": "@prefix a.b: <http://a.org/>.\n\na.b:s <axb:p> a.b:o.\n"
 },
 {
  "id": "N3Writer-test.js#55",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should expand prefixes when possible",
  "line": 375,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a": "http://a.org/",
    "b": "http://a.org/b#"
   }
  },
  "quads": [
   [
    "a:bc",
    "b:ef",
    "c:bhi"
   ]
  ],
  "expected": "@prefix a: <http://a.org/>.\n@prefix b: <http://a.org/b#>.\n\na:bc b:ef <c:bhi>.\n"
 },
 {
  "id": "N3Writer-test.js#56",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should only expand prefixes when the rest is a valid local name",
  "line": 384,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a": "http://a.org/"
   }
  },
  "quads": [
   [
    "a:bc",
    "a:d#e",
    "a:f?g"
   ],
   [
    "a:",
    "a:h~i",
    "a:j."
   ]
  ],
  "expected": "@prefix a: <http://a.org/>.\n\na:bc <a:d#e> <a:f?g>.\na: <a:h~i> <a:j.>.\n"
 },
 {
  "id": "N3Writer-test.js#57",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should keep IRIs that look like prefixed names with any valid local name as prefixed names",
  "line": 394,
  "kind": "serialize",
  "prefixes": {
   "prefixes": {
    "a": "http://a.org/"
   }
  },
  "quads": [
   [
    "a:é",
    "a:b:c",
    "a:b%20c"
   ],
   [
    "a:b..c",
    "a:-b",
    "a:%2"
   ],
   [
    "a:b·c",
    "a:%41.b",
    "a:b.-"
   ]
  ],
  "expected": "@prefix a: <http://a.org/>.\n\na:é a:b:c a:b%20c.\na:b..c <a:-b> <a:%2>.\na:b·c a:%41.b a:b.-.\n"
 },
 {
  "id": "N3Writer-test.js#58",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not repeat the same subjects",
  "line": 406,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi"
   ],
   [
    "abc",
    "mno",
    "pqr"
   ],
   [
    "stu",
    "vwx",
    "yz"
   ]
  ],
  "expected": "<abc> <def> <ghi>;\n    <mno> <pqr>.\n<stu> <vwx> <yz>.\n"
 },
 {
  "id": "N3Writer-test.js#59",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not repeat the same predicates",
  "line": 416,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi"
   ],
   [
    "abc",
    "def",
    "pqr"
   ],
   [
    "abc",
    "bef",
    "ghi"
   ],
   [
    "abc",
    "bef",
    "pqr"
   ],
   [
    "stu",
    "bef",
    "yz"
   ]
  ],
  "expected": "<abc> <def> <ghi>, <pqr>;\n    <bef> <ghi>, <pqr>.\n<stu> <bef> <yz>.\n"
 },
 {
  "id": "N3Writer-test.js#60",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should write rdf:type as \"a\"",
  "line": 428,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "def"
   ]
  ],
  "expected": "<abc> a <def>.\n"
 },
 {
  "id": "N3Writer-test.js#61",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a graph with 1 triple",
  "line": 434,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi",
    "xyz"
   ]
  ],
  "expected": "<xyz> {\n<abc> <def> <ghi>\n}\n"
 },
 {
  "id": "N3Writer-test.js#62",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a graph with 3 triples",
  "line": 442,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi",
    "xyz"
   ],
   [
    "jkl",
    "mno",
    "pqr",
    "xyz"
   ],
   [
    "stu",
    "vwx",
    "yz",
    "xyz"
   ]
  ],
  "expected": "<xyz> {\n<abc> <def> <ghi>.\n<jkl> <mno> <pqr>.\n<stu> <vwx> <yz>\n}\n"
 },
 {
  "id": "N3Writer-test.js#63",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize three graphs",
  "line": 454,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi",
    "xyz"
   ],
   [
    "jkl",
    "mno",
    "pqr",
    ""
   ],
   [
    "stu",
    "vwx",
    "yz",
    "abc"
   ]
  ],
  "expected": "<xyz> {\n<abc> <def> <ghi>\n}\n<jkl> <mno> <pqr>.\n<abc> {\n<stu> <vwx> <yz>\n}\n"
 },
 {
  "id": "N3Writer-test.js#64",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an empty named node as subject",
  "line": 464,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    "def",
    "ghi"
   ]
  ],
  "expected": "<> <def> <ghi>.\n"
 },
 {
  "id": "N3Writer-test.js#65",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an empty named node as predicate",
  "line": 470,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    "ghi"
   ]
  ],
  "expected": "<abc> <> <ghi>.\n"
 },
 {
  "id": "N3Writer-test.js#66",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an empty named node as object",
  "line": 476,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    }
   ]
  ],
  "expected": "<abc> <def> <>.\n"
 },
 {
  "id": "N3Writer-test.js#67",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize an empty named node as graph",
  "line": 482,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi",
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    }
   ]
  ],
  "expected": "<> {\n<abc> <def> <ghi>\n}\n"
 },
 {
  "id": "N3Writer-test.js#68",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not merge an empty named graph into the default graph",
  "line": 488,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "abc",
    "def",
    "ghi",
    ""
   ],
   [
    "jkl",
    "mno",
    "pqr",
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    }
   ],
   [
    "stu",
    "vwx",
    "yz",
    ""
   ]
  ],
  "expected": "<abc> <def> <ghi>.\n<> {\n<jkl> <mno> <pqr>\n}\n<stu> <vwx> <yz>.\n"
 },
 {
  "id": "N3Writer-test.js#69",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "round-trips a triple with an empty named node",
  "line": 498,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#70",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should output 8-bit unicode characters as escape sequences",
  "line": 509,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "𝐀",
    "𝐀",
    "\"𝐀\"^^𝐀",
    "𝐀"
   ]
  ],
  "expected": "<\\U0001d400> {\n<\\U0001d400> <\\U0001d400> \"\\U0001d400\"^^<\\U0001d400>\n}\n"
 },
 {
  "id": "N3Writer-test.js#71",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should escape control characters in IRIs",
  "line": 515,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a\u0001b",
    "b",
    "c"
   ]
  ],
  "expected": "<a\\u0001b> <b> <c>.\n"
 },
 {
  "id": "N3Writer-test.js#72",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should write canonical escapes in N-Triples",
  "line": 520,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#73",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should write canonical triple terms in N-Quads",
  "line": 528,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#74",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not use escape sequences in blank nodes",
  "line": 535,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "_:𝐀",
    "_:𝐀",
    "_:𝐀",
    "_:𝐀"
   ]
  ],
  "expected": "_:𝐀 {\n_:𝐀 _:𝐀 _:𝐀\n}\n"
 },
 {
  "id": "N3Writer-test.js#75",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "calls the done callback when ending the outputstream errors",
  "line": 541,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#76",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "sends output through end when no stream argument is given",
  "line": 551,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#77",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "respects the prefixes argument when no stream argument is given",
  "line": 560,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#78",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "ignores an empty prefix list",
  "line": 570,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#79",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples of graph with prefix for local names that begin with underscore",
  "line": 578,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#80",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "serializes triples of a graph with a prefix declaration in between",
  "line": 589,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#81",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "uses each prefix added between quads",
  "line": 605,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#82",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not write prefixes in N-Triples mode",
  "line": 617,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#83",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "uses a base IRI when given",
  "line": 630,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#84",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "uses a base IRI to relativize a graph to the empty IRI",
  "line": 640,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#85",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "uses partially match base IRIs",
  "line": 651,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#86",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "does not write a base directive by default",
  "line": 663,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#87",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "writes a base directive with the writeBase option",
  "line": 677,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#88",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "writes a base directive for a partially matching base IRI",
  "line": 688,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#89",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "writes the base directive before the prefixes",
  "line": 701,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#90",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not write a base directive in N-Triples mode",
  "line": 717,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#91",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not write a base directive in N-Quads mode",
  "line": 724,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#92",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "writes a version directive with the version option",
  "line": 731,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#93",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "writes the version directive before the base and the prefixes",
  "line": 738,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#94",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "writes a version directive in N-Triples mode",
  "line": 753,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#95",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "writes a version directive in N-Quads mode",
  "line": 760,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#96",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "accepts a version label with characters outside the Basic Multilingual Plane",
  "line": 774,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#97",
  "path": [
   "Writer",
   "A Writer instance",
   "when subclassed"
  ],
  "name": "closes a pending statement before its own directive",
  "line": 802,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#98",
  "path": [
   "Writer",
   "A Writer instance",
   "when subclassed"
  ],
  "name": "closes an open graph block before its own directive",
  "line": 810,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#99",
  "path": [
   "Writer",
   "A Writer instance",
   "when subclassed"
  ],
  "name": "writes nothing extra for an empty group",
  "line": 822,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#100",
  "path": [
   "Writer",
   "A Writer instance",
   "when subclassed"
  ],
  "name": "writes its own directive in line mode",
  "line": 829,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#101",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should accept triples with separated components",
  "line": 837,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#102",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should accept quads with separated components",
  "line": 845,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#103",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with an empty blank node as object",
  "line": 853,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#104",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with the same blank node as object",
  "line": 862,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#105",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a one-triple blank node as object",
  "line": 872,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#106",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a two-triple blank node as object",
  "line": 886,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#107",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a three-triple blank node as object",
  "line": 902,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#108",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with predicate-sharing blank node triples as object",
  "line": 920,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#109",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with nested blank nodes as object",
  "line": 938,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#110",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with an empty blank node as subject",
  "line": 969,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#111",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a one-triple blank node as subject",
  "line": 978,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#112",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with an empty blank node as graph",
  "line": 992,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#113",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with an empty list as object",
  "line": 1001,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#114",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a one-element list as object",
  "line": 1010,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#115",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a three-element list as object",
  "line": 1019,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#116",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with an empty list as subject",
  "line": 1028,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#117",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a one-element list as subject",
  "line": 1037,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#118",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize triples with a three-element list as subject",
  "line": 1046,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#119",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a blank node in an N3 list with a valid label when formulaScopedBlankNodes is set",
  "line": 1053,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#120",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a blank node in an N3 list with an invalid label by default",
  "line": 1062,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#121",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize subject and object triples passed by options.listHeads",
  "line": 1072,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#122",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should only treat own properties of options.lists as list heads",
  "line": 1089,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#123",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should accept triples in bulk",
  "line": 1098,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#124",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not allow writing after end",
  "line": 1106,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#125",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should write simple triples in N-Quads mode",
  "line": 1117,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#126",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should write simple quads in N-Quads mode",
  "line": 1125,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#127",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should end when the end option is not set",
  "line": 1136,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#128",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should end when the end option is set to true",
  "line": 1143,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#129",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not end when the end option is set to false",
  "line": 1150,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#130",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a triple with mixed component types as subject",
  "line": 1157,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#131",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a triple with iris as subject",
  "line": 1167,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#132",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a triple with blanknodes as subject",
  "line": 1174,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#133",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a triple as object",
  "line": 1184,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#134",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a triple with iris as object",
  "line": 1191,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#135",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a triple with blanknodes as object",
  "line": 1198,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#136",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a quad with a triple with mixed component types as subject",
  "line": 1208,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#137",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a quad with a triple as object",
  "line": 1218,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#138",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a quad with a quad as subject",
  "line": 1225,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#139",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a quad with a quad as object",
  "line": 1232,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#140",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a quad as subject",
  "line": 1239,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#141",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a quad as object",
  "line": 1246,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#142",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a literal as subject",
  "line": 1253,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "\"123\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "b",
    "c"
   ]
  ],
  "expected": "\"123\"^^<http://www.w3.org/2001/XMLSchema#boolean> <b> <c>.\n"
 },
 {
  "id": "N3Writer-test.js#143",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a literal as predicate",
  "line": 1256,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "a",
    "\"123\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "c"
   ]
  ],
  "expected": "<a> \"123\"^^<http://www.w3.org/2001/XMLSchema#boolean> <c>.\n"
 },
 {
  "id": "N3Writer-test.js#144",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a language-tagged literal as subject",
  "line": 1259,
  "kind": "serialize",
  "prefixes": null,
  "quads": [
   [
    "\"hello\"@en-us",
    "b",
    "c"
   ]
  ],
  "expected": "\"hello\"@en-us <b> <c>.\n"
 },
 {
  "id": "N3Writer-test.js#145",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a literal as subject in N3 mode",
  "line": 1262,
  "kind": "serialize",
  "prefixes": {
   "format": "text/n3"
  },
  "quads": [
   [
    "\"123\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "b",
    "c"
   ]
  ],
  "expected": "\"123\"^^<http://www.w3.org/2001/XMLSchema#boolean> <b> <c>.\n"
 },
 {
  "id": "N3Writer-test.js#146",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a literal as subject via quadToString",
  "line": 1267,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#147",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should serialize a triple with a literal as predicate via quadToString",
  "line": 1274,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#148",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should round-trip a triple with a literal as subject in N3 mode",
  "line": 1281,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#149",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should escape a literal subject in N3 mode",
  "line": 1290,
  "kind": "serialize",
  "prefixes": {
   "format": "text/n3"
  },
  "quads": [
   [
    "\"a\"b\"",
    "b",
    "c"
   ]
  ],
  "expected": "\"a\\\"b\" <b> <c>.\n"
 },
 {
  "id": "N3Writer-test.js#150",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should not abbreviate a literal predicate whose value is rdf:type",
  "line": 1295,
  "kind": "serialize",
  "prefixes": {
   "format": "text/n3"
  },
  "quads": [
   [
    "a",
    "\"http://www.w3.org/1999/02/22-rdf-syntax-ns#type\"",
    "c"
   ]
  ],
  "expected": "<a> \"http://www.w3.org/1999/02/22-rdf-syntax-ns#type\" <c>.\n"
 },
 {
  "id": "N3Writer-test.js#151",
  "path": [
   "Writer",
   "A Writer instance"
  ],
  "name": "should round-trip literal subjects and predicates in N3 mode",
  "line": 1300,
  "kind": "code"
 },
 {
  "id": "N3Writer-test.js#152",
  "path": [
   "Writer",
   "A Writer instance",
   "(dynamic name)"
  ],
  "name": "(dynamic name)",
  "line": 5983,
  "kind": "code-dynamic"
 }
];
