// Runs the RDF/JS data model test suite of rdfjs-base/data-model (MIT; the
// suite files beside this one carry its notice) against two factories: the
// DataFactory of @factoidal/core and the DataFactory of the N3.js-style echo.
import { dataFactory } from '@factoidal/core';
import { DataFactory } from '@factoidal/enthie';
import runTests from './rdfjs/data-model/index.mjs';
import { mochaShim } from './harness.mjs';

runTests({ factory: dataFactory, mocha: mochaShim('rdfjs-data-model/core') });
runTests({ factory: DataFactory, mocha: mochaShim('rdfjs-data-model/enthie') });
