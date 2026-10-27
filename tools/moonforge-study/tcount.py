# Count JUnit test method declarations per Maven module of an RDF4J clone.
# usage: python3 -I tcount.py <rdf4j root>
# A file's count is its @Test/@ParameterizedTest/@RepeatedTest/@TestFactory
# annotations, or, with none, its JUnit 3 `public void test*()` methods.
# Files under src/test/java are module tests; files under src/main/java of
# testsuites/* are the abstract suites that other modules extend.
import sys, os, re
root = sys.argv[1]
ann = re.compile(r'^\s*@(Test|ParameterizedTest|RepeatedTest|TestFactory)\b', re.M)
j3 = re.compile(r'^\s*public\s+void\s+test\w*\s*\(', re.M)
rows = {}
for dp, dn, fn in os.walk(root):
    dn[:] = [d for d in dn if d not in ('.git', 'site', 'node_modules')]
    for f in fn:
        if not f.endswith('.java'):
            continue
        p = os.path.join(dp, f)
        for kind in ('/src/test/java/', '/src/main/java/'):
            if kind in p:
                mod = os.path.relpath(p.split(kind)[0], root)
                break
        else:
            continue
        s = open(p, errors='ignore').read()
        a = len(ann.findall(s)); n = a if a else len(j3.findall(s))
        r = rows.setdefault(mod, [0, 0, 0, 0, 0])
        if kind == '/src/main/java/':
            r[0] += 1
            if n: r[3] += n; r[4] += 1
        elif n:
            r[1] += n; r[2] += 1
print(f"{'module':52} {'main':>5} {'tests':>6} {'tclass':>6} {'suite':>6} {'sclass':>6}")
tot = [0]*5
for m in sorted(rows):
    r = rows[m]
    if not any(r[1:]) and r[0] == 0: continue
    print(f"{m:52} {r[0]:5d} {r[1]:6d} {r[2]:6d} {r[3]:6d} {r[4]:6d}")
    tot = [a+b for a, b in zip(tot, r)]
print(f"{'TOTAL':52} {tot[0]:5d} {tot[1]:6d} {tot[2]:6d} {tot[3]:6d} {tot[4]:6d}")
