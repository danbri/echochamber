#!/bin/bash
# usage: count.sh <rdf4j root> <module> [...]
# main files, public top-level types, public methods (regex count: a line
# starting with whitespace then `public ... (`; misses interface methods
# without `public`; an order of magnitude only).
R=$1; shift
for m in "$@"; do
  main=$(find "$R/$m" -path '*/src/main/java/*' -name '*.java' 2>/dev/null)
  nf=$(echo "$main" | grep -c .)
  pubtypes=$(echo "$main" | xargs grep -hE '^public (final |abstract |sealed )*(class|interface|enum|record|@interface) ' 2>/dev/null | wc -l | tr -d ' ')
  pubmeth=$(echo "$main" | xargs grep -hE '^\s+public [^=(]*\(' 2>/dev/null | grep -vE '\b(class|interface|enum|record)\b' | wc -l | tr -d ' ')
  echo "$m mainfiles=$nf pubtypes=$pubtypes pubmethods=$pubmeth"
done
