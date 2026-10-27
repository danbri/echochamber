// Run one ported RDF4J ShaclSail test case on @factoidal/core. Original to
// echochamber, Apache-2.0. The cases (cases.json) are derived from Eclipse
// RDF4J, Eclipse Distribution License 1.0 (BSD-3-Clause).
//
// What RDF4J's ShaclValidator runner does (AbstractShaclTest
// runWithShaclValidator): load initialData.trig (if any) into an empty
// store, apply each queryN.rq update in file-name order, validate, and
// compare sh:conforms with the case's valid/invalid directory.
//
// Every judgement is the engine's: Dataset.update applies the updates,
// Dataset.query (CONSTRUCT) builds each data graph and shapes graph, and
// core.shaclValidate decides conformance. The JS only wires.
//
// Data graph. core.shaclValidate validates the default graph of its data
// argument (SHACL 2017 section 1.5 / 3: one data graph). RDF4J validates the
// union of every graph of the store for shapes in rdf4j:SHACLShapeGraph, and
// the graphs named by sh:shapesGraph / rsx:DataAndShapesGraphLink for shapes
// in other graphs (rdf4j:nil = the default graph). Each case's shapes entry
// lists those pairings as `plans` (made by tools/echo04-study/
// shacl-extract.mjs). For each plan a SPARQL Update run by the engine on a
// copy of the store makes the default graph the plan's data graph (the union
// of all graphs: INSERT { ?s ?p ?o } WHERE { GRAPH ?g { ?s ?p ?o } }; named
// graphs: CLEAR DEFAULT, then ADD <g> TO DEFAULT), and the same for the
// shapes graph; the case conforms when every plan conforms.
// (Not a CONSTRUCT: in 0.16.0 a CONSTRUCT over blank nodes made by `[]` in
// INSERT DATA rejects, see verdicts.json _notes.)
import { core } from '../lib/harness.mjs';

export function toDefaultGraph(graphs) {
  if (graphs === 'all') return 'INSERT { ?s ?p ?o } WHERE { GRAPH ?g { ?s ?p ?o } }';
  const ops = graphs.includes('default') ? [] : ['CLEAR DEFAULT'];
  for (const x of graphs) if (x !== 'default') ops.push(`ADD SILENT <${x}> TO DEFAULT`);
  return ops.join(' ;\n');
}

async function graphOf(ds, graphs) {
  const c = ds.clone();
  const u = toDefaultGraph(graphs);
  if (u) await c.update(u);
  return c;
}

const shapesCache = new Map();
async function shapesDataset(shapes) {
  let ds = shapesCache.get(shapes);
  if (!ds) { ds = await core.openDataset({ text: shapes.text, format: 'trig' }); shapesCache.set(shapes, ds); }
  return ds;
}

/** Apply the case's initial data and updates; answers the store (a Dataset). */
// opts.roundTrip (study tools only, never the suite): re-read the store from
// its own N-Quads text after the updates, which relabels blank nodes. It
// shows what the engine's SHACL answers under the blank-node label defect
// recorded in verdicts.json (group anon-bnode-label).
export async function buildStore(c, opts = {}) {
  let ds = await core.openDataset(c.initialData ? { text: c.initialData, format: 'trig' } : '', c.initialData ? undefined : { format: 'trig' });
  for (const u of c.updates) await ds.update(u);
  if (opts.roundTrip) { const t = ds.toNQuads(); ds.dispose(); ds = await core.openDataset({ text: t, format: 'nquads' }); }
  return ds;
}

/** Validate a case; answers {conforms, reports: [Dataset]} or throws. */
export async function validateCase(c, shapes, opts = {}) {
  const store = await buildStore(c, opts);
  const sds = await shapesDataset(shapes);
  let conforms = true; const reports = [];
  try {
    for (const plan of shapes.plans) {
      const data = await graphOf(store, plan.data);
      const sg = await graphOf(sds, plan.shapes);
      const r = await core.shaclValidate(data, sg);
      conforms = conforms && r.conforms;
      reports.push(r.report);
      data.dispose(); sg.dispose();
    }
  } finally { store.dispose(); }
  return { conforms, reports };
}

export async function runCase(c, shapesTable, opts = {}) {
  const shapes = shapesTable[c.shapes];
  let r;
  try {
    r = await validateCase(c, shapes, opts);
  } catch (e) {
    return { pass: false, detail: `rejected: ${e.code || e.name}: ${String(e.message).slice(0, 300)}` };
  }
  for (const rep of r.reports) rep.dispose();
  const want = c.expect === 'valid';
  return { pass: r.conforms === want, conforms: r.conforms, detail: `conforms ${r.conforms}, RDF4J expects ${c.expect}` };
}
