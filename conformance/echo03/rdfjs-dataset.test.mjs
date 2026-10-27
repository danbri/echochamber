// Runs the RDF/JS DatasetCore test suite of rdfjs-base/dataset (MIT; the
// suite file beside this one carries its notice) against the engine Dataset
// of @factoidal/core and the Store of the N3.js-style echo.
import { before } from 'node:test';
import * as core from '@factoidal/core';
import { ready, Store, DataFactory } from '@factoidal/echo03';
import runTests from './rdfjs/dataset/DatasetCore.test-suite.mjs';
import { mochaShim } from './harness.mjs';

// The suite's factory.dataset() is synchronous: an engine Dataset is made
// by clone() of an empty one opened before the tests run (top-level await).
await ready();
const empty = await core.openDataset('', 'nquads');
const coreFactory = {
  dataFactory: core.dataFactory,
  dataset(quads) { const ds = empty.clone(); for (const q of quads || []) ds.add(q); return ds; },
};
const echoFactory = {
  dataFactory: DataFactory,
  dataset(quads) { return new Store(quads || []); },
};
runTests({ factory: coreFactory, mocha: mochaShim('rdfjs-dataset/core') });
runTests({ factory: echoFactory, mocha: mochaShim('rdfjs-dataset/echo03') });
