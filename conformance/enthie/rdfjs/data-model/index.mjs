// Derived from rdfjs-base/data-model test/index.js at commit 66eae148b37e4df11e2a5e445db9fa785546e05b
// (https://github.com/rdfjs-base/data-model), licensed as follows:
//
// MIT License
//
// Copyright (c) 2024 Thomas Bergwinkl
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// What changed: file renamed to .mjs; imports point at the .mjs copies; the global.rdf / global.describe fallback removed (the runner passes describe and it).

import blankNodeTest from './blank-node.test-suite.mjs'
import defaultGraphTest from './default-graph.test-suite.mjs'
import fromQuadTest from './fromQuad.test-suite.mjs'
import fromTermTest from './fromTerm.test-suite.mjs'
import literalTest from './literal.test-suite.mjs'
import namedNodeTest from './named-node.test-suite.mjs'
import quadTest from './quad.test-suite.mjs'
import variableTest from './variable.test-suite.mjs'

function runTests ({ factory, mocha }) {

  const tests = [
    blankNodeTest,
    defaultGraphTest,
    fromQuadTest,
    fromTermTest,
    literalTest,
    namedNodeTest,
    quadTest,
    variableTest
  ]

  for (const test of tests) {
    test({ factory, mocha })
  }
}


export default runTests
