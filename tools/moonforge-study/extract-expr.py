# Port Eclipse RDF4J's SPARQL function/expression unit tests to data.
# Original to echochamber, Apache-2.0. Reads RDF4J test sources (Eclipse
# Distribution License 1.0); writes cases derived from them.
#
# usage: python3 -I extract-expr.py <rdf4j root> <out cases.json>
#
# The Java tests call function objects directly (substrFunc.evaluate(vf, ...))
# and are not regular enough for a parser, so most of them are hand-ported in
# the TABLE below; the comparison tables of QueryEvaluationUtilTest are read
# mechanically. The script finds every @Test method of each ported file (with
# inherited methods counted once per concrete subclass), checks that each is
# either ported or listed as not ported with a reason, adds the line numbers,
# and counts the test methods of the RDF4J extension families (not ported).
import sys, os, re, json, subprocess
from decimal import Decimal

ROOT, OUT = sys.argv[1], sys.argv[2]
T = 'core/queryalgebra/evaluation/src/test/java/org/eclipse/rdf4j/query/algebra/evaluation/'
F = T + 'function/'
U = T + 'util/'
ANN = re.compile(r'^\s*@(Test|ParameterizedTest|RepeatedTest|TestFactory)\b')


def methods(path):
    """[(name, line)] of the annotated test methods of a Java file."""
    lines = open(os.path.join(ROOT, path), encoding='utf-8').read().split('\n')
    out = []
    for i, l in enumerate(lines):
        if ANN.match(l):
            for j in range(i, min(i + 6, len(lines))):
                m = re.search(r'\bvoid\s+(\w+)\s*\(', lines[j])
                if m:
                    out.append((m.group(1), j + 1))
                    break
    return out


def body(path, name):
    """(start line, [lines]) of a method body, up to the next annotated method."""
    lines = open(os.path.join(ROOT, path), encoding='utf-8').read().split('\n')
    ms = methods(path)
    for k, (n, ln) in enumerate(ms):
        if n == name:
            end = ms[k + 1][1] - 1 if k + 1 < len(ms) else len(lines)
            return ln, lines[ln - 1:end]
    raise KeyError(name)


