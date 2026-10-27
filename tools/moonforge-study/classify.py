# Group RDF4J test method declarations (counted as tcount.py counts them)
# by what a port would do with them. usage: python3 -I classify.py <rdf4j root>
# Classes (a judgement, by module and path; first rule that matches wins):
#  a  manifest runners over W3C suites Factoidal already runs directly
#  b  API-level behaviour a port can express against @factoidal/core
#     (b-model, b-rio, b-query, b-expr, b-repo, b-shacl, b-ast: needs a
#     query object model op, b-infer: RDFS inferencer)
#  c  JVM or engine internals (stores, indexes, optimisers, HTTP, servers,
#     iterators, caches, benchmarks, tooling)
import sys, os, re, collections
R = sys.argv[1]
ann = re.compile(r'^\s*@(Test|ParameterizedTest|RepeatedTest|TestFactory)\b', re.M)
j3 = re.compile(r'^\s*public\s+void\s+test\w*\s*\(', re.M)
RULES = [
 ('a', r'^testsuites/sparql/.*/manifest/'), ('a', r'^testsuites/rio/'), ('a', r'^compliance/rio/'),
 ('a', r'^core/sail/shacl/.*W3c'), ('a', r'^compliance/sparql/.*(Compliance|Manifest)'),
 ('b-expr', r'^core/queryalgebra/evaluation/.*/function/'),
 ('b-expr', r'^core/queryalgebra/evaluation/.*/util/(QueryEvaluationUtil|ValueComparator|OrderComparator|LiteralComparator|XMLDatatypeMathUtil|MathUtil)Test'),
 ('c', r'^core/queryalgebra/'),
 ('b-query', r'^testsuites/sparql/'), ('b-query', r'^compliance/sparql/'), ('b-query', r'^core/queryparser/'),
 ('b-query', r'^core/query/'), ('b-query', r'^core/queryresultio/'),
 ('b-ast', r'^core/sparqlbuilder/'), ('b-ast', r'^core/queryrender/'),
 ('b-model', r'^core/model'), ('b-model', r'^testsuites/model/'), ('b-model', r'^compliance/model/'),
 ('b-rio', r'^core/rio/'),
 ('b-repo', r'^core/repository/(api|sail|contextaware|dataset)/'), ('b-repo', r'^testsuites/repository/'), ('b-repo', r'^compliance/repository/'),
 ('b-repo', r'^core/sail/memory/'), ('b-repo', r'^testsuites/sail/'),
 ('b-shacl', r'^core/sail/shacl/'), ('b-infer', r'^core/sail/inferencer/'),
 ('c', r'.'),
]
tot = collections.Counter(); cls = collections.Counter()
for dp, dn, fn in os.walk(R):
    dn[:] = [d for d in dn if d not in ('.git', 'site')]
    for f in fn:
        if not f.endswith('.java'): continue
        p = os.path.join(dp, f)
        if '/src/test/java/' not in p and not ('/testsuites/' in p and '/src/main/java/' in p): continue
        s = open(p, errors='ignore').read()
        a = len(ann.findall(s)); n = a if a else len(j3.findall(s))
        if not n: continue
        rel = os.path.relpath(p, R)
        for c, rx in RULES:
            if re.search(rx, rel): break
        tot[c] += n; cls[c] += 1
for c in sorted(tot): print(f"{c:8} {tot[c]:6d} methods {cls[c]:5d} classes")
print(f"{'total':8} {sum(tot.values()):6d} methods {sum(cls.values()):5d} classes")
