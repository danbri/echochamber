// Helpers for the ported RIOT tests. Apache License 2.0. Written for echochamber.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LeanaUnsupportedError } from '@factoidal/leana';

/** The jena-arq directory of the copied fixtures (Jena's tests run with jena-arq as the working directory). */
export const JENA_ARQ = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'jena-arq') + '/';

/** assertThrows for a Promise-returning call; a leana gap propagates (so a gap verdict sees it). */
export async function assertRejects(Cls, fn, msg) {
  let err = null;
  try { await fn(); } catch (e) { err = e; }
  if (err === null) assert.fail(msg || `expected ${Cls.name}`);
  if (err instanceof LeanaUnsupportedError && Cls !== LeanaUnsupportedError) throw err;
  if (!(err instanceof Cls)) throw err;
  return err;
}
