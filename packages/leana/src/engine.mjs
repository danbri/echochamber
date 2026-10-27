// leana: the one @factoidal/core engine. Loaded once, when leana is imported
// (top-level await), so that every Graph and Model method after the import is
// a synchronous engine call, as in Jena. Apache License 2.0.

import { ready, openDataset, version } from '@factoidal/core';

await ready();
const SEED = await openDataset('', 'nquads');

/** A new empty @factoidal/core Dataset (a clone of an empty one: synchronous). */
export function newDataset() {
  return SEED.clone();
}

export const coreVersion = version;
