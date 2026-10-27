/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 *   SPDX-License-Identifier: Apache-2.0
 */
// Derived from Apache Jena (Apache License 2.0) at commit
// a1164c5dc5c9e1a9c58d94766c13d870e0a8ba98:
//   jena-core/src/test/java/org/apache/jena/graph/TestNode.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Java NullPointerException is a JS TypeError; vocabulary
// constants (XSDDatatype, RDF.dtLangString, PrefixMapping.Extended) are test
// data from lib/testlib.mjs; assertSame on a fresh object is identity (===).

import assert from 'node:assert/strict';
import {
  Node, NodeFactory, Node_Variable, Node_Graph, Triple, GraphMemFactory, PrefixMapping, TypeMapper,
  UnsupportedOperationException, JenaException, LiteralLabel,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { create, node, assertEquals, assertDiffer, assertThrows, Extended, NS } from '../../lib/testlib.mjs';

const XSDstring = NodeFactory.getType(NS.xsd + 'string');
const dtLangString = NodeFactory.getType(NS.rdf + 'langString');
const expand = (s) => Extended.expandPrefix(s);

const U = 'http://some.domain.name/magic/spells.incant';
const N = 'Alice';
// LiteralLabelFactory.createLang("ashes are burning", "en"): leana's LiteralLabel is that of a literal Node.
const Lnode = () => NodeFactory.createLiteralLang('ashes are burning', 'en');
// BlankNodeId.createFreshId(): a fresh label from the engine's DataFactory.
const freshId = () => NodeFactory.createBlankNode().getBlankNodeLabel();
const A = freshId();

function assertString(n) {
  const dt = n.getLiteralDatatype();
  assert.equal(n.getLiteralLanguage(), '');
  assertEquals(XSDstring, dt);
}
function assertLangString(n) {
  const dt = n.getLiteralDatatype();
  assertDiffer('', n.getLiteralLanguage(), '');
  assertEquals(dtLangString, dt);
}

describeJena('TestNode', 'jena-core/src/test/java/org/apache/jena/graph/TestNode.java', (t) => {
  t('testBlanks', () => {
    assert.ok(NodeFactory.createBlankNode().isBlank(), 'anonymous nodes are blank');
    assert.ok(!NodeFactory.createBlankNode().isLiteral(), "anonymous nodes aren't literal");
    assert.ok(!NodeFactory.createBlankNode().isURI(), "anonymous nodes aren't URIs");
    assert.ok(!NodeFactory.createBlankNode().isVariable(), "anonymous nodes aren't variables");
    assert.equal(NodeFactory.createBlankNode(A).getBlankNodeLabel(), A, 'anonymous nodes have the right id');
  });

  t('testLiterals', () => {
    assert.ok(!Lnode().isBlank(), "literal nodes aren't blank");
    assert.ok(Lnode().isLiteral(), 'literal nodes are literal');
    assert.ok(!Lnode().isVariable(), "literal nodes aren't variables");
    assert.ok(!Lnode().isURI(), "literal nodes aren't URIs");
    assertEquals(Lnode().getLiteral(), Lnode().getLiteral(), 'literal nodes preserve value');
  });

  t('testURIs', () => {
    assert.ok(!NodeFactory.createURI(U).isBlank(), "URI nodes aren't blank");
    assert.ok(!NodeFactory.createURI(U).isLiteral(), "URI nodes aren't literal");
    assert.ok(!NodeFactory.createURI(U).isVariable(), "URI nodes aren't variables");
    assert.ok(NodeFactory.createURI(U).isURI(), 'URI nodes are URIs');
    assert.equal(NodeFactory.createURI(U).getURI(), U, 'URI nodes preserve URI');
  });

  t('testVariables', () => {
    assert.ok(!NodeFactory.createVariable(N).isBlank());
    assert.ok(!NodeFactory.createVariable(N).isLiteral());
    assert.ok(!NodeFactory.createVariable(N).isURI());
    assert.ok(NodeFactory.createVariable(N).isVariable());
    assert.equal(NodeFactory.createVariable(N).getName(), N);
    assert.equal(NodeFactory.createVariable(N + 'x').getName(), N + 'x');
  });

  t('testANY', () => {
    assert.ok(!Node.ANY.isBlank());
    assert.ok(!Node.ANY.isLiteral());
    assert.ok(!Node.ANY.isURI());
    assert.ok(!Node.ANY.isVariable());
  });

  t('testNodeVariableConstructor', () => {
    assertEquals(NodeFactory.createVariable('hello'), new Node_Variable('hello'));
    assertEquals(NodeFactory.createVariable('world'), new Node_Variable('world'));
    assertDiffer(NodeFactory.createVariable('hello'), new Node_Variable('world'));
    assert.equal(new Node_Variable('myName').getName(), 'myName');
  });

  function eqTestCases() {
    const id = freshId();
    const L2 = NodeFactory.createLiteralString(id);
    const LLang1 = NodeFactory.createLiteralLang('xyz', 'en');
    const LLang2 = NodeFactory.createLiteralLang('xyz', 'EN');
    return [[Node.ANY, '0'], [NodeFactory.createBlankNode(id), '1'], [NodeFactory.createBlankNode(), '2'],
      [NodeFactory.createBlankNode(id), '1'], [Lnode(), '3'],
      [L2, '4'], [Lnode(), '3'], [NodeFactory.createURI(U), '5'],
      [NodeFactory.createURI(id), '6'], [NodeFactory.createURI(U), '5'], [NodeFactory.createVariable(N), '7'],
      [NodeFactory.createVariable(id), '8'], [NodeFactory.createVariable(N), '7'],
      [LLang1, '9'], [LLang2, '10']];
  }

  t('testNodeEquals', () => {
    const tests = eqTestCases();
    for (const I of tests) {
      assert.ok(!I[0].equals(null), I[0] + ' should not equal null');
      assert.ok(!I[0].equals('String'), I[0] + " should not equal 'String'");
      for (const J of tests) {
        if (I[1] === J[1]) assertEquals(I[0], J[0], `${I[0]} and ${J[0]} should be equal`);
        else assertDiffer(`${I[0]} and ${J[0]} should differ`, I[0], J[0]);
      }
    }
  });

  t('testEquals', () => {
    assertDiffer('different variables', NodeFactory.createVariable('xx'), NodeFactory.createVariable('yy'));
    assertEquals(NodeFactory.createVariable('aa'), NodeFactory.createVariable('aa'), 'same vars');
    assertEquals(NodeFactory.createURI(U), NodeFactory.createURI(U), 'same URI');
    assertEquals(NodeFactory.createBlankNode(A), NodeFactory.createBlankNode(A), 'same anon');
    assertEquals(Lnode(), Lnode(), 'same literal');
    assert.ok(NodeFactory.createURI(U) !== NodeFactory.createURI(U), 'distinct URIs');
    assert.ok(NodeFactory.createBlankNode(A) !== NodeFactory.createBlankNode(A), 'distinct hyphens');
    assert.ok(Lnode() !== Lnode(), 'distinct literals');
    assert.ok(NodeFactory.createVariable('aa') !== NodeFactory.createVariable('aa'), 'distinct vars');
  });

  t('testLabels', () => {
    const id = freshId();
    assert.equal(NodeFactory.createURI(U).getURI(), U);
    assert.equal(NodeFactory.createBlankNode(id).getBlankNodeLabel(), id);
    assertEquals(Lnode().getLiteral(), Lnode().getLiteral());
    assert.equal(NodeFactory.createVariable(N).getName(), N);
  });

  t('testFailingLabels', () => {
    const u = NodeFactory.createURI(U), b = NodeFactory.createBlankNode();
    const l = Lnode(), v = NodeFactory.createVariable(N);
    const a = Node.ANY;
    for (const n of [a, b, l, v]) assertThrows(UnsupportedOperationException, () => n.getURI());
    for (const n of [a, u, b, v]) assertThrows(UnsupportedOperationException, () => n.getLiteral());
    for (const n of [a, u, b, l]) assertThrows(UnsupportedOperationException, () => n.getName());
    for (const n of [a, u, l, v]) assertThrows(UnsupportedOperationException, () => n.getBlankNodeLabel());
  });

  t('testGetBlankNodeLabelString', () => {
    assert.ok(NodeFactory.createBlankNode().getBlankNodeLabel() != null);
  });

  t('testVariableSupport', () => {
    assertEquals(new Node_Variable('xxx'), new Node_Variable('xxx'));
    assertDiffer(new Node_Variable('xxx'), new Node_Variable('yyy'));
  });

  t('testCreateBadString', () => {
    assert.throws(() => create(null), (e) => e instanceof TypeError || e instanceof JenaException);
    assertThrows(JenaException, () => create(''));
  });

  t('testCreateBlankNode', () => {
    const a = create('_xxx'), b = create('_yyy');
    assert.ok(a.isBlank() && b.isBlank(), 'both must be bnodes');
    assert.equal(a.getBlankNodeLabel(), NodeFactory.createBlankNode('_xxx').getBlankNodeLabel());
    assert.equal(b.getBlankNodeLabel(), NodeFactory.createBlankNode('_yyy').getBlankNodeLabel());
  });

  t('testCreateVariable', () => {
    const v = create('?wobbly');
    assert.ok(v.isVariable());
    assert.equal(v.getName(), 'wobbly');
  });

  t('testCreateANY', () => {
    assertEquals(Node.ANY, create('??'), '?? must denote ANY');
  });

  t('testCreatePlainLiteralSingleQuotes', () => {
    const n = create("'xxx'");
    assert.equal(n.getLiteralLexicalForm(), 'xxx');
    assertString(n);
  });

  t('testCreatePlainLiteralDoubleQuotes', () => {
    const n = create('"xxx"');
    assert.equal(n.getLiteralLexicalForm(), 'xxx');
    assertString(n);
  });

  function testStringConversion(wanted, template) {
    const n = create(template);
    assert.equal(n.getLiteralLexicalForm(), wanted);
    assert.equal(n.getLiteralLanguage(), '');
    assertString(n);
  }

  t('testCreateLiteralBackslashEscape', () => {
    testStringConversion('xx\\x', "'xx\\\\x'");
    testStringConversion('xx\\x\\y', "'xx\\\\x\\\\y'");
    testStringConversion('\\xyz\\', "'\\\\xyz\\\\'");
  });

  t('testCreateLiteralQuoteEscapes', () => {
    testStringConversion("x'y", "'x\\'y'");
    testStringConversion('x"y', "'x\\\"y'");
    testStringConversion('x\'y"z', "'x\\'y\\\"z'");
  });

  t('testCreateLiteralOtherEscapes', () => {
    testStringConversion(' ', "'\\s'");
    testStringConversion('\t', "'\\t'");
    testStringConversion('\n', "'\\n'");
  });

  t('testCreateLanguagedLiteralEN1', () => {
    const n = create("'chat'en-UK");
    assert.equal(n.getLiteralLexicalForm(), 'chat');
    assertLangString(n);
    assert.equal(n.getLiteralLanguage(), 'en-UK');
  });

  t('testCreateLanguagedLiteralEN2', () => {
    const n1 = create("'chat'en-UK");
    const n2 = create("'chat'EN-UK");
    assert.ok(n1.sameValueAs(n2));
    assert.ok(n1.equals(n2));
  });

  t('testCreateLanguagedLiteralXY', () => {
    const n = create('"chat"xy-AB');
    assert.equal(n.getLiteralLexicalForm(), 'chat');
    assert.equal(n.getLiteralLanguage(), 'xy-AB');
    assertLangString(n);
  });

  t('testCreateTypedLiteralInteger', () => {
    const n = create("'42'xsd:integer");
    assert.equal(n.getLiteralLexicalForm(), '42');
    assert.equal(n.getLiteralLanguage(), '');
    assert.equal(n.getLiteralDatatypeURI(), expand('xsd:integer'));
  });

  t('testCreateTypedLiteralBoolean', () => {
    const n = create('"true"xsd:boolean');
    assert.equal(n.getLiteralLexicalForm(), 'true');
    assert.equal(n.getLiteralLanguage(), '');
    assert.equal(n.getLiteralDatatypeURI(), expand('xsd:boolean'));
  });

  t('testGetPlainLiteralLexicalForm', () => {
    assert.equal(create("'stuff'").getLiteralLexicalForm(), 'stuff');
  });

  t('testGetNumericLiteralLexicalForm', () => {
    assert.equal(create('17').getLiteralLexicalForm(), '17');
  });

  t('testTypesExpandPrefix', () => {
    for (const type of ['rdf:spoo', 'rdfs:bar', 'owl:henry', 'xsd:bool', 'unknown:spoo']) {
      const n = create("'stuff'" + type);
      // Jena: PrefixMapping.Extended.expandPrefix(type).
      assert.equal(n.getLiteralDatatypeURI(), PrefixMapping.Extended.expandPrefix(type));
    }
  });

  function testCreateURI(inp, wanted = inp) {
    const got = create(inp).getURI();
    if (wanted !== got) {
      if (inp === wanted) assert.fail('should preserve ' + inp);
      else assert.fail(`should translate ${inp} to ${wanted} not ${got}`);
    }
  }

  t('testCreateURI', () => {
    testCreateURI('http://www.electric-hedgehog.net/');
    testCreateURI('rdf:trinket', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#trinket');
    testCreateURI('rdfs:device', 'http://www.w3.org/2000/01/rdf-schema#device');
    testCreateURI('dc:creator', NS.dc + 'creator');
    testCreateURI('rss:something', NS.rss + 'something');
    testCreateURI('vcard:TITLE', NS.vcard + 'TITLE');
    testCreateURI('owl:wol', NS.owl + 'wol');
  });

  t('testCreateURIOtherMap', () => {
    const myNS = 'eh:foo/bar#', suffix = 'something';
    const mine = PrefixMapping.Factory.create().setNsPrefix('mine', myNS);
    assert.equal(create(mine, 'mine:' + suffix).getURI(), myNS + suffix);
  });

  t('testCreatePrefixed', () => {
    const pm = PrefixMapping.Factory.create();
    create(pm, 'xyz');
  });

  t('testToStringWithPrefixMapping', () => {
    const pm = PrefixMapping.Factory.create();
    const prefix = 'spoo', ns = 'abc:def/ghi#';
    pm.setNsPrefix(prefix, ns);
    const suffix = 'bamboozle';
    assert.equal(create(ns + suffix).toString(pm), prefix + ':' + suffix);
  });

  t('testNodeHelp', () => {
    assert.ok(node('hello').isURI());
    assert.ok(node('123').isLiteral());
    assert.ok(node("'hello'").isLiteral());
    assert.ok(node('_x').isBlank());
    assert.ok(node('?x').isVariable());
  });

  t('testVisitorPatternNode', () => {
    const ret = (it) => it;
    const returnNode = {
      visitAny: ret, visitBlank: ret, visitLiteral: ret, visitURI: ret, visitVariable: ret, visitTriple: ret, visitGraph: ret,
    };
    for (const ns of ['sortOfURI', '?variable', '_anon', '11', '??']) {
      const n = node(ns);
      assertEquals(n, n.visitWith(returnNode));
    }
  });

  function visitExamples(nv) {
    node('sortOfURI').visitWith(nv);
    node('?variableI').visitWith(nv);
    node('_anon').visitWith(nv);
    node('11').visitWith(nv);
    node('??').visitWith(nv);
    const s = node('uri1'), p = node('uri2'), o = node('uri1');
    NodeFactory.createTripleTerm(s, p, o).visitWith(nv);
    const g = GraphMemFactory.empty();
    new Node_Graph(g).visitWith(nv);
  }

  t('testVisitorPatternValue', () => {
    const checkValue = {
      visitAny: () => null,
      visitBlank: (it, label) => { assert.ok(it.getBlankNodeLabel() === label); return null; },
      visitLiteral: (it, lex, lang, dtype) => {
        assert.equal(it.getLiteralLexicalForm(), lex);
        assert.equal(it.getLiteralLanguage(), lang);
        assertEquals(dtype, it.getLiteralDatatype());
        return null;
      },
      visitURI: (it, uri) => { assert.ok(it.getURI() === uri); return null; },
      visitVariable: (it, name) => { assert.equal(name, it.getName()); return null; },
      visitTriple: (it, triple) => { assertEquals(it.getTriple(), triple); return null; },
      visitGraph: (it, graph) => { assert.equal(graph, it.getGraph()); return null; },
    };
    visitExamples(checkValue);
  });

  t('testVisitorPatternCalled', () => {
    let s = '';
    const checkCalled = {
      visitAny: () => { s += ' any'; return null; },
      visitBlank: () => { s += ' blank'; return null; },
      visitLiteral: () => { s += ' literal'; return null; },
      visitURI: () => { s += ' uri'; return null; },
      visitVariable: () => { s += ' variable'; return null; },
      visitTriple: () => { s += ' termTriple'; return null; },
      visitGraph: () => { s += ' termGraph'; return null; },
    };
    visitExamples(checkCalled);
    assert.equal(s, ' uri variable blank literal any termTriple termGraph', 'all visits must have been made');
  });

  t('testSimpleMatches', () => {
    assert.ok(create('S').sameTermAs(create('S')));
    assert.ok(!create('S').sameTermAs(create('T')));
    assert.ok(create('_X').sameTermAs(create('_X')));
    assert.ok(!create('_X').sameTermAs(create('_Y')));
    assert.ok(create('10').sameTermAs(create('10')));
    assert.ok(!create('10').sameTermAs(create('11')));
    assertThrows(TypeError, () => create('S').sameTermAs(null));
  });

  t('testDataSameValue', () => {
    const tm = TypeMapper.getInstance();
    const dt1 = tm.getTypeByValue(10); // Java Integer.valueOf(10)
    const dt2 = tm.getTypeByValue(10); // Java Short.valueOf((short)10): not expressible as a JS value
    const a = NodeFactory.createLiteralDT('10', dt1);
    const b = NodeFactory.createLiteralDT('10', dt2);
    assertDiffer('types must make a difference', a, b);
    assert.ok(a.sameValueAs(b), 'A and B must express the same value');
  });

  t('testLiteralToString', () => {
    const tm = TypeMapper.getInstance();
    const dtInt = tm.getTypeByValue(10);
    const plain = NodeFactory.createLiteralLang('rhubarb', '');
    const english = NodeFactory.createLiteralLang('eccentric', 'en-UK');
    const typed = NodeFactory.createLiteralDT('10', dtInt);
    assert.equal(plain.toString(), '"rhubarb"');
    assert.equal(english.toString(), '"eccentric"@en-UK');
    assert.equal(typed.toString(), '"10"^^xsd:int');
  });

  t('testGetIndexingValueURI', () => {
    const u = create('eh:/telephone');
    assert.equal(u.getIndexingValue(), u);
  });

  t('testGetIndexingValueBlank', () => {
    const b = create('_television');
    assert.equal(b.getIndexingValue(), b);
  });

  function testIndexingValueLiteral(creator) {
    const n1 = creator(), n2 = creator();
    assert.notEqual(n1, n2);
    assertEquals(n1.getLiteral().getIndexingValue(), n2.getIndexingValue());
    assertEquals(n1.getLiteral().getIndexingValue().hashCode(), n2.getIndexingValue().hashCode());
  }

  t('testGetIndexingValuePlainString', () => testIndexingValueLiteral(() => create("'literally'")));
  t('testGetIndexingValueLanguagedString', () => testIndexingValueLiteral(() => create("'chat'fr")));
  t('testGetIndexingValueXSDString', () => testIndexingValueLiteral(() => create("'string'xsd:string")));
  t('testGetIndexingValueHexBinary1', () => testIndexingValueLiteral(() => create("''xsd:hexBinary")));
  t('testGetIndexingValueHexBinary2', () => testIndexingValueLiteral(() => create("'ABCD'xsd:hexBinary")));
  t('testGetIndexingValueBase64Binary1', () => testIndexingValueLiteral(() => create("''xsd:base64Binary")));
  t('testGetIndexingValueBase64Binary2', () => testIndexingValueLiteral(() => create("'c3VyZS4='xsd:base64Binary")));

  t('testGetLiteralValuePlainString', () => {
    const s = create("'aString'");
    assert.equal(s.getLiteralValue(), s.getLiteral().getValue());
  });

  t('testGetLiteralDatatypePlainString', () => {
    assertString(create("'plain'"));
  });

  t('testConcrete', () => {
    assert.ok(create('S').isConcrete());
    assert.ok(create('_P').isConcrete());
    assert.ok(create('11').isConcrete());
    assert.ok(create("'hello'").isConcrete());
    assert.ok(!create('??').isConcrete());
    assert.ok(!create('?x').isConcrete());
  });

  const someURIs = ['http://domainy.thing/stuff/henry', 'http://whatever.com/stingy-beast/bee',
    'ftp://erewhon/12345', 'potatoe:rhubarb'];

  t('testNamespace', () => {
    // Jena: SplitIRI.splitXML(uri) gives the expected split; leana has no IRI split (gap).
    for (const uri of someURIs) {
      const n = create(uri);
      n.getNameSpace();
      n.getLocalName();
    }
  });

  const someNodes = ['42', "'hello'", '_anon', "'robotic'tick", "'teriffic'abc:def"];

  t('testHasURI', () => {
    for (const uri of [...someURIs, ...someNodes]) {
      const n = create(uri);
      assert.ok(!n.isURI() || n.hasURI(uri), uri);
      assert.ok(!n.hasURI(uri + 'x'), uri);
    }
  });
});
