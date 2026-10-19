#include "../lesson_34_4.c"
#include <assert.h>
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#define COUNT 200000
static struct ring R;
static void *prod(void *a) {
  (void)a;
  for (uint32_t i = 0; i < COUNT; i++) {
    struct msg m = { .seq = i, .len = 4 };
    memcpy(m.data, &i, 4);
    while (!ring_put(&R, &m)) { }
  }
  return NULL;
}
int main(void) {
  pthread_t t; pthread_create(&t, NULL, prod, NULL);
  uint32_t expect = 0, got = 0; struct msg m;
  while (got < COUNT) {
    if (!ring_get(&R, &m)) continue;
    uint32_t v; memcpy(&v, m.data, 4);
    assert(v == m.seq && m.len == 4);
    assert(seq_ok(&expect, &m));
    got++;
  }
  pthread_join(t, NULL);
  struct msg gap = { .seq = expect + 5 };
  assert(!seq_ok(&expect, &gap) && expect == gap.seq + 1);
  printf("34.4 ok %u msgs\n", got);
  return 0;
}
