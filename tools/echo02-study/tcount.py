# Count RDFLib test functions per file and per area, by reading the source
# with the ast module (no RDFLib code is imported or run).
# usage: python3 -I tcount.py <rdflib root> [--files]
# "decl" = test function declarations (def test_* at module level or in a
# class named Test*). "cases" = decl, with each @pytest.mark.parametrize whose
# argument list is a literal list/tuple counted as len(list) (products of
# stacked decorators); parametrize over a computed iterable counts 1 and
# marks the file as "dyn" (executed count is higher).
import ast, os, sys, json

def param_factor(dec):
    if not isinstance(dec, ast.Call): return 1, False
    f = dec.func
    name = ast.unparse(f)
    if not name.endswith('parametrize'): return 1, False
    if len(dec.args) < 2: return 1, True
    a = dec.args[1]
    if isinstance(a, (ast.List, ast.Tuple, ast.Set)): return max(len(a.elts), 1), False
    return 1, True

def count_file(path):
    src = open(path, encoding='utf-8').read()
    tree = ast.parse(src)
    decl = 0; cases = 0; dyn = False
    def fn(node):
        nonlocal decl, cases, dyn
        decl += 1
        k = 1
        for d in node.decorator_list:
            fct, dy = param_factor(d); k *= fct; dyn = dyn or dy
        cases += k
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name.startswith('test'):
            fn(node)
        elif isinstance(node, ast.ClassDef) and node.name.startswith('Test'):
            for m in node.body:
                if isinstance(m, (ast.FunctionDef, ast.AsyncFunctionDef)) and m.name.startswith('test'):
                    fn(m)
    return decl, cases, dyn

def main():
    root = sys.argv[1]
    t = os.path.join(root, 'test')
    rows = []
    for d, _, fs in os.walk(t):
        if '/data' in d[len(t):] or d.endswith('/data'): continue
        for f in sorted(fs):
            if f.endswith('.py') and (f.startswith('test_') or f == 'runner.py'):
                p = os.path.join(d, f)
                decl, cases, dyn = count_file(p)
                if decl: rows.append((os.path.relpath(p, root), decl, cases, dyn))
    rows.sort()
    if '--files' in sys.argv:
        for r in rows: print('%-70s %4d %5d %s' % (r[0], r[1], r[2], 'dyn' if r[3] else ''))
    if '--json' in sys.argv:
        print(json.dumps(rows)); return
    areas = {}
    for p, decl, cases, dyn in rows:
        parts = p.split('/')
        a = parts[1] if len(parts) > 2 else parts[1]
        x = areas.setdefault(a, [0, 0, 0, 0]); x[0] += 1; x[1] += decl; x[2] += cases; x[3] += dyn
    print('%-32s %5s %5s %6s %4s' % ('area', 'files', 'decl', 'cases', 'dyn'))
    tot = [0, 0, 0, 0]
    for a in sorted(areas):
        x = areas[a]; print('%-32s %5d %5d %6d %4d' % (a, *x)); tot = [i + j for i, j in zip(tot, x)]
    print('%-32s %5d %5d %6d %4d' % ('TOTAL', *tot))

main()
