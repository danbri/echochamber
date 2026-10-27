# Count the declared API of the main RDFLib types, reading source with ast
# (no RDFLib code is imported or run). Declared in the class body only;
# inherited members are not counted.
# usage: python3 -I api.py <rdflib root>
#   public  = methods/properties whose name does not start with "_"
#   dunder  = __x__ methods (operators, container protocol, comparisons)
#   private = other "_x" methods
import ast, os, sys, glob
TYPES = {
  'rdflib/graph.py': ['Graph', 'ConjunctiveGraph', 'Dataset', 'QuotedGraph', 'ReadOnlyGraphAggregate', 'Seq', 'BatchAddGraph'],
  'rdflib/term.py': ['Node', 'Identifier', 'IdentifiedNode', 'URIRef', 'BNode', 'Literal', 'Variable'],
  'rdflib/namespace/__init__.py': ['Namespace', 'DefinedNamespace', 'DefinedNamespaceMeta', 'ClosedNamespace', 'NamespaceManager'],
  'rdflib/parser.py': ['Parser', 'InputSource'],
  'rdflib/serializer.py': ['Serializer'],
  'rdflib/query.py': ['Processor', 'UpdateProcessor', 'Result', 'ResultRow', 'ResultParser', 'ResultSerializer'],
  'rdflib/store.py': ['Store'],
  'rdflib/resource.py': ['Resource'],
  'rdflib/collection.py': ['Collection'],
  'rdflib/paths.py': ['Path'],
}
root = sys.argv[1]
print('%-40s %6s %6s %7s' % ('type', 'public', 'dunder', 'private'))
tot = [0, 0, 0]; names = set()
for f, cls in TYPES.items():
    tree = ast.parse(open(os.path.join(root, f), encoding='utf-8').read())
    for node in tree.body:
        if isinstance(node, ast.ClassDef) and node.name in cls:
            seen = set()
            for m in node.body:
                if isinstance(m, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    seen.add(m.name)  # overloads and property setters count once
            pub = sorted(n for n in seen if not n.startswith('_'))
            dun = sorted(n for n in seen if n.startswith('__') and n.endswith('__'))
            prv = len(seen) - len(pub) - len(dun)
            names.update(pub)
            print('%-40s %6d %6d %7d' % (f.split('/')[-1] + ':' + node.name, len(pub), len(dun), prv))
            if '-v' in sys.argv: print('   public:', ' '.join(pub)); print('   dunder:', ' '.join(dun))
            tot = [tot[0] + len(pub), tot[1] + len(dun), tot[2] + prv]
print('%-40s %6d %6d %7d' % ('TOTAL', *tot)); print('distinct public names', len(names))
# Plugins registered in rdflib/plugin.py: register("name", Kind, ...) calls.
src = open(os.path.join(root, 'rdflib/plugin.py'), encoding='utf-8').read()
kinds = {}
for node in ast.walk(ast.parse(src)):
    if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'register' and len(node.args) >= 2 \
            and isinstance(node.args[0], ast.Constant):
        k = ast.unparse(node.args[1]); kinds.setdefault(k, []).append(ast.literal_eval(node.args[0]))
for k, v in sorted(kinds.items()): print('plugin %-18s %3d  %s' % (k, len(v), ' '.join(v)))
ns = [p for p in glob.glob(os.path.join(root, 'rdflib/namespace/_*.py'))]
print('bundled DefinedNamespace modules', len(ns))
