// Derived from rdfjs-base/data-model test/fromQuad.test.js at commit 66eae148b37e4df11e2a5e445db9fa785546e05b
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
// What changed: file renamed to .mjs; the code is unchanged.

import { notStrictEqual, strictEqual, throws } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.fromQuad', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.fromQuad, 'function')
    })

    it('should create a clone of the given Quad', () => {
      const subject = factory.blankNode()
      const predicate = factory.namedNode('http://example.org/predicate')
      const object = factory.literal('example')
      const graph = factory.namedNode('http://example.org/graph')
      const original = factory.quad(subject, predicate, object, graph)

      const term = factory.fromQuad(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
    })

    it('should return null if null is given', () => {
      const term = factory.fromQuad(null)

      strictEqual(term, null)
    })

    it('should throw an error if an unknown object is given', () => {
      const original = {}

      throws(() => {
        factory.fromQuad(original)
      })
    })
  })
}

export default runTests
