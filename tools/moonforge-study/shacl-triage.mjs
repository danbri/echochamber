// Triage the RDF4J ShaclSail cases that do not meet the RDF4J expectation
// on @factoidal/core, one group per cause, and write
// conformance/moonforge/shacl/verdicts.json.
//
// usage (from conformance/moonforge):
//   node ../../tools/moonforge-study/shacl-triage.mjs shacl/verdicts.json
//
// Each case is run twice: as the suite runs it, and with the study-only
// roundTrip option (the store re-read from its own N-Quads, which relabels
// the blank nodes that trip the anon-bnode-label defect). The suite verdict
// is the cause seen in the first run; when the second run also fails, the
// note names that second cause, so the case is read again when the first
// defect is fixed. Groups were assigned by reading cases and minimal
// reproductions (see the handback report); the rules below only map each
// failing case to its group, and an unmapped failure stops the tool.
//
// Original to echochamber, Apache-2.0.
import { readFileSync, writeFileSync } from 'node:fs';
import { runCase } from '../../conformance/moonforge/shacl/run.mjs';
import { coreVersion } from '../../conformance/moonforge/lib/harness.mjs';

const out = process.argv[2];
if (!out) { console.error('usage: shacl-triage.mjs <verdicts.json>'); process.exit(2); }
const doc = JSON.parse(readFileSync(new URL('../../conformance/moonforge/shacl/cases.json', import.meta.url), 'utf8'));

