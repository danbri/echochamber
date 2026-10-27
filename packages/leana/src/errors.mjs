// leana: exception classes.
//
// Class names and the hierarchy are modelled on Apache Jena
// (https://jena.apache.org/, Apache License 2.0): org.apache.jena.shared.*,
// org.apache.jena.riot.RiotException. No Jena code is copied; this file is
// JavaScript written for leana.

import { FactoidalError } from '@factoidal/core';
import { GAPS } from './gaps.mjs';

export class JenaException extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = new.target.name;
    if (options && options.cause instanceof FactoidalError) {
      // The engine decides the code; leana only carries it.
      this.code = options.cause.code;
      this.position = options.cause.position;
      this.spec = options.cause.spec;
    }
  }
}

/** java.lang.UnsupportedOperationException (Jena throws it, for example, for getURI() on a literal). */
export class UnsupportedOperationException extends JenaException {}

/**
 * A Jena method whose semantics @factoidal/core does not have. leana does not
 * reimplement it in JavaScript (echochamber CLAUDE.md rule 1). `gap` is the key
 * in packages/leana/GAPS.md; `issue` is the danbri/factoidal issue that asks
 * for the engine op.
 */
export class LeanaUnsupportedError extends UnsupportedOperationException {
  constructor(method, gapKey) {
    const g = GAPS[gapKey];
    if (!g) throw new Error('leana: unknown gap key ' + gapKey);
    super(`leana: ${method} is not supported: ${g.summary} (${g.issue || 'echo gap'})`);
    this.method = method;
    this.gap = gapKey;
    this.issue = g.issue || null;
  }
}

export function unsupported(method, gapKey) {
  throw new LeanaUnsupportedError(method, gapKey);
}

export class NoSuchElementException extends JenaException {}
export class ClosedException extends JenaException {}
export class JenaLockedException extends JenaException {}
export class PropertyNotFoundException extends JenaException {}
export class LiteralRequiredException extends JenaException {}
export class ResourceRequiredException extends JenaException {}
export class InvalidPropertyURIException extends JenaException {}
export class AddDeniedException extends JenaException {}
export class DeleteDeniedException extends JenaException {}
export class RiotException extends JenaException {}
export class RiotNotFoundException extends RiotException {}

/** Run `fn`; a FactoidalError from the engine becomes `Cls` with the engine's code. */
export function engineCall(fn, Cls = JenaException) {
  try {
    return fn();
  } catch (e) {
    if (e instanceof FactoidalError) throw new Cls(e.message, { cause: e });
    throw e;
  }
}

export async function engineCallAsync(fn, Cls = JenaException) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof FactoidalError) throw new Cls(e.message, { cause: e });
    throw e;
  }
}
