#!/usr/bin/env bash
# Oct 20 pack: compile + test every lesson snippet. C/C++ strict warnings + ASan/UBSan; Go gofmt, vet, test -race.
set -euo pipefail
cd "$(dirname "$0")"
W="-Wall -Wextra -Wpedantic -Werror -g -O1"; SAN="-fsanitize=address,undefined -fno-sanitize-recover=all"
mkdir -p bin
for t in tests/t_*; do
  b=bin/$(basename "${t%.*}")
  case $t in *.c) gcc -std=c11 $W $SAN "$t" -o "$b";; *) g++ -std=c++17 $W $SAN "$t" -o "$b";; esac
  setarch -R "$b"
done
for p in 39_1:autoscale 39_2:k8supgrade 39_3:otel 40_1:orders 40_2:privacy 40_3:agent; do cmp -s "lesson_${p%:*}.go" "go/${p#*:}/${p#*:}.go" || { echo "go copy stale: ${p#*:}"; exit 1; }; done
cd go && test -z "$(gofmt -l .)" && go vet ./... && go test -race -count=1 ./...
echo "ALL CHECKS PASSED"
