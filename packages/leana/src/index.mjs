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
  LiteralLabel, LiteralLabelFactory, BaseDatatype, TextDirection, Util, datatypeFor, fromRDFJS, JenaParameters, XSDDateTime,
} from './node.mjs';
export { GraphMem, WrappedGraph, GraphMemFactory, GraphFactory, GraphUtil, ExtendedIterator, JenaSet,
  GraphBase, GraphPlain, WrappedIterator, ReifierStd, Capabilities, TransactionHandlerBase, SimpleTransactionHandler,
} from './graph.mjs';
export {
  ArrayList, GraphEvents, GraphEventManager, GraphListenerBase, ModelListenerAdapter, StatementListener, NullListener,
  ObjectListener, ChangedListener,
} from './events.mjs';
export { PrefixMapping, PrefixMappingImpl, IllegalPrefixException } from './prefix.mjs';
export {
  UnsupportedPolymorphismException, Model, ModelFactory, ResourceFactory, Statement, RDFNode, Resource, Property, Literal,
  StmtIterator, ResIterator, NodeIterator, AnonId, StatementTerm,
} from './model.mjs';
export {
  Lang, LangImpl, RDFLanguages, RDFFormat, RDFParser, RDFParserBuilder, RDFWriter, RDFWriterBuilder,
  RDFDataMgr, StringReader, StringWriter, ErrorHandlerFactory, StreamManager, LocatorFile, LabelToNode,
  FactoryRDFStd, PrefixMapFactory, RDFReaderFactoryRIOT,
} from './riot.mjs';
export {
  Query, QueryFactory, Syntax, QueryExecution, QueryExecutionFactory, QueryExecutionDatasetBuilder, QueryExecutionImpl,
  QuerySolution, QuerySolutionMap, ResultSet, ResultSetRewindable, ResultSetFactory, ResultSetFormatter, ResultsFormat,
  QueryException, QueryParseException, QueryExecException, QueryCancelledException, QueryBuildException,
  UpdateRequest, UpdateFactory, UpdateExecution, UpdateExecutionBuilder, UpdateExecutionFactory, UpdateAction,
  UpdateException, UpdateParseException, ExprEvalException,
  NodeValue, FunctionBase, FunctionBase0, FunctionBase1, FunctionBase2, FunctionBase3, FunctionBase4, FunctionRegistry,
  PropertyFunctionRegistry,
} from './query.mjs';
export {
  Quad, ReadWrite, TxnType, JenaTransactionException, Txn, GraphView, GraphUnionView, DatasetGraph,
  DatasetGraphInMemory, DatasetGraphMapLink, DatasetGraphOne, Symbol_, Context, Dataset, DatasetFactory,
  DatasetGraphFactory, DatasetGraphMap, DatasetGraphZero, DatasetGraphSink, Promote, ARQException, AssemblerUtils,
} from './dataset.mjs';
export {
  CompositionBase, Dyadic, Union, Intersection, Difference, DisjointUnion, Delta, Polyadic, MultiUnion,
  PolyadicPrefixMappingImpl,
} from './compose.mjs';
export { InfModel, Rule, GenericRuleReasoner, ReasonerRegistry } from './reasoner.mjs';
export {
  JenaException, UnsupportedOperationException, LeanaUnsupportedError, NoSuchElementException,
  ClosedException, JenaLockedException, PropertyNotFoundException, LiteralRequiredException,
  ResourceRequiredException, AddDeniedException, DeleteDeniedException, RiotException, RiotNotFoundException,
  InvalidPropertyURIException,
} from './errors.mjs';
export { GAPS } from './gaps.mjs';
export { coreVersion } from './engine.mjs';
export { NiceIterator } from './graph.mjs';
export {
  Container, Seq, Bag, Alt, RDFList, SeqIndexBoundsException, ListIndexException, AlreadyReifiedException,
  CannotReifyException, NTripleReader, RDF, OWL, OWL2,
} from './model.mjs';
export { XSDDouble } from './node.mjs';
export {
  Table, QueryExec, QueryExecAdapter, QueryExecutionAdapter, QueryExecBuilderAdapter, QueryTransformOps,
} from './query.mjs';
export {
  ResultSetMem, ResultSetPeeking, IllegalStateException, ResultSetUtils, ResultsCompare, RDFOutput, RDFInput,
  ResultSetLang, ResultsWriter, ResultsReader, ResultSetMgr, Expr, ExprVar, ExprList, E_Function, E_Add, E_Subtract,
  E_Multiply, NodeValueInteger, NodeValueDouble, NodeValueBoolean, UserDefinedFunctionFactory,
} from './query.mjs';
export {
  UpdateExec, UsingList, UpdateWriter, UpdateCompare, QuadAcc, QuadDataAcc, Update, UpdateDataInsert, UpdateDataDelete,
  UpdateDeleteWhere, UpdateModify, Target, UpdateCreate, UpdateDrop, UpdateClear, UpdateCopy, UpdateAdd, UpdateMove,
} from './query.mjs';
