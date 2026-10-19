#include "../lesson_34_3.c"
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
int main(void) {
  enum { N = 8 };
  unsigned char *d = malloc((size_t)N * BLK);
  for (int i = 0; i < N * BLK; i++) d[i] = (unsigned char)(i * 31 + 7);
  unsigned char (*tree)[H] = malloc(sizeof(unsigned char[H]) * (2 * N - 1));
  build(d, N, tree);
  unsigned char root[H]; memcpy(root, tree[0], H);
  for (int i = 0; i < N; i++) assert(verify(d + (size_t)i * BLK, i, N, tree, root));
  d[5 * BLK + 100] ^= 1;
  assert(!verify(d + 5 * BLK, 5, N, tree, root));
  d[5 * BLK + 100] ^= 1;
  tree[N - 1 + 4][0] ^= 1;   /* tamper with sibling hash of block 5 */
  assert(!verify(d + 5 * BLK, 5, N, tree, root));
  free(d); free(tree);
  printf("34.3 ok\n");
  return 0;
}
