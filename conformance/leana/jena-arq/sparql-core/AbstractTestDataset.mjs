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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractTestDataset.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract class is a function run by each concrete
// test file with its createDataset(). Jena's relative resource names ("s1",
// "p1") are made absolute against eh:/ (see sse.mjs). Iter.toList /
// Iter.anyMatch are ExtendedIterator.toList() and Array.some.

import assert from 'node:assert/strict';
import { ModelFactory, ResourceFactory, Quad } from '@factoidal/leana';
import { relIRI } from './sse.mjs';

const model1 = ModelFactory.createDefaultModel();
const model2 = ModelFactory.createDefaultModel();
const s1 = model1.createResource(relIRI('s1'));
const s2 = model1.createResource(relIRI('s2'));
const p1 = model1.createProperty(relIRI('p1'));
const p2 = model1.createProperty(relIRI('p2'));
const o1 = model1.createResource(relIRI('o1'));
const o2 = model1.createResource(relIRI('o2'));
model1.add(s1, p1, o1);
model2.add(s2, p2, o2);

export function runAbstractTestDataset(t, createDataset) {
  t('dataset_01', () => {
    const ds = createDataset();
    assert.ok(ds.getDefaultModel());
    assert.ok(ds.asDatasetGraph());
  });
  t('dataset_02', () => {
    const ds = createDataset();
    ds.getDefaultModel().add(s1, p1, o1);
    assert.ok(model1.isIsomorphicWith(ds.getDefaultModel()));
  });
  t('dataset_03', () => {
    const ds = createDataset();
    ds.getDefaultModel().removeAll().add(model2);
    assert.ok(model2.isIsomorphicWith(ds.getDefaultModel()));
  });
  t('dataset_04', () => {
    const graphName = 'http://example/';
    const ds = createDataset();
    ds.addNamedModel(graphName, model1);
    assert.ok(ds.containsNamedModel(graphName));
    const x = ds.listNames().toList();
    assert.equal(x.length, 1);
    assert.equal(x[0], graphName);
    assert.ok(!model1.isIsomorphicWith(ds.getDefaultModel()));
    const m = ds.getNamedModel(graphName);
    assert.ok(m);
    assert.ok(model1.isIsomorphicWith(m));
    ds.removeNamedModel(graphName);
    assert.ok(!ds.containsNamedModel(graphName));
  });
  t('dataset_05', () => {
    const graphName = 'http://example/';
    const ds = createDataset();
    ds.addNamedModel(graphName, model1);
    ds.replaceNamedModel(graphName, model2);
    assert.ok(ds.containsNamedModel(graphName));
    const x = ds.listNames().toList();
    assert.equal(x.length, 1);
    assert.equal(x[0], graphName);
    assert.ok(!model1.isIsomorphicWith(ds.getNamedModel(graphName)));
    assert.ok(model2.isIsomorphicWith(ds.getNamedModel(graphName)));
  });
  t('dataset_06', () => {
    const ds = createDataset();
    ds.addNamedModel('http://example/', model1);
    assert.ok(!ds.isEmpty(), 'Dataset should not be empty after a named graph has been added!');
  });
  t('dataset_07', () => {
    const ds = createDataset();
    ds.addNamedModel('http://example/', model1);
    assert.ok(ds.containsNamedModel('http://example/'), 'Named graph not found');
  });
  t('dataset_08', () => {
    const ds = createDataset();
    assert.ok(ds.containsNamedModel(Quad.unionGraph.getURI()), 'Union named graph not found');
  });
  t('dataset_09', () => {
    const ds = createDataset();
    assert.ok(ds.containsNamedModel(Quad.defaultGraphIRI.getURI()), `Default graph not found using '<${Quad.defaultGraphIRI.getURI()}>'`);
  });
  t('dataset_10', () => {
    const ds = createDataset();
    const name = ResourceFactory.createResource('http://ex/name1');
    ds.addNamedModel(name, model1);
    assert.ok(ds.containsNamedModel(name));
    assert.ok(ds.listNames().toList().some((x) => x === 'http://ex/name1'));
    ds.removeNamedModel(name);
    assert.ok(!ds.containsNamedModel(name));
  });
  t('dataset_11', () => {
    const ds = createDataset();
    const name = ResourceFactory.createResource();
    ds.addNamedModel(name, model1);
    assert.ok(ds.containsNamedModel(name));
    assert.ok(ds.listModelNames().toList().some((x) => x.equals(name)));
    ds.removeNamedModel(name);
    assert.ok(!ds.containsNamedModel(name));
  });
}
