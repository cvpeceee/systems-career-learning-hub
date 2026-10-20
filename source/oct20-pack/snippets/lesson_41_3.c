#include <stdint.h>

/* Command word, 16 data bits (MSB first on the wire): RT(5) T/R(1) SA(5) WC(5). WC 0 means 32 words. */
uint16_t cmd_encode(unsigned rt, int transmit, unsigned sa, unsigned wc) {
  return (uint16_t)(((rt & 31u) << 11) | ((transmit ? 1u : 0u) << 10) | ((sa & 31u) << 5) | (wc & 31u));
}
typedef struct { unsigned rt, transmit, sa, words, mode; } Cmd;
Cmd cmd_decode(uint16_t w) {
  Cmd c;
  c.rt = (w >> 11) & 31u; c.transmit = (w >> 10) & 1u; c.sa = (w >> 5) & 31u;
  c.mode = (c.sa == 0 || c.sa == 31);
  c.words = c.mode ? 0 : ((w & 31u) ? (w & 31u) : 32u);
  return c;
}

/* Status word flags (bit 1 = MSB in the standard's numbering). */
enum { ST_MSG_ERROR = 1 << 10, ST_SERVICE_REQ = 1 << 8, ST_BUSY = 1 << 3, ST_SUBSYS = 1 << 2, ST_TERMINAL = 1 << 0 };
int status_ok(uint16_t st, unsigned expect_rt) {
  if (((st >> 11) & 31u) != expect_rt) return 0;
  return (st & (ST_MSG_ERROR | ST_BUSY | ST_SUBSYS | ST_TERMINAL)) == 0;
}

/* Approximate BC->RT message time: command + n data + status, 20 us each, plus response time and gap. */
unsigned msg_time_us(unsigned n_words, unsigned response_us, unsigned gap_us) { return 20u * (n_words + 2u) + response_us + gap_us; }

typedef struct { unsigned rate_hz, words, offset; } Msg;

/* Fill per-minor-frame bus time. minor_hz is the minor frame rate; each rate must divide it.
   Returns 0 if any frame exceeds capacity_us, else 1. load[] has minor_hz entries (one major frame = 1 s). */
int build_schedule(const Msg *m, int n, unsigned minor_hz, unsigned capacity_us, unsigned *load) {
  for (unsigned f = 0; f < minor_hz; f++) load[f] = 0;
  for (int i = 0; i < n; i++) {
    if (m[i].rate_hz == 0 || minor_hz % m[i].rate_hz) return 0;
    unsigned every = minor_hz / m[i].rate_hz;
    for (unsigned f = m[i].offset % every; f < minor_hz; f += every) load[f] += msg_time_us(m[i].words, 12, 4);
  }
  for (unsigned f = 0; f < minor_hz; f++) if (load[f] > capacity_us) return 0;
  return 1;
}
