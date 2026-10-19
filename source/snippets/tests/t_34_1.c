#include "../lesson_34_1.c"
#include <assert.h>
#include <stdio.h>
int main(void) {
  struct bootctl c = { .s = { { 15, 0, 1, 5 }, { 0, 0, 0, 0 } }, .min_ver = 5 };
  assert(pick_slot(&c) == 0);
  ota_installed(&c, 1, 6);
  assert(c.s[0].prio == 14);
  for (int i = 0; i < 3; i++) assert(pick_slot(&c) == 1);   /* three tries */
  assert(pick_slot(&c) == 0);                                /* rolled back */
  ota_installed(&c, 1, 7);
  assert(pick_slot(&c) == 1);
  mark_good(&c, 1);
  assert(c.min_ver == 7 && pick_slot(&c) == 1 && c.s[1].tries == 2);
  /* anti-rollback: old slot A (v5) now refused even if preferred */
  c.s[1].prio = 0; assert(pick_slot(&c) == -1);
  uint32_t st[] = { 250, 400, 700, 500 };
  assert(over_budget(st, 4, 1800) == 3 && over_budget(st, 4, 2500) == -1);
  printf("34.1 ok\n");
  return 0;
}
