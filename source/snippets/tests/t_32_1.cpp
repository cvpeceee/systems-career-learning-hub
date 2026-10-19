#include "../lesson_32_1.cpp"
#include <cassert>
#include <cstdio>
int main() {
  Counters c;
  assert(classify({}, c).act == Action::Keep);
  assert(classify({{31, "a"}}, c).act == Action::Watch);
  assert(classify({{31, "a"}, {31, "b"}, {31, "c"}}, c).act == Action::Drain);
  assert(classify({{31, "a"}, {31, "a"}, {31, "a"}}, c).act == Action::Watch);
  assert(classify({{79, "a"}, {48, "b"}}, c).act == Action::Repair);
  assert(classify({{63, "a"}}, c).act == Action::Drain);
  assert(classify({{999, "a"}}, c).act == Action::Watch);
  Counters d; d.nvlink_crc_per_min = 10; assert(classify({}, d).act == Action::Watch);
  d.nvlink_crc_per_min = 500; assert(classify({}, d).act == Action::Drain);
  Counters e; e.remap_failed = true; assert(classify({}, e).act == Action::Repair);
  Counters t; t.temp_c = 95; assert(classify({}, t).act == Action::Drain);
  Gate g; g.need = 3;
  assert(!g.ready(Action::Keep) && !g.ready(Action::Keep));
  assert(!g.ready(Action::Keep));  // 3 clean but no burn-in
  g.burned_in = true;
  assert(g.ready(Action::Keep));
  assert(!g.ready(Action::Watch));  // reset
  printf("32.1 ok\n");
}
