// leana: stage 2 placeholders for the Jena query and dataset API
// (org.apache.jena.query.{QueryExecution, QueryExecutionFactory, QueryFactory,
// QuerySolutionMap, DatasetFactory}, org.apache.jena.sparql.core.DatasetGraphFactory).
// Names modelled on Apache Jena (Apache License 2.0). No Jena code is copied.
// Every entry point throws LeanaUnsupportedError (gap 'echo'): query execution
// and datasets are stage 2 of docs/leana/feasibility.md section 6.

import { unsupported } from './errors.mjs';

export const QueryExecution = Object.freeze({
  model() { return unsupported('QueryExecution (stage 2)', 'echo'); },
  dataset() { return unsupported('QueryExecution (stage 2)', 'echo'); },
  create() { return unsupported('QueryExecution (stage 2)', 'echo'); },
  service() { return unsupported('QueryExecution (stage 2)', 'echo'); },
});
export const QueryExecutionFactory = Object.freeze({
  create() { return unsupported('QueryExecution (stage 2)', 'echo'); },
});
export const QueryFactory = Object.freeze({
  create() { return unsupported('QueryFactory (stage 2)', 'echo'); },
});
export class QuerySolutionMap {
  constructor() { unsupported('QuerySolutionMap (stage 2)', 'echo'); }
}
export const DatasetFactory = Object.freeze({
  create() { return unsupported('DatasetFactory (stage 2)', 'echo'); },
  createTxnMem() { return unsupported('DatasetFactory (stage 2)', 'echo'); },
});
export const DatasetGraphFactory = Object.freeze({
  create() { return unsupported('DatasetGraphFactory (stage 2)', 'echo'); },
  createTxnMem() { return unsupported('DatasetGraphFactory (stage 2)', 'echo'); },
});
