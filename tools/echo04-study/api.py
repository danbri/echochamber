# Count the methods each RDF4J user-facing type declares in its own file.
# usage: python3 -I api.py <rdf4j root> Type [Type ...]
# Interfaces: every method declaration (abstract, default, static);
# classes: public ones. Inherited methods are not counted. Comments removed.
# Adapted from tools/leana-study/api.py (tab indentation, RDF4J layout).
import sys, re, os
root = sys.argv[1]
idx = {}
for dp, dn, fn in os.walk(root):
    if '/src/main/java/' not in dp + '/':
        continue
    for f in fn:
        if f.endswith('.java'):
            idx.setdefault(f[:-5], []).append(os.path.join(dp, f))
meth = re.compile(r'^(?:\t|    )(?:@\w+(?:\([^)]*\))?\s+)*((?:public|default|static|abstract|final|synchronized)\s+)*(?:<[^>]+>\s+)?[\w.<>\[\],? ]+?\s+(\w+)\s*\([^;{]*', re.M)
tot = 0; names = set()
for name in sys.argv[2:]:
    ps = [p for p in idx.get(name, []) if '/core/' in p or '/tools/' not in p]
    if not ps:
        print(f"{name}: NOT FOUND"); continue
    p = sorted(ps, key=len)[0]; s = open(p).read()
    isint = re.search(r'public\s+(?:\w+\s+)*interface\s+' + name + r'\b', s) is not None
    s2 = re.sub(r'/\*.*?\*/', '', s, flags=re.S); s2 = re.sub(r'//[^\n]*', '', s2)
    ms = []
    for m in meth.finditer(s2):
        line = m.group(0); head = line.split('(')[0]
        if m.group(2) in ('if', 'for', 'while', 'switch', 'return', 'new', 'catch', 'synchronized'):
            continue
        if not isint and 'public' not in head:
            continue
        if 'private' in head or 'protected' in head:
            continue
        ms.append(m.group(2))
    tot += len(ms); names |= {name + '.' + x for x in ms}
    print(f"{name}: {'interface' if isint else 'class'} methods={len(ms)} distinct={len(set(ms))} file={p.split(root)[1].lstrip('/')}")
print(f"TOTAL declarations={tot} distinct type.method={len(names)}")