const REC = 'https://www.w3.org/TR/2017/REC-shacl-20170720/';
const GROUPS = {
  'anon-bnode-label': {
    verdict: 'defect', issue: 'https://github.com/danbri/factoidal/issues/1074',
    spec: 'SPARQL 1.1 Update section 3.1.1 (INSERT DATA; blank nodes in QuadData) and RDF 1.2 N-Quads grammar BLANK_NODE_LABEL (https://www.w3.org/TR/rdf12-n-quads/#sec-grammar)',
    note: 'shaclValidate(data) rejects a Dataset whose blank nodes were made by [] in INSERT DATA: the engine writes them as _:b_d__:bnode_N (a colon inside the label) and its own N-Quads reader rejects the text (parse.syntax "expected \'.\' terminator" or "expected \'<\' (IRIREF)"). Dataset.query CONSTRUCT over the same store rejects the same way. Labelled blank nodes (_:x) are fine. Same family as danbri/factoidal#740 / #742 (742, CONSTRUCT template labels, closed); this path is not fixed in 0.16.0.',
  },
  'sparql-boolean-dot': {
    verdict: 'defect', issue: 'https://github.com/danbri/factoidal/issues/1075',
    spec: 'SPARQL 1.1 Query section 19.8 grammar: [134] BooleanLiteral ::= \'true\' | \'false\'; [140] PNAME_NS ::= PN_PREFIX? \':\' (a prefixed name needs a colon; PN_PREFIX [168] cannot end in \'.\')',
    note: 'The SPARQL lexer reads `true.` / `false.` (boolean literal directly followed by the triple terminator) as a prefixed name: INSERT DATA { <a> <p> true. } is an update.syntax error, and a query FILTER(true.) reports "unresolved prefix: true.". `true .` (with a space) and `1.` are read correctly.',
  },
  'deactivated-nested': {
    verdict: 'defect', issue: 'https://github.com/danbri/factoidal/issues/1076',
    spec: `SHACL 2017 section 2.1.6 Deactivating a Shape (${REC}#deactivated): "A shape that has the value true for the property sh:deactivated is called deactivated. All RDF terms conform to a deactivated shape."`,
    note: 'A deactivated shape used as a member of sh:or (or as the value of sh:not) is treated as a shape nothing conforms to: sh:or ( [ sh:class ex:B ; sh:deactivated true ] ) reports a violation, sh:not [ ...deactivated... ] conforms. A deactivated shape at sh:node is handled correctly.',
  },
  'languageIn-wildcard': {
    verdict: 'defect', issue: 'https://github.com/danbri/factoidal/issues/1076',
    spec: `SHACL 2017 section 4.4.4 sh:languageIn (${REC}#LanguageInConstraintComponent): value nodes must have "a language tag matching any of the basic language ranges ... following the filtering schema defined by the SPARQL langMatches function"; SPARQL 1.1 Query 17.4.3.12 langMatches and RFC 4647 section 2.1: the basic language range "*" matches every non-empty tag`,
    note: 'sh:languageIn ( "*" ) reports a violation for "x"@en; RDF4J (and langMatches) accept every language-tagged literal.',
  },
  'sparql-nested': {
    verdict: 'defect', issue: 'https://github.com/danbri/factoidal/issues/1076',
    spec: `SHACL 2017 section 5.3 Validation with SPARQL-based Constraints and section 4.7.2 sh:property / 4.6.1 sh:not (${REC}#sparql-constraints-validation): conformance checking of a value node against a shape includes every constraint of that shape, SPARQL-based ones included`,
    note: 'A SPARQL-based constraint (sh:sparql) is evaluated only on a shape that has its own target. On a shape reached through sh:property, sh:node or sh:not it is never evaluated: the property shape conforms (no result), and sh:not [ sh:sparql ... ] always fails.',
  },
  'maxCount-negative': {
    verdict: 'defect', issue: 'https://github.com/danbri/factoidal/issues/1076',
    spec: `SHACL 2017 section 4.2.2 sh:maxCount (${REC}#MaxCountConstraintComponent): "The values of sh:maxCount in a property shape are literals with datatype xsd:integer." "If the number of value nodes is greater than $maxCount, there is a validation result."`,
    note: 'sh:maxCount -1 never reports a result (0 value nodes > -1). RDF4J reports one. The REC places no lower bound on sh:maxCount (shsh:ShapeShape only requires xsd:integer).',
  },
  'multi-list-param': {
    verdict: 'defect', issue: 'https://github.com/danbri/factoidal/issues/1076',
    spec: `SHACL 2017 section 2.1.1 Constraints, Parameters and Constraint Components (${REC}#constraints): parameters "may be used multiple times in the same shape, and each value of such a parameter declares an individual constraint. The interpretation of such declarations is conjunction"; section 4.6.3 sh:or: "Each value of sh:or in a shape is a SHACL list."`,
    note: 'A shape with two sh:or lists (or two sh:and lists) is checked against the first value only: sh:or ( [sh:class ex:A] ), ( [sh:class ex:B] ) conforms for a node of type ex:A only. Two sh:class values are handled correctly.',
  },
  'rsx-targetShape': {
    verdict: 'divergence',
    spec: `SHACL 2017 section 2.1.3 Targets (${REC}#targets): the targets of a shape are sh:targetNode, sh:targetClass, implicit class targets, sh:targetSubjectsOf and sh:targetObjectsOf. rsx:targetShape is an RDF4J extension (RSX, enabled by setEclipseRdf4jShaclExtensions(true))`,
    note: 'Factoidal reads no rsx:targetShape, so the shape has no focus nodes and the data conforms; RDF4J targets the nodes that conform to the target shape.',
  },
  'dash-hasValueIn': {
    verdict: 'divergence',
    spec: `SHACL 2017 section 4 Core Constraint Components (${REC}#core-components): dash:hasValueIn is not a SHACL constraint component; it is a DASH (TopBraid) extension that RDF4J enables with setDashDataShapes(true)`,
    note: 'Factoidal ignores dash:hasValueIn, so the shape that carries it has no constraint (conforms where RDF4J expects a violation, and fails under sh:not where RDF4J expects conformance).',
  },
  'dash-target': {
    verdict: 'divergence',
    spec: `SHACL 2017 section 2.1.3 Targets (${REC}#targets) does not define sh:target; sh:target is the SHACL Advanced Features (W3C Working Group Note 2017) section 5 custom target, and dash:AllObjectsTarget / dash:AllSubjectsTarget are DASH target types`,
    note: 'core.shaclValidate rejects a shapes graph that uses sh:target (validate.failed: "the shapes graph uses a feature this validator does not read: sh:target (SPARQL-based targets)"), as its API documents; RDF4J reads DASH all-objects / all-subjects targets.',
  },
  'shacl-af-sparql-target': {
    verdict: 'divergence',
    spec: `SHACL Advanced Features (W3C Working Group Note 2017) section 5.1 SPARQL-based Targets (https://www.w3.org/TR/shacl-af/#SPARQLTarget); not part of SHACL 2017 section 2.1.3 Targets (${REC}#targets)`,
    note: 'core.shaclValidate rejects shapes graphs with sh:target / sh:SPARQLTarget by design (index.d.ts: "A shapes graph that uses the SPARQL-based target of SHACL-AF ... reject"). Divergence, not gap: the feature is outside the SHACL Recommendation, and rule 1 keeps it out of the echo. Under the SHACL 1.2 SPARQL Extensions draft, which carries SPARQL-based targets, it would become an engine coverage item.',
  },
  'shapes-graph-subclass': {
    verdict: 'divergence',
    spec: `SHACL 2017 section 1.1 (SHACL subclass, SHACL instance are defined "in the data graph") and section 2.1.3.2 (${REC}#targetClass): "all the rdfs:subClassOf declarations needed to walk the class hierarchy need to exist in the data graph"`,
    note: 'The rdfs:subClassOf triples of this case are in the shapes graph only; RDF4J (with its RDFS subclass reasoner) uses them for sh:class and sh:targetClass, Factoidal follows the REC and does not.',
  },
  'shacl12-defaultValue': {
    verdict: 'divergence',
    spec: `SHACL 2017 section 2.3.2.4 sh:defaultValue (${REC}#defaultValue): non-validating, "ignored by SHACL processors"; SHACL 1.2 Core (Editor's Draft) section Value Nodes of Property Shapes (https://w3c.github.io/data-shapes/shacl12-core/#value-nodes-property-shapes): "If the set is still empty and d is the value of sh:defaultValue ... add the output nodes"`,
    note: 'Factoidal follows the SHACL 1.2 Core draft: a property shape with no values takes sh:defaultValue as its value node (here ex:iri1, which is not an ex:Person, so sh:class reports it). RDF4J follows SHACL 2017, where sh:defaultValue does not take part in validation. The two specification versions disagree; the RDF4J expectation is right under the Recommendation.',
  },
  'rdf4j-update-graph-syntax': {
    verdict: 'divergence',
    spec: 'SPARQL 1.1 Query section 19.8 grammar [52] QuadsNotTriples ::= \'GRAPH\' VarOrIri \'{\' TriplesTemplate? \'}\' (used by SPARQL 1.1 Update section 3.1.1 INSERT DATA)',
    note: 'The case\'s update writes ex:dataGraph { ... } inside INSERT DATA without the GRAPH keyword (TriG style). RDF4J\'s parser accepts it; it is not SPARQL 1.1, and Factoidal rejects it (update.syntax).',
  },
};

