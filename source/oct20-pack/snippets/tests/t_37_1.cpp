#include "../lesson_37_1.cpp"
#include <cassert>
#include <cstdio>
int main() {
  { Mem m(64); assert(!march(m, MARCH_C_MINUS).failed); }
  { Mem m(64); m.stuck_addr = 10; m.stuck_val = 1; Failure f = march(m, MARCH_C_MINUS); assert(f.failed && f.addr == 10 && f.element == 1); }
  { Mem m(64); m.trans_addr = 5; Failure f = march(m, MARCH_C_MINUS); assert(f.failed && f.addr == 5 && f.element == 3); }
  { Mem m(64); m.aggr = 3; m.victim = 20; Failure f = march(m, MARCH_C_MINUS); assert(f.failed && f.addr == 20); }  // aggressor below
  { Mem m(64); m.aggr = 40; m.victim = 7; Failure f = march(m, MARCH_C_MINUS); assert(f.failed && f.addr == 7); }   // aggressor above
  // write-all-then-read-all misses the aggressor-below coupling fault
  std::vector<Element> simple = {{true, "w0"}, {true, "r0"}, {true, "w1"}, {true, "r1"}};
  { Mem m(64); m.aggr = 3; m.victim = 20; assert(!march(m, simple).failed); }
  { Mem m(64); m.aggr = 40; m.victim = 7; assert(march(m, simple).failed); }
  printf("37.1 ok\n");
}
