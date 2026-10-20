#include "../lesson_41_3.c"
#include <assert.h>
#include <stdio.h>
int main(void) {
  uint16_t w = cmd_encode(5, 0, 3, 32);
  Cmd c = cmd_decode(w);
  assert(c.rt == 5 && c.transmit == 0 && c.sa == 3 && c.words == 32 && !c.mode);
  Cmd m = cmd_decode(cmd_encode(7, 1, 31, 2)); assert(m.mode && m.words == 0 && m.transmit == 1);
  assert(status_ok((uint16_t)(5u << 11), 5) && !status_ok((uint16_t)(6u << 11), 5));
  assert(!status_ok((uint16_t)((5u << 11) | ST_BUSY), 5));
  assert(msg_time_us(16, 12, 4) == 376);
  Msg ms[3] = {{50, 16, 0}, {10, 32, 0}, {10, 32, 0}};
  unsigned load[50];
  assert(build_schedule(ms, 3, 50, 20000, load) && load[0] == 376 + 2 * 696 && load[1] == 376);
  ms[2].offset = 1; assert(build_schedule(ms, 3, 50, 20000, load) && load[0] == 376 + 696 && load[1] == 376 + 696);
  Msg bad[1] = {{7, 1, 0}}; assert(!build_schedule(bad, 1, 50, 20000, load));
  assert(!build_schedule(ms, 3, 50, 1000, load));
  printf("41.3 ok\n");
  return 0;
}
