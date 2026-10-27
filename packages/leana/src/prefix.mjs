// leana: PrefixMapping.
//
// API modelled on Apache Jena org.apache.jena.shared.PrefixMapping and
// PrefixMappingImpl (Apache License 2.0). No Jena code is copied.
//
// What is here is string bookkeeping: a table from prefix to namespace text,
// expandPrefix (split at the first ':' and look the head up, as Jena
// defines it) and shortForm (replace a namespace that starts the IRI). What is
// not here: qnameFor (needs an IRI split into namespace and XML local name),
// the prefix-name legality check (XML 1.1 NCName), and the Standard and
// Extended tables (vocabulary IRIs). See GAPS.md.

import { JenaLockedException, JenaException, unsupported } from './errors.mjs';

/** Jena PrefixMapping.IllegalPrefixException. leana never throws it: it does not check prefix names (gap 'iri-split'). */
export class IllegalPrefixException extends JenaException {}

export class PrefixMappingImpl {
  constructor() {
    this._p2u = new Map();
    this._u2p = new Map();
    this._locked = false;
  }
  _checkUnlocked() { if (this._locked) throw new JenaLockedException('prefix mapping is locked'); }
  _reverse() {
    this._u2p.clear();
    for (const [p, u] of this._p2u) this._u2p.set(u, p);
  }
  lock() { this._locked = true; return this; }

  /**
   * Jena checks that a non-empty prefix is an XML 1.1 NCName and throws
   * IllegalPrefixException. leana does not check (gap 'iri-split').
   */
  setNsPrefix(prefix, uri) {
    this._checkUnlocked();
    if (prefix === null || prefix === undefined) throw new TypeError('null prefix');
    if (uri === null || uri === undefined) throw new TypeError('null URIs are prohibited as arguments to setNsPrefix');
    this._p2u.set(String(prefix), String(uri));
    this._u2p.set(String(uri), String(prefix));
    return this;
  }
  removeNsPrefix(prefix) {
    this._checkUnlocked();
    this._p2u.delete(prefix);
    this._reverse();
    return this;
  }
  clearNsPrefixMap() {
    this._checkUnlocked();
    this._p2u.clear();
    this._reverse();
    return this;
  }
  /** Add every mapping of `other` (a PrefixMapping, a Map, or a plain object). */
  setNsPrefixes(other) {
    this._checkUnlocked();
    for (const [p, u] of entriesOf(other)) this.setNsPrefix(p, u);
    return this;
  }
  /** Add the mappings of `other` whose prefix and namespace are both unused here. */
  withDefaultMappings(other) {
    this._checkUnlocked();
    for (const [p, u] of entriesOf(other)) {
      if (this.getNsPrefixURI(p) === null && this.getNsURIPrefix(u) === null) this.setNsPrefix(p, u);
    }
    return this;
  }
  getNsPrefixURI(prefix) { return this._p2u.has(prefix) ? this._p2u.get(prefix) : null; }
  getNsURIPrefix(uri) { return this._u2p.has(uri) ? this._u2p.get(uri) : null; }
  /** A copy of the table, as a JavaScript Map from prefix to namespace. */
  getNsPrefixMap() { return new Map(this._p2u); }
  expandPrefix(prefixed) {
    const colon = prefixed.indexOf(':');
    if (colon < 0) return prefixed;
    const uri = this.getNsPrefixURI(prefixed.substring(0, colon));
    return uri === null ? prefixed : uri + prefixed.substring(colon + 1);
  }
  shortForm(uri) {
    for (const [p, ns] of this._p2u) {
      if (uri.startsWith(ns)) return p + ':' + uri.substring(ns.length);
    }
    return uri;
  }
  qnameFor(uri) { return unsupported('PrefixMapping.qnameFor', 'iri-split'); }
  hasNoMappings() { return this._p2u.size === 0; }
  numPrefixes() { return this._p2u.size; }
  samePrefixMappingAs(other) {
    const a = this.getNsPrefixMap(), b = mapOf(other);
    if (a.size !== b.size) return false;
    for (const [p, u] of a) if (b.get(p) !== u) return false;
    return true;
  }
  forEach(fn) { for (const [p, u] of this._p2u) fn(p, u); }
  toString() { return 'pm:' + JSON.stringify(Object.fromEntries(this._p2u)); }
}

function entriesOf(other) {
  if (other instanceof PrefixMappingImpl) return other.getNsPrefixMap().entries();
  if (other instanceof Map) return other.entries();
  if (other && typeof other.getNsPrefixMap === 'function') return mapOf(other).entries();
  if (other && typeof other === 'object') return Object.entries(other);
  throw new TypeError('setNsPrefixes needs a PrefixMapping, a Map or an object');
}

function mapOf(other) {
  if (other instanceof Map) return other;
  if (other && typeof other.getNsPrefixMap === 'function') {
    const m = other.getNsPrefixMap();
    return m instanceof Map ? m : new Map(Object.entries(m));
  }
  return new Map(Object.entries(other || {}));
}

export const PrefixMapping = {
  Factory: Object.freeze({ create() { return new PrefixMappingImpl(); } }),
  /** The exception classes Jena nests in PrefixMapping. */
  IllegalPrefixException,
  JenaLockedException,
  /** Jena PrefixMapping.Standard holds vocabulary IRIs: gap 'vocabulary'. */
  get Standard() { return unsupported('PrefixMapping.Standard', 'vocabulary'); },
  /** Jena PrefixMapping.Extended holds vocabulary IRIs: gap 'vocabulary'. */
  get Extended() { return unsupported('PrefixMapping.Extended', 'vocabulary'); },
};
Object.freeze(PrefixMapping);
