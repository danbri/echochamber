// leana: inference entry points (stage 3 of docs/leana/feasibility.md).
//
// Names modelled on Apache Jena org.apache.jena.reasoner.{Reasoner,
// ReasonerRegistry}, org.apache.jena.reasoner.rulesys.{Rule,
// GenericRuleReasoner} and org.apache.jena.rdf.model.InfModel (Apache License
// 2.0). No Jena code is copied. Jena's rule language needs a parser and an
// engine in Lean, and a live InfModel needs a synchronous closure: gap
// 'inference' (GAPS.md).

import { unsupported } from './errors.mjs';
import { Model } from './model.mjs';

/** Jena InfModel: a Model over an inference graph. leana has no InfGraph, so none is ever made. */
export class InfModel extends Model {}

export const Rule = Object.freeze({
  parseRules() { return unsupported('Rule.parseRules', 'inference'); },
  parseRule() { return unsupported('Rule.parseRule', 'inference'); },
  rulesFromURL() { return unsupported('Rule.rulesFromURL', 'inference'); },
});

export class GenericRuleReasoner {
  constructor() { unsupported('GenericRuleReasoner', 'inference'); }
}

export const ReasonerRegistry = Object.freeze({
  getRDFSReasoner() { return unsupported('ReasonerRegistry.getRDFSReasoner', 'inference'); },
  getOWLReasoner() { return unsupported('ReasonerRegistry.getOWLReasoner', 'inference'); },
  getOWLMicroReasoner() { return unsupported('ReasonerRegistry.getOWLMicroReasoner', 'inference'); },
  getOWLMiniReasoner() { return unsupported('ReasonerRegistry.getOWLMiniReasoner', 'inference'); },
  getTransitiveReasoner() { return unsupported('ReasonerRegistry.getTransitiveReasoner', 'inference'); },
});
