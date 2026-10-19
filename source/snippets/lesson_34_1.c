#include <stdint.h>

struct slot { uint8_t prio; uint8_t tries; uint8_t good; uint32_t sec_ver; };
struct bootctl { struct slot s[2]; uint32_t min_ver; };

/* Pick the slot to boot, or -1 to enter recovery. Decrements tries first. */
int pick_slot(struct bootctl *c) {
  int best = -1;
  for (int i = 0; i < 2; i++) {
    const struct slot *s = &c->s[i];
    if (s->prio == 0 || (!s->good && s->tries == 0)) continue;
    if (s->sec_ver < c->min_ver) continue;
    if (best < 0 || s->prio > c->s[best].prio) best = i;
  }
  if (best >= 0 && !c->s[best].good) c->s[best].tries--;
  return best;
}

/* Called by a user-space health check after a good boot. */
void mark_good(struct bootctl *c, int i) {
  c->s[i].good = 1;
  if (c->s[i].sec_ver > c->min_ver) c->min_ver = c->s[i].sec_ver;
}

/* OTA finished writing slot i: make it the preferred, untested slot. */
void ota_installed(struct bootctl *c, int i, uint32_t ver) {
  int other = 1 - i;
  c->s[i] = (struct slot){ .prio = 15, .tries = 3, .good = 0, .sec_ver = ver };
  if (c->s[other].prio >= 15) c->s[other].prio = 14;
}

/* Boot-time budget check: sum stage times, report the stage that broke it. */
int over_budget(const uint32_t *stage_ms, int n, uint32_t budget_ms) {
  uint32_t t = 0;
  for (int i = 0; i < n; i++) {
    t += stage_ms[i];
    if (t > budget_ms) return i;
  }
  return -1;
}
