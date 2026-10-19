#include "../lesson_34_2.c"
#include <assert.h>
#include <stdio.h>
#include <string.h>
int main(void) {
  struct nand f; memset(&f, 0, sizeof f);
  f.bad[1] = true; f.bad[2] = true;
  assert(map_block(&f, 0, 0) == 0 && map_block(&f, 0, 1) == 3);
  assert(map_block(&f, 60, 10) == -1);
  int copies[] = { 0, 20, 40 }, scrub = -1;
  assert(boot_image(&f, copies, 3, 4, &scrub) == 0 && scrub == 0);
  f.flips[3] = 9;                       /* copy 0 uncorrectable */
  f.flips[21] = 7;                      /* copy 1 needs scrub */
  assert(boot_image(&f, copies, 3, 4, &scrub) == 1 && scrub == 1);
  f.flips[22] = 12;
  assert(boot_image(&f, copies, 3, 4, &scrub) == 2);
  f.flips[41] = 9;
  assert(boot_image(&f, copies, 3, 4, &scrub) == -1 && scrub == 0);
  printf("34.2 ok\n");
  return 0;
}
