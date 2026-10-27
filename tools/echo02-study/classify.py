# Group RDFLib test declarations (from tcount.py --json) by portability.
# The rules are a judgement by path (Claude-inferred, coarse); first match wins.
# usage: python3 -I tcount.py <rdflib root> --json > t.json; python3 -I classify.py t.json
#   a   W3C (or W3C-form) manifest runners: Factoidal runs the W3C suites directly
#   b1  API tests portable over @factoidal/core today (terms, Graph/Dataset,
#       parse/serialize in the six core syntaxes, SPARQL query/update, isomorphism)
#   b2  API tests that need engine semantics core lacks (Python value mapping,
#       qname/namespace splitting, N3 formulae, HexTuples/TriX/Patch/N3 syntaxes,
#       RDF collections/containers, Python-side property paths, resource API)
#   c   Python internals and out of scope (remote store clients, Python stores,
#       plugin registry, typing, docs, CLI tools, OWL helpers, test utilities)
import json, sys
RULES = [
  ('test/test_w3c_spec/', 'a'), ('test/jsonld/test_testsuite.py', 'a'),
  ('test/jsonld/test_onedotone.py', 'a'), ('test/jsonld/test_localsuite.py', 'a'),
  ('test/jsonld/test_compaction.py', 'b1'),
  ('test/jsonld/test_parser_deprecation_warnings.py', 'c'), ('test/jsonld/test_util.py', 'c'),
  ('test/jsonld/test_context.py', 'c'),
  ('test/jsonld/', 'b1'),
  ('test/test_graphdb/', 'c'), ('test/test_rdf4j/', 'c'), ('test/test_store/', 'c'),
  ('test/test_extras/', 'c'), ('test/test_tools/', 'c'), ('test/utils/', 'c'),
  ('test/test_typing.py', 'c'), ('test/test_docs.py', 'c'), ('test/test_examples.py', 'c'),
  ('test/test_deprecation_notice.py', 'c'),
  ('test/test_misc/test_events.py', 'c'), ('test/test_misc/test_plugins.py', 'c'),
  ('test/test_misc/test_security.py', 'c'), ('test/test_misc/test_input_source.py', 'c'),
  ('test/test_misc/test_conventions.py', 'c'), ('test/test_misc/test_path_div_future.py', 'b2'),
  ('test/test_misc/', 'b2'),
  ('test/test_graph/test_graph_http.py', 'c'), ('test/test_graph/test_graph_redirect.py', 'c'),
  ('test/test_graph/test_graph_store.py', 'c'), ('test/test_graph/test_container.py', 'b2'),
  ('test/test_graph/test_graph_formula.py', 'b2'), ('test/test_graph/test_namespace_rebinding.py', 'b2'),
  ('test/test_graph/', 'b1'),
  ('test/test_conjunctivegraph/', 'b1'), ('test/test_dataset/', 'b1'),
  ('test/test_literal/test_term.py', 'b1'), ('test/test_literal/test_uriref_literal_comparison.py', 'b2'),
  ('test/test_literal/', 'b2'),
  ('test/test_namespace/', 'b2'), ('test/test_path.py', 'b2'), ('test/test_n3.py', 'b2'),
  ('test/test_util.py', 'b2'),
  ('test/test_parsers/test_parser_hext.py', 'b2'), ('test/test_parsers/test_parser_patch.py', 'b2'),
  ('test/test_parsers/test_trix_parse.py', 'b2'), ('test/test_parsers/test_swap_n3.py', 'b2'),
  ('test/test_parsers/test_n3parse_of_rdf_lists.py', 'b2'),
  ('test/test_parsers/test_broken_parse_data_from_jena.py', 'b2'),
  ('test/test_parsers/test_parser_helpers.py', 'c'), ('test/test_parsers/test_parser_structure.py', 'c'),
  ('test/test_parsers/test_parser_reads_from_pathlike_object.py', 'c'),
  ('test/test_parsers/', 'b1'),
  ('test/test_serializers/test_serializer_hext.py', 'b2'), ('test/test_serializers/test_serializer_patch.py', 'b2'),
  ('test/test_serializers/test_serializer_trix.py', 'b2'), ('test/test_serializers/test_serializer_n3.py', 'b2'),
  ('test/test_serializers/test_serializer_longturtle', 'b2'), ('test/test_serializers/test_prettyxml.py', 'b2'),
  ('test/test_serializers/test_xmlwriter_qname.py', 'c'),
  ('test/test_serializers/', 'b1'),
  ('test/test_sparql/test_translate_algebra.py', 'c'), ('test/test_sparql/test_sparql_parser.py', 'c'),
  ('test/test_sparql/test_prepare.py', 'b2'), ('test/test_sparql/test_initbindings.py', 'b2'),
  ('test/test_sparql/test_service.py', 'b2'), ('test/test_sparql/test_functions.py', 'b1'),
  ('test/test_sparql/', 'b1'),
  ('test/test_issues/', 'b1'), ('test/', 'b1'),
]
rows = json.load(open(sys.argv[1]))
groups = {}
detail = {}
for path, decl, cases, dyn in rows:
    g = next(c for p, c in RULES if path.startswith(p))
    x = groups.setdefault(g, [0, 0, 0]); x[0] += 1; x[1] += decl; x[2] += cases
    area = path.split('/')[1]
    y = detail.setdefault((area, g), [0, 0]); y[0] += decl; y[1] += cases
print('%-4s %5s %5s %6s' % ('grp', 'files', 'decl', 'cases'))
for g in sorted(groups): print('%-4s %5d %5d %6d' % (g, *groups[g]))
print()
for (a, g) in sorted(detail): print('%-32s %-3s %5d %6d' % (a, g, *detail[(a, g)]))
