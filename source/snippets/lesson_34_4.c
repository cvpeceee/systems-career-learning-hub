#include <stdatomic.h>
#include <stdbool.h>
#include <stdint.h>
#include <string.h>

#define SLOTS 256                    /* power of two */
#define MSG 64

struct msg { uint32_t seq; uint16_t len; uint8_t data[MSG]; };

struct ring {
  _Atomic uint32_t head;             /* written only by producer */
  _Atomic uint32_t tail;             /* written only by consumer */
  struct msg slot[SLOTS];
};

bool ring_put(struct ring *r, const struct msg *m) {
  uint32_t h = atomic_load_explicit(&r->head, memory_order_relaxed);
  uint32_t t = atomic_load_explicit(&r->tail, memory_order_acquire);
  if (h - t == SLOTS) return false;
  r->slot[h & (SLOTS - 1)] = *m;
  atomic_store_explicit(&r->head, h + 1, memory_order_release);
  return true;
}

bool ring_get(struct ring *r, struct msg *out) {
  uint32_t t = atomic_load_explicit(&r->tail, memory_order_relaxed);
  uint32_t h = atomic_load_explicit(&r->head, memory_order_acquire);
  if (t == h) return false;
  *out = r->slot[t & (SLOTS - 1)];
  atomic_store_explicit(&r->tail, t + 1, memory_order_release);
  return true;
}

/* Consumer-side check: a gap in sequence numbers means lost or reset state. */
bool seq_ok(uint32_t *expect, const struct msg *m) {
  bool ok = m->seq == *expect;
  *expect = m->seq + 1;
  return ok;
}
