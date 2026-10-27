// Derived from N3.js test/N3Parser-test.js at commit ce8f71be6af502a7a16193f7fb0fe9ad239f6d8d
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
  "id": "N3Parser-test.js#1",
  "path": [
   "Parser",
   "The Parser export"
  ],
  "name": "should be a function",
  "line": 18,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#2",
  "path": [
   "Parser",
   "The Parser export"
  ],
  "name": "should be a Parser constructor",
  "line": 22,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#3",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse the empty string",
  "line": 28,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#4",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a whitespace string",
  "line": 31,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": " \t \n  ",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#5",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a single triple",
  "line": 34,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#6",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse three triples",
  "line": 37,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>.\n<d> <e> <f>.\n<g> <h> <i>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "d",
    "e",
    "f"
   ],
   [
    "g",
    "h",
    "i"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#7",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse three triples with comments if no comment callback is set",
  "line": 45,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> #comment2\n <c> . \n<d> <e> <f>.\n<g> <h> <i>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "d",
    "e",
    "f"
   ],
   [
    "g",
    "h",
    "i"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#8",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse three triples with comments when comment callback is set",
  "line": 53,
  "kind": "parse-comments",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> #comment2\n <c> . \n<d> <e> <f>.\n<g> <h> <i>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "d",
    "e",
    "f"
   ],
   [
    "g",
    "h",
    "i"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#9",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should callback comments when a comment callback is set",
  "line": 61,
  "kind": "comments",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "#comment1\n<a> <b> #comment2\n <c> . \n<d> <e> <f>.\n<g> <h> <i>.",
  "expected": [
   "comment1",
   "comment2"
  ]
 },
 {
  "id": "N3Parser-test.js#10",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a literal",
  "line": 67,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"string\".",
  "expected": [
   [
    "a",
    "b",
    "\"string\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#11",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a triple with a literal containing a prefixed-name escape sequence",
  "line": 70,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"stri\\.ng\".",
  "expectedError": "Unexpected \"\"stri\\.ng\".\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#12",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a prefixed name containing escape sequences",
  "line": 76,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix x: <urn:x:y#>. x:a\\.b <b> \"string\".",
  "expected": [
   [
    "urn:x:y#a.b",
    "b",
    "\"string\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#13",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a numeric literal",
  "line": 82,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> 3.0.",
  "expected": [
   [
    "a",
    "b",
    "\"3.0\"^^http://www.w3.org/2001/XMLSchema#decimal"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#14",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with an integer literal",
  "line": 88,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> 3.",
  "expected": [
   [
    "a",
    "b",
    "\"3\"^^http://www.w3.org/2001/XMLSchema#integer"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#15",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a floating point literal",
  "line": 91,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> 1.3e2.",
  "expected": [
   [
    "a",
    "b",
    "\"1.3e2\"^^http://www.w3.org/2001/XMLSchema#double"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#16",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a boolean literal",
  "line": 97,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> true.",
  "expected": [
   [
    "a",
    "b",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#17",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a literal and a language code",
  "line": 103,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"string\"@en.",
  "expected": [
   [
    "a",
    "b",
    "\"string\"@en"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#18",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should normalize language codes to lowercase",
  "line": 109,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"string\"@EN.",
  "expected": [
   [
    "a",
    "b",
    "\"string\"@en"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#19",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a literal with directional language code",
  "line": 115,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"string\"@en--rtl.",
  "expected": [
   [
    "a",
    "b",
    "\"string\"@en--rtl"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#20",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not leak direction state between language-tagged literals",
  "line": 121,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"x\"@en--rtl, \"y\"@fr, \"z\"@de--ltr.\n<c> <d> \"w\"@nl.",
  "expected": [
   [
    "a",
    "b",
    "\"x\"@en--rtl"
   ],
   [
    "a",
    "b",
    "\"y\"@fr"
   ],
   [
    "a",
    "b",
    "\"z\"@de--ltr"
   ],
   [
    "c",
    "d",
    "\"w\"@nl"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#21",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error on a triple with a literal with direction but without language code",
  "line": 130,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"string\"--rtl.",
  "expectedError": "Unexpected \"--rtl.\" on line 1.",
  "expectedContext": {
   "line": 1,
   "previousToken": {
    "line": 1,
    "type": "literal",
    "value": "string",
    "prefix": "",
    "start": 8,
    "end": 16
   }
  }
 },
 {
  "id": "N3Parser-test.js#22",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error on a triple with a literal with langstring datatype and no language tag",
  "line": 146,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"Hello\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#langString>.",
  "expectedError": "Detected illegal (directional) languaged-tagged string with explicit datatype on line 1.",
  "expectedContext": {
   "line": 1,
   "previousToken": {
    "line": 1,
    "type": "literal",
    "value": "Hello",
    "prefix": "",
    "start": 8,
    "end": 15
   },
   "token": {
    "end": 72,
    "line": 1,
    "prefix": "",
    "start": 17,
    "type": "typeIRI",
    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
   }
  }
 },
 {
  "id": "N3Parser-test.js#23",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error on a triple with a literal with dirlangstring datatype and no language tag",
  "line": 170,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"Hello\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString>.",
  "expectedError": "Detected illegal (directional) languaged-tagged string with explicit datatype on line 1.",
  "expectedContext": {
   "line": 1,
   "previousToken": {
    "line": 1,
    "type": "literal",
    "value": "Hello",
    "prefix": "",
    "start": 8,
    "end": 15
   },
   "token": {
    "end": 75,
    "line": 1,
    "prefix": "",
    "start": 17,
    "type": "typeIRI",
    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString"
   }
  }
 },
 {
  "id": "N3Parser-test.js#24",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error on a triple where a literal has a language subtag longer than 8 characters (single subtag)",
  "line": 201,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"Hello\"@cantbethislong.",
  "expectedError": "Detected language tag with subtag longer than 8 characters on line 1.",
  "expectedContext": {
   "line": 1,
   "previousToken": {
    "line": 1,
    "type": "literal",
    "value": "Hello",
    "prefix": "",
    "start": 8,
    "end": 15
   },
   "token": {
    "end": 30,
    "line": 1,
    "prefix": "",
    "start": 15,
    "type": "langcode",
    "value": "cantbethislong"
   }
  }
 },
 {
  "id": "N3Parser-test.js#25",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a literal and an IRI type",
  "line": 225,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"string\"^^<type>.",
  "expected": [
   [
    "a",
    "b",
    "\"string\"^^http://example.org/type"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#26",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with a literal and a prefixed name type",
  "line": 231,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix x: <urn:x:y#>. <a> <b> \"string\"^^x:z.",
  "expected": [
   [
    "a",
    "b",
    "\"string\"^^urn:x:y#z"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#27",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should differentiate between IRI and prefixed name types",
  "line": 237,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix : <noturn:>. :a :b \"x\"^^<urn:foo>. :a :b \"x\"^^:urn:foo.",
  "expected": [
   [
    "noturn:a",
    "noturn:b",
    "\"x\"^^urn:foo"
   ],
   [
    "noturn:a",
    "noturn:b",
    "\"x\"^^noturn:urn:foo"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#28",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a triple with a literal and a prefixed name type with an inexistent prefix",
  "line": 244,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"string\"^^x:z.",
  "expectedError": "Undefined prefix \"x:\" on line 1.",
  "expectedContext": {
   "token": {
    "line": 1,
    "type": "type",
    "value": "z",
    "prefix": "x",
    "start": 18,
    "end": 21
   },
   "line": 1,
   "previousToken": {
    "line": 1,
    "type": "literal",
    "value": "string",
    "prefix": "",
    "start": 8,
    "end": 16
   }
  }
 },
 {
  "id": "N3Parser-test.js#29",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple with the \"a\" shorthand predicate",
  "line": 268,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> a <t>.",
  "expected": [
   [
    "a",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "t"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#30",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse triples with prefixes",
  "line": 274,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix : <#>.\n@prefix a: <a#>.\n:x a:a a:b.",
  "expected": [
   [
    "#x",
    "a#a",
    "a#b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#31",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse triples with the prefix \"prefix\"",
  "line": 279,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix prefix: <http://prefix.cc/>.prefix:a prefix:b prefix:c.",
  "expected": [
   [
    "http://prefix.cc/a",
    "http://prefix.cc/b",
    "http://prefix.cc/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#32",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse triples with the prefix \"base\"",
  "line": 286,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "PREFIX base: <http://prefix.cc/>base:a base:b base:c.",
  "expected": [
   [
    "http://prefix.cc/a",
    "http://prefix.cc/b",
    "http://prefix.cc/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#33",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse triples with the prefix \"graph\"",
  "line": 293,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "PREFIX graph: <http://prefix.cc/>graph:a graph:b graph:c.",
  "expected": [
   [
    "http://prefix.cc/a",
    "http://prefix.cc/b",
    "http://prefix.cc/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#34",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse @PREFIX",
  "line": 300,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@PREFIX : <#>.",
  "expectedError": "Expected entity but got @PREFIX on line 1.",
  "expectedContext": {
   "token": {
    "line": 1,
    "type": "@PREFIX",
    "value": "",
    "prefix": "",
    "start": 0,
    "end": 7
   },
   "line": 1
  }
 },
 {
  "id": "N3Parser-test.js#35",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse triples with prefixes and different punctuation",
  "line": 314,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix : <#>.\n@prefix a: <a#>.\n:x a:a a:b;a:c a:d,a:e.",
  "expected": [
   [
    "#x",
    "a#a",
    "a#b"
   ],
   [
    "#x",
    "a#c",
    "a#d"
   ],
   [
    "#x",
    "a#c",
    "a#e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#36",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse undefined empty prefix in subject",
  "line": 324,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": ":a ",
  "expectedError": "Undefined prefix \":\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#37",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse undefined prefix in subject",
  "line": 330,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "a:a ",
  "expectedError": "Undefined prefix \"a:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#38",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse undefined prefix in predicate",
  "line": 333,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> b:c ",
  "expectedError": "Undefined prefix \"b:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#39",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse undefined prefix in object",
  "line": 339,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> c:d ",
  "expectedError": "Undefined prefix \"c:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#40",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse undefined prefix in datatype",
  "line": 345,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"c\"^^d:e ",
  "expectedError": "Undefined prefix \"d:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#41",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse undefined prefix in datatype with comments enabled",
  "line": 351,
  "kind": "not-parse-comments",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "#comment\n<a> <b> \"c\"^^d:e ",
  "expectedError": "Undefined prefix \"d:\" on line 2.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#42",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse triples with SPARQL prefixes",
  "line": 357,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "PREFIX : <#>\nPrEfIX a: <a#> :x a:a a:b.",
  "expected": [
   [
    "#x",
    "a#a",
    "a#b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#43",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse prefix declarations without prefix",
  "line": 365,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix <a> ",
  "expectedError": "Expected prefix to follow @prefix on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#44",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse prefix declarations without IRI",
  "line": 371,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix : .",
  "expectedError": "Expected IRI to follow prefix \":\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#45",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse prefix declarations without a dot",
  "line": 377,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix : <a> ;",
  "expectedError": "Expected declaration to end with a dot on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#46",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with shared subjects",
  "line": 383,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>;\n<d> <e>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "a",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#47",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with shared subjects and trailing semicolon",
  "line": 390,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>;\n<d> <e>;\n.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "a",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#48",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with shared subjects and multiple semicolons",
  "line": 397,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>;;\n<d> <e>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "a",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#49",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with shared subjects and predicates",
  "line": 404,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>, <d>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "a",
    "b",
    "d"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#50",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not accept ; without preceding predicate",
  "line": 411,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>. <x>; <y> <z>.",
  "expectedError": "Expected predicate but got ; on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#51",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not accept , without preceding object",
  "line": 417,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>. <x> <y>, <z>.",
  "expectedError": "Expected entity but got , on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#52",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse diamonds",
  "line": 423,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<> <> <> <>.\n(<>) <> (<>) <>.",
  "expected": [
   [
    "http://example.org/",
    "http://example.org/",
    "http://example.org/",
    "http://example.org/"
   ],
   [
    "_:b0",
    "http://example.org/",
    "_:b1",
    "http://example.org/"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://example.org/"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://example.org/"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#53",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with named blank nodes",
  "line": 431,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "_:a <b> _:c.",
  "expected": [
   [
    "_:b0_a",
    "b",
    "_:b0_c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#54",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse statements with a blank node as predicate",
  "line": 437,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "PREFIX : <#>\n<a> [] <c>.",
  "expectedError": "Disallowed blank node as predicate on line 2.",
  "expectedContext": {
   "token": {
    "line": 2,
    "type": "[",
    "value": "",
    "prefix": "",
    "start": 4,
    "end": 5
   },
   "line": 2,
   "previousToken": {
    "line": 2,
    "type": "IRI",
    "value": "a",
    "prefix": "",
    "start": 0,
    "end": 3
   }
  }
 },
 {
  "id": "N3Parser-test.js#55",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse statements with a blank node label as predicate",
  "line": 461,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "PREFIX : <#>\n<a> _:b <c>.",
  "expectedError": "Disallowed blank node as predicate on line 2.",
  "expectedContext": {
   "token": {
    "line": 2,
    "type": "blank",
    "value": "b",
    "prefix": "_",
    "start": 4,
    "end": 7
   },
   "line": 2,
   "previousToken": {
    "line": 2,
    "type": "IRI",
    "value": "a",
    "prefix": "",
    "start": 0,
    "end": 3
   }
  }
 },
 {
  "id": "N3Parser-test.js#56",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with empty blank nodes",
  "line": 485,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[] <b> [].",
  "expected": [
   [
    "_:b0",
    "b",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#57",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with unnamed blank nodes in the subject",
  "line": 491,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[<a> <b>] <c> <d>.",
  "expected": [
   [
    "_:b0",
    "c",
    "d"
   ],
   [
    "_:b0",
    "a",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#58",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with unnamed blank nodes in the object",
  "line": 498,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [<c> <d>].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "c",
    "d"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#59",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with unnamed blank nodes with a string object",
  "line": 505,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [<c> \"x\"].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "c",
    "\"x\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#60",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a blank node with missing subject",
  "line": 512,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [<c>].",
  "expectedError": "Expected entity but got ] on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#61",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a blank node with only a semicolon",
  "line": 518,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [;].",
  "expectedError": "Expected predicate but got ; on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#62",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a dangling blank node closing brace",
  "line": 524,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a:a> <b:b> <c:c> ; ]",
  "expectedError": "Unexpected ] on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#63",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a blank node with a trailing semicolon",
  "line": 530,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>; ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#64",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a blank node with multiple trailing semicolons",
  "line": 537,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>;;; ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#65",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a multi-predicate blank node",
  "line": 544,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>; <w> <z> ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ],
   [
    "_:b0",
    "w",
    "z"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#66",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a multi-predicate blank node with multiple semicolons",
  "line": 552,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>;;; <w> <z> ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ],
   [
    "_:b0",
    "w",
    "z"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#67",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a multi-object blank node",
  "line": 560,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>, <z> ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ],
   [
    "_:b0",
    "u",
    "z"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#68",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a multi-statement blank node ending with a literal",
  "line": 568,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>; <w> \"z\" ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ],
   [
    "_:b0",
    "w",
    "\"z\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#69",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a multi-statement blank node ending with a typed literal",
  "line": 576,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>; <w> \"z\"^^<t> ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ],
   [
    "_:b0",
    "w",
    "\"z\"^^http://example.org/t"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#70",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a multi-statement blank node ending with a string with language",
  "line": 584,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>; <w> \"z\"^^<t> ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ],
   [
    "_:b0",
    "w",
    "\"z\"^^http://example.org/t"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#71",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a multi-statement blank node with trailing semicolon",
  "line": 592,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [ <u> <v>; <w> <z>; ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "u",
    "v"
   ],
   [
    "_:b0",
    "w",
    "z"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#72",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with nested blank nodes in the subject",
  "line": 600,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[<a> [<x> <y>]] <c> <d>.",
  "expected": [
   [
    "_:b0",
    "c",
    "d"
   ],
   [
    "_:b0",
    "a",
    "_:b1"
   ],
   [
    "_:b1",
    "x",
    "y"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#73",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with nested blank nodes in the object",
  "line": 608,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [<c> [<d> <e>]].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "c",
    "_:b1"
   ],
   [
    "_:b1",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#74",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should reuse identifiers of blank nodes within and outside of graphs",
  "line": 616,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "_:a <b> _:c. <g> { _:a <b> _:c }",
  "expected": [
   [
    "_:b0_a",
    "b",
    "_:b0_c"
   ],
   [
    "_:b0_a",
    "b",
    "_:b0_c",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#75",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an invalid blank node",
  "line": 623,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[ <a> <b> .",
  "expectedError": "Expected punctuation to follow \"http://example.org/b\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#76",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a statements with only an anonymous node",
  "line": 626,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[<p> <o>].",
  "expected": [
   [
    "_:b0",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#77",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a statement with only a blank anonymous node",
  "line": 632,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[].",
  "expectedError": "Unexpected . on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#78",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an anonymous node with only an anonymous node inside",
  "line": 638,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[[<p> <o>]].",
  "expectedError": "Disallowed blank node as predicate on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#79",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with an empty list in the subject",
  "line": 644,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "() <a> <b>.",
  "expected": [
   [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "a",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#80",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with an empty list in the object",
  "line": 650,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> ().",
  "expected": [
   [
    "a",
    "b",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#81",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a single-element list in the subject",
  "line": 656,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "(<x>) <a> <b>.",
  "expected": [
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#82",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a single-element list in the object",
  "line": 664,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (<x>).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#83",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse statements with a list in the predicate",
  "line": 672,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> (<b>) <c>.",
  "expectedError": "Expected entity but got ( on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#84",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a list with a literal",
  "line": 678,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (\"x\").",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"x\""
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#85",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a list with a typed literal",
  "line": 683,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (\"x\"^^<y>).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"x\"^^http://example.org/y"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#86",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a list with a language-tagged literal",
  "line": 691,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (\"x\"@en-GB).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"x\"@en-gb"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#87",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a list with a directional language-tagged literal",
  "line": 699,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (\"x\"@en-GB--ltr).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"x\"@en-gb--ltr"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#88",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a multi-element list in the subject",
  "line": 707,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "(<x> <y>) <a> <b>.",
  "expected": [
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#89",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a multi-element list in the object",
  "line": 717,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (<x> <y>).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#90",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a multi-element literal list in the object",
  "line": 727,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (\"x\" \"y\"@en-GB 1 \"z\"^^<t>).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"x\""
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"y\"@en-gb"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"1\"^^http://www.w3.org/2001/XMLSchema#integer"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"z\"^^http://example.org/t"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#91",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with prefixed names in lists",
  "line": 741,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix a: <a#>. <a> <b> (a:x a:y).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a#x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a#y"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#92",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse statements with undefined prefixes in lists",
  "line": 751,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (a:x a:y).",
  "expectedError": "Undefined prefix \"a:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#93",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with blank nodes in lists",
  "line": 757,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (_:x _:y).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b0_x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b0_y"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#94",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a nested empty list",
  "line": 767,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (<x> ()).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#95",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with non-empty nested lists",
  "line": 777,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (<x> (<y>)).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#96",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a list containing a blank node",
  "line": 789,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "([]) <a> <b>.",
  "expected": [
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#97",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a list containing multiple blank nodes",
  "line": 797,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "([] [<x> <y>]) <a> <b>.",
  "expected": [
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b3",
    "x",
    "y"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#98",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a blank node containing a list",
  "line": 808,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[<a> (<b>)] <c> <d>.",
  "expected": [
   [
    "_:b0",
    "c",
    "d"
   ],
   [
    "_:b0",
    "a",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "b"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#99",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a subject list containing reified triples",
  "line": 817,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "(<< <a1> <b1> <c1> >> << <a2> <b2> <c2> >>) <a> <b>.",
  "expected": [
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a1",
     "b1",
     "c1"
    ]
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a2",
     "b2",
     "c2"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#100",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with an object list containing reified triples",
  "line": 829,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (<< <a1> <b1> <c1> >> << <a2> <b2> <c2> >>).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a1",
     "b1",
     "c1"
    ]
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a2",
     "b2",
     "c2"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#101",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a subject list containing a triple term",
  "line": 841,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "(<<(<a1> <b1> <c1>)>>) <a> <b>.",
  "expected": [
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    [
     "a1",
     "b1",
     "c1"
    ]
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#102",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with an object list containing a triple term",
  "line": 849,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (<<(<a1> <b1> <c1>)>>).",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    [
     "a1",
     "b1",
     "c1"
    ]
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#103",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an invalid list",
  "line": 857,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (]).",
  "expectedError": "Expected entity but got ] on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#104",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should resolve IRIs against @base",
  "line": 860,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/>.\n<a> <b> <c>.\n@base <d/>.\n<e> <f> <g>.",
  "expected": [
   [
    "http://ex.org/a",
    "http://ex.org/b",
    "http://ex.org/c"
   ],
   [
    "http://ex.org/d/e",
    "http://ex.org/d/f",
    "http://ex.org/d/g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#105",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should remove dot segments from the base path or the relative IRI",
  "line": 870,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/a/./b/../c/>.\n<d> <./e> <../f>.",
  "expected": [
   [
    "http://ex.org/a/c/d",
    "http://ex.org/a/c/e",
    "http://ex.org/a/f"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#106",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not treat dot segments in the query or fragment of a relative IRI as path segments",
  "line": 877,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/a/>.\n<g?y/../x> <h#s/../x> <i/../j?y/./x>.",
  "expected": [
   [
    "http://ex.org/a/g?y/../x",
    "http://ex.org/a/h#s/../x",
    "http://ex.org/a/j?y/./x"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#107",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not rescan a long base path for relative IRIs without dot segments",
  "line": 884,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#108",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should still remove dot segments when the base path has them",
  "line": 900,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#109",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not resolve IRIs against @BASE",
  "line": 907,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@BASE <http://ex.org/>.",
  "expectedError": "Expected entity but got @BASE on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#110",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should resolve IRIs against SPARQL base",
  "line": 913,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "BASE <http://ex.org/>\n<a> <b> <c>. BASE <d/> <e> <f> <g>.",
  "expected": [
   [
    "http://ex.org/a",
    "http://ex.org/b",
    "http://ex.org/c"
   ],
   [
    "http://ex.org/d/e",
    "http://ex.org/d/f",
    "http://ex.org/d/g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#111",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should resolve IRIs against a @base with query string",
  "line": 923,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/?foo>.\n<> <b> <c>.\n@base <d/?bar>.\n<> <f> <g>.",
  "expected": [
   [
    "http://ex.org/?foo",
    "http://ex.org/b",
    "http://ex.org/c"
   ],
   [
    "http://ex.org/d/?bar",
    "http://ex.org/d/f",
    "http://ex.org/d/g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#112",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should resolve IRIs with query string against @base",
  "line": 933,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/>.\n<?> <?a> <?a=b>.\n@base <d>.\n<?> <?a> <?a=b>.@base <?e>.\n<> <?a> <?a=b>.",
  "expected": [
   [
    "http://ex.org/?",
    "http://ex.org/?a",
    "http://ex.org/?a=b"
   ],
   [
    "http://ex.org/d?",
    "http://ex.org/d?a",
    "http://ex.org/d?a=b"
   ],
   [
    "http://ex.org/d?e",
    "http://ex.org/d?a",
    "http://ex.org/d?a=b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#113",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not resolve IRIs with colons",
  "line": 946,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/>.\n<a>   <b>   <c>.\n<A:>  <b:>  <c:>.\n<a:a> <b:B> <C-D:c>.",
  "expected": [
   [
    "http://ex.org/a",
    "http://ex.org/b",
    "http://ex.org/c"
   ],
   [
    "A:",
    "b:",
    "c:"
   ],
   [
    "a:a",
    "b:B",
    "C-D:c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#114",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow relative URIs with a colon in the first path segment",
  "line": 957,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<entity.beeldbank_leiden_person:A.E._Stuur.> <x:x> <x:x> .",
  "expectedError": "Invalid IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#115",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow relative URIs with a colon in the first path segment as base",
  "line": 963,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <entity.beeldbank_leiden_person:A.E._Stuur.> .",
  "expectedError": "Expected valid IRI to follow base declaration on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#116",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should resolve datatype IRIs against @base",
  "line": 969,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/>.\n<a> <b> \"c\"^^<d>.\n@base <d/>.\n<e> <f> \"g\"^^<h>.",
  "expected": [
   [
    "http://ex.org/a",
    "http://ex.org/b",
    "\"c\"^^http://ex.org/d"
   ],
   [
    "http://ex.org/d/e",
    "http://ex.org/d/f",
    "\"g\"^^http://ex.org/d/h"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#117",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should resolve IRIs against a base with a fragment",
  "line": 979,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/foo#bar>.\n<a> <b> <#c>.\n",
  "expected": [
   [
    "http://ex.org/a",
    "http://ex.org/b",
    "http://ex.org/foo#c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#118",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should resolve IRIs with an empty fragment",
  "line": 986,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base <http://ex.org/foo>.\n<#> <b#> <#c>.\n",
  "expected": [
   [
    "http://ex.org/foo#",
    "http://ex.org/b#",
    "http://ex.org/foo#c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#119",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not resolve prefixed names",
  "line": 993,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "PREFIX ex: <http://ex.org/a/bb/ccc/../>\nex:a ex:b ex:c .",
  "expected": [
   [
    "http://ex.org/a/bb/ccc/../a",
    "http://ex.org/a/bb/ccc/../b",
    "http://ex.org/a/bb/ccc/../c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#120",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle VERSION",
  "line": 1000,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"1.2\"",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#121",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle @version",
  "line": 1005,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@version \"1.2\".",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#122",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle multiple version declarations",
  "line": 1010,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"1.2\"\nversion \"1.2\"\n@version \"1.2\" .",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#123",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle multiple version declarations followed by a triple",
  "line": 1017,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"1.2\"\nversion \"1.2\"\n@version \"1.2\" .\n<ex:a> <ex:b> <ex:c> .",
  "expected": [
   [
    "ex:a",
    "ex:b",
    "ex:c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#124",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle @prefix and @base after a SPARQL-style version declaration",
  "line": 1026,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"1.2\"\n@prefix ex: <ex:>.\nVERSION \"1.2\" @base <ex:>.\nex:a ex:b <c> .",
  "expected": [
   [
    "ex:a",
    "ex:b",
    "ex:c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#125",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should still read a language tag after whitespace",
  "line": 1035,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<ex:a> <ex:b> \"c\" @en .",
  "expected": [
   [
    "ex:a",
    "ex:b",
    "\"c\"@en"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#126",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with an IRI",
  "line": 1041,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION <ex:abc>",
  "expectedError": "Expected literal to follow version declaration on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#127",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with a non-string",
  "line": 1047,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION 1.2",
  "expectedError": "Version declarations must use single quotes on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#128",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with a long string",
  "line": 1053,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"\"\"1.2\"\"\"",
  "expectedError": "Version declarations must use single quotes on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#129",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle version declarations without whitespace before the string",
  "line": 1059,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION\"1.2\"\n@version'1.2'.\n<ex:a> <ex:b> <ex:c> .",
  "expected": [
   [
    "ex:a",
    "ex:b",
    "ex:c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#130",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle version declarations with escapes",
  "line": 1065,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"1\\u002e2\"\n@version '\\u0031.2'.\n<ex:a> <ex:b> <ex:c> .",
  "expected": [
   [
    "ex:a",
    "ex:b",
    "ex:c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#131",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with a boolean",
  "line": 1071,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION true .",
  "expectedError": "Version declarations must use single quotes on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#132",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with a long string with escapes",
  "line": 1077,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"\"\"1\\u002e2\"\"\"",
  "expectedError": "Version declarations must use single quotes on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#133",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with a long single-quoted string",
  "line": 1083,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION '''1.2'''",
  "expectedError": "Version declarations must use single quotes on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#134",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with a long string followed by a short one when parsing synchronously",
  "line": 1089,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#135",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow VERSION with a multi-line long string",
  "line": 1099,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#136",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should allow VERSION with an escaped short string after a long literal when parsing synchronously",
  "line": 1111,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#137",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow unsupported VERSIONs",
  "line": 1121,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "VERSION \"1.2-unknown\"",
  "expectedError": "Detected unsupported version: \"1.2-unknown\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#138",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should handle unsupported VERSIONs when parseUnsupportedVersions is true",
  "line": 1128,
  "kind": "parse",
  "options": {
   "parseUnsupportedVersions": true
  },
  "input": "VERSION \"1.2-unknown\"",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#139",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not allow unsupported versions passed through the constructor",
  "line": 1133,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#140",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an empty default graph",
  "line": 1141,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#141",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple default graph ending without a dot",
  "line": 1143,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#142",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple default graph ending with a dot",
  "line": 1149,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{<a> <b> <c>.}",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#143",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple default graph ending without a dot",
  "line": 1155,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{<a> <b> <c>;<d> <e>,<f>}",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "a",
    "d",
    "e"
   ],
   [
    "a",
    "d",
    "f"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#144",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple default graph ending with a dot",
  "line": 1163,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{<a> <b> <c>;<d> <e>,<f>.}",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "a",
    "d",
    "e"
   ],
   [
    "a",
    "d",
    "f"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#145",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple default graph ending with a semicolon",
  "line": 1171,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{<a> <b> <c>;<d> <e>,<f>;}",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "a",
    "d",
    "e"
   ],
   [
    "a",
    "d",
    "f"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#146",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a default graph with a blank node ending with a dot",
  "line": 1179,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{ [<p> <o>]. }",
  "expected": [
   [
    "_:b0",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#147",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a default graph with a blank node ending without a dot",
  "line": 1185,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{ [<p> <o>] }",
  "expected": [
   [
    "_:b0",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#148",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an empty named graph with an IRI",
  "line": 1191,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<g>{}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#149",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple named graph with an IRI ending without a dot",
  "line": 1193,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<g> {<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#150",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple named graph with an IRI ending with a dot",
  "line": 1199,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<g>{<a> <b> <c>.}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#151",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple named graph with an IRI ending without a dot",
  "line": 1205,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<g> {<a> <b> <c>;<d> <e>,<f>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ],
   [
    "a",
    "d",
    "e",
    "g"
   ],
   [
    "a",
    "d",
    "f",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#152",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple named graph with an IRI ending with a dot",
  "line": 1213,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<g>{<a> <b> <c>;<d> <e>,<f>.}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ],
   [
    "a",
    "d",
    "e",
    "g"
   ],
   [
    "a",
    "d",
    "f",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#153",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an empty named graph with a prefixed name",
  "line": 1221,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix g: <g#>.\ng:h {}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#154",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple named graph with a prefixed name ending without a dot",
  "line": 1226,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix g: <g#>.\ng:h {<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g#h"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#155",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple named graph with a prefixed name ending with a dot",
  "line": 1232,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix g: <g#>.\ng:h{<a> <b> <c>.}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g#h"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#156",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple named graph with a prefixed name ending without a dot",
  "line": 1238,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix g: <g#>.\ng:h {<a> <b> <c>;<d> <e>,<f>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g#h"
   ],
   [
    "a",
    "d",
    "e",
    "g#h"
   ],
   [
    "a",
    "d",
    "f",
    "g#h"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#157",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple named graph with a prefixed name ending with a dot",
  "line": 1246,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix g: <g#>.\ng:h{<a> <b> <c>;<d> <e>,<f>.}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g#h"
   ],
   [
    "a",
    "d",
    "e",
    "g#h"
   ],
   [
    "a",
    "d",
    "f",
    "g#h"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#158",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a named graph with a blank node ending with a dot",
  "line": 1254,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<g> { [<p> <o>]. }",
  "expected": [
   [
    "_:b0",
    "p",
    "o",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#159",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a named graph with a blank node ending without a dot",
  "line": 1260,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<g> { [<p> <o>] }",
  "expected": [
   [
    "_:b0",
    "p",
    "o",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#160",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an empty anonymous graph",
  "line": 1266,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[] {}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#161",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple anonymous graph ending without a dot",
  "line": 1268,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[] {<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#162",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple anonymous graph ending with a dot",
  "line": 1274,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[]{<a> <b> <c>.}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#163",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple anonymous graph ending without a dot",
  "line": 1280,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[] {<a> <b> <c>;<d> <e>,<f>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "_:b0"
   ],
   [
    "a",
    "d",
    "e",
    "_:b0"
   ],
   [
    "a",
    "d",
    "f",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#164",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a three-triple anonymous graph ending with a dot",
  "line": 1288,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[]{<a> <b> <c>;<d> <e>,<f>.}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "_:b0"
   ],
   [
    "a",
    "d",
    "e",
    "_:b0"
   ],
   [
    "a",
    "d",
    "f",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#165",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an empty named graph with an IRI and the GRAPH keyword",
  "line": 1296,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH <g> {}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#166",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an empty named graph with a prefixed name and the GRAPH keyword",
  "line": 1301,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix g: <g#>.\nGRAPH g:h {}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#167",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an empty anonymous graph and the GRAPH keyword",
  "line": 1306,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH [] {}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#168",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple named graph with an IRI and the GRAPH keyword",
  "line": 1311,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH <g> {<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#169",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple named graph with a prefixed name and the GRAPH keyword",
  "line": 1317,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix g: <g#>.\nGRAPH g:h {<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g#h"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#170",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a one-triple anonymous graph and the GRAPH keyword",
  "line": 1323,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH [] {<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#171",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a graph with 8-bit unicode escape sequences",
  "line": 1329,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<\\U0001d400> {\n<\\U0001d400> <\\U0001d400> \"\\U0001d400\"^^<\\U0001d400>\n}\n",
  "expected": [
   [
    "𝐀",
    "𝐀",
    "\"𝐀\"^^http://example.org/𝐀",
    "𝐀"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#172",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a a reified triple inside a GRAPH",
  "line": 1335,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH <g> {<< <a> <b> <c> >> <q> <z> }",
  "expected": [
   [
    "_:b0",
    "q",
    "z",
    "g"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ],
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#173",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a single closing brace",
  "line": 1342,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "}",
  "expectedError": "Unexpected graph closing on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#174",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a single opening brace",
  "line": 1345,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{",
  "expectedError": "Unexpected \"{\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#175",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a superfluous closing brace",
  "line": 1348,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{}}",
  "expectedError": "Unexpected graph closing on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#176",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a graph with only a dot",
  "line": 1351,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{.}",
  "expectedError": "Expected entity but got . on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#177",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a graph with only a semicolon",
  "line": 1354,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{;}",
  "expectedError": "Expected entity but got ; on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#178",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an unclosed graph",
  "line": 1357,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{<a> <b> <c>.",
  "expectedError": "Unclosed graph on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#179",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a named graph with a list node as label",
  "line": 1360,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "() {}",
  "expectedError": "Expected entity but got { on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#180",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a named graph with a non-empty blank node as label",
  "line": 1366,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[<a> <b>] {}",
  "expectedError": "Expected entity but got { on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#181",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a named graph with the GRAPH keyword and a non-empty blank node as label",
  "line": 1372,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH [<a> <b>] {}",
  "expectedError": "Invalid graph label on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#182",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a triple after the GRAPH keyword",
  "line": 1378,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH <a> <b> <c>.",
  "expectedError": "Expected graph but got IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#183",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse repeated GRAPH keywords",
  "line": 1384,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "GRAPH GRAPH <g> {}",
  "expectedError": "Invalid graph label on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#184",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a quad with 4 IRIs",
  "line": 1390,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> <g>.",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#185",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a quad with 4 prefixed names",
  "line": 1393,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@prefix p: <p#>.\np:a p:b p:c p:g.",
  "expected": [
   [
    "p#a",
    "p#b",
    "p#c",
    "p#g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#186",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a quad with an undefined prefix",
  "line": 1399,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> p:g.",
  "expectedError": "Undefined prefix \"p:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#187",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a quad with 3 IRIs and a literal",
  "line": 1405,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> \"c\"^^<d> <g>.",
  "expected": [
   [
    "a",
    "b",
    "\"c\"^^http://example.org/d",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#188",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a quad with 2 blank nodes and a literal",
  "line": 1411,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "_:a <b> \"c\"^^<d> _:g.",
  "expected": [
   [
    "_:b0_a",
    "b",
    "\"c\"^^http://example.org/d",
    "_:b0_g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#189",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a quad in a graph",
  "line": 1417,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "{<a> <b> <c> <g>.}",
  "expectedError": "Expected punctuation to follow \"http://example.org/c\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#190",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a quad with different punctuation",
  "line": 1420,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> <g>;",
  "expectedError": "Expected dot to follow quad on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#191",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse base declarations without IRI",
  "line": 1426,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "@base a: ",
  "expectedError": "Expected valid IRI to follow base declaration on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#192",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse improperly nested parentheses and brackets",
  "line": 1432,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [<c> (<d>]).",
  "expectedError": "Expected entity but got ] on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#193",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse improperly nested square brackets",
  "line": 1438,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> [<c> <d>]].",
  "expectedError": "Expected entity but got ] on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#194",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error when an object is not there",
  "line": 1444,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b>.",
  "expectedError": "Expected entity but got . on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#195",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error when a dot is not there",
  "line": 1447,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>",
  "expectedError": "Expected entity but got eof on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#196",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error with an abbreviation in the subject",
  "line": 1450,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "a <a> <a>.",
  "expectedError": "Expected entity but got abbreviation on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#197",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error with an abbreviation in the object",
  "line": 1456,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <a> a .",
  "expectedError": "Expected entity but got abbreviation on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#198",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error if punctuation follows a subject",
  "line": 1462,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> .",
  "expectedError": "Unexpected . on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#199",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a ! path after a number",
  "line": 1467,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> 1!<c>.",
  "expectedError": "Unexpected \"!<c>.\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#200",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a ^ path after a boolean",
  "line": 1473,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> true^<c>.",
  "expectedError": "Unexpected \"^<c>.\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#201",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a ! path after a blank node",
  "line": 1479,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> _:m!<c>.",
  "expectedError": "Unexpected \"!<c>.\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#202",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should error if an unexpected token follows a subject",
  "line": 1485,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> @",
  "expectedError": "Unexpected \"@\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#203",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not error if there is no triple callback",
  "line": 1501,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#204",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should return prefixes through a callback",
  "line": 1505,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#205",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should return prefixes through a callback without triple callback",
  "line": 1531,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#206",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should return prefixes at the last triple callback",
  "line": 1548,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#207",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a string synchronously if no callback is given",
  "line": 1568,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#208",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should throw on syntax errors if no callback is given",
  "line": 1576,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#209",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should throw on grammar errors if no callback is given",
  "line": 1580,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#210",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should throw on a triple term with iris as subject correctly",
  "line": 1584,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#211",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a standalone reified triple",
  "line": 1588,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c>>>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#212",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple and a standalone reified triple",
  "line": 1595,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> . <<<a> <b> <c>>> .",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#213",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a standalone reified triple and triple",
  "line": 1603,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c>>>. <a> <b> <c>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#214",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with a triple with iris as subject correctly",
  "line": 1611,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c>>> <b> <c>.",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#215",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple with a triple as predicate",
  "line": 1619,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <<<b> <c> <d>>> <e>",
  "expectedError": "Expected entity but got << on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#216",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a triple term with a triple with blanknodes as subject",
  "line": 1625,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<(_:a <b> _:c)>> <b> <c>.",
  "expectedError": "Disallowed triple term as subject on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#217",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with a triple with blanknodes as subject correctly",
  "line": 1631,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<_:a <b> _:c>> <b> <c>.",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0_a",
     "b",
     "_:b0_c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#218",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with a triple with blanknodes and literals as subject correctly",
  "line": 1638,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<_:a <b> \"c\"^^<d>>> <b> <c>.",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0_a",
     "b",
     "\"c\"^^http://example.org/d"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#219",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with iri reifier in subject",
  "line": 1645,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c> ~ <iri>>> <b> <c>.",
  "expected": [
   [
    "iri",
    "b",
    "c"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#220",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with blank node reifier in subject",
  "line": 1653,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c> ~ _:b1>> <b> <c>.",
  "expected": [
   [
    "_:b0_b1",
    "b",
    "c"
   ],
   [
    "_:b0_b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#221",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with iri reifier in object",
  "line": 1661,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<<a> <b> <c> ~ <iri>>>.",
  "expected": [
   [
    "a",
    "b",
    "iri"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#222",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with blank node reifier in object",
  "line": 1669,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<<a> <b> <c> ~ _:b1>>.",
  "expected": [
   [
    "a",
    "b",
    "_:b0_b1"
   ],
   [
    "_:b0_b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#223",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with an empty reifier in subject",
  "line": 1677,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c> ~>> <b> <c>.",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#224",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with an empty reifier in object",
  "line": 1685,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<<a> <b> <c> ~ >>.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#225",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse nested reified triples with empty reifiers",
  "line": 1693,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<< << <a> <b> <c> ~ >> <d> <e> ~ >> <f> <g>.",
  "expected": [
   [
    "_:b1",
    "f",
    "g"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "d",
     "e"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#226",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with an empty reifier in a list",
  "line": 1702,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> (<< <a> <b> <c> ~ >>).",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#227",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple with two reifiers",
  "line": 1712,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<< <a> <b> <c> ~ ~ >> <d> <e>.",
  "expectedError": "Expected entity but got ~ on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#228",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple term with a triple as object correctly",
  "line": 1718,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<(<a> <b> <c>)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#229",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with a triple as object correctly",
  "line": 1724,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<<a> <b> <c>>>.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#230",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple term with a triple as object with blank node correctly",
  "line": 1731,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<(_:a <b> _:c)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "_:b0_a",
     "b",
     "_:b0_c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#231",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with a triple as object with blank node correctly",
  "line": 1737,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<_:a <b> _:c>>.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0_a",
     "b",
     "_:b0_c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#232",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a triple term with a triple as object with literal correctly",
  "line": 1744,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<(_:a <b> \"c\"^^<d>)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "_:b0_a",
     "b",
     "\"c\"^^http://example.org/d"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#233",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple with a triple as object with literal correctly",
  "line": 1750,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <<_:a <b> \"c\"^^<d>>>.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0_a",
     "b",
     "\"c\"^^http://example.org/d"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#234",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should throw on nested triple terms in subject",
  "line": 1757,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#235",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse nested reified triples in subject correctly",
  "line": 1761,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<<<a> <b> <c>>> <f> <g>>> <d> <e>.",
  "expected": [
   [
    "_:b1",
    "d",
    "e"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "f",
     "g"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#236",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse nested triple terms in object correctly",
  "line": 1769,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<(<f> <g> <<(<a> <b> <c>)>>)>>.",
  "expected": [
   [
    "d",
    "e",
    [
     "f",
     "g",
     [
      "a",
      "b",
      "c"
     ]
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#237",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse nested reified triples in object correctly",
  "line": 1775,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<f> <g> <<<a> <b> <c>>>>>.",
  "expected": [
   [
    "d",
    "e",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "f",
     "g",
     "_:b0"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#238",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse nested reified triples in subject and object correctly",
  "line": 1783,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<f> <g> <<<a> <b> <c>>>>> <d> <e>.",
  "expected": [
   [
    "_:b1",
    "d",
    "e"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "f",
     "g",
     "_:b0"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#239",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse nested reified triples in object and subject correctly",
  "line": 1791,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<<<a> <b> <c>>> <f> <g>>>.",
  "expected": [
   [
    "d",
    "e",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "f",
     "g"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#240",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an annotation on a triple with a nested reified triple as subject",
  "line": 1799,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c>>> <d> <e> {| <f> <g> |}.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "d",
     "e"
    ]
   ],
   [
    "_:b0",
    "d",
    "e"
   ],
   [
    "_:b1",
    "f",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#241",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an annotation on a triple with a nested reified triple as object",
  "line": 1808,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<a> <b> <c>>> {| <f> <g> |}.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "d",
     "e",
     "_:b0"
    ]
   ],
   [
    "d",
    "e",
    "_:b0"
   ],
   [
    "_:b1",
    "f",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#242",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a bare annotation reifier on a triple with a nested reified triple as subject",
  "line": 1817,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c>>> <d> <e> ~ .",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b0",
    "d",
    "e"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "d",
     "e"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#243",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a bare annotation reifier on a triple with a nested reified triple as object",
  "line": 1825,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<a> <b> <c>>> ~ .",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "d",
    "e",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "d",
     "e",
     "_:b0"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#244",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse nested triple terms that are partially closed",
  "line": 1833,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<(<<(<a> <b> <c>)>> <f> <g>.",
  "expectedError": "Disallowed triple term as subject on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#245",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse nested reified triples that are partially closed",
  "line": 1840,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<<<a> <b> <c>>> <f> <g>.",
  "expectedError": "Expected >> but got . on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#246",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse partially closed nested triple terms",
  "line": 1847,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<(<<(<a> <b> <c> <f> <g>)>>.",
  "expectedError": "Disallowed triple term as subject on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#247",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse partially closed nested reified triples",
  "line": 1854,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<<<a> <b> <c> <f> <g>>>.",
  "expectedError": "Expected >> but got IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#248",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse nested triple terms with too many closing tags after the inner term",
  "line": 1861,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<(<<(<a> <b> <c>)>>)>> <f> <g>)>>.",
  "expectedError": "Disallowed triple term as subject on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#249",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse nested reified triples with too many closing tags after the inner triple",
  "line": 1868,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<<<a> <b> <c>>>>> <f> <g>>>.",
  "expectedError": "Expected entity but got >> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#250",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse nested triple terms with too many closing tags at the end",
  "line": 1875,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<(<<(<a> <b> <c>)>> <f> <g>)>>)>>.",
  "expectedError": "Disallowed triple term as subject on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#251",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse nested reified triples with too many closing tags at the end",
  "line": 1882,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<<<a> <b> <c>>> <f> <g>>>>>.",
  "expectedError": "Expected entity but got >> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#252",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse triple terms with too many closing tags",
  "line": 1889,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>)>>.",
  "expectedError": "Expected entity but got )>> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#253",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse reified triples with too many closing tags",
  "line": 1896,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c>>>.",
  "expectedError": "Expected entity but got >> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#254",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse incomplete triple terms in object",
  "line": 1903,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<(<a> <b>)>>.",
  "expectedError": "Expected entity but got )>> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#255",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse incomplete reified triples in object",
  "line": 1910,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<d> <e> <<<a> <b>>>.",
  "expectedError": "Expected entity but got >> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#256",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse incomplete triple terms in subject",
  "line": 1917,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<(<a> <b>)>> <d> <e>.",
  "expectedError": "Disallowed triple term as subject on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#257",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse incomplete reified triples in subject",
  "line": 1924,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b>>> <d> <e>.",
  "expectedError": "Expected entity but got >> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#258",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse incorrectly nested triple terms",
  "line": 1931,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": ")>> <<(",
  "expectedError": "Expected entity but got )>> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#259",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse incorrectly nested reified triples",
  "line": 1938,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": ">> <<",
  "expectedError": "Expected entity but got >> on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#260",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a triple term on its own",
  "line": 1945,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<(<a> <b> <c>)>>.",
  "expectedError": "Disallowed triple term as subject on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#261",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified quad",
  "line": 1952,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c> <d> <e>>> <a> <b> .",
  "expectedError": "Expected >> but got IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#262",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a shared reified triple subject",
  "line": 1958,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c>>> <b> <c>;\n<d> <c>.",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b0",
    "d",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#263",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse statements with a shared reified triple subject and reified object",
  "line": 1966,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<<<a> <b> <c>>> <b> <c>;\n<d> <<<a> <b> <c>>>.",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b0",
    "d",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#264",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should put nested reified triples in the default graph",
  "line": 1975,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> <g>.\n<<<a> <b> <c>>> <d> <e>.",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ],
   [
    "_:b0",
    "d",
    "e"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#265",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax with one predicate-object",
  "line": 1983,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b> <c> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#266",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax without reifier",
  "line": 1991,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ .",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#267",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an annotation inside a blank node property list",
  "line": 1998,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> [ <b> <c> {| <d> <e> |} ].",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "b",
     "c"
    ]
   ],
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b1",
    "d",
    "e"
   ],
   [
    "s",
    "p",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#268",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an annotation inside a blank node property list in subject position",
  "line": 2007,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "[ <b> <c> {| <d> <e> |} ] <p> <o>.",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "b",
     "c"
    ]
   ],
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b1",
    "d",
    "e"
   ],
   [
    "_:b0",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#269",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an annotation inside a nested blank node property list",
  "line": 2016,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> [ <b> [ <c> <d> {| <e> <f> |} ] ].",
  "expected": [
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b1",
     "c",
     "d"
    ]
   ],
   [
    "_:b1",
    "c",
    "d"
   ],
   [
    "_:b2",
    "e",
    "f"
   ],
   [
    "_:b0",
    "b",
    "_:b1"
   ],
   [
    "s",
    "p",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#270",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an annotation with a reifier inside a blank node property list",
  "line": 2026,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> [ <b> <c> ~ <r> {| <d> <e> |} ].",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "r",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "b",
     "c"
    ]
   ],
   [
    "r",
    "d",
    "e"
   ],
   [
    "s",
    "p",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#271",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a predicate-object pair after an annotation inside a blank node property list",
  "line": 2035,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> [ <b> <c> {| <d> <e> |} ; <f> <g> ].",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "d",
    "e"
   ],
   [
    "_:b0",
    "f",
    "g"
   ],
   [
    "s",
    "p",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#272",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a predicate-object pair after an annotation",
  "line": 2045,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> |} ; <p2> <o2> .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "s",
    "p2",
    "o2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#273",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an object after an annotation",
  "line": 2054,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> |} , <o2> .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "s",
    "p",
    "o2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#274",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a predicate-object pair after an annotation with a reifier",
  "line": 2063,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> ~ <r> {| <a> <b> |} ; <p2> <o2> .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "r",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "r",
    "a",
    "b"
   ],
   [
    "s",
    "p2",
    "o2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#275",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse annotations on predicate and object lists",
  "line": 2072,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> |} ; <p2> <o2> {| <a2> <b2> |} , <o3> {| <a3> <b3> |} .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "s",
    "p2",
    "o2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p2",
     "o2"
    ]
   ],
   [
    "_:b1",
    "a2",
    "b2"
   ],
   [
    "s",
    "p2",
    "o3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p2",
     "o3"
    ]
   ],
   [
    "_:b2",
    "a3",
    "b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#276",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a nested annotation",
  "line": 2086,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> {| <c> <d> |} |} .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "a",
     "b"
    ]
   ],
   [
    "_:b1",
    "c",
    "d"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#277",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse predicate-object pairs after a nested annotation",
  "line": 2096,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> {| <c> <d> |} ; <e> <f> |} ; <p2> <o2> .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "a",
     "b"
    ]
   ],
   [
    "_:b1",
    "c",
    "d"
   ],
   [
    "_:b0",
    "e",
    "f"
   ],
   [
    "s",
    "p2",
    "o2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#278",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a doubly nested annotation with a reifier",
  "line": 2108,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> ~ <r> {| <c> <d> {| <e> <f> |} |} |} .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "r",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "a",
     "b"
    ]
   ],
   [
    "r",
    "c",
    "d"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "r",
     "c",
     "d"
    ]
   ],
   [
    "_:b1",
    "e",
    "f"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#279",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a nested annotation inside a blank node in an annotation",
  "line": 2120,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> [ <b> <c> {| <d> <e> |} ] |} .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b1",
    "b",
    "c"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b1",
     "b",
     "c"
    ]
   ],
   [
    "_:b2",
    "d",
    "e"
   ],
   [
    "_:b0",
    "a",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#280",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse consecutive annotation blocks with separate reifiers",
  "line": 2131,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> |} {| <c> <d> |} .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b1",
    "c",
    "d"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#281",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse an annotation block after an empty reifier",
  "line": 2141,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> ~ {| <a> <b> |} .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#282",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reifier after an annotation block",
  "line": 2149,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> |} ~ <r> .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "_:b0",
    "a",
    "b"
   ],
   [
    "r",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#283",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse alternating reifiers and annotation blocks",
  "line": 2158,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> ~ <r1> {| <a> <b> |} ~ <r2> {| <c> <d> |} .",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "r1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "r1",
    "a",
    "b"
   ],
   [
    "r2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ]
   ],
   [
    "r2",
    "c",
    "d"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#284",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an empty nested annotation",
  "line": 2168,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> {| |} |} .",
  "expectedError": "Annotation block can not be empty on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#285",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an annotation closing after a trailing semicolon",
  "line": 2174,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> ; |}",
  "expectedError": "Unexpected annotation syntax closing on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#286",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an annotation closing inside a blank node property list",
  "line": 2180,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> [ <b> <c> |} ] .",
  "expectedError": "Unexpected annotation syntax closing on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#287",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an unclosed outer annotation",
  "line": 2186,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<s> <p> <o> {| <a> <b> {| <c> <d> |} .",
  "expectedError": "Expected punctuation to follow \"http://example.org/b\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#288",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax with reifier and one predicate-object",
  "line": 2192,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri> {| <b> <c> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri",
    "b",
    "c"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#289",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reifier that is not followed by an annotation block",
  "line": 2200,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#290",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a blank node reifier that is not followed by an annotation block",
  "line": 2207,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ _:r.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0_r",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#291",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a lone reifier followed by a shared subject",
  "line": 2214,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri>; <b2> <c2>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "a",
    "b2",
    "c2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#292",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a lone reifier followed by a shared subject and predicate",
  "line": 2222,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri>, <c2>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "a",
    "b",
    "c2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#293",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should reify the correct triple when lone reifiers follow a shared subject",
  "line": 2230,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri1>; <b2> <c2> ~ <iri2>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "a",
    "b2",
    "c2"
   ],
   [
    "iri2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b2",
     "c2"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#294",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse two reified triples using annotation syntax with one predicate-object",
  "line": 2239,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b> <c> |}. <a2> <b2> <c2> {| <b2> <c2> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "a2",
    "b2",
    "c2"
   ],
   [
    "_:b1",
    "b2",
    "c2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a2",
     "b2",
     "c2"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#295",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax with two predicate-objects",
  "line": 2250,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b1> <c1>; <b2> <c2> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0",
    "b1",
    "c1"
   ],
   [
    "_:b0",
    "b2",
    "c2"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#296",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax with reifier and with two predicate-objects",
  "line": 2259,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri> {| <b1> <c1>; <b2> <c2> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri",
    "b1",
    "c1"
   ],
   [
    "iri",
    "b2",
    "c2"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#297",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax with reifier and with two predicate-objects with trailing ;",
  "line": 2268,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri> {| <b1> <c1>; <b2> <c2> ; |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri",
    "b1",
    "c1"
   ],
   [
    "iri",
    "b2",
    "c2"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#298",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax with one predicate-object followed by regular triples",
  "line": 2277,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b> <c> |}.\n<a2> <b2> <c2>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "a2",
    "b2",
    "c2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#299",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using annotation syntax with reifier and with one predicate-object followed by regular triples",
  "line": 2286,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri> {| <b> <c> |}.\n<a2> <b2> <c2>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri",
    "b",
    "c"
   ],
   [
    "iri",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "a2",
    "b2",
    "c2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#300",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using multiple annotation syntax blocks",
  "line": 2295,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b1> <c1> |} {| <b2> <c2> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "_:b0",
    "b1",
    "c1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b1",
    "b2",
    "c2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#301",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using multiple annotation syntax blocks with reifiers",
  "line": 2305,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri1> {| <b1> <c1> |} ~ <iri2> {| <b2> <c2> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri1",
    "b1",
    "c1"
   ],
   [
    "iri1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "iri2",
    "b2",
    "c2"
   ],
   [
    "iri2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#302",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple in a graph using annotation syntax with one predicate-object",
  "line": 2315,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<G> { <a> <b> <c> {| <b> <c> |}. }",
  "expected": [
   [
    "a",
    "b",
    "c",
    "G"
   ],
   [
    "_:b0",
    "b",
    "c",
    "G"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ],
    "G"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#303",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple in a graph using annotation syntax with an explicit reifier",
  "line": 2323,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<G> { <a> <b> <c> ~ <r> {| <b> <c> |}. }",
  "expected": [
   [
    "a",
    "b",
    "c",
    "G"
   ],
   [
    "r",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ],
    "G"
   ],
   [
    "r",
    "b",
    "c",
    "G"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#304",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple in a graph using << >> syntax",
  "line": 2331,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<G> { <<<a> <b> <c>>> <p> <o> . }",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ],
    "G"
   ],
   [
    "_:b0",
    "p",
    "o",
    "G"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#305",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should parse a reified triple using multiple annotation syntax blocks with reifier for the first",
  "line": 2338,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> ~ <iri1> {| <b1> <c1> |} {| <b2> <c2> |}.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ],
   [
    "iri1",
    "b1",
    "c1"
   ],
   [
    "iri1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ],
   [
    "_:b0",
    "b2",
    "c2"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#306",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple using annotation syntax with zero predicate-objects",
  "line": 2348,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| |}",
  "expectedError": "Annotation block can not be empty on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#307",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple using annotation syntax with zero predicate-objects ending with .",
  "line": 2354,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| |} .",
  "expectedError": "Annotation block can not be empty on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#308",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple using an incomplete annotation syntax",
  "line": 2360,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b> |}",
  "expectedError": "Expected entity but got |} on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#309",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple using an incomplete annotation syntax after a semicolon",
  "line": 2366,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b1> <c1>; |}",
  "expectedError": "Expected entity but got eof on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#310",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple using an incomplete annotation syntax after a semicolon and entity",
  "line": 2372,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b1> <c1>; <b2> |}",
  "expectedError": "Expected entity but got |} on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#311",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple using an incomplete annotation syntax that misses |}",
  "line": 2378,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b1> <c1>",
  "expectedError": "Expected punctuation to follow \"http://example.org/c1\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#312",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse a reified triple using an incomplete annotation syntax that misses |} and starts a new subject",
  "line": 2384,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| <b1> <c1>. <a2> <b2> <c2>",
  "expectedError": "Expected punctuation to follow \"http://example.org/c1\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#313",
  "path": [
   "Parser",
   "A Parser instance"
  ],
  "name": "should not parse an out of place |}",
  "line": 2390,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> |}",
  "expectedError": "Unexpected annotation syntax closing on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#314",
  "path": [
   "Parser",
   "An Parser instance without document IRI"
  ],
  "name": "should keep relative IRIs",
  "line": 2397,
  "kind": "parse",
  "options": {},
  "input": "@prefix : <#>.\n<a> <b> <c> <g>.\n:d :e :f :g.",
  "expected": [
   [
    "a",
    "b",
    "c",
    "g"
   ],
   [
    "#d",
    "#e",
    "#f",
    "#g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#315",
  "path": [
   "Parser",
   "An Parser instance without document IRI"
  ],
  "name": "should keep empty IRIs",
  "line": 2404,
  "kind": "parse",
  "options": {},
  "input": "@prefix : <>.\n<> <> <> <>.\n: : : :.",
  "expected": [
   [
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    }
   ],
   [
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    },
    {
     "term": {
      "termType": "NamedNode",
      "value": ""
     }
    }
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#316",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs against the document IRI",
  "line": 2415,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "@prefix : <#>.\n<a> <b> <c> <g>.\n:d :e :f :g.",
  "expected": [
   [
    "http://ex.org/x/yy/zzz/a",
    "http://ex.org/x/yy/zzz/b",
    "http://ex.org/x/yy/zzz/c",
    "http://ex.org/x/yy/zzz/g"
   ],
   [
    "http://ex.org/x/yy/zzz/f.ttl#d",
    "http://ex.org/x/yy/zzz/f.ttl#e",
    "http://ex.org/x/yy/zzz/f.ttl#f",
    "http://ex.org/x/yy/zzz/f.ttl#g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#317",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs with a trailing slash against the document IRI",
  "line": 2422,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "</a> </a/b> </a/b/c>.\n",
  "expected": [
   [
    "http://ex.org/a",
    "http://ex.org/a/b",
    "http://ex.org/a/b/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#318",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs starting with ./ against the document IRI",
  "line": 2429,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<./a> <./a/b> <./a/b/c>.\n",
  "expected": [
   [
    "http://ex.org/x/yy/zzz/a",
    "http://ex.org/x/yy/zzz/a/b",
    "http://ex.org/x/yy/zzz/a/b/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#319",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs starting with multiple ./ sequences against the document IRI",
  "line": 2436,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<./././a> <./././././a/b> <././././././a/b/c>.\n",
  "expected": [
   [
    "http://ex.org/x/yy/zzz/a",
    "http://ex.org/x/yy/zzz/a/b",
    "http://ex.org/x/yy/zzz/a/b/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#320",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs starting with ../ against the document IRI",
  "line": 2443,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<../a> <../a/b> <../a/b/c>.\n",
  "expected": [
   [
    "http://ex.org/x/yy/a",
    "http://ex.org/x/yy/a/b",
    "http://ex.org/x/yy/a/b/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#321",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs starting multiple ../ sequences against the document IRI",
  "line": 2450,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<../../a> <../../../a/b> <../../../../../../../../a/b/c>.\n",
  "expected": [
   [
    "http://ex.org/x/a",
    "http://ex.org/a/b",
    "http://ex.org/a/b/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#322",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs starting with mixes of ./ and ../ sequences against the document IRI",
  "line": 2457,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<.././a> <./.././a/b> <./.././.././a/b/c>.\n",
  "expected": [
   [
    "http://ex.org/x/yy/a",
    "http://ex.org/x/yy/a/b",
    "http://ex.org/x/a/b/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#323",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs starting with .x, ..x, or .../ against the document IRI",
  "line": 2464,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<.x/a> <..x/a/b> <.../a/b/c>.\n",
  "expected": [
   [
    "http://ex.org/x/yy/zzz/.x/a",
    "http://ex.org/x/yy/zzz/..x/a/b",
    "http://ex.org/x/yy/zzz/.../a/b/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#324",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve datatype IRIs against the document IRI",
  "line": 2471,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<a> <b> \"c\"^^<d>.",
  "expected": [
   [
    "http://ex.org/x/yy/zzz/a",
    "http://ex.org/x/yy/zzz/b",
    "\"c\"^^http://ex.org/x/yy/zzz/d"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#325",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should resolve IRIs in lists against the document IRI",
  "line": 2478,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "(<a> <b>) <p> (<c> <d>).",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://ex.org/x/yy/zzz/a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://ex.org/x/yy/zzz/b"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "http://ex.org/x/yy/zzz/p",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://ex.org/x/yy/zzz/c"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://ex.org/x/yy/zzz/d"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#326",
  "path": [
   "Parser",
   "An Parser instance with a document IRI"
  ],
  "name": "should respect @base statements",
  "line": 2493,
  "kind": "parse",
  "options": {
   "baseIRI": "http://ex.org/x/yy/zzz/f.ttl"
  },
  "input": "<a> <b> <c>.\n@base <http://ex.org/x/>.\n<e> <f> <g>.\n@base <d/>.\n<h> <i> <j>.\n@base </e/>.\n<k> <l> <m>.",
  "expected": [
   [
    "http://ex.org/x/yy/zzz/a",
    "http://ex.org/x/yy/zzz/b",
    "http://ex.org/x/yy/zzz/c"
   ],
   [
    "http://ex.org/x/e",
    "http://ex.org/x/f",
    "http://ex.org/x/g"
   ],
   [
    "http://ex.org/x/d/h",
    "http://ex.org/x/d/i",
    "http://ex.org/x/d/j"
   ],
   [
    "http://ex.org/e/k",
    "http://ex.org/e/l",
    "http://ex.org/e/m"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#327",
  "path": [
   "Parser",
   "A Parser instance with a blank node prefix"
  ],
  "name": "should use the given prefix for blank nodes",
  "line": 2510,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "blankNodePrefix": "_:blank"
  },
  "input": "_:a <b> _:c.\n",
  "expected": [
   [
    "_:blanka",
    "b",
    "_:blankc"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#328",
  "path": [
   "Parser",
   "A Parser instance with an empty blank node prefix"
  ],
  "name": "should not use a prefix for blank nodes",
  "line": 2518,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "blankNodePrefix": ""
  },
  "input": "_:a <b> _:c.\n",
  "expected": [
   [
    "_:a",
    "b",
    "_:c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#329",
  "path": [
   "Parser",
   "A Parser instance with a non-string format"
  ],
  "name": "should parse a single triple",
  "line": 2526,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": 1
  },
  "input": "<a> <b> <c>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#330",
  "path": [
   "Parser",
   "A Parser instance with a non-string format"
  ],
  "name": "should parse a graph",
  "line": 2531,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": 1
  },
  "input": "{<a> <b> <c>}",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#331",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should parse a single triple",
  "line": 2540,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> <b> <c>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#332",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a default graph",
  "line": 2545,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "{}",
  "expectedError": "Unexpected graph on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#333",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a named graph",
  "line": 2550,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<g> {}",
  "expectedError": "Expected entity but got { on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#334",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a named graph with the GRAPH keyword",
  "line": 2555,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "GRAPH <g> {}",
  "expectedError": "Expected entity but got GRAPH on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#335",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a quad",
  "line": 2560,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> <b> <c> <d>.",
  "expectedError": "Expected punctuation to follow \"http://example.org/c\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#336",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a variable",
  "line": 2565,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "?a ?b ?c.",
  "expectedError": "Unexpected \"?a\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#337",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse an equality statement",
  "line": 2570,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> = <b>.",
  "expectedError": "Unexpected \"=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#338",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a right implication statement",
  "line": 2575,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> => <b>.",
  "expectedError": "Unexpected \"=>\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#339",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a left implication statement",
  "line": 2580,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> <= <b>.",
  "expectedError": "Unexpected \"<=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#340",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a formula as object",
  "line": 2585,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> <b> {}.",
  "expectedError": "Unexpected graph on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#341",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse @forSome",
  "line": 2590,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "@forSome <x>.",
  "expectedError": "Unexpected \"@forSome\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#342",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse @forAll",
  "line": 2595,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "@forAll <x>.",
  "expectedError": "Unexpected \"@forAll\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#343",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a formula as list item",
  "line": 2600,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "( <a> { <b> <c> <d> } <e> ).",
  "expectedError": "Unexpected graph on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#344",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a literal as subject",
  "line": 2606,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "1 <a> <b>.",
  "expectedError": "Unexpected literal on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#345",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a literal as subject with comments enabled",
  "line": 2612,
  "kind": "not-parse-comments",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "1 <a> <b>.",
  "expectedError": "Unexpected literal on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#346",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a literal as predicate",
  "line": 2618,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> \"1\" <b>.",
  "expectedError": "Unexpected literal on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#347",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should parse a triple term",
  "line": 2624,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<a> <b> <<(<a> <b> <c>)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#348",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should parse a reified triple",
  "line": 2627,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<<<a> <b> <c>>> <b> <c> .",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#349",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse nested quads",
  "line": 2632,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<<_:a <http://ex.org/b> _:b <http://ex.org/b>>> <http://ex.org/b> \"c\" .",
  "expectedError": "Expected >> but got IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#350",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse nested quads with comments",
  "line": 2638,
  "kind": "not-parse-comments",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "#comment1\n<<_:a <http://ex.org/b> _:b <http://ex.org/b>>> <http://ex.org/b> \"c\" .",
  "expectedError": "Expected >> but got IRI on line 2.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#351",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a reified triple with list object",
  "line": 2644,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<<<s> <p> (\"abc\") >> <q> 123 .",
  "expectedError": "Unexpected list in reified triple on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#352",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a reified triple with list subject",
  "line": 2650,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<< (\"abc\") <p> <o>>> <q> 123 .",
  "expectedError": "Unexpected list in reified triple on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#353",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a reified triple with compound blank node expression in object",
  "line": 2656,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<<<s> <p> [ <p1> <o1> ]  >> <q> 123 .",
  "expectedError": "Unexpected compound blank node expression in reified triple on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#354",
  "path": [
   "Parser",
   "A Parser instance for the Turtle format"
  ],
  "name": "should not parse a reified triple with compound blank node expression in subject",
  "line": 2662,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "Turtle"
  },
  "input": "<< [ <p1> <o1> ] <p> <o>>> <q> 123 .",
  "expectedError": "Unexpected compound blank node expression in reified triple on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#355",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should parse a nested annotation followed by a predicate-object pair in a graph",
  "line": 2672,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<g> { <s> <p> <o> {| <a> <b> {| <c> <d> |} |} ; <p2> <o2> }",
  "expected": [
   [
    "s",
    "p",
    "o",
    "g"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "s",
     "p",
     "o"
    ],
    "g"
   ],
   [
    "_:b0",
    "a",
    "b",
    "g"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0",
     "a",
     "b"
    ],
    "g"
   ],
   [
    "_:b1",
    "c",
    "d",
    "g"
   ],
   [
    "s",
    "p2",
    "o2",
    "g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#356",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should parse a single triple",
  "line": 2683,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> <b> <c>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#357",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should parse a default graph",
  "line": 2688,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "{}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#358",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse statements with a list in the predicate",
  "line": 2690,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> (<b>) <c>.",
  "expectedError": "Expected entity but got ( on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#359",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should parse a named graph",
  "line": 2696,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<g> {}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#360",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should parse a named graph with the GRAPH keyword",
  "line": 2698,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "GRAPH <g> {}",
  "expected": []
 },
 {
  "id": "N3Parser-test.js#361",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a quad",
  "line": 2703,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> <b> <c> <d>.",
  "expectedError": "Expected punctuation to follow \"http://example.org/c\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#362",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a variable",
  "line": 2708,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "?a ?b ?c.",
  "expectedError": "Unexpected \"?a\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#363",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse an equality statement",
  "line": 2713,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> = <b>.",
  "expectedError": "Unexpected \"=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#364",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a right implication statement",
  "line": 2718,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> => <b>.",
  "expectedError": "Unexpected \"=>\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#365",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a left implication statement",
  "line": 2723,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> <= <b>.",
  "expectedError": "Unexpected \"<=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#366",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a formula as object",
  "line": 2728,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> <b> {}.",
  "expectedError": "Unexpected graph on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#367",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse @forSome",
  "line": 2733,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "@forSome <x>.",
  "expectedError": "Unexpected \"@forSome\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#368",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse @forAll",
  "line": 2738,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "@forAll <x>.",
  "expectedError": "Unexpected \"@forAll\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#369",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a literal as subject",
  "line": 2743,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "\"1\" <a> <b>.",
  "expectedError": "Unexpected literal on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#370",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a literal as predicate",
  "line": 2748,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> \"1\" <b>.",
  "expectedError": "Unexpected literal on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#371",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should parse a triple term",
  "line": 2753,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<a> <b> <<(<a> <b> <c>)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#372",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should parse a reified triple",
  "line": 2756,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<<<a> <b> <c>>> <b> <c> .",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#373",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse nested quads",
  "line": 2761,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "TriG"
  },
  "input": "<<_:a <http://ex.org/b> _:b <http://ex.org/b>>> <http://ex.org/b> \"c\" .",
  "expectedError": "Expected >> but got IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#374",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a reified triple using annotation syntax with zero predicate-objects",
  "line": 2767,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| |}",
  "expectedError": "Annotation block can not be empty on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#375",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a reified triple using annotation syntax with zero predicate-objects ending in .",
  "line": 2773,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<a> <b> <c> {| |} .",
  "expectedError": "Annotation block can not be empty on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#376",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a reified triple in a graph using annotation syntax with zero predicate-objects",
  "line": 2779,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<G> { <a> <b> <c> {|  |}}",
  "expectedError": "Annotation block can not be empty on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#377",
  "path": [
   "Parser",
   "A Parser instance for the TriG format"
  ],
  "name": "should not parse a reified triple in a graph using annotation syntax with zero predicate-objects ending in .",
  "line": 2785,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/"
  },
  "input": "<G> { <a> <b> <c> {|  |} .}",
  "expectedError": "Annotation block can not be empty on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#378",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should parse a version directive",
  "line": 2795,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "VERSION \"1.2\"\n_:a <http://ex.org/b> \"c\".",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#379",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should parse a version directive without whitespace before the string",
  "line": 2801,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "VERSION\"1.2\"\n_:a <http://ex.org/b> \"c\".",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#380",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a lowercase version directive",
  "line": 2807,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "version \"1.2\"",
  "expectedError": "Unexpected \"version\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#381",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a mixed-case version directive",
  "line": 2812,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "Version \"1.2\"",
  "expectedError": "Unexpected \"Version\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#382",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse an @version directive",
  "line": 2817,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "@version \"1.2\".",
  "expectedError": "Unexpected \"@version\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#383",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a SPARQL-style prefix declaration",
  "line": 2822,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "PREFIX ex: <http://ex.org/>",
  "expectedError": "Unexpected \"PREFIX\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#384",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should parse a single triple",
  "line": 2827,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "_:a <http://ex.org/b> \"c\".",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#385",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should parse a datatype separated from its marker by whitespace",
  "line": 2833,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "_:a <http://ex.org/b> \"c\"  ^^  <http://ex.org/t> .",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\"^^http://ex.org/t"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#386",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should parse a single triple starting with Bom",
  "line": 2839,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "﻿_:a <http://ex.org/b> \"c\".",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#387",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a single quad",
  "line": 2845,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "_:a <http://ex.org/b> \"c\" <http://ex.org/g>.",
  "expectedError": "Expected punctuation to follow \"\"c\"\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#388",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse object lists",
  "line": 2851,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<http://example/s> <http://example/p> <http://example/o>, <http://example/o2> .",
  "expectedError": "Unexpected \",\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#389",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse relative IRIs",
  "line": 2857,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<a> <b> <c>.",
  "expectedError": "Invalid IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#390",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a prefix declaration",
  "line": 2862,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "@prefix : <p#>.",
  "expectedError": "Unexpected \"@prefix\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#391",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse apostrophe literals",
  "line": 2867,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "_:a <http://ex.org/b> 'c'.",
  "expectedError": "Unexpected \"'c'.\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#392",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse triple-quoted literals",
  "line": 2873,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "_:a <http://ex.org/b> \"\"\"c\"\"\".",
  "expectedError": "Unexpected \"\"\"\"c\"\"\".\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#393",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse triple-apostrophe literals",
  "line": 2879,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "_:a <http://ex.org/b> '''c'''.",
  "expectedError": "Unexpected \"'''c'''.\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#394",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a variable",
  "line": 2885,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "?a ?b ?c.",
  "expectedError": "Unexpected \"?a\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#395",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse an equality statement",
  "line": 2890,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<urn:a:a> = <urn:b:b>.",
  "expectedError": "Unexpected \"=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#396",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a right implication statement",
  "line": 2895,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<urn:a:a> => <urn:b:b>.",
  "expectedError": "Unexpected \"=>\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#397",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a left implication statement",
  "line": 2900,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<urn:a:a> <= <urn:b:b>.",
  "expectedError": "Unexpected \"<=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#398",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a formula as object",
  "line": 2905,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<urn:a:a> <urn:b:b> {}.",
  "expectedError": "Unexpected \"{}.\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#399",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse @forSome",
  "line": 2910,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "@forSome <x>.",
  "expectedError": "Unexpected \"@forSome\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#400",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse @forAll",
  "line": 2915,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "@forAll <x>.",
  "expectedError": "Unexpected \"@forAll\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#401",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should parse a triple term",
  "line": 2920,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<http://example.org/a> <http://example.org/b> <<(<http://example.org/a> <http://example.org/b> <http://example.org/c>)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#402",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse a reified triple",
  "line": 2923,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<<_:a <http://example.org/b> _:c>> <http://example.org/a> _:b .",
  "expectedError": "Unexpected \"<<_:a\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#403",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse nested quads",
  "line": 2929,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "<<_:a <http://ex.org/b> _:b <http://ex.org/b>>> <http://ex.org/b> \"c\" .",
  "expectedError": "Unexpected \"<<_:a\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#404",
  "path": [
   "Parser",
   "A Parser instance for the N-Triples format"
  ],
  "name": "should not parse annotated triples",
  "line": 2935,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Triples"
  },
  "input": "_:a <http://ex.org/b> _:c {| <http://ex.org/b1> \"c1\" |} .",
  "expectedError": "Unexpected \"{|\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#405",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should parse a version directive",
  "line": 2945,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "VERSION \"1.2\"\n_:a <http://ex.org/b> \"c\".",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#406",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should parse a version directive without whitespace before the string",
  "line": 2951,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "VERSION\"1.2\"\n_:a <http://ex.org/b> \"c\".",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#407",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a lowercase version directive",
  "line": 2957,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "version \"1.2\"",
  "expectedError": "Unexpected \"version\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#408",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a mixed-case version directive",
  "line": 2962,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "Version \"1.2\"",
  "expectedError": "Unexpected \"Version\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#409",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse an @version directive",
  "line": 2967,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "@version \"1.2\".",
  "expectedError": "Unexpected \"@version\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#410",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a SPARQL-style prefix declaration",
  "line": 2972,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "PREFIX ex: <http://ex.org/>",
  "expectedError": "Unexpected \"PREFIX\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#411",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should parse a single triple",
  "line": 2977,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "_:a <http://ex.org/b> \"c\".",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#412",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should parse a single quad",
  "line": 2983,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "_:a <http://ex.org/b> \"c\" <http://ex.org/g>.",
  "expected": [
   [
    "_:b0_a",
    "http://ex.org/b",
    "\"c\"",
    "http://ex.org/g"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#413",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse relative IRIs",
  "line": 2989,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "<a> <b> <c>.",
  "expectedError": "Invalid IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#414",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a prefix declaration",
  "line": 2994,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "@prefix : <p#>.",
  "expectedError": "Unexpected \"@prefix\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#415",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a variable",
  "line": 2999,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "?a ?b ?c.",
  "expectedError": "Unexpected \"?a\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#416",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse an equality statement",
  "line": 3004,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "<urn:a:a> = <urn:b:b>.",
  "expectedError": "Unexpected \"=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#417",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a right implication statement",
  "line": 3009,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "<urn:a:a> => <urn:b:b>.",
  "expectedError": "Unexpected \"=>\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#418",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a left implication statement",
  "line": 3014,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "<urn:a:a> <= <urn:b:b>.",
  "expectedError": "Unexpected \"<=\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#419",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a formula as object",
  "line": 3019,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "<urn:a:a> <urn:b:b> {}.",
  "expectedError": "Unexpected \"{}.\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#420",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse @forSome",
  "line": 3024,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "@forSome <x>.",
  "expectedError": "Unexpected \"@forSome\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#421",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse @forAll",
  "line": 3029,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "@forAll <x>.",
  "expectedError": "Unexpected \"@forAll\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#422",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should parse a triple term",
  "line": 3034,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "<http://example.org/a> <http://example.org/b> <<(<http://example.org/a> <http://example.org/b> <http://example.org/c>)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#423",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse a reified triple",
  "line": 3037,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "<<_:a <http://example.org/b> _:c>> <http://example.org/a> _:b .",
  "expectedError": "Unexpected \"<<_:a\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#424",
  "path": [
   "Parser",
   "A Parser instance for the N-Quads format"
  ],
  "name": "should not parse annotated triples",
  "line": 3043,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N-Quads"
  },
  "input": "_:a <http://ex.org/b> _:c {| <http://ex.org/b1> \"c1\" |} .",
  "expectedError": "Unexpected \"{|\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#425",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should bind the empty prefix to the document local namespace",
  "line": 3061,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "implicitEmptyPrefix": true
  },
  "input": ":a :b :c .",
  "expected": [
   [
    "http://example.org/#a",
    "http://example.org/#b",
    "http://example.org/#c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#426",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should let an explicit empty prefix override the implicit binding",
  "line": 3067,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "implicitEmptyPrefix": true
  },
  "input": "@prefix : <http://example.com/>. :a :b :c .",
  "expected": [
   [
    "http://example.com/a",
    "http://example.com/b",
    "http://example.com/c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#427",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should replace a document IRI fragment in the implicit binding",
  "line": 3074,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.com/doc#old",
   "format": "N3",
   "implicitEmptyPrefix": true
  },
  "input": ":a :b :c .",
  "expected": [
   [
    "http://example.com/doc#a",
    "http://example.com/doc#b",
    "http://example.com/doc#c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#428",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require an explicit empty prefix by default",
  "line": 3080,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": ":a :b :c .",
  "expectedError": "Undefined prefix \":\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#429",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require an explicit empty prefix without a document IRI",
  "line": 3085,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#430",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a single triple",
  "line": 3090,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> <c>.",
  "expected": [
   [
    "a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#431",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a default graph",
  "line": 3095,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{}",
  "expectedError": "Expected entity but got eof on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#432",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a named graph",
  "line": 3100,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<g> {}",
  "expectedError": "Expected entity but got eof on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#433",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a named graph with the GRAPH keyword",
  "line": 3105,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "GRAPH <g> {}",
  "expectedError": "Expected entity but got GRAPH on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#434",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a quad",
  "line": 3110,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> <c> <d>.",
  "expectedError": "Expected punctuation to follow \"http://example.org/c\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#435",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should scope prefix declarations to their formula",
  "line": 3115,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix ex: <http://outer.example/>.\n<s> <p> { @prefix ex: <http://inner.example/>. ex:s ex:p ex:o. }.\nex:s ex:p ex:o.",
  "expected": [
   [
    "http://inner.example/s",
    "http://inner.example/p",
    "http://inner.example/o",
    "_:b0"
   ],
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "http://outer.example/s",
    "http://outer.example/p",
    "http://outer.example/o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#436",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should restore prefix declarations between sibling formulas",
  "line": 3126,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix ex: <http://outer.example/>.\n<s1> <p> { PREFIX ex: <http://first.example/> ex:s ex:p ex:o. }.\n<s2> <p> { ex:s ex:p ex:o. }.\n",
  "expected": [
   [
    "http://first.example/s",
    "http://first.example/p",
    "http://first.example/o",
    "_:b0"
   ],
   [
    "s1",
    "p",
    "_:b0"
   ],
   [
    "http://outer.example/s",
    "http://outer.example/p",
    "http://outer.example/o",
    "_:b1"
   ],
   [
    "s2",
    "p",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#437",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not keep a prefix first declared inside a formula",
  "line": 3138,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> { @prefix in: <http://inner.example/>. in:s in:p in:o. }.\nin:s in:p in:o.",
  "expectedError": "Undefined prefix \"in:\" on line 2.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#438",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should scope base declarations to their formula",
  "line": 3146,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@base <http://outer.example/>.\n<s> <p> { @base <http://inner.example/>. <s> <p> <o>. }.\n<s> <p> <o>.",
  "expected": [
   [
    "http://inner.example/s",
    "http://inner.example/p",
    "http://inner.example/o",
    "_:b0"
   ],
   [
    "http://outer.example/s",
    "http://outer.example/p",
    "_:b0"
   ],
   [
    "http://outer.example/s",
    "http://outer.example/p",
    "http://outer.example/o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#439",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a SPARQL-style base declaration in a formula",
  "line": 3157,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> { BASE <http://inner.example/> <s> <p> <o>. }.",
  "expected": [
   [
    "http://inner.example/s",
    "http://inner.example/p",
    "http://inner.example/o",
    "_:b0"
   ],
   [
    "s",
    "p",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#440",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "allows a blank node in predicate position",
  "line": 3165,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> [] <c>.",
  "expected": [
   [
    "a",
    "_:b0",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#441",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "allows a blank node label in predicate position",
  "line": 3170,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> _:b <c>.",
  "expected": [
   [
    "a",
    "_:b0_b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#442",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "allows a blank node with properties in predicate position",
  "line": 3175,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> [<p> <o>] <c>.",
  "expected": [
   [
    "a",
    "_:b0",
    "c"
   ],
   [
    "_:b0",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#443",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula in predicate position",
  "line": 3182,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> { <a> <b> <c>. } <o>.",
  "expected": [
   [
    "s",
    "_:b0",
    "o"
   ],
   [
    "a",
    "b",
    "c",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#444",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a forward path in predicate position",
  "line": 3188,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p>!<q> <o>.",
  "expected": [
   [
    "p",
    "q",
    "_:b0"
   ],
   [
    "s",
    "_:b0",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#445",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a backward path in predicate position",
  "line": 3194,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p>^<q> <o>.",
  "expected": [
   [
    "_:b0",
    "q",
    "p"
   ],
   [
    "s",
    "_:b0",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#446",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a path after a formula predicate",
  "line": 3200,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> { <a> <b> <c>. }!<q> <o>.",
  "expected": [
   [
    "a",
    "b",
    "c",
    "_:b0"
   ],
   [
    "_:b0",
    "q",
    "_:b1"
   ],
   [
    "s",
    "_:b1",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#447",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a path after a list predicate",
  "line": 3206,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> (<a>)!<q> <o>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "q",
    "_:b1"
   ],
   [
    "s",
    "_:b1",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#448",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a path after a literal predicate",
  "line": 3214,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> \"p\"^<q> <o>.",
  "expected": [
   [
    "_:b0",
    "q",
    "\"p\""
   ],
   [
    "s",
    "_:b0",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#449",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a path after a directional language-tagged literal predicate",
  "line": 3220,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> \"p\"@en--ltr!<q> <o>.",
  "expected": [
   [
    "\"p\"@en--ltr",
    "q",
    "_:b0"
   ],
   [
    "s",
    "_:b0",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#450",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a path after a blank node property list predicate",
  "line": 3226,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> [<inner-p> <inner-o>]!<q> <o>.",
  "expected": [
   [
    "_:b0",
    "inner-p",
    "inner-o"
   ],
   [
    "_:b0",
    "q",
    "_:b1"
   ],
   [
    "s",
    "_:b1",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#451",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a bare IRI property list",
  "line": 3232,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[id <s> <p> <o>].",
  "expected": [
   [
    "s",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#452",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an IRI property list in object position",
  "line": 3237,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> [id <o> <inner-p> <inner-o>].",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "o",
    "inner-p",
    "inner-o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#453",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an IRI property list in predicate position",
  "line": 3243,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> [id <p> <inner-p> <inner-o>] <o>.",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "p",
    "inner-p",
    "inner-o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#454",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse nested IRI property lists",
  "line": 3249,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> [id <o> <q> [id <inner> <r> \"value\"]].",
  "expected": [
   [
    "s",
    "p",
    "o"
   ],
   [
    "o",
    "q",
    "inner"
   ],
   [
    "inner",
    "r",
    "\"value\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#455",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require an IRI after id",
  "line": 3255,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[id _:s <p> <o>].",
  "expectedError": "Expected IRI after id but got blank on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#456",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require an entity after id",
  "line": 3260,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[id ; <p> <o>].",
  "expectedError": "Expected entity but got ; on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#457",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require properties after an IRI property list ID",
  "line": 3265,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[id <s>].",
  "expectedError": "Expected predicate but got ] on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#458",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reject a semicolon after an IRI property list ID",
  "line": 3270,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[id <s>; <p> <o>].",
  "expectedError": "Expected predicate but got ; on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#459",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reject multiple IRI property list IDs",
  "line": 3275,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[id <s1>, <s2> <p> <o>].",
  "expectedError": "Expected entity but got , on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#460",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a variable",
  "line": 3280,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "?a ?b ?c.",
  "expected": [
   [
    "?a",
    "?b",
    "?c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#461",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a simple equality",
  "line": 3285,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> = <b>.",
  "expected": [
   [
    "a",
    "http://www.w3.org/2002/07/owl#sameAs",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#462",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse the has verb",
  "line": 3288,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> has <p> <o>.",
  "expected": [
   [
    "s",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#463",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse the is-of verb",
  "line": 3293,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> is <p> of <o>.",
  "expected": [
   [
    "o",
    "p",
    "s"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#464",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should preserve inversion across commas and reset it after a semicolon",
  "line": 3298,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> is <p> of <o1>, <o2>; <q> <r>.",
  "expected": [
   [
    "o1",
    "p",
    "s"
   ],
   [
    "o2",
    "p",
    "s"
   ],
   [
    "s",
    "q",
    "r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#465",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reset inverted predicate markers after a semicolon",
  "line": 3304,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <- <p> <o>; <q> <r>.",
  "expected": [
   [
    "o",
    "p",
    "s"
   ],
   [
    "s",
    "q",
    "r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#466",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should apply inversion when a blank node property list closes",
  "line": 3310,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[ is <p1> of <o1> ]. [ <- <p2> <o2> ].",
  "expected": [
   [
    "o1",
    "p1",
    "_:b0"
   ],
   [
    "o2",
    "p2",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#467",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should scope inversion across blank node property-list punctuation",
  "line": 3316,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[ is <p> of <o1>, <o2>; <q> <r> ].",
  "expected": [
   [
    "o1",
    "p",
    "_:b0"
   ],
   [
    "o2",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "q",
    "r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#468",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should apply and scope inversion inside formulas",
  "line": 3322,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ <s1> is <p1> of <o1> }. { <s2> is <p2> of <o2>; <q2> <r2> }.",
  "expected": [
   [
    "o1",
    "p1",
    "s1",
    "_:b0"
   ],
   [
    "o2",
    "p2",
    "s2",
    "_:b1"
   ],
   [
    "s2",
    "q2",
    "r2",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#469",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should apply inversion inside triple terms",
  "line": 3330,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<<( <s> is <p> of <o> )>> <q> <r>.",
  "expected": [
   [
    [
     "o",
     "p",
     "s"
    ],
    "q",
    "r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#470",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should apply inversion inside reified triples",
  "line": 3336,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<< <s> is <p> of <o> >> <q> <r>.",
  "expected": [
   [
    "_:b0",
    "q",
    "r"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "o",
     "p",
     "s"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#471",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should apply inversion to annotated triples without leaking into annotations",
  "line": 3342,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> is <p> of <o> {| <q> <r> |}.",
  "expected": [
   [
    "o",
    "p",
    "s"
   ],
   [
    "_:b0",
    "q",
    "r"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "o",
     "p",
     "s"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#472",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reset inversion after a reifier and semicolon",
  "line": 3348,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> is <p> of <o> ~ <t>; <q> <r>.",
  "expected": [
   [
    "o",
    "p",
    "s"
   ],
   [
    "t",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "o",
     "p",
     "s"
    ]
   ],
   [
    "s",
    "q",
    "r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#473",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse verb keywords after literal subjects",
  "line": 3354,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "\"s1\" has <p1> <o1>. \"s2\" is <p2> of <o2>.",
  "expected": [
   [
    "\"s1\"",
    "p1",
    "o1"
   ],
   [
    "o2",
    "p2",
    "\"s2\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#474",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an inverted predicate marker",
  "line": 3360,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <- <p> <o>. <-s> <-<-p> <-o>.",
  "expected": [
   [
    "o",
    "p",
    "s"
   ],
   [
    "-o",
    "-p",
    "-s"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#475",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an inverted compound predicate",
  "line": 3366,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <- (<a>) <o>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "o",
    "_:b0",
    "s"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#476",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should restore is-of state around a compound predicate",
  "line": 3374,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> is (<a> <b>) of <o>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "b"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "o",
    "_:b0",
    "s"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#477",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require of after an is predicate",
  "line": 3385,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> is <p> <o>.",
  "expectedError": "Expected of but got IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#478",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require an expression after has",
  "line": 3390,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> has has <o>.",
  "expectedError": "Expected expression but got has on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#479",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should require an expression after an inverted predicate marker",
  "line": 3395,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <- <- <p> <o>.",
  "expectedError": "Expected expression but got inversePredicate on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#480",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reject the historical @has keyword",
  "line": 3400,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> @has <p> <o>.",
  "expectedError": "Expected entity but got @has on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#481",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reject the historical @is and @of keywords",
  "line": 3405,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> @is <p> @of <o>.",
  "expectedError": "Expected entity but got @is on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#482",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a simple right implication",
  "line": 3410,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> => <b>.",
  "expected": [
   [
    "a",
    "http://www.w3.org/2000/10/swap/log#implies",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#483",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a simple left implication",
  "line": 3416,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <= <b>.",
  "expected": [
   [
    "b",
    "http://www.w3.org/2000/10/swap/log#implies",
    "a"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#484",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a simple left implication with isImpliedBy enabled",
  "line": 3422,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "isImpliedBy": true
  },
  "input": "<a> <= <b>.",
  "expected": [
   [
    "a",
    "http://www.w3.org/2000/10/swap/log#isImpliedBy",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#485",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a right implication between one-triple graphs",
  "line": 3428,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ ?a ?b <c>. } => { <d> <e> ?a }.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b1"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#486",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a right implication between one-triple graphs with isImpliedBy enabled",
  "line": 3436,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "isImpliedBy": true
  },
  "input": "{ ?a ?b <c>. } => { <d> <e> ?a }.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b1"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#487",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a right implication between two-triple graphs",
  "line": 3444,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ ?a ?b <c>. <d> <e> <f>. } => { <d> <e> ?a, <f> }.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b1"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "f",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ],
   [
    "d",
    "e",
    "f",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#488",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a left implication between one-triple graphs",
  "line": 3454,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ ?a ?b <c>. } <= { <d> <e> ?a }.",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b0"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#489",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a left implication between one-triple graphs with isImpliedBy enabled",
  "line": 3462,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "isImpliedBy": true
  },
  "input": "{ ?a ?b <c>. } <= { <d> <e> ?a }.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#isImpliedBy",
    "_:b1"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#490",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a left implication between two-triple graphs",
  "line": 3470,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ ?a ?b <c>. <d> <e> <f>. } <= { <d> <e> ?a, <f> }.",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b0"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "f",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ],
   [
    "d",
    "e",
    "f",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#491",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an equality of one-triple graphs",
  "line": 3480,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ ?a ?b <c>. } = { <d> <e> ?a }.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/2002/07/owl#sameAs",
    "_:b1"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#492",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an equality of two-triple graphs",
  "line": 3488,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ ?a ?b <c>. <d> <e> <f>. } = { <d> <e> ?a, <f> }.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/2002/07/owl#sameAs",
    "_:b1"
   ],
   [
    "?a",
    "?b",
    "c",
    "_:b0"
   ],
   [
    "d",
    "e",
    "f",
    "_:b0"
   ],
   [
    "d",
    "e",
    "?a",
    "_:b1"
   ],
   [
    "d",
    "e",
    "f",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#493",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse nested implication graphs",
  "line": 3498,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ { ?a ?b ?c }<={ ?d ?e ?f }. } <= { { ?g ?h ?i } => { ?j ?k ?l } }.",
  "expected": [
   [
    "_:b3",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b0"
   ],
   [
    "_:b2",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b1",
    "_:b0"
   ],
   [
    "?a",
    "?b",
    "?c",
    "_:b1"
   ],
   [
    "?d",
    "?e",
    "?f",
    "_:b2"
   ],
   [
    "_:b4",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b5",
    "_:b3"
   ],
   [
    "?g",
    "?h",
    "?i",
    "_:b4"
   ],
   [
    "?j",
    "?k",
    "?l",
    "_:b5"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#494",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an empty formula in the subject position as a blank node graph term",
  "line": 3510,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{} <b> <c>.",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#495",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an empty formula in the object position as a blank node graph term",
  "line": 3516,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> {}.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#496",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an empty formula mid-document without leaking the previous subject into it",
  "line": 3522,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<p> <q> <r>. {} <b> <c>.",
  "expected": [
   [
    "p",
    "q",
    "r"
   ],
   [
    "_:b0",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#497",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse empty formulas in the subject and object positions as distinct blank node graph terms",
  "line": 3529,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{} <b> {}.",
  "expected": [
   [
    "_:b0",
    "b",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#498",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an empty formula after a list subject without emitting a garbage quad",
  "line": 3535,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "() <http://www.w3.org/2000/10/swap/log#onNegativeSurface> { }.",
  "expected": [
   [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "http://www.w3.org/2000/10/swap/log#onNegativeSurface",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#499",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not reuse identifiers of blank nodes within and outside of formulas",
  "line": 3542,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "_:a _:b _:c. { _:a _:b _:c } => { { _:a _:b _:c } => { _:a _:b _:c } }.",
  "expected": [
   [
    "_:b0_a",
    "_:b0_b",
    "_:b0_c"
   ],
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b1",
    ""
   ],
   [
    "_:b0.a",
    "_:b0.b",
    "_:b0.c",
    "_:b0"
   ],
   [
    "_:b2",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b3",
    "_:b1"
   ],
   [
    "_:b2.a",
    "_:b2.b",
    "_:b2.c",
    "_:b2"
   ],
   [
    "_:b3.a",
    "_:b3.b",
    "_:b3.c",
    "_:b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#500",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should rescope a blank node in a list by default",
  "line": 3557,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> (_:a).",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:.a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#501",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not reuse identifiers of blank nodes within and outside of lists by default",
  "line": 3565,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> (_:a). _:a <b> <c>.",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:.a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0_a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#502",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not reuse identifiers of blank nodes within and outside of blank node property lists by default",
  "line": 3574,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "_:a <p> [ <q> _:a ].",
  "expected": [
   [
    "_:b0_a",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "q",
    "_:.a"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#503",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should scope blank nodes in a list to the enclosing formula by default",
  "line": 3581,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "_:a <p> <o>. { <s> <q> (_:a). _:a <r> <o2>. } <d> <e>.",
  "expected": [
   [
    "_:b0_a",
    "p",
    "o"
   ],
   [
    "s",
    "q",
    "_:b1",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b0.a",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "_:b0.a",
    "r",
    "o2",
    "_:b0"
   ],
   [
    "_:b0",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#504",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a blank node in a list with formulaScopedBlankNodes",
  "line": 3592,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "<s> <p> (_:a).",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b0_a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#505",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reuse identifiers of blank nodes within and outside of lists with formulaScopedBlankNodes",
  "line": 3600,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "<s> <p> (_:a). _:a <b> <c>.",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b0_a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0_a",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#506",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reuse identifiers of blank nodes within and outside of blank node property lists with formulaScopedBlankNodes",
  "line": 3609,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "_:a <p> [ <q> _:a ].",
  "expected": [
   [
    "_:b0_a",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "q",
    "_:b0_a"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#507",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reuse identifiers of blank nodes in nested lists and blank node property lists with formulaScopedBlankNodes (#660)",
  "line": 3616,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "_:a <p> ([ <q> _:a ] (_:a)).",
  "expected": [
   [
    "_:b0_a",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b1",
    "q",
    "_:b0_a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b0_a"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#508",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reuse identifiers of blank nodes within and outside of reified triples with formulaScopedBlankNodes",
  "line": 3629,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "_:a <p> << _:a <q> <o> >>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0_a",
     "q",
     "o"
    ]
   ],
   [
    "_:b0_a",
    "p",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#509",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should reuse identifiers of blank nodes within and outside of triple terms with formulaScopedBlankNodes",
  "line": 3636,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "_:a <p> <<( _:a <q> <o> )>>.",
  "expected": [
   [
    "_:b0_a",
    "p",
    [
     "_:b0_a",
     "q",
     "o"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#510",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should scope blank nodes in reified triples and triple terms to the enclosing formula with formulaScopedBlankNodes",
  "line": 3642,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "_:a <p> <o>. { _:a <p> << _:a <q> <o> >>. _:a <p> <<( _:a <q> <o> )>>. } <d> <e>.",
  "expected": [
   [
    "_:b0_a",
    "p",
    "o"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "_:b0.a",
     "q",
     "o"
    ],
    "_:b0"
   ],
   [
    "_:b0.a",
    "p",
    "_:b1",
    "_:b0"
   ],
   [
    "_:b0.a",
    "p",
    [
     "_:b0.a",
     "q",
     "o"
    ],
    "_:b0"
   ],
   [
    "_:b0",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#511",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should scope blank nodes in a list to the enclosing formula with formulaScopedBlankNodes",
  "line": 3652,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "formulaScopedBlankNodes": true
  },
  "input": "_:a <p> <o>. { <s> <q> (_:a). _:a <r> <o2>. } <d> <e>.",
  "expected": [
   [
    "_:b0_a",
    "p",
    "o"
   ],
   [
    "s",
    "q",
    "_:b1",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b0.a",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "_:b0.a",
    "r",
    "o2",
    "_:b0"
   ],
   [
    "_:b0",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#512",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a @forSome statement",
  "line": 3663,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forSome <x>. <x> <x> <x>.",
  "expected": [
   [
    "_:b0",
    "_:b0",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#513",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a @forSome statement with multiple entities",
  "line": 3669,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix a: <a:>. @base <b:>. @forSome a:x, <y>, a:z. a:x <y> a:z.",
  "expected": [
   [
    "_:b0",
    "_:b1",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#514",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a @forSome statement with an invalid prefix",
  "line": 3675,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forSome a:b.",
  "expectedError": "Undefined prefix \"a:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#515",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a @forSome statement with a blank node",
  "line": 3681,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forSome _:a.",
  "expectedError": "Unexpected blank on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#516",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a @forSome statement with a variable",
  "line": 3687,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forSome ?a.",
  "expectedError": "Unexpected var on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#517",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should correctly scope @forSome statements",
  "line": 3693,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forSome <x>. <x> <x> { @forSome <x>. <x> <x> <x>. }. <x> <x> <x>.",
  "expected": [
   [
    "_:b0",
    "_:b0",
    "_:b1"
   ],
   [
    "_:b2",
    "_:b2",
    "_:b2",
    "_:b1"
   ],
   [
    "_:b0",
    "_:b0",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#518",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a @forAll statement",
  "line": 3701,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forAll  <x>. <x> <x> <x>.",
  "expected": [
   [
    "?b0",
    "?b0",
    "?b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#519",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a @forAll statement with multiple entities",
  "line": 3707,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix a: <a:>. @base <b:>. @forAll  a:x, <y>, a:z. a:x <y> a:z.",
  "expected": [
   [
    "?b0",
    "?b1",
    "?b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#520",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a @forAll statement with an invalid prefix",
  "line": 3713,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forAll a:b.",
  "expectedError": "Undefined prefix \"a:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#521",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a @forAll statement with a blank node",
  "line": 3719,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forAll _:a.",
  "expectedError": "Unexpected blank on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#522",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a @forAll statement with a variable",
  "line": 3725,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forAll ?a.",
  "expectedError": "Unexpected var on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#523",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should correctly scope @forAll statements",
  "line": 3731,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forAll <x>. <x> <x> { @forAll <x>. <x> <x> <x>. }. <x> <x> <x>.",
  "expected": [
   [
    "?b0",
    "?b0",
    "_:b1"
   ],
   [
    "?b2",
    "?b2",
    "?b2",
    "_:b1"
   ],
   [
    "?b0",
    "?b0",
    "?b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#524",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path of length 2 as subject",
  "line": 3739,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.:joe!fam:mother a fam:Person.",
  "expected": [
   [
    "ex:joe",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#525",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path of length 4 as subject",
  "line": 3747,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>. @prefix loc: <l:>.:joe!fam:mother!loc:office!loc:zip loc:code 1234.",
  "expected": [
   [
    "ex:joe",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b0",
    "l:office",
    "_:b1"
   ],
   [
    "_:b1",
    "l:zip",
    "_:b2"
   ],
   [
    "_:b2",
    "l:code",
    "\"1234\"^^http://www.w3.org/2001/XMLSchema#integer"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#526",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path of length 2 as object",
  "line": 3757,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<x> <is> :joe!fam:mother.",
  "expected": [
   [
    "x",
    "is",
    "_:b0"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#527",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path of length 4 as object",
  "line": 3765,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>. @prefix loc: <l:>.<x> <is> :joe!fam:mother!loc:office!loc:zip.",
  "expected": [
   [
    "x",
    "is",
    "_:b2"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b0",
    "l:office",
    "_:b1"
   ],
   [
    "_:b1",
    "l:zip",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#528",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path of length 2 as subject",
  "line": 3775,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.:joe^fam:son a fam:Person.",
  "expected": [
   [
    "_:b0",
    "f:son",
    "ex:joe"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#529",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path of length 4 as subject",
  "line": 3783,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.:joe^fam:son^fam:sister^fam:mother a fam:Person.",
  "expected": [
   [
    "_:b0",
    "f:son",
    "ex:joe"
   ],
   [
    "_:b1",
    "f:sister",
    "_:b0"
   ],
   [
    "_:b2",
    "f:mother",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#530",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path of length 2 as object",
  "line": 3793,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<x> <is> :joe^fam:son.",
  "expected": [
   [
    "x",
    "is",
    "_:b0"
   ],
   [
    "_:b0",
    "f:son",
    "ex:joe"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#531",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path of length 4 as object",
  "line": 3801,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<x> <is> :joe^fam:son^fam:sister^fam:mother.",
  "expected": [
   [
    "x",
    "is",
    "_:b2"
   ],
   [
    "_:b0",
    "f:son",
    "ex:joe"
   ],
   [
    "_:b1",
    "f:sister",
    "_:b0"
   ],
   [
    "_:b2",
    "f:mother",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#532",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse mixed !/^ paths as subject",
  "line": 3811,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.:joe!fam:mother^fam:mother a fam:Person.",
  "expected": [
   [
    "ex:joe",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b1",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#533",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse mixed !/^ paths as object",
  "line": 3820,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<x> <is> :joe!fam:mother^fam:mother.",
  "expected": [
   [
    "x",
    "is",
    "_:b1"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b1",
    "f:mother",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#534",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path in a blank node as subject",
  "line": 3829,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.[fam:knows :joe!fam:mother] a fam:Person.",
  "expected": [
   [
    "_:b0",
    "f:knows",
    "_:b1"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#535",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path in a blank node as object",
  "line": 3838,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<x> <is> [fam:knows :joe!fam:mother].",
  "expected": [
   [
    "x",
    "is",
    "_:b0"
   ],
   [
    "_:b0",
    "f:knows",
    "_:b1"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#536",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path in a blank node as subject",
  "line": 3847,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.[fam:knows :joe^fam:son] a fam:Person.",
  "expected": [
   [
    "_:b0",
    "f:knows",
    "_:b1"
   ],
   [
    "_:b1",
    "f:son",
    "ex:joe"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#537",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path in a blank node as object",
  "line": 3856,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<x> <is> [fam:knows :joe^fam:son].",
  "expected": [
   [
    "x",
    "is",
    "_:b0"
   ],
   [
    "_:b0",
    "f:knows",
    "_:b1"
   ],
   [
    "_:b1",
    "f:son",
    "ex:joe"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#538",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse statements with an empty list in the predicate",
  "line": 3865,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> () <b>.",
  "expected": [
   [
    "a",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#539",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse statements with a single-element list in the predicate",
  "line": 3871,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> (<p>) <b>.",
  "expected": [
   [
    "a",
    "_:b0",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#540",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse statements with a multi-element list in the predicate",
  "line": 3879,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> (<p> <q>) <b>.",
  "expected": [
   [
    "a",
    "_:b0",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "q"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#541",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse statements with a nested list in the predicate",
  "line": 3889,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> ((<p>) <q>) <b>.",
  "expected": [
   [
    "a",
    "_:b0",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "q"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#542",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse statements after a list in the predicate",
  "line": 3901,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> (<p>) <b>. <c> <d> <e>.",
  "expected": [
   [
    "a",
    "_:b0",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "c",
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#543",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a list in the predicate within a formula",
  "line": 3910,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ <a> (<p>) <b>. } => { <a> <b> <c>. }.",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "a",
    "_:b1",
    "b",
    "_:b0"
   ],
   [
    "a",
    "b",
    "c",
    "_:b2"
   ],
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#544",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path in a list as predicate",
  "line": 3920,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<l> (:joe!fam:mother) <m>.",
  "expected": [
   [
    "l",
    "_:b0",
    "m"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#545",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse nested lists in the subject, predicate, and object simultaneously",
  "line": 3930,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "((<a>) (<b> (<c>))) ((<p>)) ((<x> (<y>))).",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "b"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b4"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b5"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b5",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "c"
   ],
   [
    "_:b5",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b6",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b7"
   ],
   [
    "_:b6",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b7",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p"
   ],
   [
    "_:b7",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b8",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b9"
   ],
   [
    "_:b8",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b9",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b9",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b10"
   ],
   [
    "_:b10",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b11"
   ],
   [
    "_:b10",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b11",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b11",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "_:b6",
    "_:b8"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#546",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a triple-nested list in the predicate",
  "line": 3962,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> (((<p>))) <b>.",
  "expected": [
   [
    "a",
    "_:b0",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#547",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a nested list in the predicate within a formula",
  "line": 3974,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> { <a> ((<q>)) <b>. }.",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "a",
    "_:b1",
    "b",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "q",
    "_:b0"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#548",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse empty lists at each depth and position",
  "line": 3986,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "(()) (() ()) ((() ())).",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b4"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b5"
   ],
   [
    "_:b5",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b5",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "_:b1",
    "_:b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#549",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse lists in every position of a statement in a formula",
  "line": 4005,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "{ (<a>) (<p>) (<b>). } => { <x> <y> <z>. }.",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "p",
    "_:b0"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "b",
    "_:b0"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "_:b1",
    "_:b2",
    "_:b3",
    "_:b0"
   ],
   [
    "x",
    "y",
    "z",
    "_:b4"
   ],
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b4"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#550",
  "path": [
   "Parser",
   "A Parser instance for the N3 format",
   "nested lists across all positions"
  ],
  "name": "(dynamic name)",
  "line": 4058,
  "kind": "code-dynamic"
 },
 {
  "id": "N3Parser-test.js#551",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path in a list as subject",
  "line": 4109,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.(<x> :joe!fam:mother <y>) a :List.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "ex:List"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#552",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path in a list as object",
  "line": 4123,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<l> <is> (<x> :joe!fam:mother <y>).",
  "expected": [
   [
    "l",
    "is",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "ex:joe",
    "f:mother",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#553",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path in a list as subject",
  "line": 4137,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.(<x> :joe^fam:son <y>) a :List.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "ex:List"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b2",
    "f:son",
    "ex:joe"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#554",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path in a list as object",
  "line": 4151,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>.<l> <is> (<x> :joe^fam:son <y>).",
  "expected": [
   [
    "l",
    "is",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b2",
    "f:son",
    "ex:joe"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#555",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula as list item",
  "line": 4165,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <findAll> ( <b> { <b> a <type>. <b> <something> <foo> } <o> ).",
  "expected": [
   [
    "a",
    "findAll",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "b"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "o"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "b",
    "something",
    "foo",
    "_:b2"
   ],
   [
    "b",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "type",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#556",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula as only list item",
  "line": 4180,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> ({<a> <b> <c>}) .",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#557",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula in a list as subject",
  "line": 4190,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "({<a> <b> <c>}) <p> <o> .",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b1"
   ],
   [
    "_:b0",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#558",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse two formulas in one list",
  "line": 4200,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> ({<a> <b> <c>} {<d> <e> <f>}) .",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b1"
   ],
   [
    "d",
    "e",
    "f",
    "_:b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#559",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula between other list items",
  "line": 4213,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> (<x> {<a> <b> <c>} <y>) .",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#560",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a list inside a formula inside a list",
  "line": 4227,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> ( { <a> <b> ( <c> ) } ).",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "_:b2",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "c",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#561",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse alternating list-formula nesting three levels deep",
  "line": 4241,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> ( { <a> <b> ( { <c> <d> ( <e> ) } ) } ).",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "_:b2",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b1"
   ],
   [
    "c",
    "d",
    "_:b4",
    "_:b3"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "e",
    "_:b3"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#562",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a subject list containing a formula containing a list containing a formula",
  "line": 4257,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "( { <a> <b> ( { <c> <d> <e> } ) } ) <p> <o>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "p",
    "o"
   ],
   [
    "a",
    "b",
    "_:b2",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b1"
   ],
   [
    "c",
    "d",
    "e",
    "_:b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#563",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula containing a list of formulas",
  "line": 4270,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> { <a> <b> ( { <c> <d> <e> } { <f> <g> <h> } ) }.",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "a",
    "b",
    "_:b1",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2",
    "_:b0"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3",
    "_:b0"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b4",
    "_:b0"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b0"
   ],
   [
    "c",
    "d",
    "e",
    "_:b2"
   ],
   [
    "f",
    "g",
    "h",
    "_:b4"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#564",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula inside a nested list",
  "line": 4284,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> ( ( <x> { <a> <b> <c> } ) <y> ).",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b4"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "y"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#565",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse formulas in subject and object lists of the same triple",
  "line": 4300,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "( { <a> <b> <c> } ) <p> ( { <d> <e> <f> } ).",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "p",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b1"
   ],
   [
    "d",
    "e",
    "f",
    "_:b3"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#566",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse adjacent formulas in a nested list",
  "line": 4313,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<s> <p> ( ( { <a> <b> <c> } { <d> <e> <f> } ) ).",
  "expected": [
   [
    "s",
    "p",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b4"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b2"
   ],
   [
    "d",
    "e",
    "f",
    "_:b4"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#567",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a formula in a list in a blank node property list",
  "line": 4328,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "[ <p> ( { <a> <b> <c> } ) ] <q> <o>.",
  "expected": [
   [
    "_:b0",
    "p",
    "_:b1"
   ],
   [
    "_:b0",
    "q",
    "o"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "c",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#568",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an existentially quantified variable inside a formula in a list",
  "line": 4339,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@forSome <x>. <s> <p> ( { <x> <b> <c> } ).",
  "expected": [
   [
    "s",
    "p",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "b",
    "c",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#569",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse an invalid ! path",
  "line": 4350,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a>!\"invalid\" ",
  "expectedError": "Expected entity but got literal on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#570",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse an invalid ^ path",
  "line": 4355,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a>^\"invalid\" ",
  "expectedError": "Expected entity but got literal on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#571",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse an incomplete statement starting with a literal",
  "line": 4360,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "\"lit\" <p> ",
  "expectedError": "Expected entity but got eof on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#572",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path of length 2 starting with a literal as subject",
  "line": 4370,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix fam: <f:>. \"lit\"!fam:mother a fam:Person.",
  "expected": [
   [
    "\"lit\"",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#573",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path of length 2 starting with a literal as subject",
  "line": 4378,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix fam: <f:>. \"lit\"^fam:son a fam:Person.",
  "expected": [
   [
    "_:b0",
    "f:son",
    "\"lit\""
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#574",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a statement consisting of only a ^ path starting with a literal",
  "line": 4387,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix log: <l:>. \"Some message\"^log:trace .",
  "expected": [
   [
    "_:b0",
    "l:trace",
    "\"Some message\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#575",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a statement consisting of only a ! path",
  "line": 4394,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>. :joe!fam:mother .",
  "expected": [
   [
    "ex:joe",
    "f:mother",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#576",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a datatyped literal as subject",
  "line": 4401,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. @prefix fam: <f:>. \"x\"^^:dt!fam:mother a fam:Person.",
  "expected": [
   [
    "\"x\"^^ex:dt",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#577",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a language-tagged literal as subject",
  "line": 4409,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix fam: <f:>. \"x\"@en!fam:mother a fam:Person.",
  "expected": [
   [
    "\"x\"@en",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#578",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a directional language-tagged literal as subject",
  "line": 4417,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix fam: <f:>. \"x\"@en--ltr!fam:mother a fam:Person.",
  "expected": [
   [
    "\"x\"@en--ltr",
    "f:mother",
    "_:b0"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "f:Person"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#579",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a number as subject",
  "line": 4425,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. 1!:p :q :r.",
  "expected": [
   [
    "\"1\"^^http://www.w3.org/2001/XMLSchema#integer",
    "ex:p",
    "_:b0"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#580",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a boolean as subject",
  "line": 4433,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. true!:p :q :r.",
  "expected": [
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "ex:p",
    "_:b0"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#581",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a blank node as subject",
  "line": 4441,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. _:m!:p :q :r.",
  "expected": [
   [
    "_:b0_m",
    "ex:p",
    "_:b0"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#582",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path of length 2 starting with a literal as object",
  "line": 4449,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. :a :b \"lit\"!:p.",
  "expected": [
   [
    "\"lit\"",
    "ex:p",
    "_:b0"
   ],
   [
    "ex:a",
    "ex:b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#583",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path of length 2 starting with a literal as object",
  "line": 4457,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. :a :b \"lit\"^:p.",
  "expected": [
   [
    "_:b0",
    "ex:p",
    "\"lit\""
   ],
   [
    "ex:a",
    "ex:b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#584",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a datatyped literal as object",
  "line": 4465,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. :a :b \"x\"^^:dt!:p.",
  "expected": [
   [
    "\"x\"^^ex:dt",
    "ex:p",
    "_:b0"
   ],
   [
    "ex:a",
    "ex:b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#585",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a language-tagged literal as object",
  "line": 4473,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. :a :b \"x\"@en!:p.",
  "expected": [
   [
    "\"x\"@en",
    "ex:p",
    "_:b0"
   ],
   [
    "ex:a",
    "ex:b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#586",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a number as object",
  "line": 4481,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. :a :b 1!:p.",
  "expected": [
   [
    "\"1\"^^http://www.w3.org/2001/XMLSchema#integer",
    "ex:p",
    "_:b0"
   ],
   [
    "ex:a",
    "ex:b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#587",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a list as subject",
  "line": 4489,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. (:a)!:p :q :r.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "ex:a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "ex:p",
    "_:b1"
   ],
   [
    "_:b1",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#588",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ^ path starting with a list as subject",
  "line": 4499,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. (:a)^:p :q :r.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "ex:a"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "ex:p",
    "_:b0"
   ],
   [
    "_:b1",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#589",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a list as object",
  "line": 4509,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. :a :b (:x)!:p.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "ex:x"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "ex:p",
    "_:b1"
   ],
   [
    "ex:a",
    "ex:b",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#590",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with an empty list as subject",
  "line": 4519,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. ()!:p :q :r.",
  "expected": [
   [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "ex:p",
    "_:b0"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#591",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with an empty list as object",
  "line": 4527,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. :a :b ()!:p.",
  "expected": [
   [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "ex:p",
    "_:b0"
   ],
   [
    "ex:a",
    "ex:b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#592",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a list inside a list",
  "line": 4536,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. ((:a)!:p :b) :q :r.",
  "expected": [
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "ex:a"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b1",
    "ex:p",
    "_:b2"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b2"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b3"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "ex:b"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#593",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with an empty list inside a list",
  "line": 4551,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. (()!:p) :q :r.",
  "expected": [
   [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "ex:p",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#594",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a variable inside a list",
  "line": 4561,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. (?v!:p) :q :r.",
  "expected": [
   [
    "?v",
    "ex:p",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#595",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse ! and ^ paths starting with literals inside a list",
  "line": 4573,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. (\"s\"!:p 1^:q) a :List.",
  "expected": [
   [
    "\"s\"",
    "ex:p",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b3",
    "ex:q",
    "\"1\"^^http://www.w3.org/2001/XMLSchema#integer"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b3"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "ex:List"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#596",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a datatyped literal inside a list",
  "line": 4586,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. (\"x\"^^:dt) :q :r.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"x\"^^ex:dt"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#597",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a ! path starting with a blank node inside a list",
  "line": 4596,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. (_:m!:p) :q :r.",
  "expected": [
   [
    "_:.m",
    "ex:p",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b1"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "ex:q",
    "ex:r"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#598",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a statement consisting of only a ! path inside a formula",
  "line": 4607,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix : <ex:>. { :a!:b } => { :c :d :e }.",
  "expected": [
   [
    "ex:a",
    "ex:b",
    "_:b1",
    "_:b0"
   ],
   [
    "ex:c",
    "ex:d",
    "ex:e",
    "_:b2"
   ],
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b2"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#599",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a rule with paths starting with variables and lists inside lists",
  "line": 4620,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "@prefix foaf: <http://xmlns.com/foaf/0.1/> .@prefix math: <http://www.w3.org/2000/10/swap/math#> .@prefix : <http://example.org/> .{ ?x :trueOnDate ?date. } <= { ((?date ?s!foaf:birthday)!math:difference 31622400) math:integerQuotient ?age . } .",
  "expected": [
   [
    "?x",
    "http://example.org/trueOnDate",
    "?date",
    "_:b0"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "?date",
    "_:b1"
   ],
   [
    "_:b3",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b4",
    "_:b1"
   ],
   [
    "?s",
    "http://xmlns.com/foaf/0.1/birthday",
    "_:b5",
    "_:b1"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b5",
    "_:b1"
   ],
   [
    "_:b4",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b1"
   ],
   [
    "_:b3",
    "http://www.w3.org/2000/10/swap/math#difference",
    "_:b6",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "_:b6",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b7",
    "_:b1"
   ],
   [
    "_:b7",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"31622400\"^^http://www.w3.org/2001/XMLSchema#integer",
    "_:b1"
   ],
   [
    "_:b7",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "_:b1"
   ],
   [
    "_:b2",
    "http://www.w3.org/2000/10/swap/math#integerQuotient",
    "?age",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#600",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse literal as subject",
  "line": 4642,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> {1 <greaterThan> 0}.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "\"1\"^^http://www.w3.org/2001/XMLSchema#integer",
    "greaterThan",
    "\"0\"^^http://www.w3.org/2001/XMLSchema#integer",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#601",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse literals with datatype as subject",
  "line": 4650,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> {\"a\"^^<c> <greaterThan> \"b\"^^<c>}.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "\"a\"^^http://example.org/c",
    "greaterThan",
    "\"b\"^^http://example.org/c",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#602",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse literals with language as subject",
  "line": 4658,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> {\"bonjour\"@fr <sameAs> \"hello\"@en}.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "\"bonjour\"@fr",
    "sameAs",
    "\"hello\"@en",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#603",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse literals with language and direction as subject",
  "line": 4666,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> {\"bonjour\"@fr--ltr <sameAs> \"hello\"@en--rtl}.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "\"bonjour\"@fr--ltr",
    "sameAs",
    "\"hello\"@en--rtl",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#604",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an integer literal as subject",
  "line": 4674,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "1 <a> <b>.",
  "expected": [
   [
    "\"1\"^^http://www.w3.org/2001/XMLSchema#integer",
    "a",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#605",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a string literal as subject",
  "line": 4680,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "\"1\" <a> <b>.",
  "expected": [
   [
    "\"1\"",
    "a",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#606",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a string literal as subject of a formula",
  "line": 4686,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> {\"1\" <c> \"2\"}.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "\"1\"",
    "c",
    "\"2\"",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#607",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a string literal as subject of a formula in a blank node",
  "line": 4694,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> [ <c> {\"1\" <d> \"2\"} ].",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "_:b0",
    "c",
    "_:b1"
   ],
   [
    "\"1\"",
    "d",
    "\"2\"",
    "_:b1"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#608",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a string literal as subject list element",
  "line": 4703,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "(\"1\") <a> <b>.",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"1\""
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "_:b0",
    "a",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#609",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a string literal as object list element",
  "line": 4712,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> (\"1\").",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "\"1\""
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
   ],
   [
    "a",
    "b",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#610",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a string literal as subject with an undefined datatype prefix",
  "line": 4721,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "\"1\"^^p:x <a> <b>.",
  "expectedError": "Undefined prefix \"p:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#611",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse an integer literal as predicate",
  "line": 4727,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> 1 <b>.",
  "expected": [
   [
    "a",
    "\"1\"^^http://www.w3.org/2001/XMLSchema#integer",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#612",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a string literal as predicate",
  "line": 4733,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> \"1\" <b>.",
  "expected": [
   [
    "a",
    "\"1\"",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#613",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a string literal as object",
  "line": 4739,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> <b> \"1\".",
  "expected": [
   [
    "a",
    "b",
    "\"1\""
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#614",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a literal with datatype as predicate",
  "line": 4745,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> \"1\"^^<c> <b>.",
  "expected": [
   [
    "a",
    "\"1\"^^http://example.org/c",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#615",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a literal with language as predicate",
  "line": 4751,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> \"one\"@en <b>.",
  "expected": [
   [
    "a",
    "\"one\"@en",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#616",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a literal with language and direction as predicate",
  "line": 4757,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> \"one\"@en--ltr <b>.",
  "expected": [
   [
    "a",
    "\"one\"@en--ltr",
    "b"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#617",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should not parse a string literal as predicate with an undefined datatype prefix",
  "line": 4763,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<a> \"1\"^^p:x <b>.",
  "expectedError": "Undefined prefix \"p:\" on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#618",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse a triple term with iris as subject correctly",
  "line": 4769,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<<(<a> <b> <c>)>> <b> <c>.",
  "expected": [
   [
    [
     "a",
     "b",
     "c"
    ],
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#619",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse nested triple terms in subject correctly",
  "line": 4775,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<<(<<(<a> <b> <c>)>> <f> <g>)>> <d> <e>.",
  "expected": [
   [
    [
     [
      "a",
      "b",
      "c"
     ],
     "f",
     "g"
    ],
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#620",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse nested triple terms in subject and object correctly",
  "line": 4781,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<<(<f> <g> <<(<a> <b> <c>)>>)>> <d> <e>.",
  "expected": [
   [
    [
     "f",
     "g",
     [
      "a",
      "b",
      "c"
     ]
    ],
    "d",
    "e"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#621",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse nested triple terms in object and subject correctly",
  "line": 4787,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<d> <e> <<(<<(<a> <b> <c>)>> <f> <g>)>>.",
  "expected": [
   [
    "d",
    "e",
    [
     [
      "a",
      "b",
      "c"
     ],
     "f",
     "g"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#622",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse statements with a shared triple term subject",
  "line": 4793,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<<(<a> <b> <c>)>> <b> <c>;\n<d> <c>.",
  "expected": [
   [
    [
     "a",
     "b",
     "c"
    ],
    "b",
    "c"
   ],
   [
    [
     "a",
     "b",
     "c"
    ],
    "d",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#623",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should parse statements with a shared triple term subject and triple term object",
  "line": 4800,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3"
  },
  "input": "<<(<a> <b> <c>)>> <b> <c>;\n<d> <<(<a> <b> <c>)>>.",
  "expected": [
   [
    [
     "a",
     "b",
     "c"
    ],
    "b",
    "c"
   ],
   [
    [
     "a",
     "b",
     "c"
    ],
    "d",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#624",
  "path": [
   "Parser",
   "A Parser instance for the N3 format"
  ],
  "name": "should throw when a triple term does not terminate correctly",
  "line": 4807,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#625",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula in the subject position as the boolean literal true",
  "line": 4819,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "{} <b> <c>.",
  "expected": [
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#626",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula with whitespace in the subject position as the boolean literal true",
  "line": 4825,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "{ } <p> <o>.",
  "expected": [
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "p",
    "o"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#627",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula in the object position as the boolean literal true",
  "line": 4831,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "<a> <b> {}.",
  "expected": [
   [
    "a",
    "b",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#628",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula in the predicate position as the boolean literal true",
  "line": 4837,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "<a> {} <c>.",
  "expected": [
   [
    "a",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#629",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula in the subject position mid-document as the boolean literal true",
  "line": 4843,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "<p> <q> <r>. {} <b> <c>.",
  "expected": [
   [
    "p",
    "q",
    "r"
   ],
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "b",
    "c"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#630",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse empty formulas in the subject and object positions as the boolean literal true",
  "line": 4850,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "{} <b> {}.",
  "expected": [
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "b",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#631",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse a right implication with an empty formula as antecedent",
  "line": 4856,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "{} => true.",
  "expected": [
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "http://www.w3.org/2000/10/swap/log#implies",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#632",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse a left implication with an empty formula as consequent",
  "line": 4862,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "{ <a> <b> <c> } <= {}.",
  "expected": [
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "http://www.w3.org/2000/10/swap/log#implies",
    "_:b0"
   ],
   [
    "a",
    "b",
    "c",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#633",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse a left implication between empty formulas",
  "line": 4869,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true,
   "isImpliedBy": true
  },
  "input": "{} <= {}.",
  "expected": [
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "http://www.w3.org/2000/10/swap/log#isImpliedBy",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#634",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula as the object of an empty list subject",
  "line": 4875,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "() <http://www.w3.org/2000/10/swap/log#onNegativeSurface> { }.",
  "expected": [
   [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "http://www.w3.org/2000/10/swap/log#onNegativeSurface",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#635",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula as the object of a blank node property",
  "line": 4881,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "[ <p> {} ].",
  "expected": [
   [
    "_:b0",
    "p",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#636",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula in the object position within a formula",
  "line": 4887,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "<a> <b> { <x> <y> {} }.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "x",
    "y",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#637",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should parse an empty formula in the subject position within a formula",
  "line": 4894,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "<a> <b> { {} <y> <z> }.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "y",
    "z",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#638",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should not parse a formula with a trailing dot as the boolean literal true",
  "line": 4901,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "<a> <b> { <x> <y> <z>. }.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "x",
    "y",
    "z",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#639",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should not parse a formula with a trailing semicolon as the boolean literal true",
  "line": 4908,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "<a> <b> { <x> <y> <z>; }.",
  "expected": [
   [
    "a",
    "b",
    "_:b0"
   ],
   [
    "x",
    "y",
    "z",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#640",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should pass the N3 spec test \"Empty Graph Eval\"",
  "line": 4920,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "@prefix : <http://example.com/> .\n\n:a :b {} .",
  "expected": [
   [
    "http://example.com/a",
    "http://example.com/b",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#641",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the emptyFormulaAsTrue option"
  ],
  "name": "should pass the N3 spec test \"Empty Graph Implies Eval\"",
  "line": 4927,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "emptyFormulaAsTrue": true
  },
  "input": "{\n  {} => {}\n} => {} .",
  "expected": [
   [
    "_:b0",
    "http://www.w3.org/2000/10/swap/log#implies",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean"
   ],
   [
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "http://www.w3.org/2000/10/swap/log#implies",
    "\"true\"^^http://www.w3.org/2001/XMLSchema#boolean",
    "_:b0"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#642",
  "path": [
   "Parser",
   "A Parser instance for the N3Star format"
  ],
  "name": "should parse a triple term",
  "line": 4939,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3Star"
  },
  "input": "<a> <b> <<(<a> <b> <c>)>>.",
  "expected": [
   [
    "a",
    "b",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#643",
  "path": [
   "Parser",
   "A Parser instance for the N3Star format"
  ],
  "name": "should parse a reified triple",
  "line": 4942,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3Star"
  },
  "input": "<<<a> <b> <c>>> <b> <c> .",
  "expected": [
   [
    "_:b0",
    "b",
    "c"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies",
    [
     "a",
     "b",
     "c"
    ]
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#644",
  "path": [
   "Parser",
   "A Parser instance for the N3Star format"
  ],
  "name": "should not parse nested quads",
  "line": 4947,
  "kind": "not-parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3Star"
  },
  "input": "<<_:a <http://ex.org/b> _:b <http://ex.org/b>>> <http://ex.org/b> \"c\" .",
  "expectedError": "Expected >> but got IRI on line 1.",
  "expectedContext": null
 },
 {
  "id": "N3Parser-test.js#645",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the explicitQuantifiers option"
  ],
  "name": "should parse a @forSome statement",
  "line": 4957,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "explicitQuantifiers": true
  },
  "input": "@forSome <x>. <x> <x> <x>.",
  "expected": [
   [
    "",
    "http://www.w3.org/2000/10/swap/reify#forSome",
    "_:b0",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "x",
    "x",
    "x"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#646",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the explicitQuantifiers option"
  ],
  "name": "should parse a @forSome statement with multiple entities",
  "line": 4966,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "explicitQuantifiers": true
  },
  "input": "@prefix a: <a:>. @base <b:>. @forSome a:x, <y>, a:z. a:x <y> a:z.",
  "expected": [
   [
    "",
    "http://www.w3.org/2000/10/swap/reify#forSome",
    "_:b0",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a:x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1",
    "urn:n3:quantifiers"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "b:y",
    "urn:n3:quantifiers"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a:z",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "a:x",
    "b:y",
    "a:z"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#647",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the explicitQuantifiers option"
  ],
  "name": "should correctly scope @forSome statements",
  "line": 4979,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "explicitQuantifiers": true
  },
  "input": "@forSome <x>. <x> <x> { @forSome <x>. <x> <x> <x>. }. <x> <x> <x>.",
  "expected": [
   [
    "",
    "http://www.w3.org/2000/10/swap/reify#forSome",
    "_:b0",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "x",
    "x",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/2000/10/swap/reify#forSome",
    "_:b2",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "x",
    "x",
    "x",
    "_:b1"
   ],
   [
    "x",
    "x",
    "x"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#648",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the explicitQuantifiers option"
  ],
  "name": "should parse a @forAll statement",
  "line": 4993,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "explicitQuantifiers": true
  },
  "input": "@forAll <x>. <x> <x> <x>.",
  "expected": [
   [
    "",
    "http://www.w3.org/2000/10/swap/reify#forAll",
    "_:b0",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "x",
    "x",
    "x"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#649",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the explicitQuantifiers option"
  ],
  "name": "should parse a @forAll statement with multiple entities",
  "line": 5002,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "explicitQuantifiers": true
  },
  "input": "@prefix a: <a:>. @base <b:>. @forAll a:x, <y>, a:z. a:x <y> a:z.",
  "expected": [
   [
    "",
    "http://www.w3.org/2000/10/swap/reify#forAll",
    "_:b0",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a:x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b1",
    "urn:n3:quantifiers"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "b:y",
    "urn:n3:quantifiers"
   ],
   [
    "_:b1",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "_:b2",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "a:z",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "a:x",
    "b:y",
    "a:z"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#650",
  "path": [
   "Parser",
   "A Parser instance for the N3 format with the explicitQuantifiers option"
  ],
  "name": "should correctly scope @forAll statements",
  "line": 5015,
  "kind": "parse",
  "options": {
   "baseIRI": "http://example.org/",
   "format": "N3",
   "explicitQuantifiers": true
  },
  "input": "@forAll <x>. <x> <x> { @forAll <x>. <x> <x> <x>. }. <x> <x> <x>.",
  "expected": [
   [
    "",
    "http://www.w3.org/2000/10/swap/reify#forAll",
    "_:b0",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b0",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "x",
    "x",
    "_:b1"
   ],
   [
    "_:b1",
    "http://www.w3.org/2000/10/swap/reify#forAll",
    "_:b2",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    "x",
    "urn:n3:quantifiers"
   ],
   [
    "_:b2",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    "urn:n3:quantifiers"
   ],
   [
    "x",
    "x",
    "x",
    "_:b1"
   ],
   [
    "x",
    "x",
    "x"
   ]
  ]
 },
 {
  "id": "N3Parser-test.js#651",
  "path": [
   "Parser",
   "A Parser instance with a custom DataFactory"
  ],
  "name": "should use the custom factory",
  "line": 5041,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#652",
  "path": [
   "Parser",
   "A parser instance with external data factory"
  ],
  "name": "should parse",
  "line": 5050,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#653",
  "path": [
   "Parser",
   "A parser instance with external data factory"
  ],
  "name": "should use the internal `this` state",
  "line": 5087,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#654",
  "path": [
   "Parser",
   "A turtle parser instance with external data factory"
  ],
  "name": "should parse",
  "line": 5132,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#655",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "parses triple terms nested up to 1024 levels by default",
  "line": 5183,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#656",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "parses triple terms that the Store and Writer can process at the default limit",
  "line": 5191,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#657",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "rejects triple terms nested deeper than 1024 levels by default",
  "line": 5198,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#658",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "rejects triple terms nested deeper than maxTripleTermDepth",
  "line": 5203,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#659",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "limits triple terms in subject position",
  "line": 5210,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#660",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "limits triple terms in lists",
  "line": 5217,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#661",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "limits reified triples",
  "line": 5226,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#662",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "counts the depth of the current triple term only",
  "line": 5233,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#663",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "does not limit nesting with maxTripleTermDepth: Infinity",
  "line": 5238,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#664",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "falls back to the default limit for an invalid maxTripleTermDepth",
  "line": 5242,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#665",
  "path": [
   "Parser",
   "A Parser instance with nested triple terms"
  ],
  "name": "reports the error once and stops parsing when parsing asynchronously",
  "line": 5248,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#666",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "bounds input-derived content interpolated into the message",
  "line": 5260,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#667",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "keeps the full offending token available on err.context.token",
  "line": 5274,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#668",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "reports the first error in the document when parsing synchronously",
  "line": 5286,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#669",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "calls no prefix or version callbacks when lexing fails later",
  "line": 5293,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#670",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "restores the base of a formula when lexing fails inside it",
  "line": 5312,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#671",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "restores the base when lexing fails after a base declaration",
  "line": 5319,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#672",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "does not reuse a reifier when lexing fails after it",
  "line": 5326,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#673",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "parses synchronously through a lexer that overrides tokenize",
  "line": 5334,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#674",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "lexes and parses together again after a parse with onComment",
  "line": 5344,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#675",
  "path": [
   "Parser",
   "An error emitted by a Parser instance"
  ],
  "name": "parses synchronously with a lexer that only provides tokenize",
  "line": 5354,
  "kind": "code"
 },
 {
  "id": "N3Parser-test.js#676",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g:h> against <http://a/bb/ccc/d;p?q>",
  "line": 5364,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#677",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g> against <http://a/bb/ccc/d;p?q>",
  "line": 5365,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#678",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <./g> against <http://a/bb/ccc/d;p?q>",
  "line": 5366,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "./g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#679",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g/> against <http://a/bb/ccc/d;p?q>",
  "line": 5367,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g/",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#680",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving </g> against <http://a/bb/ccc/d;p?q>",
  "line": 5368,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "/g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#681",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <//g> against <http://a/bb/ccc/d;p?q>",
  "line": 5369,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#682",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <?y> against <http://a/bb/ccc/d;p?q>",
  "line": 5370,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "?y",
  "expected": "http://a/bb/ccc/d;p?y"
 },
 {
  "id": "N3Parser-test.js#683",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g?y> against <http://a/bb/ccc/d;p?q>",
  "line": 5371,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g?y",
  "expected": "http://a/bb/ccc/g?y"
 },
 {
  "id": "N3Parser-test.js#684",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <#s> against <http://a/bb/ccc/d;p?q>",
  "line": 5372,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "#s",
  "expected": "http://a/bb/ccc/d;p?q#s"
 },
 {
  "id": "N3Parser-test.js#685",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g#s> against <http://a/bb/ccc/d;p?q>",
  "line": 5373,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g#s",
  "expected": "http://a/bb/ccc/g#s"
 },
 {
  "id": "N3Parser-test.js#686",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g?y#s> against <http://a/bb/ccc/d;p?q>",
  "line": 5374,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g?y#s",
  "expected": "http://a/bb/ccc/g?y#s"
 },
 {
  "id": "N3Parser-test.js#687",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <;x> against <http://a/bb/ccc/d;p?q>",
  "line": 5375,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": ";x",
  "expected": "http://a/bb/ccc/;x"
 },
 {
  "id": "N3Parser-test.js#688",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g;x> against <http://a/bb/ccc/d;p?q>",
  "line": 5376,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g;x",
  "expected": "http://a/bb/ccc/g;x"
 },
 {
  "id": "N3Parser-test.js#689",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <g;x?y#s> against <http://a/bb/ccc/d;p?q>",
  "line": 5377,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g;x?y#s",
  "expected": "http://a/bb/ccc/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#690",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <> against <http://a/bb/ccc/d;p?q>",
  "line": 5378,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "",
  "expected": "http://a/bb/ccc/d;p?q"
 },
 {
  "id": "N3Parser-test.js#691",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <.> against <http://a/bb/ccc/d;p?q>",
  "line": 5379,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": ".",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#692",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <./> against <http://a/bb/ccc/d;p?q>",
  "line": 5380,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "./",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#693",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <..> against <http://a/bb/ccc/d;p?q>",
  "line": 5381,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "..",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#694",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <../> against <http://a/bb/ccc/d;p?q>",
  "line": 5382,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "../",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#695",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <../g> against <http://a/bb/ccc/d;p?q>",
  "line": 5383,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#696",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <../..> against <http://a/bb/ccc/d;p?q>",
  "line": 5384,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "../..",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#697",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <../../> against <http://a/bb/ccc/d;p?q>",
  "line": 5385,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "../../",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#698",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples"
  ],
  "name": "resolving <../../g> against <http://a/bb/ccc/d;p?q>",
  "line": 5386,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#699",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <../../../g> against <http://a/bb/ccc/d;p?q>",
  "line": 5390,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#700",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <../../../../g> against <http://a/bb/ccc/d;p?q>",
  "line": 5391,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "../../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#701",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving </./g> against <http://a/bb/ccc/d;p?q>",
  "line": 5392,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "/./g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#702",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving </../g> against <http://a/bb/ccc/d;p?q>",
  "line": 5393,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "/../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#703",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g.> against <http://a/bb/ccc/d;p?q>",
  "line": 5394,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g.",
  "expected": "http://a/bb/ccc/g."
 },
 {
  "id": "N3Parser-test.js#704",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <.g> against <http://a/bb/ccc/d;p?q>",
  "line": 5395,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": ".g",
  "expected": "http://a/bb/ccc/.g"
 },
 {
  "id": "N3Parser-test.js#705",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g..> against <http://a/bb/ccc/d;p?q>",
  "line": 5396,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g..",
  "expected": "http://a/bb/ccc/g.."
 },
 {
  "id": "N3Parser-test.js#706",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <..g> against <http://a/bb/ccc/d;p?q>",
  "line": 5397,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "..g",
  "expected": "http://a/bb/ccc/..g"
 },
 {
  "id": "N3Parser-test.js#707",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <./../g> against <http://a/bb/ccc/d;p?q>",
  "line": 5398,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "./../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#708",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <./g/.> against <http://a/bb/ccc/d;p?q>",
  "line": 5399,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "./g/.",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#709",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g/./h> against <http://a/bb/ccc/d;p?q>",
  "line": 5400,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g/./h",
  "expected": "http://a/bb/ccc/g/h"
 },
 {
  "id": "N3Parser-test.js#710",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g/../h> against <http://a/bb/ccc/d;p?q>",
  "line": 5401,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g/../h",
  "expected": "http://a/bb/ccc/h"
 },
 {
  "id": "N3Parser-test.js#711",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g;x=1/./y> against <http://a/bb/ccc/d;p?q>",
  "line": 5402,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g;x=1/./y",
  "expected": "http://a/bb/ccc/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#712",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g;x=1/../y> against <http://a/bb/ccc/d;p?q>",
  "line": 5403,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g;x=1/../y",
  "expected": "http://a/bb/ccc/y"
 },
 {
  "id": "N3Parser-test.js#713",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g?y/./x> against <http://a/bb/ccc/d;p?q>",
  "line": 5404,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g?y/./x",
  "expected": "http://a/bb/ccc/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#714",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g?y/../x> against <http://a/bb/ccc/d;p?q>",
  "line": 5405,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g?y/../x",
  "expected": "http://a/bb/ccc/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#715",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g#s/./x> against <http://a/bb/ccc/d;p?q>",
  "line": 5406,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g#s/./x",
  "expected": "http://a/bb/ccc/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#716",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <g#s/../x> against <http://a/bb/ccc/d;p?q>",
  "line": 5407,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "g#s/../x",
  "expected": "http://a/bb/ccc/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#717",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples"
  ],
  "name": "resolving <http:g> against <http://a/bb/ccc/d;p?q>",
  "line": 5408,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#718",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g:h> against <http://a/bb/ccc/d/>",
  "line": 5412,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#719",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g> against <http://a/bb/ccc/d/>",
  "line": 5413,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g",
  "expected": "http://a/bb/ccc/d/g"
 },
 {
  "id": "N3Parser-test.js#720",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <./g> against <http://a/bb/ccc/d/>",
  "line": 5414,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "./g",
  "expected": "http://a/bb/ccc/d/g"
 },
 {
  "id": "N3Parser-test.js#721",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g/> against <http://a/bb/ccc/d/>",
  "line": 5415,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g/",
  "expected": "http://a/bb/ccc/d/g/"
 },
 {
  "id": "N3Parser-test.js#722",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving </g> against <http://a/bb/ccc/d/>",
  "line": 5416,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "/g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#723",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <//g> against <http://a/bb/ccc/d/>",
  "line": 5417,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#724",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <?y> against <http://a/bb/ccc/d/>",
  "line": 5418,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "?y",
  "expected": "http://a/bb/ccc/d/?y"
 },
 {
  "id": "N3Parser-test.js#725",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g?y> against <http://a/bb/ccc/d/>",
  "line": 5419,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g?y",
  "expected": "http://a/bb/ccc/d/g?y"
 },
 {
  "id": "N3Parser-test.js#726",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <#s> against <http://a/bb/ccc/d/>",
  "line": 5420,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "#s",
  "expected": "http://a/bb/ccc/d/#s"
 },
 {
  "id": "N3Parser-test.js#727",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g#s> against <http://a/bb/ccc/d/>",
  "line": 5421,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g#s",
  "expected": "http://a/bb/ccc/d/g#s"
 },
 {
  "id": "N3Parser-test.js#728",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g?y#s> against <http://a/bb/ccc/d/>",
  "line": 5422,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g?y#s",
  "expected": "http://a/bb/ccc/d/g?y#s"
 },
 {
  "id": "N3Parser-test.js#729",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <;x> against <http://a/bb/ccc/d/>",
  "line": 5423,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": ";x",
  "expected": "http://a/bb/ccc/d/;x"
 },
 {
  "id": "N3Parser-test.js#730",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g;x> against <http://a/bb/ccc/d/>",
  "line": 5424,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g;x",
  "expected": "http://a/bb/ccc/d/g;x"
 },
 {
  "id": "N3Parser-test.js#731",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g;x?y#s> against <http://a/bb/ccc/d/>",
  "line": 5425,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g;x?y#s",
  "expected": "http://a/bb/ccc/d/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#732",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <> against <http://a/bb/ccc/d/>",
  "line": 5426,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "",
  "expected": "http://a/bb/ccc/d/"
 },
 {
  "id": "N3Parser-test.js#733",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <.> against <http://a/bb/ccc/d/>",
  "line": 5427,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": ".",
  "expected": "http://a/bb/ccc/d/"
 },
 {
  "id": "N3Parser-test.js#734",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <./> against <http://a/bb/ccc/d/>",
  "line": 5428,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "./",
  "expected": "http://a/bb/ccc/d/"
 },
 {
  "id": "N3Parser-test.js#735",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <..> against <http://a/bb/ccc/d/>",
  "line": 5429,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "..",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#736",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <../> against <http://a/bb/ccc/d/>",
  "line": 5430,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "../",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#737",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <../g> against <http://a/bb/ccc/d/>",
  "line": 5431,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "../g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#738",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <../..> against <http://a/bb/ccc/d/>",
  "line": 5432,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "../..",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#739",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <../../> against <http://a/bb/ccc/d/>",
  "line": 5433,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "../../",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#740",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing slash in base IRI"
  ],
  "name": "resolving <../../g> against <http://a/bb/ccc/d/>",
  "line": 5434,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "../../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#741",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <../../../g> against <http://a/bb/ccc/d/>",
  "line": 5438,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#742",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <../../../../g> against <http://a/bb/ccc/d/>",
  "line": 5439,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "../../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#743",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving </./g> against <http://a/bb/ccc/d/>",
  "line": 5440,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "/./g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#744",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving </../g> against <http://a/bb/ccc/d/>",
  "line": 5441,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "/../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#745",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g.> against <http://a/bb/ccc/d/>",
  "line": 5442,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g.",
  "expected": "http://a/bb/ccc/d/g."
 },
 {
  "id": "N3Parser-test.js#746",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <.g> against <http://a/bb/ccc/d/>",
  "line": 5443,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": ".g",
  "expected": "http://a/bb/ccc/d/.g"
 },
 {
  "id": "N3Parser-test.js#747",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g..> against <http://a/bb/ccc/d/>",
  "line": 5444,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g..",
  "expected": "http://a/bb/ccc/d/g.."
 },
 {
  "id": "N3Parser-test.js#748",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <..g> against <http://a/bb/ccc/d/>",
  "line": 5445,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "..g",
  "expected": "http://a/bb/ccc/d/..g"
 },
 {
  "id": "N3Parser-test.js#749",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <./../g> against <http://a/bb/ccc/d/>",
  "line": 5446,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "./../g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#750",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <./g/.> against <http://a/bb/ccc/d/>",
  "line": 5447,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "./g/.",
  "expected": "http://a/bb/ccc/d/g/"
 },
 {
  "id": "N3Parser-test.js#751",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g/./h> against <http://a/bb/ccc/d/>",
  "line": 5448,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g/./h",
  "expected": "http://a/bb/ccc/d/g/h"
 },
 {
  "id": "N3Parser-test.js#752",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g/../h> against <http://a/bb/ccc/d/>",
  "line": 5449,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g/../h",
  "expected": "http://a/bb/ccc/d/h"
 },
 {
  "id": "N3Parser-test.js#753",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g;x=1/./y> against <http://a/bb/ccc/d/>",
  "line": 5450,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g;x=1/./y",
  "expected": "http://a/bb/ccc/d/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#754",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g;x=1/../y> against <http://a/bb/ccc/d/>",
  "line": 5451,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g;x=1/../y",
  "expected": "http://a/bb/ccc/d/y"
 },
 {
  "id": "N3Parser-test.js#755",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g?y/./x> against <http://a/bb/ccc/d/>",
  "line": 5452,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g?y/./x",
  "expected": "http://a/bb/ccc/d/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#756",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g?y/../x> against <http://a/bb/ccc/d/>",
  "line": 5453,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g?y/../x",
  "expected": "http://a/bb/ccc/d/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#757",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g#s/./x> against <http://a/bb/ccc/d/>",
  "line": 5454,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g#s/./x",
  "expected": "http://a/bb/ccc/d/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#758",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <g#s/../x> against <http://a/bb/ccc/d/>",
  "line": 5455,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "g#s/../x",
  "expected": "http://a/bb/ccc/d/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#759",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing slash in base IRI"
  ],
  "name": "resolving <http:g> against <http://a/bb/ccc/d/>",
  "line": 5456,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d/",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#760",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g:h> against <http://a/bb/ccc/./d;p?q>",
  "line": 5460,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#761",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5461,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#762",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <./g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5462,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "./g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#763",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g/> against <http://a/bb/ccc/./d;p?q>",
  "line": 5463,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g/",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#764",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving </g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5464,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "/g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#765",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <//g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5465,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#766",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <?y> against <http://a/bb/ccc/./d;p?q>",
  "line": 5466,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "?y",
  "expected": "http://a/bb/ccc/./d;p?y"
 },
 {
  "id": "N3Parser-test.js#767",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g?y> against <http://a/bb/ccc/./d;p?q>",
  "line": 5467,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g?y",
  "expected": "http://a/bb/ccc/g?y"
 },
 {
  "id": "N3Parser-test.js#768",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <#s> against <http://a/bb/ccc/./d;p?q>",
  "line": 5468,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "#s",
  "expected": "http://a/bb/ccc/./d;p?q#s"
 },
 {
  "id": "N3Parser-test.js#769",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g#s> against <http://a/bb/ccc/./d;p?q>",
  "line": 5469,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g#s",
  "expected": "http://a/bb/ccc/g#s"
 },
 {
  "id": "N3Parser-test.js#770",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g?y#s> against <http://a/bb/ccc/./d;p?q>",
  "line": 5470,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g?y#s",
  "expected": "http://a/bb/ccc/g?y#s"
 },
 {
  "id": "N3Parser-test.js#771",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <;x> against <http://a/bb/ccc/./d;p?q>",
  "line": 5471,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": ";x",
  "expected": "http://a/bb/ccc/;x"
 },
 {
  "id": "N3Parser-test.js#772",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g;x> against <http://a/bb/ccc/./d;p?q>",
  "line": 5472,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g;x",
  "expected": "http://a/bb/ccc/g;x"
 },
 {
  "id": "N3Parser-test.js#773",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <g;x?y#s> against <http://a/bb/ccc/./d;p?q>",
  "line": 5473,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g;x?y#s",
  "expected": "http://a/bb/ccc/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#774",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <> against <http://a/bb/ccc/./d;p?q>",
  "line": 5474,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "",
  "expected": "http://a/bb/ccc/./d;p?q"
 },
 {
  "id": "N3Parser-test.js#775",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <.> against <http://a/bb/ccc/./d;p?q>",
  "line": 5475,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": ".",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#776",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <./> against <http://a/bb/ccc/./d;p?q>",
  "line": 5476,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "./",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#777",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <..> against <http://a/bb/ccc/./d;p?q>",
  "line": 5477,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "..",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#778",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <../> against <http://a/bb/ccc/./d;p?q>",
  "line": 5478,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "../",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#779",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <../g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5479,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#780",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <../..> against <http://a/bb/ccc/./d;p?q>",
  "line": 5480,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "../..",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#781",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <../../> against <http://a/bb/ccc/./d;p?q>",
  "line": 5481,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "../../",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#782",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /. in the base IRI"
  ],
  "name": "resolving <../../g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5482,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#783",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <../../../g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5486,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#784",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <../../../../g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5487,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "../../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#785",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving </./g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5488,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "/./g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#786",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving </../g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5489,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "/../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#787",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g.> against <http://a/bb/ccc/./d;p?q>",
  "line": 5490,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g.",
  "expected": "http://a/bb/ccc/g."
 },
 {
  "id": "N3Parser-test.js#788",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <.g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5491,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": ".g",
  "expected": "http://a/bb/ccc/.g"
 },
 {
  "id": "N3Parser-test.js#789",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g..> against <http://a/bb/ccc/./d;p?q>",
  "line": 5492,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g..",
  "expected": "http://a/bb/ccc/g.."
 },
 {
  "id": "N3Parser-test.js#790",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <..g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5493,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "..g",
  "expected": "http://a/bb/ccc/..g"
 },
 {
  "id": "N3Parser-test.js#791",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <./../g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5494,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "./../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#792",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <./g/.> against <http://a/bb/ccc/./d;p?q>",
  "line": 5495,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "./g/.",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#793",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g/./h> against <http://a/bb/ccc/./d;p?q>",
  "line": 5496,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g/./h",
  "expected": "http://a/bb/ccc/g/h"
 },
 {
  "id": "N3Parser-test.js#794",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g/../h> against <http://a/bb/ccc/./d;p?q>",
  "line": 5497,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g/../h",
  "expected": "http://a/bb/ccc/h"
 },
 {
  "id": "N3Parser-test.js#795",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g;x=1/./y> against <http://a/bb/ccc/./d;p?q>",
  "line": 5498,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g;x=1/./y",
  "expected": "http://a/bb/ccc/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#796",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g;x=1/../y> against <http://a/bb/ccc/./d;p?q>",
  "line": 5499,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g;x=1/../y",
  "expected": "http://a/bb/ccc/y"
 },
 {
  "id": "N3Parser-test.js#797",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g?y/./x> against <http://a/bb/ccc/./d;p?q>",
  "line": 5500,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g?y/./x",
  "expected": "http://a/bb/ccc/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#798",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g?y/../x> against <http://a/bb/ccc/./d;p?q>",
  "line": 5501,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g?y/../x",
  "expected": "http://a/bb/ccc/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#799",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g#s/./x> against <http://a/bb/ccc/./d;p?q>",
  "line": 5502,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g#s/./x",
  "expected": "http://a/bb/ccc/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#800",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <g#s/../x> against <http://a/bb/ccc/./d;p?q>",
  "line": 5503,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "g#s/../x",
  "expected": "http://a/bb/ccc/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#801",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /. in the base IRI"
  ],
  "name": "resolving <http:g> against <http://a/bb/ccc/./d;p?q>",
  "line": 5504,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/./d;p?q",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#802",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g:h> against <http://a/bb/ccc/../d;p?q>",
  "line": 5508,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#803",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5509,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#804",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <./g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5510,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "./g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#805",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g/> against <http://a/bb/ccc/../d;p?q>",
  "line": 5511,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g/",
  "expected": "http://a/bb/g/"
 },
 {
  "id": "N3Parser-test.js#806",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving </g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5512,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "/g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#807",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <//g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5513,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#808",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <?y> against <http://a/bb/ccc/../d;p?q>",
  "line": 5514,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "?y",
  "expected": "http://a/bb/ccc/../d;p?y"
 },
 {
  "id": "N3Parser-test.js#809",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g?y> against <http://a/bb/ccc/../d;p?q>",
  "line": 5515,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g?y",
  "expected": "http://a/bb/g?y"
 },
 {
  "id": "N3Parser-test.js#810",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <#s> against <http://a/bb/ccc/../d;p?q>",
  "line": 5516,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "#s",
  "expected": "http://a/bb/ccc/../d;p?q#s"
 },
 {
  "id": "N3Parser-test.js#811",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g#s> against <http://a/bb/ccc/../d;p?q>",
  "line": 5517,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g#s",
  "expected": "http://a/bb/g#s"
 },
 {
  "id": "N3Parser-test.js#812",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g?y#s> against <http://a/bb/ccc/../d;p?q>",
  "line": 5518,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g?y#s",
  "expected": "http://a/bb/g?y#s"
 },
 {
  "id": "N3Parser-test.js#813",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <;x> against <http://a/bb/ccc/../d;p?q>",
  "line": 5519,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": ";x",
  "expected": "http://a/bb/;x"
 },
 {
  "id": "N3Parser-test.js#814",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g;x> against <http://a/bb/ccc/../d;p?q>",
  "line": 5520,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g;x",
  "expected": "http://a/bb/g;x"
 },
 {
  "id": "N3Parser-test.js#815",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <g;x?y#s> against <http://a/bb/ccc/../d;p?q>",
  "line": 5521,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g;x?y#s",
  "expected": "http://a/bb/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#816",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <> against <http://a/bb/ccc/../d;p?q>",
  "line": 5522,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "",
  "expected": "http://a/bb/ccc/../d;p?q"
 },
 {
  "id": "N3Parser-test.js#817",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <.> against <http://a/bb/ccc/../d;p?q>",
  "line": 5523,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": ".",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#818",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <./> against <http://a/bb/ccc/../d;p?q>",
  "line": 5524,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "./",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#819",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <..> against <http://a/bb/ccc/../d;p?q>",
  "line": 5525,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "..",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#820",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <../> against <http://a/bb/ccc/../d;p?q>",
  "line": 5526,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "../",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#821",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <../g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5527,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#822",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <../..> against <http://a/bb/ccc/../d;p?q>",
  "line": 5528,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "../..",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#823",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <../../> against <http://a/bb/ccc/../d;p?q>",
  "line": 5529,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "../../",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#824",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with /.. in the base IRI"
  ],
  "name": "resolving <../../g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5530,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#825",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <../../../g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5534,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#826",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <../../../../g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5535,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "../../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#827",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving </./g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5536,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "/./g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#828",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving </../g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5537,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "/../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#829",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g.> against <http://a/bb/ccc/../d;p?q>",
  "line": 5538,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g.",
  "expected": "http://a/bb/g."
 },
 {
  "id": "N3Parser-test.js#830",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <.g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5539,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": ".g",
  "expected": "http://a/bb/.g"
 },
 {
  "id": "N3Parser-test.js#831",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g..> against <http://a/bb/ccc/../d;p?q>",
  "line": 5540,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g..",
  "expected": "http://a/bb/g.."
 },
 {
  "id": "N3Parser-test.js#832",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <..g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5541,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "..g",
  "expected": "http://a/bb/..g"
 },
 {
  "id": "N3Parser-test.js#833",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <./../g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5542,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "./../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#834",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <./g/.> against <http://a/bb/ccc/../d;p?q>",
  "line": 5543,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "./g/.",
  "expected": "http://a/bb/g/"
 },
 {
  "id": "N3Parser-test.js#835",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g/./h> against <http://a/bb/ccc/../d;p?q>",
  "line": 5544,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g/./h",
  "expected": "http://a/bb/g/h"
 },
 {
  "id": "N3Parser-test.js#836",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g/../h> against <http://a/bb/ccc/../d;p?q>",
  "line": 5545,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g/../h",
  "expected": "http://a/bb/h"
 },
 {
  "id": "N3Parser-test.js#837",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g;x=1/./y> against <http://a/bb/ccc/../d;p?q>",
  "line": 5546,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g;x=1/./y",
  "expected": "http://a/bb/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#838",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g;x=1/../y> against <http://a/bb/ccc/../d;p?q>",
  "line": 5547,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g;x=1/../y",
  "expected": "http://a/bb/y"
 },
 {
  "id": "N3Parser-test.js#839",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g?y/./x> against <http://a/bb/ccc/../d;p?q>",
  "line": 5548,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g?y/./x",
  "expected": "http://a/bb/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#840",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g?y/../x> against <http://a/bb/ccc/../d;p?q>",
  "line": 5549,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g?y/../x",
  "expected": "http://a/bb/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#841",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g#s/./x> against <http://a/bb/ccc/../d;p?q>",
  "line": 5550,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g#s/./x",
  "expected": "http://a/bb/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#842",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <g#s/../x> against <http://a/bb/ccc/../d;p?q>",
  "line": 5551,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "g#s/../x",
  "expected": "http://a/bb/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#843",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with /.. in the base IRI"
  ],
  "name": "resolving <http:g> against <http://a/bb/ccc/../d;p?q>",
  "line": 5552,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/../d;p?q",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#844",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g:h> against <http://a/bb/ccc/.>",
  "line": 5556,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#845",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g> against <http://a/bb/ccc/.>",
  "line": 5557,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#846",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <./g> against <http://a/bb/ccc/.>",
  "line": 5558,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "./g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#847",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g/> against <http://a/bb/ccc/.>",
  "line": 5559,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g/",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#848",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving </g> against <http://a/bb/ccc/.>",
  "line": 5560,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "/g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#849",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <//g> against <http://a/bb/ccc/.>",
  "line": 5561,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#850",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <?y> against <http://a/bb/ccc/.>",
  "line": 5562,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "?y",
  "expected": "http://a/bb/ccc/.?y"
 },
 {
  "id": "N3Parser-test.js#851",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g?y> against <http://a/bb/ccc/.>",
  "line": 5563,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g?y",
  "expected": "http://a/bb/ccc/g?y"
 },
 {
  "id": "N3Parser-test.js#852",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <#s> against <http://a/bb/ccc/.>",
  "line": 5564,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "#s",
  "expected": "http://a/bb/ccc/.#s"
 },
 {
  "id": "N3Parser-test.js#853",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g#s> against <http://a/bb/ccc/.>",
  "line": 5565,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g#s",
  "expected": "http://a/bb/ccc/g#s"
 },
 {
  "id": "N3Parser-test.js#854",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g?y#s> against <http://a/bb/ccc/.>",
  "line": 5566,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g?y#s",
  "expected": "http://a/bb/ccc/g?y#s"
 },
 {
  "id": "N3Parser-test.js#855",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <;x> against <http://a/bb/ccc/.>",
  "line": 5567,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": ";x",
  "expected": "http://a/bb/ccc/;x"
 },
 {
  "id": "N3Parser-test.js#856",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g;x> against <http://a/bb/ccc/.>",
  "line": 5568,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g;x",
  "expected": "http://a/bb/ccc/g;x"
 },
 {
  "id": "N3Parser-test.js#857",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g;x?y#s> against <http://a/bb/ccc/.>",
  "line": 5569,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g;x?y#s",
  "expected": "http://a/bb/ccc/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#858",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <> against <http://a/bb/ccc/.>",
  "line": 5570,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "",
  "expected": "http://a/bb/ccc/."
 },
 {
  "id": "N3Parser-test.js#859",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <.> against <http://a/bb/ccc/.>",
  "line": 5571,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": ".",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#860",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <./> against <http://a/bb/ccc/.>",
  "line": 5572,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "./",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#861",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <..> against <http://a/bb/ccc/.>",
  "line": 5573,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "..",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#862",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <../> against <http://a/bb/ccc/.>",
  "line": 5574,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "../",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#863",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <../g> against <http://a/bb/ccc/.>",
  "line": 5575,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#864",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <../..> against <http://a/bb/ccc/.>",
  "line": 5576,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "../..",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#865",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <../../> against <http://a/bb/ccc/.>",
  "line": 5577,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "../../",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#866",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <../../g> against <http://a/bb/ccc/.>",
  "line": 5578,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#867",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <../../../g> against <http://a/bb/ccc/.>",
  "line": 5582,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#868",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <../../../../g> against <http://a/bb/ccc/.>",
  "line": 5583,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "../../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#869",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving </./g> against <http://a/bb/ccc/.>",
  "line": 5584,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "/./g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#870",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving </../g> against <http://a/bb/ccc/.>",
  "line": 5585,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "/../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#871",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g.> against <http://a/bb/ccc/.>",
  "line": 5586,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g.",
  "expected": "http://a/bb/ccc/g."
 },
 {
  "id": "N3Parser-test.js#872",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <.g> against <http://a/bb/ccc/.>",
  "line": 5587,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": ".g",
  "expected": "http://a/bb/ccc/.g"
 },
 {
  "id": "N3Parser-test.js#873",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g..> against <http://a/bb/ccc/.>",
  "line": 5588,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g..",
  "expected": "http://a/bb/ccc/g.."
 },
 {
  "id": "N3Parser-test.js#874",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <..g> against <http://a/bb/ccc/.>",
  "line": 5589,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "..g",
  "expected": "http://a/bb/ccc/..g"
 },
 {
  "id": "N3Parser-test.js#875",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <./../g> against <http://a/bb/ccc/.>",
  "line": 5590,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "./../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#876",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <./g/.> against <http://a/bb/ccc/.>",
  "line": 5591,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "./g/.",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#877",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g/./h> against <http://a/bb/ccc/.>",
  "line": 5592,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g/./h",
  "expected": "http://a/bb/ccc/g/h"
 },
 {
  "id": "N3Parser-test.js#878",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g/../h> against <http://a/bb/ccc/.>",
  "line": 5593,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g/../h",
  "expected": "http://a/bb/ccc/h"
 },
 {
  "id": "N3Parser-test.js#879",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g;x=1/./y> against <http://a/bb/ccc/.>",
  "line": 5594,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g;x=1/./y",
  "expected": "http://a/bb/ccc/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#880",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g;x=1/../y> against <http://a/bb/ccc/.>",
  "line": 5595,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g;x=1/../y",
  "expected": "http://a/bb/ccc/y"
 },
 {
  "id": "N3Parser-test.js#881",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g?y/./x> against <http://a/bb/ccc/.>",
  "line": 5596,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g?y/./x",
  "expected": "http://a/bb/ccc/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#882",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g?y/../x> against <http://a/bb/ccc/.>",
  "line": 5597,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g?y/../x",
  "expected": "http://a/bb/ccc/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#883",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g#s/./x> against <http://a/bb/ccc/.>",
  "line": 5598,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g#s/./x",
  "expected": "http://a/bb/ccc/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#884",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <g#s/../x> against <http://a/bb/ccc/.>",
  "line": 5599,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "g#s/../x",
  "expected": "http://a/bb/ccc/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#885",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /. in the base IRI"
  ],
  "name": "resolving <http:g> against <http://a/bb/ccc/.>",
  "line": 5600,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/.",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#886",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g:h> against <http://a/bb/ccc/..>",
  "line": 5604,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#887",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g> against <http://a/bb/ccc/..>",
  "line": 5605,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#888",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <./g> against <http://a/bb/ccc/..>",
  "line": 5606,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "./g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#889",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g/> against <http://a/bb/ccc/..>",
  "line": 5607,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g/",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#890",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving </g> against <http://a/bb/ccc/..>",
  "line": 5608,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "/g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#891",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <//g> against <http://a/bb/ccc/..>",
  "line": 5609,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#892",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <?y> against <http://a/bb/ccc/..>",
  "line": 5610,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "?y",
  "expected": "http://a/bb/ccc/..?y"
 },
 {
  "id": "N3Parser-test.js#893",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g?y> against <http://a/bb/ccc/..>",
  "line": 5611,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g?y",
  "expected": "http://a/bb/ccc/g?y"
 },
 {
  "id": "N3Parser-test.js#894",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <#s> against <http://a/bb/ccc/..>",
  "line": 5612,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "#s",
  "expected": "http://a/bb/ccc/..#s"
 },
 {
  "id": "N3Parser-test.js#895",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g#s> against <http://a/bb/ccc/..>",
  "line": 5613,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g#s",
  "expected": "http://a/bb/ccc/g#s"
 },
 {
  "id": "N3Parser-test.js#896",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g?y#s> against <http://a/bb/ccc/..>",
  "line": 5614,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g?y#s",
  "expected": "http://a/bb/ccc/g?y#s"
 },
 {
  "id": "N3Parser-test.js#897",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <;x> against <http://a/bb/ccc/..>",
  "line": 5615,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": ";x",
  "expected": "http://a/bb/ccc/;x"
 },
 {
  "id": "N3Parser-test.js#898",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g;x> against <http://a/bb/ccc/..>",
  "line": 5616,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g;x",
  "expected": "http://a/bb/ccc/g;x"
 },
 {
  "id": "N3Parser-test.js#899",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g;x?y#s> against <http://a/bb/ccc/..>",
  "line": 5617,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g;x?y#s",
  "expected": "http://a/bb/ccc/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#900",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <> against <http://a/bb/ccc/..>",
  "line": 5618,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "",
  "expected": "http://a/bb/ccc/.."
 },
 {
  "id": "N3Parser-test.js#901",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <.> against <http://a/bb/ccc/..>",
  "line": 5619,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": ".",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#902",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <./> against <http://a/bb/ccc/..>",
  "line": 5620,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "./",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#903",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <..> against <http://a/bb/ccc/..>",
  "line": 5621,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "..",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#904",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <../> against <http://a/bb/ccc/..>",
  "line": 5622,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "../",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#905",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <../g> against <http://a/bb/ccc/..>",
  "line": 5623,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#906",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <../..> against <http://a/bb/ccc/..>",
  "line": 5624,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "../..",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#907",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <../../> against <http://a/bb/ccc/..>",
  "line": 5625,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "../../",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#908",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <../../g> against <http://a/bb/ccc/..>",
  "line": 5626,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#909",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <../../../g> against <http://a/bb/ccc/..>",
  "line": 5630,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#910",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <../../../../g> against <http://a/bb/ccc/..>",
  "line": 5631,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "../../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#911",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving </./g> against <http://a/bb/ccc/..>",
  "line": 5632,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "/./g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#912",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving </../g> against <http://a/bb/ccc/..>",
  "line": 5633,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "/../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#913",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g.> against <http://a/bb/ccc/..>",
  "line": 5634,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g.",
  "expected": "http://a/bb/ccc/g."
 },
 {
  "id": "N3Parser-test.js#914",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <.g> against <http://a/bb/ccc/..>",
  "line": 5635,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": ".g",
  "expected": "http://a/bb/ccc/.g"
 },
 {
  "id": "N3Parser-test.js#915",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g..> against <http://a/bb/ccc/..>",
  "line": 5636,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g..",
  "expected": "http://a/bb/ccc/g.."
 },
 {
  "id": "N3Parser-test.js#916",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <..g> against <http://a/bb/ccc/..>",
  "line": 5637,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "..g",
  "expected": "http://a/bb/ccc/..g"
 },
 {
  "id": "N3Parser-test.js#917",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <./../g> against <http://a/bb/ccc/..>",
  "line": 5638,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "./../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#918",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <./g/.> against <http://a/bb/ccc/..>",
  "line": 5639,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "./g/.",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#919",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g/./h> against <http://a/bb/ccc/..>",
  "line": 5640,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g/./h",
  "expected": "http://a/bb/ccc/g/h"
 },
 {
  "id": "N3Parser-test.js#920",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g/../h> against <http://a/bb/ccc/..>",
  "line": 5641,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g/../h",
  "expected": "http://a/bb/ccc/h"
 },
 {
  "id": "N3Parser-test.js#921",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g;x=1/./y> against <http://a/bb/ccc/..>",
  "line": 5642,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g;x=1/./y",
  "expected": "http://a/bb/ccc/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#922",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g;x=1/../y> against <http://a/bb/ccc/..>",
  "line": 5643,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g;x=1/../y",
  "expected": "http://a/bb/ccc/y"
 },
 {
  "id": "N3Parser-test.js#923",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g?y/./x> against <http://a/bb/ccc/..>",
  "line": 5644,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g?y/./x",
  "expected": "http://a/bb/ccc/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#924",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g?y/../x> against <http://a/bb/ccc/..>",
  "line": 5645,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g?y/../x",
  "expected": "http://a/bb/ccc/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#925",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g#s/./x> against <http://a/bb/ccc/..>",
  "line": 5646,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g#s/./x",
  "expected": "http://a/bb/ccc/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#926",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <g#s/../x> against <http://a/bb/ccc/..>",
  "line": 5647,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "g#s/../x",
  "expected": "http://a/bb/ccc/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#927",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with trailing /.. in the base IRI"
  ],
  "name": "resolving <http:g> against <http://a/bb/ccc/..>",
  "line": 5648,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/..",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#928",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g:h> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5652,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#929",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5653,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#930",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <./g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5654,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "./g",
  "expected": "http://a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#931",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g/> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5655,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g/",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#932",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving </g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5656,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "/g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#933",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <//g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5657,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#934",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <?y> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5658,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "?y",
  "expected": "http://a/bb/ccc/d;p?y"
 },
 {
  "id": "N3Parser-test.js#935",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g?y> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5659,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g?y",
  "expected": "http://a/bb/ccc/g?y"
 },
 {
  "id": "N3Parser-test.js#936",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <#s> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5660,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "#s",
  "expected": "http://a/bb/ccc/d;p?q#s"
 },
 {
  "id": "N3Parser-test.js#937",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g#s> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5661,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g#s",
  "expected": "http://a/bb/ccc/g#s"
 },
 {
  "id": "N3Parser-test.js#938",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g?y#s> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5662,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g?y#s",
  "expected": "http://a/bb/ccc/g?y#s"
 },
 {
  "id": "N3Parser-test.js#939",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <;x> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5663,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": ";x",
  "expected": "http://a/bb/ccc/;x"
 },
 {
  "id": "N3Parser-test.js#940",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g;x> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5664,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g;x",
  "expected": "http://a/bb/ccc/g;x"
 },
 {
  "id": "N3Parser-test.js#941",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <g;x?y#s> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5665,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g;x?y#s",
  "expected": "http://a/bb/ccc/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#942",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5666,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "",
  "expected": "http://a/bb/ccc/d;p?q"
 },
 {
  "id": "N3Parser-test.js#943",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <.> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5667,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": ".",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#944",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <./> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5668,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "./",
  "expected": "http://a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#945",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <..> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5669,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "..",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#946",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <../> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5670,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "../",
  "expected": "http://a/bb/"
 },
 {
  "id": "N3Parser-test.js#947",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <../g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5671,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#948",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <../..> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5672,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "../..",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#949",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <../../> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5673,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "../../",
  "expected": "http://a/"
 },
 {
  "id": "N3Parser-test.js#950",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with fragment in base IRI"
  ],
  "name": "resolving <../../g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5674,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#951",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <../../../g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5678,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#952",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <../../../../g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5679,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "../../../../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#953",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving </./g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5680,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "/./g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#954",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving </../g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5681,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "/../g",
  "expected": "http://a/g"
 },
 {
  "id": "N3Parser-test.js#955",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g.> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5682,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g.",
  "expected": "http://a/bb/ccc/g."
 },
 {
  "id": "N3Parser-test.js#956",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <.g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5683,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": ".g",
  "expected": "http://a/bb/ccc/.g"
 },
 {
  "id": "N3Parser-test.js#957",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g..> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5684,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g..",
  "expected": "http://a/bb/ccc/g.."
 },
 {
  "id": "N3Parser-test.js#958",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <..g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5685,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "..g",
  "expected": "http://a/bb/ccc/..g"
 },
 {
  "id": "N3Parser-test.js#959",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <./../g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5686,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "./../g",
  "expected": "http://a/bb/g"
 },
 {
  "id": "N3Parser-test.js#960",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <./g/.> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5687,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "./g/.",
  "expected": "http://a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#961",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g/./h> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5688,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g/./h",
  "expected": "http://a/bb/ccc/g/h"
 },
 {
  "id": "N3Parser-test.js#962",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g/../h> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5689,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g/../h",
  "expected": "http://a/bb/ccc/h"
 },
 {
  "id": "N3Parser-test.js#963",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g;x=1/./y> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5690,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g;x=1/./y",
  "expected": "http://a/bb/ccc/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#964",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g;x=1/../y> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5691,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g;x=1/../y",
  "expected": "http://a/bb/ccc/y"
 },
 {
  "id": "N3Parser-test.js#965",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g?y/./x> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5692,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g?y/./x",
  "expected": "http://a/bb/ccc/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#966",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g?y/../x> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5693,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g?y/../x",
  "expected": "http://a/bb/ccc/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#967",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g#s/./x> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5694,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g#s/./x",
  "expected": "http://a/bb/ccc/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#968",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <g#s/../x> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5695,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "g#s/../x",
  "expected": "http://a/bb/ccc/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#969",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with fragment in base IRI"
  ],
  "name": "resolving <http:g> against <http://a/bb/ccc/d;p?q#f>",
  "line": 5696,
  "kind": "resolve",
  "baseIRI": "http://a/bb/ccc/d;p?q#f",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#970",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g:h> against <file:///a/bb/ccc/d;p?q>",
  "line": 5700,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#971",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5701,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g",
  "expected": "file:///a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#972",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <./g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5702,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "./g",
  "expected": "file:///a/bb/ccc/g"
 },
 {
  "id": "N3Parser-test.js#973",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g/> against <file:///a/bb/ccc/d;p?q>",
  "line": 5703,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g/",
  "expected": "file:///a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#974",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving </g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5704,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "/g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#975",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <//g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5705,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "//g",
  "expected": "file://g"
 },
 {
  "id": "N3Parser-test.js#976",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <?y> against <file:///a/bb/ccc/d;p?q>",
  "line": 5706,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "?y",
  "expected": "file:///a/bb/ccc/d;p?y"
 },
 {
  "id": "N3Parser-test.js#977",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g?y> against <file:///a/bb/ccc/d;p?q>",
  "line": 5707,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g?y",
  "expected": "file:///a/bb/ccc/g?y"
 },
 {
  "id": "N3Parser-test.js#978",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <#s> against <file:///a/bb/ccc/d;p?q>",
  "line": 5708,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "#s",
  "expected": "file:///a/bb/ccc/d;p?q#s"
 },
 {
  "id": "N3Parser-test.js#979",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g#s> against <file:///a/bb/ccc/d;p?q>",
  "line": 5709,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g#s",
  "expected": "file:///a/bb/ccc/g#s"
 },
 {
  "id": "N3Parser-test.js#980",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g?y#s> against <file:///a/bb/ccc/d;p?q>",
  "line": 5710,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g?y#s",
  "expected": "file:///a/bb/ccc/g?y#s"
 },
 {
  "id": "N3Parser-test.js#981",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <;x> against <file:///a/bb/ccc/d;p?q>",
  "line": 5711,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": ";x",
  "expected": "file:///a/bb/ccc/;x"
 },
 {
  "id": "N3Parser-test.js#982",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g;x> against <file:///a/bb/ccc/d;p?q>",
  "line": 5712,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g;x",
  "expected": "file:///a/bb/ccc/g;x"
 },
 {
  "id": "N3Parser-test.js#983",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <g;x?y#s> against <file:///a/bb/ccc/d;p?q>",
  "line": 5713,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g;x?y#s",
  "expected": "file:///a/bb/ccc/g;x?y#s"
 },
 {
  "id": "N3Parser-test.js#984",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <> against <file:///a/bb/ccc/d;p?q>",
  "line": 5714,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "",
  "expected": "file:///a/bb/ccc/d;p?q"
 },
 {
  "id": "N3Parser-test.js#985",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <.> against <file:///a/bb/ccc/d;p?q>",
  "line": 5715,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": ".",
  "expected": "file:///a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#986",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <./> against <file:///a/bb/ccc/d;p?q>",
  "line": 5716,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "./",
  "expected": "file:///a/bb/ccc/"
 },
 {
  "id": "N3Parser-test.js#987",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <..> against <file:///a/bb/ccc/d;p?q>",
  "line": 5717,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "..",
  "expected": "file:///a/bb/"
 },
 {
  "id": "N3Parser-test.js#988",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <../> against <file:///a/bb/ccc/d;p?q>",
  "line": 5718,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "../",
  "expected": "file:///a/bb/"
 },
 {
  "id": "N3Parser-test.js#989",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <../g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5719,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "../g",
  "expected": "file:///a/bb/g"
 },
 {
  "id": "N3Parser-test.js#990",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <../..> against <file:///a/bb/ccc/d;p?q>",
  "line": 5720,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "../..",
  "expected": "file:///a/"
 },
 {
  "id": "N3Parser-test.js#991",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <../../> against <file:///a/bb/ccc/d;p?q>",
  "line": 5721,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "../../",
  "expected": "file:///a/"
 },
 {
  "id": "N3Parser-test.js#992",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 normal examples with file path"
  ],
  "name": "resolving <../../g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5722,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "../../g",
  "expected": "file:///a/g"
 },
 {
  "id": "N3Parser-test.js#993",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <../../../g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5726,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "../../../g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#994",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <../../../../g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5727,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "../../../../g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#995",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving </./g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5728,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "/./g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#996",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving </../g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5729,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "/../g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#997",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g.> against <file:///a/bb/ccc/d;p?q>",
  "line": 5730,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g.",
  "expected": "file:///a/bb/ccc/g."
 },
 {
  "id": "N3Parser-test.js#998",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <.g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5731,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": ".g",
  "expected": "file:///a/bb/ccc/.g"
 },
 {
  "id": "N3Parser-test.js#999",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g..> against <file:///a/bb/ccc/d;p?q>",
  "line": 5732,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g..",
  "expected": "file:///a/bb/ccc/g.."
 },
 {
  "id": "N3Parser-test.js#1000",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <..g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5733,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "..g",
  "expected": "file:///a/bb/ccc/..g"
 },
 {
  "id": "N3Parser-test.js#1001",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <./../g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5734,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "./../g",
  "expected": "file:///a/bb/g"
 },
 {
  "id": "N3Parser-test.js#1002",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <./g/.> against <file:///a/bb/ccc/d;p?q>",
  "line": 5735,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "./g/.",
  "expected": "file:///a/bb/ccc/g/"
 },
 {
  "id": "N3Parser-test.js#1003",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g/./h> against <file:///a/bb/ccc/d;p?q>",
  "line": 5736,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g/./h",
  "expected": "file:///a/bb/ccc/g/h"
 },
 {
  "id": "N3Parser-test.js#1004",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g/../h> against <file:///a/bb/ccc/d;p?q>",
  "line": 5737,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g/../h",
  "expected": "file:///a/bb/ccc/h"
 },
 {
  "id": "N3Parser-test.js#1005",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g;x=1/./y> against <file:///a/bb/ccc/d;p?q>",
  "line": 5738,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g;x=1/./y",
  "expected": "file:///a/bb/ccc/g;x=1/y"
 },
 {
  "id": "N3Parser-test.js#1006",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g;x=1/../y> against <file:///a/bb/ccc/d;p?q>",
  "line": 5739,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g;x=1/../y",
  "expected": "file:///a/bb/ccc/y"
 },
 {
  "id": "N3Parser-test.js#1007",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g?y/./x> against <file:///a/bb/ccc/d;p?q>",
  "line": 5740,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g?y/./x",
  "expected": "file:///a/bb/ccc/g?y/./x"
 },
 {
  "id": "N3Parser-test.js#1008",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g?y/../x> against <file:///a/bb/ccc/d;p?q>",
  "line": 5741,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g?y/../x",
  "expected": "file:///a/bb/ccc/g?y/../x"
 },
 {
  "id": "N3Parser-test.js#1009",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g#s/./x> against <file:///a/bb/ccc/d;p?q>",
  "line": 5742,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g#s/./x",
  "expected": "file:///a/bb/ccc/g#s/./x"
 },
 {
  "id": "N3Parser-test.js#1010",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <g#s/../x> against <file:///a/bb/ccc/d;p?q>",
  "line": 5743,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "g#s/../x",
  "expected": "file:///a/bb/ccc/g#s/../x"
 },
 {
  "id": "N3Parser-test.js#1011",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 abnormal examples with file path"
  ],
  "name": "resolving <http:g> against <file:///a/bb/ccc/d;p?q>",
  "line": 5744,
  "kind": "resolve",
  "baseIRI": "file:///a/bb/ccc/d;p?q",
  "relativeIri": "http:g",
  "expected": "http:g"
 },
 {
  "id": "N3Parser-test.js#1012",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <> against <http://abc/xyz#>",
  "line": 5749,
  "kind": "resolve",
  "baseIRI": "http://abc/xyz#",
  "relativeIri": "",
  "expected": "http://abc/xyz"
 },
 {
  "id": "N3Parser-test.js#1013",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <> against <http://abc/xyz?>",
  "line": 5752,
  "kind": "resolve",
  "baseIRI": "http://abc/xyz?",
  "relativeIri": "",
  "expected": "http://abc/xyz?"
 },
 {
  "id": "N3Parser-test.js#1014",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <.> against <http://abc/>",
  "line": 5755,
  "kind": "resolve",
  "baseIRI": "http://abc/",
  "relativeIri": ".",
  "expected": "http://abc/"
 },
 {
  "id": "N3Parser-test.js#1015",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <.> against <http://abc/def/ghi>",
  "line": 5756,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi",
  "relativeIri": ".",
  "expected": "http://abc/def/"
 },
 {
  "id": "N3Parser-test.js#1016",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <.?a=b> against <http://abc/def/ghi>",
  "line": 5757,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi",
  "relativeIri": ".?a=b",
  "expected": "http://abc/def/?a=b"
 },
 {
  "id": "N3Parser-test.js#1017",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <.#a=b> against <http://abc/def/ghi>",
  "line": 5758,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi",
  "relativeIri": ".#a=b",
  "expected": "http://abc/def/#a=b"
 },
 {
  "id": "N3Parser-test.js#1018",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <..> against <http://abc/>",
  "line": 5761,
  "kind": "resolve",
  "baseIRI": "http://abc/",
  "relativeIri": "..",
  "expected": "http://abc/"
 },
 {
  "id": "N3Parser-test.js#1019",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <..> against <http://abc/def/ghi>",
  "line": 5762,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi",
  "relativeIri": "..",
  "expected": "http://abc/"
 },
 {
  "id": "N3Parser-test.js#1020",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <..?a=b> against <http://abc/def/ghi>",
  "line": 5763,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi",
  "relativeIri": "..?a=b",
  "expected": "http://abc/?a=b"
 },
 {
  "id": "N3Parser-test.js#1021",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <..#a=b> against <http://abc/def/ghi>",
  "line": 5764,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi",
  "relativeIri": "..#a=b",
  "expected": "http://abc/#a=b"
 },
 {
  "id": "N3Parser-test.js#1022",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <xyz> against <http://ab//de//ghi>",
  "line": 5767,
  "kind": "resolve",
  "baseIRI": "http://ab//de//ghi",
  "relativeIri": "xyz",
  "expected": "http://ab//de//xyz"
 },
 {
  "id": "N3Parser-test.js#1023",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <./xyz> against <http://ab//de//ghi>",
  "line": 5768,
  "kind": "resolve",
  "baseIRI": "http://ab//de//ghi",
  "relativeIri": "./xyz",
  "expected": "http://ab//de//xyz"
 },
 {
  "id": "N3Parser-test.js#1024",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <../xyz> against <http://ab//de//ghi>",
  "line": 5769,
  "kind": "resolve",
  "baseIRI": "http://ab//de//ghi",
  "relativeIri": "../xyz",
  "expected": "http://ab//de/xyz"
 },
 {
  "id": "N3Parser-test.js#1025",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <xyz> against <http://abc/d:f/ghi>",
  "line": 5772,
  "kind": "resolve",
  "baseIRI": "http://abc/d:f/ghi",
  "relativeIri": "xyz",
  "expected": "http://abc/d:f/xyz"
 },
 {
  "id": "N3Parser-test.js#1026",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <./xyz> against <http://abc/d:f/ghi>",
  "line": 5773,
  "kind": "resolve",
  "baseIRI": "http://abc/d:f/ghi",
  "relativeIri": "./xyz",
  "expected": "http://abc/d:f/xyz"
 },
 {
  "id": "N3Parser-test.js#1027",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <../xyz> against <http://abc/d:f/ghi>",
  "line": 5774,
  "kind": "resolve",
  "baseIRI": "http://abc/d:f/ghi",
  "relativeIri": "../xyz",
  "expected": "http://abc/xyz"
 },
 {
  "id": "N3Parser-test.js#1028",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <abc> against <./>",
  "line": 5777,
  "kind": "resolve",
  "baseIRI": "./",
  "relativeIri": "abc",
  "expected": "/abc"
 },
 {
  "id": "N3Parser-test.js#1029",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <abc> against <../>",
  "line": 5778,
  "kind": "resolve",
  "baseIRI": "../",
  "relativeIri": "abc",
  "expected": "/abc"
 },
 {
  "id": "N3Parser-test.js#1030",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <././abc> against <./././>",
  "line": 5779,
  "kind": "resolve",
  "baseIRI": "./././",
  "relativeIri": "././abc",
  "expected": "/abc"
 },
 {
  "id": "N3Parser-test.js#1031",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <../../abc> against <../../../>",
  "line": 5780,
  "kind": "resolve",
  "baseIRI": "../../../",
  "relativeIri": "../../abc",
  "expected": "/abc"
 },
 {
  "id": "N3Parser-test.js#1032",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <././abc> against <.../././>",
  "line": 5781,
  "kind": "resolve",
  "baseIRI": ".../././",
  "relativeIri": "././abc",
  "expected": ".../abc"
 },
 {
  "id": "N3Parser-test.js#1033",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <def/../> against <a:b:c/>",
  "line": 5784,
  "kind": "resolve",
  "baseIRI": "a:b:c/",
  "relativeIri": "def/../",
  "expected": "a:b:c/"
 },
 {
  "id": "N3Parser-test.js#1034",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving </def> against <a:b:c>",
  "line": 5785,
  "kind": "resolve",
  "baseIRI": "a:b:c",
  "relativeIri": "/def",
  "expected": "a:/def"
 },
 {
  "id": "N3Parser-test.js#1035",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving </def> against <a:b/c>",
  "line": 5786,
  "kind": "resolve",
  "baseIRI": "a:b/c",
  "relativeIri": "/def",
  "expected": "a:/def"
 },
 {
  "id": "N3Parser-test.js#1036",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving </.> against <a:>",
  "line": 5787,
  "kind": "resolve",
  "baseIRI": "a:",
  "relativeIri": "/.",
  "expected": "a:/"
 },
 {
  "id": "N3Parser-test.js#1037",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving </..> against <a:>",
  "line": 5788,
  "kind": "resolve",
  "baseIRI": "a:",
  "relativeIri": "/..",
  "expected": "a:/"
 },
 {
  "id": "N3Parser-test.js#1038",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <jjj> against <http://abc/def/ghi?q=xx/yyy/z>",
  "line": 5791,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi?q=xx/yyy/z",
  "relativeIri": "jjj",
  "expected": "http://abc/def/jjj"
 },
 {
  "id": "N3Parser-test.js#1039",
  "path": [
   "Parser",
   "IRI resolution",
   "additional cases"
  ],
  "name": "resolving <jjj> against <http://abc/def/ghi?q=xx/y?y/z>",
  "line": 5792,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi?q=xx/y?y/z",
  "relativeIri": "jjj",
  "expected": "http://abc/def/jjj"
 },
 {
  "id": "N3Parser-test.js#1040",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <g:h> against <http://abc>",
  "line": 5796,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "g:h",
  "expected": "g:h"
 },
 {
  "id": "N3Parser-test.js#1041",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <g> against <http://abc>",
  "line": 5797,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1042",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <./g> against <http://abc>",
  "line": 5798,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "./g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1043",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <g/> against <http://abc>",
  "line": 5799,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "g/",
  "expected": "http://abc/g/"
 },
 {
  "id": "N3Parser-test.js#1044",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <g/h> against <http://abc>",
  "line": 5800,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "g/h",
  "expected": "http://abc/g/h"
 },
 {
  "id": "N3Parser-test.js#1045",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving </g> against <http://abc>",
  "line": 5801,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "/g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1046",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <//g> against <http://abc>",
  "line": 5802,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "//g",
  "expected": "http://g"
 },
 {
  "id": "N3Parser-test.js#1047",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <?y> against <http://abc>",
  "line": 5803,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "?y",
  "expected": "http://abc?y"
 },
 {
  "id": "N3Parser-test.js#1048",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <g?y> against <http://abc>",
  "line": 5804,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "g?y",
  "expected": "http://abc/g?y"
 },
 {
  "id": "N3Parser-test.js#1049",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <#s> against <http://abc>",
  "line": 5805,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "#s",
  "expected": "http://abc#s"
 },
 {
  "id": "N3Parser-test.js#1050",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <g#s> against <http://abc>",
  "line": 5806,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "g#s",
  "expected": "http://abc/g#s"
 },
 {
  "id": "N3Parser-test.js#1051",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <g?y#s> against <http://abc>",
  "line": 5807,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "g?y#s",
  "expected": "http://abc/g?y#s"
 },
 {
  "id": "N3Parser-test.js#1052",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <> against <http://abc>",
  "line": 5808,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "",
  "expected": "http://abc"
 },
 {
  "id": "N3Parser-test.js#1053",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <.> against <http://abc>",
  "line": 5809,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": ".",
  "expected": "http://abc/"
 },
 {
  "id": "N3Parser-test.js#1054",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <./> against <http://abc>",
  "line": 5810,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "./",
  "expected": "http://abc/"
 },
 {
  "id": "N3Parser-test.js#1055",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <..> against <http://abc>",
  "line": 5811,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "..",
  "expected": "http://abc/"
 },
 {
  "id": "N3Parser-test.js#1056",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <../> against <http://abc>",
  "line": 5812,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "../",
  "expected": "http://abc/"
 },
 {
  "id": "N3Parser-test.js#1057",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <../g> against <http://abc>",
  "line": 5813,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "../g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1058",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path in base IRI"
  ],
  "name": "resolving <../../g> against <http://abc>",
  "line": 5814,
  "kind": "resolve",
  "baseIRI": "http://abc",
  "relativeIri": "../../g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1059",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path and query in base IRI"
  ],
  "name": "resolving <g> against <http://abc?q>",
  "line": 5818,
  "kind": "resolve",
  "baseIRI": "http://abc?q",
  "relativeIri": "g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1060",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path and query in base IRI"
  ],
  "name": "resolving <?y> against <http://abc?q>",
  "line": 5819,
  "kind": "resolve",
  "baseIRI": "http://abc?q",
  "relativeIri": "?y",
  "expected": "http://abc?y"
 },
 {
  "id": "N3Parser-test.js#1061",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path and query in base IRI"
  ],
  "name": "resolving <#s> against <http://abc?q>",
  "line": 5820,
  "kind": "resolve",
  "baseIRI": "http://abc?q",
  "relativeIri": "#s",
  "expected": "http://abc?q#s"
 },
 {
  "id": "N3Parser-test.js#1062",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path and query in base IRI"
  ],
  "name": "resolving <> against <http://abc?q>",
  "line": 5821,
  "kind": "resolve",
  "baseIRI": "http://abc?q",
  "relativeIri": "",
  "expected": "http://abc?q"
 },
 {
  "id": "N3Parser-test.js#1063",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path and query in base IRI"
  ],
  "name": "resolving <../g> against <http://abc?q>",
  "line": 5822,
  "kind": "resolve",
  "baseIRI": "http://abc?q",
  "relativeIri": "../g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1064",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty host and path in base IRI"
  ],
  "name": "resolving <g> against <file://>",
  "line": 5826,
  "kind": "resolve",
  "baseIRI": "file://",
  "relativeIri": "g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#1065",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty host and path in base IRI"
  ],
  "name": "resolving <./g> against <file://>",
  "line": 5827,
  "kind": "resolve",
  "baseIRI": "file://",
  "relativeIri": "./g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#1066",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty host and path in base IRI"
  ],
  "name": "resolving <../g> against <file://>",
  "line": 5828,
  "kind": "resolve",
  "baseIRI": "file://",
  "relativeIri": "../g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#1067",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty host and path in base IRI"
  ],
  "name": "resolving <?y> against <file://>",
  "line": 5829,
  "kind": "resolve",
  "baseIRI": "file://",
  "relativeIri": "?y",
  "expected": "file://?y"
 },
 {
  "id": "N3Parser-test.js#1068",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty host and path in base IRI"
  ],
  "name": "resolving <#s> against <file://>",
  "line": 5830,
  "kind": "resolve",
  "baseIRI": "file://",
  "relativeIri": "#s",
  "expected": "file://#s"
 },
 {
  "id": "N3Parser-test.js#1069",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty host and path in base IRI"
  ],
  "name": "resolving <g> against <file://?q>",
  "line": 5831,
  "kind": "resolve",
  "baseIRI": "file://?q",
  "relativeIri": "g",
  "expected": "file:///g"
 },
 {
  "id": "N3Parser-test.js#1070",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path and fragment in base IRI"
  ],
  "name": "resolving <g> against <http://abc#top>",
  "line": 5835,
  "kind": "resolve",
  "baseIRI": "http://abc#top",
  "relativeIri": "g",
  "expected": "http://abc/g"
 },
 {
  "id": "N3Parser-test.js#1071",
  "path": [
   "Parser",
   "IRI resolution",
   "RFC3986 examples with empty path and fragment in base IRI"
  ],
  "name": "resolving <#s> against <http://abc#top>",
  "line": 5836,
  "kind": "resolve",
  "baseIRI": "http://abc#top",
  "relativeIri": "#s",
  "expected": "http://abc#s"
 },
 {
  "id": "N3Parser-test.js#1072",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host> against <http://a/b/c/d;p?q>",
  "line": 5840,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host",
  "expected": "http://host"
 },
 {
  "id": "N3Parser-test.js#1073",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/> against <http://a/b/c/d;p?q>",
  "line": 5841,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/",
  "expected": "http://host/"
 },
 {
  "id": "N3Parser-test.js#1074",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/../g> against <http://a/b/c/d;p?q>",
  "line": 5842,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/../g",
  "expected": "http://host/g"
 },
 {
  "id": "N3Parser-test.js#1075",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/../../g> against <http://a/b/c/d;p?q>",
  "line": 5843,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/../../g",
  "expected": "http://host/g"
 },
 {
  "id": "N3Parser-test.js#1076",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/..> against <http://a/b/c/d;p?q>",
  "line": 5844,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/..",
  "expected": "http://host/"
 },
 {
  "id": "N3Parser-test.js#1077",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/../..> against <http://a/b/c/d;p?q>",
  "line": 5845,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/../..",
  "expected": "http://host/"
 },
 {
  "id": "N3Parser-test.js#1078",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/./g> against <http://a/b/c/d;p?q>",
  "line": 5846,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/./g",
  "expected": "http://host/g"
 },
 {
  "id": "N3Parser-test.js#1079",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/g/../h> against <http://a/b/c/d;p?q>",
  "line": 5847,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/g/../h",
  "expected": "http://host/h"
 },
 {
  "id": "N3Parser-test.js#1080",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/../..> against <http://abc/def/ghi>",
  "line": 5848,
  "kind": "resolve",
  "baseIRI": "http://abc/def/ghi",
  "relativeIri": "//host/../..",
  "expected": "http://host/"
 },
 {
  "id": "N3Parser-test.js#1081",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host?x/../g> against <http://a/b/c/d;p?q>",
  "line": 5849,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host?x/../g",
  "expected": "http://host?x/../g"
 },
 {
  "id": "N3Parser-test.js#1082",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host#x/../g> against <http://a/b/c/d;p?q>",
  "line": 5850,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host#x/../g",
  "expected": "http://host#x/../g"
 },
 {
  "id": "N3Parser-test.js#1083",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host?x/./g> against <http://a/b/c/d;p?q>",
  "line": 5851,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host?x/./g",
  "expected": "http://host?x/./g"
 },
 {
  "id": "N3Parser-test.js#1084",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/a/..?x/../g> against <http://a/b/c/d;p?q>",
  "line": 5852,
  "kind": "resolve",
  "baseIRI": "http://a/b/c/d;p?q",
  "relativeIri": "//host/a/..?x/../g",
  "expected": "http://host/?x/../g"
 },
 {
  "id": "N3Parser-test.js#1085",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/../g> against <//base/a/b>",
  "line": 5853,
  "kind": "resolve",
  "baseIRI": "//base/a/b",
  "relativeIri": "//host/../g",
  "expected": "//host/g"
 },
 {
  "id": "N3Parser-test.js#1086",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host> against <//base/a/b>",
  "line": 5854,
  "kind": "resolve",
  "baseIRI": "//base/a/b",
  "relativeIri": "//host",
  "expected": "//host"
 },
 {
  "id": "N3Parser-test.js#1087",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host?x/../g> against <//base/a/b>",
  "line": 5855,
  "kind": "resolve",
  "baseIRI": "//base/a/b",
  "relativeIri": "//host?x/../g",
  "expected": "//host?x/../g"
 },
 {
  "id": "N3Parser-test.js#1088",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving </../g> against <//base/a/b>",
  "line": 5856,
  "kind": "resolve",
  "baseIRI": "//base/a/b",
  "relativeIri": "/../g",
  "expected": "//base/g"
 },
 {
  "id": "N3Parser-test.js#1089",
  "path": [
   "Parser",
   "IRI resolution",
   "scheme-relative references with dot segments"
  ],
  "name": "resolving <//host/./g/../h> against <./a/b>",
  "line": 5857,
  "kind": "resolve",
  "baseIRI": "./a/b",
  "relativeIri": "//host/./g/../h",
  "expected": "//host/h"
 }
];
