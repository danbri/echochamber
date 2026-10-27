// @factoidal/leana: an RDF API in the style of Apache Jena, in JavaScript
// over the public API of @factoidal/core.
//
// The API (class and method names, argument order, exception names) is
// modelled on Apache Jena (https://jena.apache.org/, Apache License 2.0).
// No Jena code is copied. Apache Jena is a trademark of The Apache Software
// Foundation; leana is not affiliated with or endorsed by it.
//
// Importing leana loads the @factoidal/core engine (top-level await). After
// that every Graph and Model method is synchronous; parsing text answers a
// Promise. Semantics @factoidal/core lacks throw LeanaUnsupportedError (see
// GAPS.md).

import { installModelIO } from './riot.mjs';

installModelIO();

export {
  Node, Node_URI, Node_Blank, Node_Literal, Node_Variable, Node_Triple, Node_Graph, NodeFactory, TypeMapper, Triple,
  LiteralLabel, BaseDatatype, fromRDFJS,
} from './node.mjs';
export { GraphMem, GraphMemFactory, GraphFactory, GraphUtil, ExtendedIterator, JenaSet } from './graph.mjs';
export { PrefixMapping, PrefixMappingImpl } from './prefix.mjs';
export {
  Model, ModelFactory, ResourceFactory, Statement, RDFNode, Resource, Property, Literal,
  StmtIterator, ResIterator, NodeIterator,
} from './model.mjs';
export {
  Lang, LangImpl, RDFLanguages, RDFFormat, RDFParser, RDFParserBuilder, RDFWriter, RDFWriterBuilder,
  RDFDataMgr, StringReader, StringWriter,
} from './riot.mjs';
export {
  JenaException, UnsupportedOperationException, LeanaUnsupportedError, NoSuchElementException,
  ClosedException, JenaLockedException, PropertyNotFoundException, LiteralRequiredException,
  ResourceRequiredException, AddDeniedException, DeleteDeniedException, RiotException, RiotNotFoundException,
} from './errors.mjs';
export { GAPS } from './gaps.mjs';
export { coreVersion } from './engine.mjs';
