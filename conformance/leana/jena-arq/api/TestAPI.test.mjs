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
//   jena-arq/src/test/java/org/apache/jena/sparql/api/TestAPI.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Query execution answers a Promise (awaited).
// GraphFactory.makeDefaultModel() is ModelFactory.createDefaultModel().
// try-with-resources is try/finally close(). Model.asStatement(triple) +
// add is Graph.add(triple). IsoMatcher.isomorphic(dsg1, dsg2) is isoDSG
// below (same graph names, each graph isomorphic). assertThrows of a Promise
// is assert.rejects.

import assert from 'node:assert/strict';
import {
  ModelFactory, QueryExecution, QuerySolutionMap, QueryFactory, QueryExecutionFactory, QueryTransformOps,
  Syntax, DatasetFactory, DatasetGraphFactory, Quad, ResourceFactory, ResultSetFactory, ResultSetFormatter,
  QueryParseException, QueryException, OWL, RDF, AnonId,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const ns = 'http://example/ns#';
const m = ModelFactory.createDefaultModel();
const r1 = m.createResource();
const p1 = m.createProperty(ns + 'p1');
const p2 = m.createProperty(ns + 'p2');
const p3 = m.createProperty(ns + 'p3');
const dft = ModelFactory.createDefaultModel();
const s = dft.createResource(ns + 's');
const p = dft.createProperty(ns + 'p');
const o = dft.createResource(ns + 'o');
const g1 = dft.createResource(ns + 'g1');
m.add(r1, p1, 'x1');
m.add(r1, p2, 'X2'); // NB Capital
m.add(r1, p3, 'y1');
dft.add(s, p, o);
const d = DatasetFactory.create(dft);
d.addNamedModel(g1.getURI(), m);

async function queryAndCount(qExec) {
  try {
    const rs = await qExec.execSelect();
    return ResultSetFormatter.consume(rs);
  } finally {
    qExec.close();
  }
}

/** IsoMatcher.isomorphic for DatasetGraphs with IRI graph names. */
function isoDSG(a, b) {
  const names = (x) => x.listGraphNodes().toList().map(String).sort();
  if (JSON.stringify(names(a)) !== JSON.stringify(names(b))) return false;
  if (!a.getDefaultGraph().isIsomorphicWith(b.getDefaultGraph())) return false;
  return a.listGraphNodes().toList().every((gn) => a.getGraph(gn).isIsomorphicWith(b.getGraph(gn)));
}

/** Triples from an iterator into a new Model. */
function modelOf(iterTriples) {
  const result = ModelFactory.createDefaultModel();
  while (iterTriples.hasNext()) result.getGraph().add(iterTriples.next());
  return result;
}

async function quadsOf(qExec) {
  const iterQuads = await qExec.execConstructQuads();
  const quads = [];
  while (iterQuads.hasNext()) quads.push(iterQuads.next());
  return quads;
}

async function withExec(qExec, body) {
  try { return await body(qExec); } finally { qExec.close(); }
}

describeJena('TestAPI', 'jena-arq/src/test/java/org/apache/jena/sparql/api/TestAPI.java', (t) => {
  t('testSelect1', async () => {
    const qs = 'SELECT * {?s ?p ?o}';
    await withExec(QueryExecution.model(m).query(qs).build(), async (qExec) => {
      const rs = await qExec.execSelect();
      assert.ok(rs.hasNext(), 'No results');
      const qSoln = rs.nextSolution();
      const qr = qSoln.getResource('s');
      const s1 = qr.getModel().listStatements().toSet();
      const s2 = m.listStatements().toSet();
      assertEquals(s1, s2);
    });
  });

  t('testConstruct1', async () => {
    const qs = 'CONSTRUCT {?s ?p ?o} WHERE { ?s ?p ?o }';
    await withExec(QueryExecution.model(m).query(qs).build(), async (qExec) => {
      const m2 = await qExec.execConstruct();
      assert.ok(!m2.isEmpty(), 'No results');
      assert.ok(m.isIsomorphicWith(m2), 'Not isonorphic');
    });
  });

  t('testConstructBad1', async () => {
    const qs = `PREFIX :     <http://example/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
CONSTRUCT {
    << 456 :p :o >> .
    ?x :p :o .
    :s ?x :o .
    :tt1 :p <<( ?x :c2 :c3 )>> .
    :tt2 :p <<( :c1 ?x :c3 )>> .
    :tt3 :p <<( :c1 :c2 <<( ?x :d2 :d3 )>> )>> .
 } WHERE { BIND(123 AS ?x) }
`;
    // Bad triples in result. They should be filtered out.
    await withExec(QueryExecution.model(m).query(qs).build(), async (qExec) => {
      const m2 = await qExec.execConstruct();
      assert.ok(m2.isEmpty(), 'Expected empty graph');
    });
  });

  t('testSubstitutionConstruct1', async () => {
    const init = new QuerySolutionMap();
    init.add('z', m.createLiteral('zzz'));
    const qs = "CONSTRUCT {?s ?p ?z} {?s ?p 'x1'}";
    await withExec(QueryExecution.model(m).query(qs).substitution(init).build(), async (qExec) => {
      const r = await qExec.execConstruct();
      assert.ok(r.size() > 0, 'Empty model');
      const p1b = m.createProperty(ns + 'p1');
      assert.ok(r.contains(null, p1b, init.get('z')), 'Empty model');
    });
  });

  t('testSubstitutionConstruct2', async () => {
    const init = new QuerySolutionMap();
    init.add('o', m.createLiteral('x1'));
    const qs = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }';
    await withExec(QueryExecution.model(m).query(qs).substitution(init).build(), async (qExec) => {
      const r = await qExec.execConstruct();
      assert.ok(r.size() > 0, 'Empty model');
      const p1b = m.createProperty(ns + 'p1');
      assert.ok(r.contains(null, p1b, init.get('x1')), 'Empty model');
    });
  });

  t('testSubstitution0', () => {
    const smap1 = new QuerySolutionMap();
    const smap2 = new QuerySolutionMap();
    smap1.add('o', m.createLiteral('y1'));
    smap2.addAll(smap1);
    assert.ok(smap2.contains('o'));
    smap2.clear();
    assert.ok(!smap2.contains('o'));
    assert.ok(smap1.contains('o'));
    smap2.addAll(smap1); // (QuerySolution) cast
    assert.ok(smap2.contains('o'));
  });

  t('testSubstitution1', async () => {
    const init = new QuerySolutionMap();
    init.add('o', m.createLiteral('y1'));
    const qs = 'SELECT * {?s ?p ?o}';
    const count = await queryAndCount(QueryExecution.model(m).query(qs).substitution(init).build());
    assertEquals(1, count, "Initial binding didn't restrict query properly");
  });

  t('testSubstitution2', async () => {
    const init = new QuerySolutionMap();
    init.add('z', m.createLiteral('zzz'));
    const qs = 'SELECT * {?s ?p ?o}';
    const count = await queryAndCount(QueryExecution.model(m).query(qs).substitution(init).build());
    assertEquals(3, count, 'Initial binding restricted query improperly');
  });

  t('testSubstitution3', async () => {
    const init = new QuerySolutionMap();
    init.add('z', m.createLiteral('zzz'));
    const qs = "SELECT * {?s ?p 'x1'}";
    const q = QueryFactory.create(qs);
    const q2 = QueryTransformOps.syntaxSubstitute(q, init.asVarNodeMap());
    await withExec(QueryExecution.model(m).query(q2).build(), async (qExec) => {
      const rs = await qExec.execSelect();
      const qSoln = rs.nextSolution();
      assert.ok(qSoln.getLiteral('z').getLexicalForm() === 'zzz', 'Initial setting not set correctly now');
    });
  });

  t('testSubstitution4', async () => {
    const queryString = `PREFIX : <${ns}>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT *
WHERE {
    ?x :p1 ?z .
    NOT EXISTS {
        ?x rdfs:label ?z .
    }
}`;
    QueryFactory.create(queryString, Syntax.syntaxARQ);
    const map = new QuerySolutionMap();
    map.add('this', OWL.Thing);
    await withExec(QueryExecution.model(m).query(queryString).substitution(map).build(), async (qExec) => {
      const rs = await qExec.execSelect();
      while (rs.hasNext()) rs.nextSolution();
    });
  });

  t('testSubstitution5', async () => {
    const query = QueryFactory.create('ASK\nWHERE {\n    FILTER (?a = <http://constant>) .\n}');
    const model = ModelFactory.createDefaultModel();
    model.add(OWL.Thing, RDF.type, OWL.Class);
    const substitution = new QuerySolutionMap();
    substitution.add('a', ResourceFactory.createResource('http://constant'));
    await withExec(QueryExecution.model(model).query(query).substitution(substitution).build(), async (qExec) => {
      assert.ok(await qExec.execAsk());
    });
  });

  t('testSubstitution6', async () => {
    const query = QueryFactory.create('ASK\nWHERE {\n    FILTER (?a = ?b) .\n}');
    const model = ModelFactory.createDefaultModel();
    model.add(OWL.Thing, RDF.type, OWL.Class);
    const substitution = new QuerySolutionMap();
    substitution.add('a', ResourceFactory.createTypedLiteral(true));
    substitution.add('b', ResourceFactory.createTypedLiteral(true));
    await withExec(QueryExecution.model(model).query(query).substitution(substitution).build(), async (qExec) => {
      assert.ok(await qExec.execAsk());
    });
  });

  t('testSubstitution7', async () => {
    const query = QueryFactory.create('SELECT DISTINCT ?x WHERE {}');
    const ds = DatasetFactory.create();
    const substitution = new QuerySolutionMap();
    substitution.add('a', ResourceFactory.createTypedLiteral(true));
    await withExec(QueryExecution.dataset(ds).query(query).substitution(substitution).build(), async (qExec) => {
      assert.ok(!(await qExec.execSelect()).next().contains('a'));
    });
  });

  t('testReuseQueryObject1', async () => {
    const q = QueryFactory.create('SELECT * {?s ?p ?o}');
    let count = await queryAndCount(QueryExecutionFactory.create(q, m));
    assertEquals(3, count);
    count = await queryAndCount(QueryExecutionFactory.create(q, m));
    assertEquals(3, count);
  });

  t('testReuseQueryObject2', async () => {
    const q = QueryFactory.create('SELECT (count(?o) AS ?c) {?s ?p ?o} GROUP BY ?s');
    for (let i = 0; i < 2; i++) {
      await withExec(QueryExecutionFactory.create(q, m), async (qExec) => {
        const rs = await qExec.execSelect();
        const qs = rs.nextSolution();
        assertEquals(3, qs.getLiteral('c').getInt());
      });
    }
  });

  t('testConstructRejectsBadTriples1', async () => {
    const q = QueryFactory.create('CONSTRUCT { ?s ?p ?o } WHERE { ?o ?p ?s }');
    const resultModel = await QueryExecutionFactory.create(q, m).execConstruct();
    assertEquals(0, resultModel.size());
  });

  t('testConstructRejectsBadTriples2', async () => {
    const q = QueryFactory.create('CONSTRUCT { ?s ?p ?o } WHERE { ?o ?p ?s }');
    const ts = await QueryExecutionFactory.create(q, m).execConstructTriples();
    let count = 0;
    while (ts.hasNext()) { count++; ts.next(); }
    assertEquals(0, count);
  });

  t('testARQConstructQuad_a_1', async () => {
    const q = QueryFactory.create('CONSTRUCT { ?s ?p ?o } WHERE { GRAPH ?g { ?s ?p ?o } }', Syntax.syntaxARQ);
    const result = modelOf(await QueryExecutionFactory.create(q, d).execConstructTriples());
    assertEquals(3, result.size());
    assert.ok(m.isIsomorphicWith(result));
  });

  t('testARQConstructQuad_b_2', async () => {
    const q = QueryFactory.create("CONSTRUCT { GRAPH ?g1 {?s ?p ?o} } WHERE { ?s ?p ?o. GRAPH ?g1 {?s1 ?p1 'x1'} }", Syntax.syntaxARQ);
    const quads = await quadsOf(QueryExecutionFactory.create(q, d));
    const result = DatasetGraphFactory.create();
    for (const quad of quads) result.add(quad);
    const expected = DatasetGraphFactory.create();
    expected.add(g1.asNode(), s.asNode(), p.asNode(), o.asNode());
    assertEquals(1, quads.length);
    assert.ok(isoDSG(expected, result));
  });

  t('testARQConstructQuad_a_2', async () => {
    const q = QueryFactory.create('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }', Syntax.syntaxARQ);
    const quads = await quadsOf(QueryExecutionFactory.create(q, d));
    const result = DatasetGraphFactory.create();
    for (const quad of quads) result.add(quad);
    const expected = DatasetGraphFactory.create();
    expected.add(Quad.defaultGraphNodeGenerated, s.asNode(), p.asNode(), o.asNode());
    assertEquals(1, quads.length);
    assert.ok(isoDSG(expected, result));
  });

  t('testARQConstructQuad_b_1', async () => {
    const q = QueryFactory.create('CONSTRUCT { ?s ?p ?o GRAPH ?g1 { ?s1 ?p1 ?o1 } } WHERE { ?s ?p ?o. GRAPH ?g1 { ?s1 ?p1 ?o1 } }', Syntax.syntaxARQ);
    const result = modelOf(await QueryExecutionFactory.create(q, d).execConstructTriples());
    assertEquals(1, result.size());
    assert.ok(dft.isIsomorphicWith(result));
  });

  t('testARQConstructQuad_bnodes', async () => {
    const q = QueryFactory.create('PREFIX : <http://example/> CONSTRUCT { :s :p :o GRAPH _:a { :s :p :o1 } } WHERE { }', Syntax.syntaxARQ);
    const ds = await QueryExecutionFactory.create(q, d).execConstructDataset();
    assertEquals(1, ds.asDatasetGraph().listGraphNodes().toList().length);
    const n = ds.asDatasetGraph().listGraphNodes().next();
    assert.ok(n.isBlank());
    const g = ds.asDatasetGraph().getGraph(n);
    assert.ok(g !== null);
    assert.ok(!g.isEmpty());
  });

  t('testARQConstructQuad_Duplicate_1', async () => {
    const q = QueryFactory.create('CONSTRUCT { GRAPH ?g1 {?s ?p ?o} } WHERE { ?s ?p ?o. GRAPH ?g1 {?s1 ?p1 ?o1} }', Syntax.syntaxARQ);
    const quads = await quadsOf(QueryExecutionFactory.create(q, d));
    const expected = Quad.create(g1.asNode(), s.asNode(), p.asNode(), o.asNode());
    for (const quad of quads) assertEquals(expected, quad);
    assertEquals(3, quads.length); // 3 duplicated quads
  });

  t('testARQConstructQuad_Duplicate_2', async () => {
    const q = QueryFactory.create('CONSTRUCT { GRAPH ?g1 {?s ?p ?o} } WHERE { ?s ?p ?o. GRAPH ?g1 {?s1 ?p1 ?o1} }', Syntax.syntaxARQ);
    const result = await QueryExecutionFactory.create(q, d).execConstructDataset();
    const expected = DatasetGraphFactory.create();
    expected.add(g1.asNode(), s.asNode(), p.asNode(), o.asNode());
    assertEquals(1, result.asDatasetGraph().size());
    assert.ok(isoDSG(expected, result.asDatasetGraph()));
  });

  t('testARQConstructQuad_Duplicate_3', async () => {
    const q = QueryFactory.create('CONSTRUCT { GRAPH ?g1 {?s ?p ?o} GRAPH ?g1 {?s ?p ?o} } WHERE { ?s ?p ?o. GRAPH ?g1 {?s1 ?p1 ?o1} }', Syntax.syntaxARQ);
    const quads = await quadsOf(QueryExecutionFactory.create(q, d));
    const expected = Quad.create(g1.asNode(), s.asNode(), p.asNode(), o.asNode());
    for (const quad of quads) assertEquals(expected, quad);
    assertEquals(6, quads.length); // 6 duplicated quads
  });

  t('testARQConstructQuad_Prefix', async () => {
    const q = QueryFactory.create('PREFIX :   <http://example/ns#> CONSTRUCT { GRAPH :g1 { ?s :p ?o} } WHERE { ?s ?p ?o }', Syntax.syntaxARQ);
    const quads = await quadsOf(QueryExecutionFactory.create(q, d));
    const result = DatasetGraphFactory.create();
    for (const quad of quads) result.add(quad);
    const expected = DatasetGraphFactory.create();
    expected.add(g1.asNode(), s.asNode(), p.asNode(), o.asNode());
    assertEquals(1, quads.length);
    assert.ok(isoDSG(expected, result));
  });

  t('testARQConstructQuad_ShortForm_1', async () => {
    const q = QueryFactory.create('CONSTRUCT WHERE {?s ?p ?o }', Syntax.syntaxARQ);
    const result = ModelFactory.createDefaultModel();
    await QueryExecutionFactory.create(q, d).execConstruct(result);
    assertEquals(1, result.size());
    assert.ok(dft.isIsomorphicWith(result));
  });

  t('testARQConstructQuad_ShortForm_2', async () => {
    const q = QueryFactory.create('CONSTRUCT WHERE { GRAPH ?g {?s ?p ?o} }', Syntax.syntaxARQ);
    const result = await QueryExecutionFactory.create(q, d).execConstructDataset();
    const expected = DatasetFactory.createTxnMem();
    expected.addNamedModel(g1.getURI(), m);
    assert.ok(isoDSG(expected.asDatasetGraph(), result.asDatasetGraph()));
  });

  t('testARQConstructQuad_ShortForm_3', async () => {
    const q = QueryFactory.create('CONSTRUCT WHERE { ?s ?p ?o. GRAPH ?g1 {?s1 ?p1 ?o1} }', Syntax.syntaxARQ);
    const result = await QueryExecutionFactory.create(q, d).execConstructDataset();
    assert.ok(isoDSG(d.asDatasetGraph(), result.asDatasetGraph()));
  });

  t('testARQConstructQuad_ShortForm_bad', () => {
    const queryString = 'CONSTRUCT WHERE { GRAPH ?g {?s ?p ?o. FILTER isIRI(?o)}  }';
    try {
      QueryFactory.create(queryString, Syntax.syntaxARQ);
    } catch (e) {
      if (e instanceof QueryParseException) return;
      throw e;
    }
    assert.fail('Short form of construct quad MUST be simple graph patterns!');
  });

  t('testResultSetCloseableGood', async () => {
    const q = QueryFactory.create('SELECT * { ?s ?p ?o. }');
    const qExec = QueryExecutionFactory.create(q, d);
    const rs = await ResultSetFactory.closeableResultSet(qExec);
    try {
      const x = ResultSetFormatter.consume(rs);
      assertEquals(1, x);
    } finally { rs.close(); }
  });

  t('testResultSetCloseableBad', async () => {
    const q = QueryFactory.create('ASK { ?s ?p ?o. }');
    const qExec = QueryExecutionFactory.create(q, d);
    await assert.rejects(async () => {
      const rs = await ResultSetFactory.closeableResultSet(qExec);
      try { ResultSetFormatter.consume(rs); } finally { rs.close(); }
    }, QueryException);
  });

  t('testExecJson', async () => {
    const query = QueryFactory.create('JSON { "s": ?s , "p": ?p , "o" : ?o } WHERE { ?s ?p ?o }', Syntax.syntaxARQ);
    await withExec(QueryExecutionFactory.create(query, m), async (qexec) => {
      const jsonArray = await qexec.execJson();
      assert.ok(jsonArray != null);
      assertEquals(3, jsonArray.length);
    });
  });

  t('testExecJsonItems', async () => {
    const model = ModelFactory.createDefaultModel();
    const XSD = 'http://www.w3.org/2001/XMLSchema#';
    {
      let r = model.createResource(AnonId.create('first'));
      let pp = model.getProperty('');
      let node = ResourceFactory.createTypedLiteral('123', XSD + 'decimal');
      model.add(r, pp, node);
      r = model.createResource(AnonId.create('second'));
      pp = model.getProperty('');
      node = ResourceFactory.createTypedLiteral('abc', XSD + 'string');
      model.add(r, pp, node);
      r = model.createResource(AnonId.create('third'));
      pp = model.getProperty('');
      node = ResourceFactory.createLangLiteral('def', 'en');
      model.add(r, pp, node);
    }
    const query = QueryFactory.create('JSON { "s": ?s , "p": ?p , "o" : ?o } WHERE { ?s ?p ?o }', Syntax.syntaxARQ);
    await withExec(QueryExecutionFactory.create(query, model), async (qexec) => {
      const items = await qexec.execJsonItems();
      let size = 0;
      for (const next of items) {
        if (String(next.s).includes('first')) assertEquals(123, Number(next.o));
        else if (String(next.s).includes('second')) assertEquals('abc', next.o);
        else if (String(next.s).includes('third')) assertEquals('def', next.o);
        size++;
      }
      assertEquals(3, size);
    });
  });
});
