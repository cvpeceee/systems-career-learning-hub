#include "../lesson_38_2.c"
#include <assert.h>
#include <stdio.h>
int main(void) {
  assert(VXLAN_OVERHEAD == 50 && inner_mtu(1500) == 1450 && inner_mtu(9000) == 8950);
  uint8_t h[8]; vxlan_build(h, 0xABCDEF);
  assert(h[0] == 0x08 && vxlan_parse(h, 8) == 0xABCDEF);
  assert(vxlan_parse(h, 7) == -1);
  h[0] = 0; assert(vxlan_parse(h, 8) == -1);
  static Fdb f; f.max_age = 300;
  uint8_t mac[6] = {1, 2, 3, 4, 5, 6};
  assert(fdb_lookup(&f, mac, 42, 0) == 0);
  assert(fdb_learn(&f, mac, 42, 0x0A000001u, 10) == 0);
  assert(fdb_lookup(&f, mac, 42, 100) == 0x0A000001u);
  assert(fdb_lookup(&f, mac, 43, 100) == 0);
  assert(fdb_lookup(&f, mac, 42, 400) == 0);   /* aged out */
  for (int i = 0; i < 256; i++) { uint8_t m2[6] = {9, 9, 9, 9, (uint8_t)(i >> 8), (uint8_t)i}; assert(fdb_learn(&f, m2, 1, 1, 500) == 0); }
  uint8_t extra[6] = {7, 7, 7, 7, 7, 7}; assert(fdb_learn(&f, extra, 1, 1, 500) == -1);
  printf("38.2 ok\n");
  return 0;
}
