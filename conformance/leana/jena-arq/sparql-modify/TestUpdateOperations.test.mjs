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
// Derived from Apache Jena (Apache License 2.0) at commit
// a1164c5dc5c9e1a9c58d94766c13d870e0a8ba98:
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateOperations.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Updates answer a Promise (awaited); assertThrows of
// an update is assert.rejects. DIR "testing/Update" (relative, resolved by Jena
// against the working directory) is the copied fixture directory as a file:
// IRI. The @BeforeAll/@AfterAll that silence the parser's error handler are
// left out (leana's parser does not log). Iter.count(gs.find()) is
// gs.find().toList().length. The DatasetGraphWrapper subclass that counts
// add/delete calls is a JS subclass of the dataset's class (an update reaches the
// dataset through the engine, not through add/delete). RDF.type and OWL.Thing
// are written as IRIs (leana's vocabulary constants are gap 'vocabulary'). strjoinNL is a join with '\n'.

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import {
  DatasetGraphFactory, NodeFactory, Triple, ModelFactory, UpdateFactory, UpdateAction, UpdateException,
  QueryParseException,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { FileBase } from './updatebase.mjs';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const OWL_THING = 'http://www.w3.org/2002/07/owl#Thing';
const DIR = pathToFileURL(FileBase).href;
const graphStore = () => DatasetGraphFactory.create();
const gName = NodeFactory.createURI('http://example/g');
const count = (gs) => gs.find().toList().length;

describeJena('TestUpdateOperations', 'jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateOperations.java', (t) => {
  t('loadTriples', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-triple.nt>');
    await UpdateAction.execute(req, gs);
    assert.equal(gs.getDefaultGraph().size(), 1);
    assert.ok(!gs.listGraphNodes().hasNext());
  });

  t('loadTriplesInto', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-triple.nt> INTO GRAPH <' + gName.getURI() + '>');
    await UpdateAction.execute(req, gs);
  });

  // Bad: loading quads into a graph
  t('loadQuadsInto', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-quad.nq> INTO GRAPH <' + gName.getURI() + '>');
    await assert.rejects(() => UpdateAction.execute(req, gs), UpdateException);
  });

  t('loadQuadsIntoSilent', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD SILENT <' + DIR + '/D-quad.nq> INTO GRAPH <' + gName.getURI() + '>');
    await UpdateAction.execute(req, gs);
    assert.equal(count(gs), 0);
  });

  t('loadTriplesIntoBad', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-bad.nt> INTO GRAPH <' + gName.getURI() + '>');
    await assert.rejects(() => UpdateAction.execute(req, gs), UpdateException);
  });

  t('loadTriplesIntoBadSilent', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD SILENT <' + DIR + '/D-bad.nt> INTO GRAPH <' + gName.getURI() + '>');
    await UpdateAction.execute(req, gs);
    assert.equal(count(gs), 0);
  });

  // Quad loading (extension)
  t('loadQuads', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-quad.nq>');
    await UpdateAction.execute(req, gs);
    assert.equal(gs.getDefaultGraph().size(), 0);
    gs.containsGraph(NodeFactory.createURI('http://example/'));
    assert.equal(gs.getGraph(gName).size(), 1);
  });

  t('loadBadQuads', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-bad.nq>');
    await assert.rejects(() => UpdateAction.execute(req, gs), UpdateException);
  });

  t('loadBadQuadsSilent', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD SILENT <' + DIR + '/D-bad.nq>');
    await UpdateAction.execute(req, gs);
    assert.equal(count(gs), 0);
  });

  // Called "N-triples" but the data is quads
  t('loadQuadsNTIntoGraph', async () => {
    const gs = graphStore();
    // N-Quads pretending to be N-Triples.
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-bad-quad.nt> INTO GRAPH <' + gName.getURI() + '>');
    await assert.rejects(() => UpdateAction.execute(req, gs), UpdateException);
  });

  t('loadQuadsNTIntoGraphSilent', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD SILENT <' + DIR + '/D-bad-quad.nt> INTO GRAPH <' + gName.getURI() + '>');
    await UpdateAction.execute(req, gs);
    assert.equal(count(gs), 0);
  });

  t('loadNotFound', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-not-found.nt>');
    await assert.rejects(() => UpdateAction.execute(req, gs), UpdateException);
  });

  t('loadNotFoundSilent', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD SILENT <' + DIR + '/D-not-found.nt>');
    await UpdateAction.execute(req, gs);
    assert.equal(count(gs), 0);
  });

  t('loadNotFoundInto', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD <' + DIR + '/D-not-found.nt> INTO GRAPH <' + gName.getURI() + '>');
    await assert.rejects(() => UpdateAction.execute(req, gs), UpdateException);
  });

  t('loadNotFoundIntoSilent', async () => {
    const gs = graphStore();
    const req = UpdateFactory.create('LOAD SILENT <' + DIR + '/D-not-found.nt> INTO GRAPH <' + gName.getURI() + '>');
    await UpdateAction.execute(req, gs);
    assert.equal(count(gs), 0);
  });

  t('insert_data_01', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { :a :p <<( :s :p :o )>>  .}';
    UpdateFactory.create(x);
  });

  // Triple terms.
  t('insert_data_02', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { <<( :s :p :o )>>  :q :z . }';
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_data_03', () => {
    const x = "PREFIX : <http://example/> INSERT DATA { 'literal'  :q :z . }";
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_data_04', () => {
    const x = "PREFIX : <http://example/> INSERT DATA { :a :q <<( 'bad' :p :o )>> }";
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_data_05', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { << :s :p :o >> :q :z }';
    UpdateFactory.create(x);
  });

  // Variables.
  t('insert_data_10', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { :a :p <<( ?s :p :o )>>  .}';
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_data_11', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { <<( :s :p ?o )>> :q :z . }';
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_data_12', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { ?v :q :z . }';
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_data_13', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { :a :q <<( ?v :p :o )>> }';
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_data_14', () => {
    const x = 'PREFIX : <http://example/> INSERT DATA { << ?s :p :o >> :q :z }';
    assert.throws(() => UpdateFactory.create(x), QueryParseException);
  });

  t('insert_where_01', async () => {
    const m = ModelFactory.createDefaultModel();
    const anon = m.createResource();
    anon.addProperty(m.createProperty(RDF_TYPE), m.createResource(OWL_THING));
    assert.equal(m.size(), 1);
    const req = UpdateFactory.create('INSERT { ?s ?p ?o } WHERE { ?o ?p ?s }');
    await UpdateAction.execute(req, m);
    assert.equal(m.size(), 2);
    assert.equal(m.listStatements(anon, null, null).toList().length, 1);
    assert.equal(m.listStatements(null, null, anon).toList().length, 1);
  });

  // Check constant and template quads
  t('delete_insert_where_01', async () => {
    const dsg0 = DatasetGraphFactory.create();
    let req = UpdateFactory.create('INSERT DATA { <x> <p> 2 . <z> <q> 2 . <z> <q> 3 . }');
    await UpdateAction.execute(req, dsg0);
    assert.equal(dsg0.getDefaultGraph().size(), 3);

    let counterIns = 0;
    let counterDel = 0;
    // Jena: new DatasetGraphWrapper(dsg0) { add(quad) {...} delete(quad) {...} }.
    const dsg = Object.create(dsg0, {
      add: { value(...a) { counterIns++; return dsg0.add(...a); } },
      delete: { value(...a) { counterDel++; return dsg0.delete(...a); } },
    });
    void counterDel;
    // WHERE clause doubles the effect.
    const s = 'DELETE { ?x <p> 2 . <z> <q> 2 } INSERT { ?x <p> 1 . <x> <q> 1  } WHERE { ?x <p> ?o {} UNION {} }';
    req = UpdateFactory.create(s);
    await UpdateAction.execute(req, dsg);
    assert.equal(counterIns, 3); // 3 : 1 constant, 2 from template.
    assert.equal(counterIns, 3);
    assert.equal(dsg.getDefaultGraph().size(), 3);
  });

  // Ensure that the IRI function in UpdateRequests considers the BASE IRI - https://github.com/apache/jena/issues/1272
  t('insert_with_iri_function_resolution_against_base_01', async () => {
    const m = ModelFactory.createDefaultModel();
    const req = UpdateFactory.create("BASE <http://www.example.org/> INSERT { ?s ?s ?s } WHERE { BIND(iri('s') AS ?s) }");
    await UpdateAction.execute(req, m);
    const triples = m.getGraph().find(null, null, null).toList();
    const s = NodeFactory.createURI('http://www.example.org/s');
    const expected = Triple.create(s, s, s);
    assert.ok(triples.some((x) => x.equals(expected)));
    assert.equal(triples.length, 1);
  });

  // Ensure that the IRI function in UpdateRequests considers the BASE IRI in syntactic scope.
  t('insert_with_iri_function_resolution_against_base_02', async () => {
    const m = ModelFactory.createDefaultModel();
    const updateStr = [
      "BASE <http://www.example.org/base1/> INSERT { ?s ?s ?s } WHERE { BIND(iri('s') AS ?s) }",
      ';',
      "BASE <http://www.example.org/base2/> INSERT { ?s ?s ?s } WHERE { BIND(iri('s') AS ?s) }",
    ].join('\n');
    const req = UpdateFactory.create(updateStr);
    await UpdateAction.execute(req, m);
    const triples = m.getGraph().find(null, null, null).toList();
    const s1 = NodeFactory.createURI('http://www.example.org/base1/s');
    const s2 = NodeFactory.createURI('http://www.example.org/base2/s');
    assert.ok(!s1.equals(s2), 'Bad test: different triples are equals');
    const expected1 = Triple.create(s1, s1, s1);
    const expected2 = Triple.create(s2, s2, s2);
    assert.ok(triples.some((x) => x.equals(expected1)));
    assert.ok(triples.some((x) => x.equals(expected2)));
    assert.equal(triples.length, 2);
  });

  // ARQ extension. IRI(base, relative)
  async function test2Arg(updateStr, expectedURI) {
    const m = ModelFactory.createDefaultModel();
    // ARQ extension form.
    const req = UpdateFactory.create(updateStr);
    await UpdateAction.execute(req, m);
    const triples = m.getGraph().find(null, null, null).toList();
    const x = NodeFactory.createURI(expectedURI);
    const expected = Triple.create(x, x, x);
    assert.ok(triples.some((y) => y.equals(expected)));
    assert.equal(triples.length, 1);
  }

  t('insert_with_iri_function_resolution_against_base_03', () => test2Arg(
    "BASE <http://www.example.org/> INSERT { ?s ?s ?s } WHERE { BIND(iri('http://example/', 's') AS ?s) }",
    'http://example/s'));

  t('insert_with_iri_function_resolution_against_base_04', () => test2Arg(
    "BASE <http://www.example.org/> INSERT { ?s ?s ?s } WHERE { BIND(iri(<http://example/>, 's') AS ?s) }",
    'http://example/s'));

  t('insert_with_iri_function_resolution_against_base_05', () => test2Arg(
    "BASE <http://www.example.org/> INSERT { ?s ?s ?s } WHERE { BIND(iri(<x1/x2/x3>, 's') AS ?s) }",
    'http://www.example.org/x1/x2/s'));
});
