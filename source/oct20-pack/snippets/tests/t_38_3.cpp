#include "../lesson_38_3.cpp"
#include <cassert>
#include <cstdio>
int main() {
  Tree t;
  ProcKey ex{100, 1}, ww{200, 2}, ps{300, 3};
  t.exec(ex, "explorer", {}, false); t.exec(ww, "winword", ex, true); t.exec(ps, "powershell", ww, true);
  auto chain = t.ancestry(ps);
  assert(chain.size() == 3 && chain[0] == "powershell");
  assert(matches(chain, {"powershell", "winword"}));
  assert(!matches(chain, {"winword", "powershell"}));
  ProcKey reused{300, 99}; t.exec(reused, "notepad", ex, true);
  assert(t.ancestry(reused)[0] == "notepad" && t.ancestry(ps)[0] == "powershell");
  Tree loop; ProcKey a{1, 1}, b{2, 1}; loop.exec(a, "a", b, true); loop.exec(b, "b", a, true);
  assert(loop.ancestry(a, 16).size() == 16);
  Ring r(4); for (int i = 0; i < 6; i++) r.push(i);
  assert(r.dropped == 2); int v; assert(r.pop(v) && v == 0);
  assert(validate({{"r1", {0, 19}}}, 20).ok);
  Validation bad = validate({{"r2", {20}}}, 20); assert(!bad.ok);
  printf("38.3 ok\n");
}