# ---- term helpers (SPARQL syntax for RDF4J ValueFactory values) ----
def q(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'
def S(s): return q(s)                                  # createLiteral(String): xsd:string
def L(s, lang, d=None): return q(s) + '@' + lang + ('--' + d if d else '')
def D(s, dt): return q(s) + '^^xsd:' + dt              # createLiteral(label, XSD.X)
def I(n): return D(str(n), 'int')                       # createLiteral(int): xsd:int
def TT(s, p, o): return f'<<( {s} {p} {o} )>>'

# A case: dict(expr, expected, check, sparql12, note, pre). check kinds:
#  sameTerm   sameTerm(?r, expected)
#  label      sameTerm(STR(?r), expected): the test reads getLabel()/stringValue() only
#  datatype   sameTerm(DATATYPE(?r), expected): the test reads getDatatype() only
#  valueEqual ?r = expected: the test reads intValue()/doubleValue()/decimalValue()
#  ebv        EBV of ?r is expected (true/false): the test reads booleanValue()
#  test       expected is a boolean expression over ?r
#  error      E is an expression error (ValueExprEvaluationException)
#  noError    E is not an error
#  parseError the query does not parse (RDF4J: wrong arity at evaluation time)
#  order      ORDER BY: expected is lt|eq|gt|ne for the values a and b
def C(expr, expected, check, **kw):
    d = {'expr': expr, 'expected': expected, 'check': check}
    d.update(kw)
    return d
def ORD(a, b, rel, **kw):
    d = {'expr': None, 'a': a, 'b': b, 'expected': rel, 'check': 'order'}
    d.update(kw)
    return d

ARITY = 'SPARQL grammar fixes the arity of this built-in, so the RDF4J evaluation error is a parse error in SPARQL'
NO_ASSERT = 'the test asserts nothing about the result (it only exercises the call)'

TABLE = {}  # path -> {method: [case...] | 'not ported: reason'}

TABLE[F + 'string/ConcatTest.java'] = {
    'emptyArgumentsProduceEmptyString': [C('CONCAT()', S(''), 'sameTerm')],
    'stringLiteralHandling': [C('CONCAT("foo", "bar")', S('foobar'), 'sameTerm')],
    'commonLanguageLiteralHandling': [C('CONCAT("foo"@en, "bar"@en)', L('foobar', 'en'), 'sameTerm')],
    'mixedLanguageLiteralHandling': [C('CONCAT("foo"@nl, "bar"@en)', S('foobar'), 'sameTerm')],
    'mixedLiteralHandling': [C('CONCAT("foo", "bar"@en)', S('foobar'), 'sameTerm')],
    'nonStringLiteralHandling': [C('CONCAT(rdf:type, true)', None, 'error')],
    'nonLiteralHandling': [C('CONCAT(rdf:type, "bar"@en)', None, 'error')],
}
TABLE[F + 'string/ContainsTest.java'] = {
    'differentBaseDirectionsAreIncompatible': [C('CONTAINS("abc"@en--ltr, "b"@en--rtl)', None, 'error', sparql12=True)],
}
TABLE[F + 'string/EncodeForUriTest.java'] = {
    'encodesSupplementaryCharactersAsUtf8': [C('ENCODE_FOR_URI("\U0001F600")', S('%F0%9F%98%80'), 'label')],
    'preservesAsciiUnreservedCharactersAroundSupplementaryCharacters':
        [C('ENCODE_FOR_URI("A-._~\U0001F600 /")', S('A-._~%F0%9F%98%80%20%2F'), 'label')],
}
for cls, fn, up in (('LowerCaseTest', 'LCASE', False), ('UpperCaseTest', 'UCASE', True)):
    cv = (lambda s: s.upper()) if up else (lambda s: s.lower())
    TABLE[F + f'string/{cls}.java'] = {
        'testEvaluate1': [C(f'{fn}("foobar")', S(cv('foobar')), 'label')],
        'testEvaluate2': [C(f'{fn}("FooBar")', S(cv('FooBar')), 'label')],
        'testDirectedLanguageLiteralPreservesBaseDirection':
            [C(f'{fn}("FooBar"@en--rtl)', L(cv('FooBar'), 'en', 'rtl'), 'sameTerm', sparql12=True,
               note='asserts label, language and base direction')],
        'testEvaluate3': [C(f'{fn}("FooBar", {I(4)})', None, 'parseError', note=ARITY)],
    }
TABLE[F + 'string/StrLenTest.java'] = {
    'countsSupplementaryCharactersAsSingleCharacters': [C('STRLEN("A\U0001F600\U00010437")', '3', 'valueEqual', note='intValue()')],
    'countsUnicodeCodePointsRatherThanGraphemeClusters': [C('STRLEN("é")', '2', 'valueEqual', note='intValue()')],
}
TABLE[F + 'string/RegexTest.java'] = {
    'testEvaluate1': [C('REGEX("foobar", "foobar")', 'true', 'ebv')],
    'testEvaluate2': [C('REGEX("foobar", "FooBar", "i")', 'true', 'ebv')],
    'testEvaluate3': [C(f'REGEX("FooBar", {I(4)}, {I(4)}, {I(4)})', None, 'parseError', note=ARITY)],
    'testEvaluate4': [C('REGEX("foobar"@en, "FooBar", "i")', 'true', 'ebv')],
    'testEvaluate5': [C('REGEX("foobar"^^xsd:string, "FooBar", "i")', 'true', 'ebv')],
    'testEvaluate6': [C('REGEX("foobar"^^xsd:token, "FooBar", "i")', None, 'error')],
}
TABLE[F + 'string/ReplaceTest.java'] = {
    'testEvaluate1': [C('REPLACE("foobar", "ba", "Z")', S('fooZr'), 'label')],
    'testEvaluate2': [C('REPLACE("foobar", "BA", "Z")', S('foobar'), 'label')],
    'testEvaluate3': [C('REPLACE("foobar", "BA", "Z", "i")', S('fooZr'), 'label')],
    'testDirectedLanguageLiteralPreservesBaseDirection':
        [C('REPLACE("foobar"@en--rtl, "ba", "Z")', L('fooZr', 'en', 'rtl'), 'sameTerm', sparql12=True)],
    'testEvaluate4': [C(f'REPLACE({I(10)}, "BA", "Z")', None, 'error')],
    'testEvaluate5': [C('REPLACE("foobarfoobarbarfoo", "ba", "Z")', S('fooZrfooZrZrfoo'), 'label')],
    'testEvaluate6': [C('REPLACE("foobarfoobarbarfooba", "ba.", "Z")', S('fooZfooZZfooba'), 'label')],
    'testEvaluate7': [C('REPLACE("日本語"@ja, "[^a-zA-Z0-9]", "-")', L('---', 'ja'), 'sameTerm',
                        note='asserts label and language')],
}
for cls, fn, res, res2 in (('StrAfterTest', 'STRAFTER', 'r', 'ar'), ('StrBeforeTest', 'STRBEFORE', 'foo', 'foo')):
    TABLE[F + f'string/{cls}.java'] = {
        'testEvaluate1': [C(f'{fn}("foobar", "ba")', S(res), 'label')],
        'testEvaluate2': [C(f'{fn}("foobar", "xyz")', S(''), 'label')],
        'testEvaluate3': [C(f'{fn}("foobar"@en, "b")', L(res2, 'en'), 'sameTerm')],
        'testDirectedLanguageLiteralPreservesBaseDirection':
            [C(f'{fn}("foobar"@en--rtl, "b")', L(res2, 'en', 'rtl'), 'sameTerm', sparql12=True)],
        'testEvaluate4': [C(f'{fn}("foobar"^^xsd:string, "b")', S(res2), 'sameTerm')],
        'testEvaluate4a': [C(f'{fn}("foobar", "b"^^xsd:string)', S(res2), 'sameTerm')],
        'testEvaluate5': [C(f'{fn}("foobar"^^xsd:string, "b"^^xsd:date)', None, 'error')],
        'testEvaluate6': [C(f'{fn}({I(10)}, "b")', None, 'error')],
        'testEvaluate7': [C(f'{fn}(<http://example.org/foobar>, "b")', None, 'error')],
        'testEvaluate8': [C(f'{fn}("foobar"@en, "b"@nl)', None, 'error')],
        'testEvaluate9': [C(f'{fn}("foobar", "b"@nl)', None, 'error')],
        'testEvaluate10': [C(f'{fn}("foobar"@en, "b"^^xsd:string)', L(res2, 'en'), 'sameTerm')],
        'testEvaluate11': [C(f'{fn}("foobar"@nl, "b"@nl)', L(res2, 'nl'), 'sameTerm')],
    }
TABLE[F + 'string/SubstringTest.java'] = {
    'testEvaluate1': [C(f'SUBSTR("foobar", {I(4)})', S('bar'), 'label')],
    'testEvaluate2': [C(f'SUBSTR("foobar", {I(4)}, {I(2)})', S('ba'), 'label')],
    'testEvaluate3': [C(f'SUBSTR("foobar", {I(4)}, {I(5)})', S('bar'), 'label')],
    'testDirectedLanguageLiteralPreservesBaseDirection':
        [C(f'SUBSTR("foobar"@en--rtl, {I(4)})', L('bar', 'en', 'rtl'), 'sameTerm', sparql12=True)],
    'testEvaluate4': [C('SUBSTR("foobar")', None, 'parseError', note=ARITY)],
    'testEvaluateStartBefore1': [C(f'SUBSTR("ABC", {I(0)}, {I(1)})', S(''), 'label')],
    'testXpathExamples1': [C(f'SUBSTR("motor car", {I(6)})', S(' car'), 'label')],
    'testXpathExamples2': [C(f'SUBSTR("metadata", {I(4)}, {I(3)})', S('ada'), 'label')],
    'testXpathExamples3': [C('SUBSTR("12345", "1.5E0"^^xsd:double, "2.6E0"^^xsd:double)', None, 'error')],
    'testXpathExamples3int': [C(f'SUBSTR("12345", {I(2)}, {I(3)})', S('234'), 'label')],
    'testXpathExamples4': [C(f'SUBSTR("12345", {I(0)}, {I(3)})', S('12'), 'label')],
    'testXpathExamples5': [C(f'SUBSTR("12345", {I(5)}, {I(-3)})', S(''), 'label')],
    'testXpathExamples6': [C(f'SUBSTR("12345", {I(-3)}, {I(5)})', S('1'), 'label')],
    'testXpathExamples7': 'not ported: ' + NO_ASSERT + ' (SUBSTR with length NaN; either outcome passes)',
    'testXpathExample8Inspired': [C(f'SUBSTR("12345", {I(-42)}, {I(50)})', S('12345'), 'label')],
    'testXpathExamples9': [C('SUBSTR("12345", "-INF"^^xsd:float, "INF"^^xsd:float)', None, 'error')],
}

# HashFunctionTest is abstract; each subclass runs its three methods.
HASH = {'MD5Test': ('MD5', 'abc', '900150983cd24fb0d6963f7d28e17f72'),
        'HashLeadingZeroTest': ('MD5', '363', '00411460f7c92d2124a67ea0f4cb5f85'),
        'SHA1Test': ('SHA1', 'abc', 'a9993e364706816aba3e25717850c26c9cd0d89d'),
        'SHA256Test': ('SHA256', 'abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'),
        'SHA384Test': ('SHA384', 'abc', 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'),
        'SHA512Test': ('SHA512', 'abc', 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f')}
INHERITED = {}  # subclass path -> (base path, {method: cases})
for cls, (fn, inp, dig) in HASH.items():
    INHERITED[F + f'hash/{cls}.java'] = (F + 'hash/HashFunctionTest.java', {
        'testEvaluate': [C(f'{fn}({S(inp)})', S(dig), 'sameTerm', note='asserts datatype xsd:string and label')],
        'testEvaluate2': [C(f'{fn}({D(inp, "string")})', S(dig), 'sameTerm')],
        'testEvaluate3': [C(f'{fn}("4"^^xsd:integer)', None, 'error')],
    })

TABLE[F + 'numeric/RoundTest.java'] = {
    'testEvaluateDouble': [C('ROUND("1.6E0"^^xsd:double)', '"2.0E0"^^xsd:double', 'valueEqual', note='doubleValue() within 0.001')],
    'testEvaluateInt': [C(f'ROUND({I(1)})', '1', 'valueEqual', note='intValue()')],
    'testEvaluateBigDecimal': [C(f'ROUND({D(format(Decimal(1234567.567), "f"), "decimal")})', '1234568.0', 'valueEqual',
                                 note='decimalValue() equals new BigDecimal(1234568.0); the argument is new BigDecimal(1234567.567).toPlainString(), the exact binary expansion')],
}
TABLE[F + 'numeric/RandTest.java'] = {
    'testEvaluate': [C('RAND()', 'DATATYPE(?r) = xsd:double && ?r >= 0 && ?r < 1', 'test')],
    'testPrepare': 'not ported: exercises the precompiled evaluation-step API; its only extra assertion (100 draws all distinct) is probabilistic',
}
TABLE[F + 'datetime/TzTest.java'] = {
    'testEvaluate1': [C('TZ("2011-01-10T14:45:13.815-05:00"^^xsd:dateTime)', S('-05:00'), 'sameTerm')],
    'testEvaluate2': [C('TZ("2011-01-10T14:45:13.815Z"^^xsd:dateTime)', S('Z'), 'sameTerm')],
    'testEvaluate3': [C('TZ("2011-01-10T14:45:13.815"^^xsd:dateTime)', S(''), 'sameTerm')],
}
TABLE[F + 'datetime/TimezoneTest.java'] = {
    'testEvaluate1': [C('TIMEZONE("2011-01-10T14:45:13.815-05:00"^^xsd:dateTime)', D('-PT5H', 'dayTimeDuration'), 'sameTerm')],
    'testEvaluate2': [C('TIMEZONE("2011-01-10T14:45:13.815Z"^^xsd:dateTime)', D('PT0S', 'dayTimeDuration'), 'sameTerm')],
    'testEvaluate3': [C('TIMEZONE("2011-01-10T14:45:13.815"^^xsd:dateTime)', None, 'error')],
}

def dc(arg, exp):
    return [C(f'xsd:date({arg})', D(exp, 'date'), 'sameTerm', note='asserts label and datatype')] if exp else [C(f'xsd:date({arg})', None, 'error')]
TABLE[F + 'xsd/TestDateCast.java'] = {
    'testCastPlainLiteral_date': dc(S('1999-09-09'), '1999-09-09'),
    'testCastPlainLiteral_date_withTimeZone_utc': dc(S('1999-09-09Z'), '1999-09-09Z'),
    'testCastPlainLiteral_date_withTimeZone_offset': dc(S('1999-09-09-06:00'), '1999-09-09-06:00'),
    'testCastPlainLiteral_date_invalid': dc(S('1999-09-xx'), None),
    'testCastPlainLiteral_dateTime': dc(S('1999-09-09T14:45:13'), '1999-09-09'),
    'testCastPlainLiteral_dateTime_withTimeZone_utc': dc(S('1999-09-09T14:45:13Z'), '1999-09-09-00:00'),
    'testCastPlainLiteral_dateTime_withTimeZone_offset': dc(S('1999-09-09T14:45:13-06:00'), '1999-09-09-06:00'),
    'testCastPlainLiteral_dateTime_invalid': dc(S('1999-09-09T14:45:xx'), None),
    'testCastDateLiteral': dc(D('2022-11-01Z', 'date'), '2022-11-01Z'),
    'testCastDateTimeLiteral': dc(D('1999-09-09T14:45:13', 'dateTime'), '1999-09-09'),
    'testCastDateTimeLiteral_withTimeZone_utc': dc(D('1999-09-09T14:45:13Z', 'dateTime'), '1999-09-09-00:00'),
    'testCastDateTimeLiteral_withTimeZone_offset': dc(D('1999-09-09T14:45:13+03:00', 'dateTime'), '1999-09-09+03:00'),
}
TABLE[F + 'xsd/TestDateTimeCast.java'] = {
    'testCastPlainLiteral': [C('xsd:dateTime("1999-09-09T00:00:01")', 'xsd:dateTime', 'datatype')],
    'testCastDateLiteral': [C('xsd:dateTime("1999-09-09"^^xsd:date)', 'xsd:dateTime', 'datatype')],
    'testCastDateTimeLiteral': [C('xsd:dateTime("2000-01-01T00:00:00"^^xsd:dateTime)', D('2000-01-01T00:00:00', 'dateTime'), 'sameTerm')],
}
TABLE[F + 'xsd/TestStringCast.java'] = {
    'testCastPlainLiteral': [C('xsd:string("foo")', 'xsd:string', 'datatype')],
    'testCastLangtagLiteral': [C('xsd:string("foo"@en)', None, 'error')],
    'testCastIntegerLiteral': [C(f'xsd:string({I(10)})', S('10'), 'sameTerm')],
    'testCastDateTimeLiteral': [C('xsd:string("2000-01-01T00:00:00"^^xsd:dateTime)', S('2000-01-01T00:00:00'), 'sameTerm')],
    'testCastUnknownDatatypedLiteral': [C('xsd:string("foobar"^^<foo:unknownDt>)', S('foobar'), 'sameTerm')],
}

# TestIntegerDatatypeCast is abstract: (datatype, min, max) per subclass, as the subclass declares them.
INTC = {'TestByteCast': ('byte', -128, 127), 'TestShortCast': ('short', -32768, 32767),
        'TestIntCast': ('int', -2**31, 2**31 - 1), 'TestLongCast': ('long', -2**63, 2**63 - 1),
        'TestIntegerCast': ('integer', None, None), 'TestNegativeIntegerCast': ('negativeInteger', None, -1),
        'TestNonNegativeInteger': ('nonNegativeInteger', 0, None), 'TestNonPositiveIntegerCast': ('nonPositiveInteger', None, 0),
        'TestPositiveIntegerCast': ('positiveInteger', 1, None), 'TestUnsignedByteCast': ('unsignedByte', 0, 255),
        'TestUnsignedShortCast': ('unsignedShort', 0, 65535), 'TestUnsignedIntCast': ('unsignedInt', 0, 2**32 - 1),
        'TestUnsignedLongCast': ('unsignedLong', 0, 2**63 - 1)}
for cls, (dt, lo, hi) in INTC.items():
    inr = (lo is None or lo <= 100) and (hi is None or hi >= 100)
    vac = 'not ported: the test returns without an assertion for this datatype'
    pos = lambda v: [C(f'xsd:{dt}("{v}"^^xsd:double)', f'sameTerm(DATATYPE(?r), xsd:{dt}) && ?r = 100', 'test',
                       note='asserts the datatype and intValue() 100')]
    INHERITED[F + f'xsd/{cls}.java'] = (F + 'xsd/TestIntegerDatatypeCast.java', {
        'testCastBelowMinValue': [C(f'xsd:{dt}("{lo - 1}"^^xsd:integer)', None, 'error')] if lo is not None else vac + ' (no minimum)',
        'testCastAboveMaxValue': [C(f'xsd:{dt}("{hi + 1}"^^xsd:integer)', None, 'error')] if hi is not None else vac + ' (no maximum)',
        'testCastPositiveDouble': pos('100.01') if inr else vac + ' (100 is out of range)',
        'testCastPositiveDoubleWithLargeFraction': pos('100.987456') if inr else vac + ' (100 is out of range)',
    })

A, B, Cc = '<urn:a>', '<urn:b>', '<urn:c>'
T12 = dict(sparql12=True)
TABLE[F + 'triple/IsTripleTermFunctionTest.java'] = {
    'testEvaluateWithTriple': [C(f'isTRIPLE({TT(A, B, Cc)})', 'true', 'sameTerm', **T12),
                               C(f'isTRIPLE({A})', 'false', 'sameTerm', **T12)],
    'testNegativeWrongArguments': [C(f'isTRIPLE({TT(A, B, Cc)}, {A})', None, 'parseError', note=ARITY, **T12)],
    'testNegativeNoArguments': [C('isTRIPLE()', None, 'parseError', note=ARITY, **T12)],
}
NOTE_BN = 'the blank node is made once by BNODE() before the case; the expected triple term is built with the <<( )>> expression syntax'
TABLE[F + 'triple/StatementFunctionTest.java'] = {
    'testEvaluateIRIAndIRI': [C(f'TRIPLE({A}, {B}, {Cc})', TT(A, B, Cc), 'sameTerm', **T12)],
    'testEvaluateIRIAndBNode': [C(f'TRIPLE({A}, {B}, ?o)', TT(A, B, '?o'), 'sameTerm', pre='BIND(BNODE() AS ?o)', note=NOTE_BN, **T12)],
    'testEvaluateIRIAndLiteral': [C(f'TRIPLE({A}, {B}, {I(1)})', TT(A, B, I(1)), 'sameTerm', **T12)],
    'testEvaluateIRIAndTriple': [C(f'TRIPLE({A}, {B}, {TT(A, A, A)})', TT(A, B, TT(A, A, A)), 'sameTerm', **T12)],
    'testEvaluateBNodeAndIRI': [C(f'TRIPLE(?s, {B}, {Cc})', TT('?s', B, Cc), 'sameTerm', pre='BIND(BNODE() AS ?s)', note=NOTE_BN, **T12)],
    'testEvaluateBNodeAndBNode': [C(f'TRIPLE(?s, {B}, ?o)', TT('?s', B, '?o'), 'sameTerm', pre='BIND(BNODE() AS ?s) BIND(BNODE() AS ?o)', note=NOTE_BN, **T12)],
    'testEvaluateBNodeAndLiteral': [C(f'TRIPLE(?s, {B}, {I(1)})', TT('?s', B, I(1)), 'sameTerm', pre='BIND(BNODE() AS ?s)', note=NOTE_BN, **T12)],
    'testEvaluateBNodeAndTriple': [C(f'TRIPLE(?s, {B}, {TT(B, B, B)})', TT('?s', B, TT(B, B, B)), 'sameTerm', pre='BIND(BNODE() AS ?s)', note=NOTE_BN, **T12)],
    'testNegariveWrongNumberOfArguments': [C(f'TRIPLE({A}, {B}, {Cc}, ?unbound)', None, 'parseError', note=ARITY + ' (RDF4J passes null as the fourth argument)', **T12)],
    'testNegativeLiteralAsSubject': [C(f'TRIPLE({I(1)}, {B}, {Cc})', None, 'error', **T12)],
    'testNegativeLiteralAsPredicate': [C(f'TRIPLE({I(1)}, {B}, {Cc})', None, 'error', note='as written upstream the literal is the subject, not the predicate', **T12)],
}
for cls, fn, res in (('TripleObjectFunctionTest', 'OBJECT', Cc), ('TriplePredicateFunctionTest', 'PREDICATE', B),
                     ('TripleTermSubjectFunctionTest', 'SUBJECT', A)):
    TABLE[F + f'triple/{cls}.java'] = {
        'testEvaluateWithTriple': [C(f'{fn}({TT(A, B, Cc)})', res, 'sameTerm', **T12)],
        'testNegativeWrongArguments': [C(f'{fn}({TT(A, B, Cc)}, {A})', None, 'parseError', note=ARITY, **T12)],
        'testWrongArguments': [C(f'{fn}({A})', None, 'error', **T12)],
    }

NULLIF = 'not ported: NULLIF is an RDF4J extension function (MISCF.nullIf), not a SPARQL 1.1 or 1.2 built-in'
TABLE[F + 'misc/NullIfEdgeCaseTest.java'] = {m: NULLIF for m, _ in methods(F + 'misc/NullIfEdgeCaseTest.java')}

# ---- QueryEvaluationUtilTest: compareLiterals and compatibleArguments, read mechanically ----
QEU_ARGS = {
    'arg1simple': S('abc'), 'arg2simple': S('b'), 'arg1en': L('abc', 'en'), 'arg2en': L('b', 'en'),
    'arg1cy': L('abc', 'cy'), 'arg2cy': L('b', 'cy'), 'arg1string': D('abc', 'string'), 'arg2string': D('b', 'string'),
    'arg1year': D('2007', 'gYear'), 'arg2year': D('2009', 'gYear'),
    'arg1dateTime': D('2009-01-01T20:20:20Z', 'dateTime'), 'arg2dateTime': D('2007-01-01T20:20:20+02:00', 'dateTime'),
    'arg1int': I(10), 'arg2int': I(1), 'arg1duration': D('P1Y30DT1H1M1S', 'duration'), 'arg2duration': D('P1Y31DT1H1M1S', 'duration'),
    'arg1yearMonthDuration': D('P1M', 'yearMonthDuration'), 'arg2yearMonthDuration': D('P1Y1M', 'yearMonthDuration'),
    'arg1unknown': '"foo"^^<http://example.com/datatype>', 'arg2unknown': '"bar"^^<http://example.com/datatype>',
    'literal("value NOT")': S('value NOT'), 'literal("1", XSD.INTEGER)': '"1"^^xsd:integer',
}
def qeu_term(s, local):
    s = s.strip()
    if s in local: return local[s]
    if s in QEU_ARGS: return QEU_ARGS[s]
    m = re.fullmatch(r'f\.createLiteral\("([^"]*)", "([^"]*)"(?:, Literal\.BaseDirection\.(LTR|RTL))?\)', s)
    if m: return L(m.group(1), m.group(2), m.group(3).lower() if m.group(3) else None)
    m = re.fullmatch(r'f\.createLiteral\("([^"]*)"\)', s)
    if m: return S(m.group(1))
    raise ValueError('term ' + s)
OPS = {'EQ': '=', 'NE': '!=', 'LT': '<'}
NONSTRICT = 'not ported: RDF4J non-strict (extended) comparison mode, an RDF4J evaluation setting with no SPARQL counterpart'

def qeu_method(name):
    ln0, lines = body(U + 'QueryEvaluationUtilTest.java', name)
    local, out = {}, []
    stmts, buf, start = [], '', 0
    for k, l in enumerate(lines):  # join statements that continue on the next line
        if not buf: start = k
        buf = (buf + ' ' + l.strip()) if buf else l
        if buf.count('(') <= buf.count(')'):
            stmts.append((start, buf)); buf = ''
    for k, l in stmts:
        m = re.match(r'\s*Literal (\w+) = (f\.createLiteral\(.*\));', l)
        if m: local[m.group(1)] = qeu_term(m.group(2), {})
        m = re.match(r'\s*assert(True|False)\(QueryEvaluationUtil\.compatibleArguments\((.*), (\w+)\)\);', l)
        if m:
            a, b = qeu_term(m.group(2), local), qeu_term(m.group(3), local)
            out.append((ln0 + k, C(f'STRSTARTS({a}, {b})', None, 'noError' if m.group(1) == 'True' else 'error',
                                   sparql12='--' in a + b,
                                   note='compatibleArguments, observed as whether STRSTARTS is an error (SPARQL 1.1 §17.4.3.1.3)')))
            continue
        m = re.match(r'\s*assertCompare(True|False|Exception)\((.*), (EQ|NE|LT)(, (true|false))?\);', l)
        if m:
            parts = [p for p in re.split(r',\s*(?![^()]*\))', m.group(2))]
            a, b = qeu_term(parts[0], local), qeu_term(parts[1], local)
            if m.group(5) == 'false':
                out.append((ln0 + k, NONSTRICT))
                continue
            kind = m.group(1)
            e = f'{a} {OPS[m.group(3)]} {b}'
            out.append((ln0 + k, C(e, None, 'error') if kind == 'Exception' else C(e, kind.lower(), 'sameTerm', sparql12='--' in e)))
    return out

QEU = {
    'effectiveBooleanValueInvalidNumericReturnsFalse': [C('"abc"^^xsd:integer', 'false', 'ebv')],
    'orderedComparisonNonLiteralThrowsTypeError': [C('<http://example.com/res> < <http://example.com/res>', None, 'error')],
    'testDirectedLanguageLiteralIsPlainLiteral': 'not ported: isPlainLiteral is an RDF4J Java classification with no SPARQL operation of its own (argument compatibility of directional strings is ported from the next method)',
    'testCompareWithCustomLiterals': 'not ported: regression for a custom Java Literal implementation (GH-2760); ' + NO_ASSERT,
    'testCompareWithCustomLiteralsIncompatible': 'not ported: custom Java Literal implementation (GH-2760); asserts only exception messages',
    'testCompareWithCustomLiteralsInditerminate': 'not ported: custom Java Literal implementation (GH-2760); asserts only exception messages',
    'testCompareCustomDatatypes': 'not ported: asserts only an exception message, not whether the comparison is an error',
    'testCompareWithOnlyCustomLiterals': 'not ported: custom Java Literal implementation (GH-2760); ' + NO_ASSERT,
    'calendarComparisonCacheDoesNotStronglyRetainComparedLiteralOrValue': 'not ported: inspects an internal cache by reflection',
}
TABLE[U + 'QueryEvaluationUtilTest.java'] = QEU  # the rest is filled by qeu_method

# ---- comparators: ValueComparator is RDF4J's ORDER BY order ----
UN = None  # an unbound value (Java null)
u1, u2, u3 = '<http://script.example/Latin>', '<http://script.example/Кириллица>', '<http://script.example/日本語>'
typed1 = D('http://script.example/Latin', 'string')
BN1 = 'BIND(BNODE() AS ?b1)'
BN2 = 'BIND(BNODE() AS ?b1) BIND(BNODE() AS ?b2)'
PAIR = 'pairwise: the upstream test sorts a longer list and compares two positions; the case sorts the two values only'
TABLE[U + 'ValueComparatorTest.java'] = {
    'testBothNull': [ORD(UN, UN, 'eq')],
    'testLeftNull': [ORD(UN, typed1, 'lt')],
    'testRightNull': [ORD(typed1, UN, 'gt')],
    'testBothBnode': [ORD('?b1', '?b1', 'eq', pre=BN1), ORD('?b1', '?b1', 'eq', pre=BN1, note='bnode2 with itself'),
                      ORD('?b1', '?b2', 'ne', pre=BN2), ORD('?b1', '?b2', 'ne', pre=BN2, note='antisymmetry; one ORDER BY is antisymmetric, so this is the not-a-tie check again')],
    'testLeftBnode': [ORD('?b1', typed1, 'lt', pre=BN1)],
    'testRightBnode': [ORD(typed1, '?b1', 'gt', pre=BN1)],
    'testBothURI': [ORD(x, y, r) for x, y, r in ((u1, u1, 'eq'), (u1, u2, 'lt'), (u1, u3, 'lt'), (u2, u1, 'gt'), (u2, u2, 'eq'),
                                                  (u2, u3, 'lt'), (u3, u1, 'gt'), (u3, u2, 'gt'), (u3, u3, 'eq'))],
    'testDirectedLanguageBaseDirection': [ORD(L('abc', 'en', 'ltr'), L('abc', 'en', 'rtl'), 'ne', **T12) for _ in range(3)],
    'testLeftURI': [ORD(u1, typed1, 'lt')],
    'testRightURI': [ORD(typed1, u1, 'gt')],
    'testOrder1': [ORD(I(9), I(10), 'lt', note=PAIR)],
    'testOrder2': [ORD(x, y, 'lt', note=PAIR) for x, y in (('"5"^^xsd:integer', '"9.0E0"^^xsd:float'), ('"5"^^xsd:integer', I(9)),
                                                            ('"5"^^xsd:integer', I(10)), ('"9.0E0"^^xsd:float', I(10)), (I(9), I(10)), (I(9), I(10)))],
    'testOrder3': [ORD(I(1000), '"2000.0E0"^^xsd:float', 'lt', note=PAIR)],
    'testNonStrictComparisons': NONSTRICT,
    'testStrictComparisons': [ORD(D('2017-01-01', 'date'), D('2018', 'gYear'), 'lt'), ORD(D('2018', 'gYear'), D('2017-01-01', 'date'), 'gt')],
    'testCalendarValueEqualsUseRdfTermTieBreak': [
        ORD(D('2000-01-01T00:00:00Z', 'dateTime'), D('2000-01-01T00:00:00Z', 'dateTime'), 'eq', note='DEFAULT policy, strict'),
        ORD(D('2000-01-01T00:00:00Z', 'dateTime'), D('1999-12-31T19:00:00-05:00', 'dateTime'), 'eq', note='DEFAULT policy, strict: value-equal calendar tie'),
        ORD(D('2000-01-01T00:00:00Z', 'dateTime'), D('2000-01-01T00:00:00Z', 'dateTimeStamp'), 'ne', note='DEFAULT policy, strict: distinct datatypes are not a tie'),
        'not ported: the same assertions under the EXPERIMENTAL policy and non-strict mode, RDF4J evaluation settings'],
    'testCalendarSortKeyRemainsLabelDerivedAfterBackingCalendarMutation': 'not ported: mutates the Java XMLGregorianCalendar behind a literal',
}
la, lb, lf = L('a', 'en'), L('b', 'en'), L('a', 'fr')
d1, d2 = D('2000-03-04T20:00:00Z', 'dateTime'), D('2002-10-10T12:00:00-05:00', 'dateTime')
s1, s2 = S('http://script.example/Latin'), S('http://script.example/Кириллица')
def quad(x, y):
    return [ORD(x, x, 'eq'), ORD(x, y, 'lt'), ORD(y, x, 'gt'), ORD(y, y, 'eq')]
TABLE[U + 'LiteralComparatorTest.java'] = {
    'testNumeric': quad(I(1), I(10)), 'testString': quad(S('a'), S('b')), 'testSameLanguage': quad(la, lb),
    'testDifferentLanguage': 'not ported: ' + NO_ASSERT,
    'testBoolean': quad('false', 'true'), 'testDateTime': quad(d1, d2), 'testBothSimple': quad(s1, s2),
    'testLeftSimple': [ORD(s1, typed1, 'eq')], 'testRightSimple': [ORD(typed1, s1, 'eq')],
    'testOrder': [ORD(I(9), I(10), 'lt', note=PAIR)],
}
ORDCMP = 'not ported: OrderComparator over binding sets with a mocked value comparator, or with no ORDER BY condition (RDF4J internal total-order tie-break); not observable in SPARQL, where rows with equal sort keys have no defined order'
TABLE[U + 'OrderComparatorTest.java'] = {m: ORDCMP for m, _ in methods(U + 'OrderComparatorTest.java')}

# ---- assemble ----
cases, notPorted, counts = [], [], {}

def family(path):
    return path[len(F):].split('/')[0] if path.startswith(F) else 'util'

def emit(cls, path, ln, name, items, srcfile, sub=None):
    fam = family(srcfile)
    c = counts.setdefault(fam, [0, 0, 0])  # methods, ported, not ported
    c[0] += 1
    if isinstance(items, str):
        notPorted.append({'id': f'{cls}#{name}', 'file': srcfile, 'line': ln, 'reason': items[len('not ported: '):]} | ({'subclass': sub} if sub else {}))
        c[2] += 1
        return
    multi = len(items) > 1
    any_case = False
    for k, it in enumerate(items):
        if isinstance(it, tuple):
            iln, it = it
        else:
            iln = ln
        cid = f'{cls}#{name}' + (f'#{k + 1}' if multi else '')
        if isinstance(it, str):
            notPorted.append({'id': cid, 'file': srcfile, 'line': iln, 'reason': it[len('not ported: '):]})
            continue
        d = {'id': cid, 'file': srcfile, 'line': iln, 'sparql12': bool(it.pop('sparql12', False))}
        if sub: d['subclass'] = sub
        d.update(it)
        if d['expr'] is None: del d['expr']
        cases.append(d)
        any_case = True
    c[1 if any_case else 2] += 1

for path, tab in TABLE.items():
    cls = os.path.basename(path)[:-5]
    ms = methods(path)
    names = [m for m, _ in ms]
    extra = set(tab) - set(names)
    assert not extra, (path, extra)
    for name, ln in ms:
        if name in tab:
            items = tab[name]
        elif path.endswith('QueryEvaluationUtilTest.java'):
            items = qeu_method(name)
            assert items, name
        else:
            raise SystemExit(f'unported, unlisted method {cls}#{name}')
        emit(cls, path, ln, name, items, path)

for sub, (base, tab) in INHERITED.items():
    assert not methods(sub), sub
    cls = os.path.basename(sub)[:-5]
    bm = dict(methods(base))
    assert set(bm) == set(tab), (sub, set(bm) ^ set(tab))
    for name, ln in methods(base):
        emit(cls, base, ln, name, tab[name], base, sub)

# every ported directory's files are covered
for d in ('string', 'hash', 'numeric', 'datetime', 'xsd', 'triple', 'misc'):
    for fn in sorted(os.listdir(os.path.join(ROOT, F + d))):
        p = F + d + '/' + fn
        if not fn.endswith('.java'): continue
        if p in TABLE or p in INHERITED or p in (F + 'hash/HashFunctionTest.java', F + 'xsd/TestIntegerDatatypeCast.java'): continue
        if p in (F + 'datetime/NowTest.java',): continue
        raise SystemExit('file not covered: ' + p)

# extension families (not ported): test methods per family
ext = {}
for fam in ('json', 'array', 'bitwise', 'text', 'math', 'encoding', 'support', 'datetime/ext', 'string/ext', 'aggregate/ext'):
    n = 0
    for dp, dn, fns in os.walk(os.path.join(ROOT, F + fam)):
        for fn in fns:
            if fn.endswith('.java'):
                n += sum(1 for l in open(os.path.join(dp, fn), encoding='utf-8') if ANN.match(l))
    ext[fam] = n

commit = subprocess.run(['git', '-C', ROOT, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
doc = {
    '_notice': 'Derived from Eclipse RDF4J (https://github.com/eclipse-rdf4j/rdf4j), Eclipse Distribution License 1.0 (BSD-3-Clause). '
               'Copyright (c) Eclipse RDF4J contributors, Aduna, and others. Changed: each Java assertion on a function object '
               '(e.g. substrFunc.evaluate(vf, ...)), on QueryEvaluationUtil.compareLiterals/compatibleArguments, or on '
               'ValueComparator is rewritten as a SPARQL expression (or a two-row ORDER BY), an expected term and a check kind; '
               'Java values are written as SPARQL terms with the datatypes SimpleValueFactory gives them (createLiteral(int) is xsd:int); '
               'list sorts are reduced to the compared pair; generated by tools/moonforge-study/extract-expr.py.',
    'source': {'repository': 'https://github.com/eclipse-rdf4j/rdf4j', 'commit': commit,
               'paths': sorted({c['file'] for c in cases} | {n['file'] for n in notPorted} | set(INHERITED))},
    'cases': cases,
    'notPorted': notPorted,
}
with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('{\n' + ',\n'.join(
        f' {json.dumps(k)}: ' + (('[\n' + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in v) + '\n ]')
                                if isinstance(v, list) else json.dumps(v, ensure_ascii=False))
        for k, v in doc.items()) + '\n}\n')

print(f'{"family":12} {"methods":>7} {"ported":>7} {"notPorted":>9}')
for fam, (m, p, n) in counts.items():
    print(f'{fam:12} {m:7d} {p:7d} {n:9d}')
print(f'{"TOTAL":12} {sum(v[0] for v in counts.values()):7d} {sum(v[1] for v in counts.values()):7d} {sum(v[2] for v in counts.values()):9d}')
print(f'cases {len(cases)}, notPorted entries {len(notPorted)}')
print('extension families, test methods (not ported):', json.dumps(ext), 'total', sum(ext.values()))
print('also not ported: datetime/NowTest', len(methods(F + 'datetime/NowTest.java')), 'method(s) (NOW() is not deterministic)')
