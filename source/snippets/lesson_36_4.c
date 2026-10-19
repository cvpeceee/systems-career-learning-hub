#include <stddef.h>
#include <stdint.h>

/* Register field helpers: mask = width bits starting at shift. */
static inline uint32_t field_mask(unsigned shift, unsigned width) {
  return (width >= 32 ? 0xFFFFFFFFu : ((1u << width) - 1u)) << shift;
}
static inline uint32_t field_get(uint32_t reg, unsigned shift, unsigned width) {
  return (reg & field_mask(shift, width)) >> shift;
}
static inline uint32_t field_set(uint32_t reg, unsigned shift, unsigned width, uint32_t v) {
  uint32_t m = field_mask(shift, width);
  return (reg & ~m) | ((v << shift) & m);
}

/* CRC-32 (IEEE, reflected polynomial 0xEDB88320). */
uint32_t crc32(const uint8_t *p, size_t n) {
  uint32_t c = 0xFFFFFFFFu;
  while (n--) {
    c ^= *p++;
    for (int k = 0; k < 8; k++) c = (c >> 1) ^ (0xEDB88320u & (0u - (c & 1u)));
  }
  return ~c;
}

struct hdr { uint8_t version; uint8_t type; uint16_t len; uint32_t seq; };

static void put16(uint8_t *b, uint16_t v) { b[0] = (uint8_t)(v >> 8); b[1] = (uint8_t)v; }
static void put32(uint8_t *b, uint32_t v) { for (int i = 0; i < 4; i++) b[i] = (uint8_t)(v >> (24 - 8 * i)); }
static uint32_t get32(const uint8_t *b) { return ((uint32_t)b[0] << 24) | ((uint32_t)b[1] << 16) | ((uint32_t)b[2] << 8) | b[3]; }

/* Wire format: version, type, len (BE16), seq (BE32), crc (BE32 over first 8 bytes). 12 bytes total. */
void hdr_pack(const struct hdr *h, uint8_t out[12]) {
  out[0] = h->version; out[1] = h->type;
  put16(out + 2, h->len); put32(out + 4, h->seq);
  put32(out + 8, crc32(out, 8));
}

int hdr_unpack(const uint8_t in[12], struct hdr *h) {
  if (get32(in + 8) != crc32(in, 8)) return -1;
  h->version = in[0]; h->type = in[1];
  h->len = (uint16_t)((in[2] << 8) | in[3]);
  h->seq = get32(in + 4);
  return 0;
}
