#include "../lesson_36_4.c"
#include <assert.h>
#include <stdio.h>
int main(void) {
  assert(crc32((const uint8_t *)"123456789", 9) == 0xCBF43926u);
  uint32_t r = 0;
  r = field_set(r, 4, 4, 0xA); assert(r == 0xA0 && field_get(r, 4, 4) == 0xA);
  r = field_set(r, 31, 1, 1); assert(field_get(r, 31, 1) == 1 && field_get(r, 4, 4) == 0xA);
  r = field_set(r, 0, 32, 0x12345678u); assert(r == 0x12345678u);
  for (unsigned w = 1; w <= 32; w++) for (unsigned s = 0; s + w <= 32; s++) {
    uint32_t v = w == 32 ? 0xDEADBEEFu : (0xDEADBEEFu & ((1u << w) - 1u));
    assert(field_get(field_set(0, s, w, v), s, w) == v);
  }
  struct hdr h = { 1, 7, 513, 0x01020304u }, o;
  uint8_t b[12]; hdr_pack(&h, b);
  assert(b[2] == 2 && b[3] == 1 && b[4] == 1 && b[7] == 4);
  assert(hdr_unpack(b, &o) == 0 && o.len == 513 && o.seq == h.seq && o.type == 7);
  for (int i = 0; i < 96; i++) { b[i / 8] ^= (uint8_t)(1u << (i % 8)); assert(hdr_unpack(b, &o) == -1); b[i / 8] ^= (uint8_t)(1u << (i % 8)); }
  printf("36.4 ok\n");
  return 0;
}