const has = (text, re) => re.test(text);
function groupOf(c, r) {
  const sh = doc.shapes[c.shapes].text;
  const d = r.detail;
  if (/shaclValidate\(data\): expected/.test(d)) return 'anon-bnode-label';
  if (/sh:target \(SPARQL-based targets\)/.test(d)) return has(sh, /dash:All(Objects|Subjects)/) ? 'dash-target' : 'shacl-af-sparql-target';
  if (/update\.syntax/.test(d)) return c.updates.some((u) => /\b(true|false)\./.test(u)) ? 'sparql-boolean-dot' : 'rdf4j-update-graph-syntax';
  if (/^conforms /.test(d)) {
    if (has(sh, /rsx:targetShape/)) return 'rsx-targetShape';
    if (has(sh, /dash:hasValueIn/)) return 'dash-hasValueIn';
    if (has(sh, /sh:defaultValue/)) return 'shacl12-defaultValue';
    if (c.id.startsWith('class/subclass/')) return 'shapes-graph-subclass';
    if (has(sh, /sh:deactivated/)) return 'deactivated-nested';
    if (has(sh, /sh:languageIn \("\*"\)/)) return 'languageIn-wildcard';
    if (has(sh, /sh:not/) && has(sh, /sh:sparql/)) return 'sparql-nested';
    if (has(sh, /sh:maxCount -/)) return 'maxCount-negative';
    if (c.id.startsWith('or/multiple/')) return 'multi-list-param';
  }
  return null;
}

const cases = {}; const counts = {}; const unmapped = [];
for (const c of doc.cases) {
  const r = await runCase(c, doc.shapes);
  if (r.pass) continue;
  const grp = groupOf(c, r);
  if (!grp) { unmapped.push(`${c.id}: ${r.detail}`); continue; }
  const G = GROUPS[grp];
  const v = { verdict: G.verdict, group: grp };
  if (G.issue) v.issue = G.issue;
  if (G.spec) v.spec = G.spec;
  if (G.reason) v.reason = G.reason;
  if (grp === 'anon-bnode-label') {
    const r2 = await runCase(c, doc.shapes, { roundTrip: true });
    if (!r2.pass) {
      const g2 = groupOf(c, r2);
      if (!g2) { unmapped.push(`${c.id} (roundTrip): ${r2.detail}`); continue; }
      v.note = `With the blank nodes relabelled the case still fails: group ${g2} (${GROUPS[g2].verdict}).`;
      counts[`(under anon-bnode-label) ${g2}`] = (counts[`(under anon-bnode-label) ${g2}`] || 0) + 1;
    }
  }
  cases[c.id] = v;
  counts[grp] = (counts[grp] || 0) + 1;
}
if (unmapped.length) { console.error('unmapped failures:\n' + unmapped.join('\n')); process.exit(1); }

const groups = Object.fromEntries(Object.entries(GROUPS).map(([k, g]) => [k, { verdict: g.verdict, ...(g.issue ? { issue: g.issue } : {}), spec: g.spec, note: g.note }]));
writeFileSync(out, JSON.stringify({
  _notes: `Verdicts for shacl/cases.json on @factoidal/core ${coreVersion}, written by tools/moonforge-study/shacl-triage.mjs. ` +
    'One group per cause; groups lists each group\'s evidence once. issue "NEW:<group>" marks a defect not yet filed.',
  groups,
  cases,
}, null, 1) + '\n');
console.error(JSON.stringify(counts, null, 1));
