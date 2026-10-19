#!/usr/bin/env bash
# Oct 12 snippets: C/C++ with -Wall -Wextra -Wpedantic -Werror + ASan/UBSan (TSan for threaded ones),
# Go with gofmt + go vet + go test -race.
set -u
cd "$(dirname "$0")"; S=$PWD; mkdir -p bin; pass=0; fail=0
ok() { echo "PASS $1 :: $2"; pass=$((pass+1)); }
bad() { echo "FAIL $1"; echo "$2"; fail=$((fail+1)); }
W="-Wall -Wextra -Wpedantic -Werror -g -O1"
cd tests
for t in t_*.c t_*.cpp; do
  b=../bin/${t%.*}; san="-fsanitize=address,undefined -fno-sanitize-recover=all"; extra=""
  case $t in t_34_4.c|t_36_5.cpp) san="-fsanitize=thread";; esac
  case $t in t_34_3.c) extra="-lcrypto";; esac
  case $t in *.c) cmd="gcc -std=c11 $W $san $t -o $b -pthread -lm $extra";; *) cmd="g++ -std=c++17 $W $san $t -o $b -pthread";; esac
  if out=$($cmd 2>&1) && [ -z "$out" ] && run=$(setarch -R $b 2>&1); then ok $t "$(echo "$run" | tail -1)"; else bad $t "$out ${run:-}"; fi
  run=""
done
# threaded snippets also under ASan/UBSan
for t in t_34_4.c t_36_5.cpp; do
  case $t in *.c) cmd="gcc -std=c11 $W -fsanitize=address,undefined -fno-sanitize-recover=all $t -o ../bin/${t%.*}_asan -pthread";; *) cmd="g++ -std=c++17 $W -fsanitize=address,undefined -fno-sanitize-recover=all $t -o ../bin/${t%.*}_asan -pthread";; esac
  if out=$($cmd 2>&1) && run=$(../bin/${t%.*}_asan 2>&1); then ok "$t(asan)" "$(echo "$run" | tail -1)"; else bad "$t(asan)" "$out ${run:-}"; fi
done
cd "$S/go"
cp ../lesson_31_2.go ckpt/ckpt.go; cp ../lesson_31_3.go gang/gang.go; cp ../lesson_31_4.go apf/apf.go
cp ../lesson_32_2.go rollout/rollout.go; cp ../lesson_33_1.go buildcache/buildcache.go; cp ../lesson_33_2.go mergeq/mergeq.go
cp ../lesson_33_3.go flaky/flaky.go; cp ../lesson_33_4.go trigram/trigram.go; cp ../lesson_36_1.go jobq/jobq.go
cp ../lesson_36_2.go triage/triage.go; cp ../lesson_36_3.go ttl/ttl.go
fmt=$(gofmt -l . 2>&1); [ -z "$fmt" ] && ok gofmt "all files formatted" || bad gofmt "$fmt"
if out=$(go vet ./... 2>&1); then ok "go vet" "clean"; else bad "go vet" "$out"; fi
for p in ckpt gang apf rollout buildcache mergeq flaky trigram jobq triage ttl; do
  if out=$(go test -race -count=1 ./$p 2>&1); then ok "go test -race $p" "$(echo "$out" | tail -1)"; else bad "go test -race $p" "$out"; fi
done
echo "total: $pass passed, $fail failed"
