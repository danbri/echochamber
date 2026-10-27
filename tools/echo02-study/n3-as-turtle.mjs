// Informational: how many of RDFLib's n3roundtrip/*.n3 files the
// @factoidal/core Turtle reader accepts (N3 is a superset of Turtle only in
// part). Not a conformance test: an N3 file is not a Turtle document.
// usage: node tools/echo02-study/n3-as-turtle.mjs
import * as core from '@factoidal/core';
import { readdirSync, readFileSync } from 'node:fs';
const d = new URL('../../conformance/echo02/data/n3roundtrip/', import.meta.url);
let ok = 0, bad = 0; const why = {};
for (const f of readdirSync(d).filter((x) => x.endsWith('.n3'))) {
  try { await core.parse(readFileSync(new URL(f, d), 'utf8'), { format: 'turtle', baseIRI: 'file:///n3/' + f }); ok++; }
  catch (e) { bad++; const k = (e.message.match(/: ([^:]*?)( at line|$)/) || [, e.message])[1].slice(0, 50); why[k] = (why[k] || 0) + 1; }
}
console.log(`@factoidal/core ${core.version}: ${ok} read as Turtle, ${bad} refused`); console.log(why);
