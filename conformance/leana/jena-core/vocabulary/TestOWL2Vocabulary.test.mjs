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
//   jena-core/src/test/java/org/apache/jena/vocabulary/TestOWL2Vocabulary.java
//   jena-core/src/test/java/org/apache/jena/vocabulary/VocabTestLib.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. OWL and OWL2 are leana's vocabulary classes (the classes
// under test); the term lists are Jena's, in Jena's order.

import { OWL, OWL2 } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const RESOURCES = ['AllDifferent', 'AllDisjointClasses', 'AllDisjointProperties', 'Annotation', 'AnnotationProperty',
  'AsymmetricProperty', 'Axiom', 'Class', 'DataRange', 'DatatypeProperty', 'DeprecatedClass', 'DeprecatedProperty',
  'FunctionalProperty', 'InverseFunctionalProperty', 'IrreflexiveProperty', 'NamedIndividual', 'NegativePropertyAssertion',
  'Nothing', 'ObjectProperty', 'Ontology', 'OntologyProperty', 'ReflexiveProperty', 'Restriction', 'SymmetricProperty',
  'Thing', 'TransitiveProperty'];
const PROPERTIES = ['allValuesFrom', 'annotatedProperty', 'annotatedSource', 'annotatedTarget', 'assertionProperty',
  'backwardCompatibleWith', 'bottomDataProperty', 'bottomObjectProperty', 'cardinality', 'complementOf',
  'datatypeComplementOf', 'deprecated', 'differentFrom', 'disjointUnionOf', 'disjointWith', 'distinctMembers',
  'equivalentClass', 'equivalentProperty', 'hasKey', 'hasSelf', 'hasValue', 'imports', 'incompatibleWith',
  'intersectionOf', 'inverseOf', 'maxCardinality', 'maxQualifiedCardinality', 'members', 'minCardinality',
  'minQualifiedCardinality', 'onClass', 'onDataRange', 'onDatatype', 'onProperties', 'onProperty', 'oneOf',
  'priorVersion', 'propertyChainAxiom', 'propertyDisjointWith', 'qualifiedCardinality', 'sameAs', 'someValuesFrom',
  'sourceIndividual', 'targetIndividual', 'targetValue', 'topDataProperty', 'topObjectProperty', 'unionOf',
  'versionIRI', 'versionInfo', 'withRestrictions'];
const SHARED = ['AllDifferent', 'AnnotationProperty', 'Class', 'DataRange', 'DatatypeProperty', 'DeprecatedClass',
  'DeprecatedProperty', 'FunctionalProperty', 'InverseFunctionalProperty', 'Nothing', 'ObjectProperty', 'Ontology',
  'OntologyProperty', 'Restriction', 'SymmetricProperty', 'Thing', 'TransitiveProperty', 'allValuesFrom',
  'backwardCompatibleWith', 'cardinality', 'complementOf', 'differentFrom', 'disjointWith', 'distinctMembers',
  'equivalentClass', 'equivalentProperty', 'hasValue', 'imports', 'incompatibleWith', 'intersectionOf', 'inverseOf',
  'maxCardinality', 'minCardinality', 'onProperty', 'oneOf', 'priorVersion', 'sameAs', 'someValuesFrom', 'unionOf',
  'versionInfo'];

// VocabTestLib.assertResource / assertProperty
const assertResource = (uri, r) => assertEquals(uri, r.getURI());
const assertProperty = assertResource;

describeJena('TestOWL2Vocabulary', 'jena-core/src/test/java/org/apache/jena/vocabulary/TestOWL2Vocabulary.java', (t) => {
  t('testOWL2SharesOWL1URI', () => assertEquals(OWL.getURI(), OWL2.getURI()));

  t('testOWL2TermSpellings', () => {
    for (const local of RESOURCES) assertResource(OWL2.getURI() + local, OWL2[local]);
    for (const local of PROPERTIES) assertProperty(OWL2.getURI() + local, OWL2[local]);
  });

  t('testSharedOWLTerms', () => {
    for (const k of SHARED) assertEquals(OWL2[k], OWL[k]);
  });
});
