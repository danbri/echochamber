// Derived from rdfjs-base/data-model test/blank-node.test.js at commit 66eae148b37e4df11e2a5e445db9fa785546e05b
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

import { strictEqual, notStrictEqual } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.blankNode', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.blankNode, 'function')
    })

    it('should create an object with a termType property that contains the value "BlankNode"', () => {
      const term = factory.blankNode()

      strictEqual(term.termType, 'BlankNode')
    })

    it('should create an object with a value property that contains a unique identifier', () => {
      const term1 = factory.blankNode()
      const term2 = factory.blankNode()

      notStrictEqual(term1.value, term2.value)
    })

    it('should create an object with a value property that contains the given identifier', () => {
      const id = 'b1'
      const term = factory.blankNode(id)

      strictEqual(term.value, id)
    })

    describe('.equals', () => {
      it('should be a method', () => {
        const term = factory.blankNode()

        strictEqual(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', () => {
        const id = 'b1'
        const term = factory.blankNode(id)
        const mock = { termType: 'BlankNode', value: id }

        strictEqual(term.equals(mock), true)
      })

      it('should return false if termType is not equal', () => {
        const id = 'b1'
        const term = factory.blankNode(id)
        const mock = { termType: 'NamedNode', value: id }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is not equal', () => {
        const id = 'b1'
        const term = factory.blankNode(id)
        const mock = { termType: 'BlankNode', value: id + '1' }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is falsy', () => {
        const id = 'b1'
        const term = factory.blankNode(id)

        strictEqual(term.equals(null), false)
      })
    })
  })
}

export default runTests
