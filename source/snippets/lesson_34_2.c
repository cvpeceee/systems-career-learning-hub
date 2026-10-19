#include <stdbool.h>
#include <stdint.h>

#define NBLK 64
#define ECC_MAX 8          /* bits the ECC can correct per chunk */
#define SCRUB_AT 6         /* rewrite when this many bits needed fixing */

struct nand {
  bool bad[NBLK];          /* factory or grown bad blocks */
  int flips[NBLK];         /* simulated bit errors seen on the next read */
};

/* Physical block for the n-th good block at or after start, or -1. */
int map_block(const struct nand *f, int start, int n) {
  for (int b = start; b < NBLK; b++) {
    if (f->bad[b]) continue;
    if (n-- == 0) return b;
  }
  return -1;
}

enum rd { RD_OK, RD_SCRUB, RD_FAIL };

enum rd read_block(const struct nand *f, int b) {
  if (f->flips[b] > ECC_MAX) return RD_FAIL;
  if (f->flips[b] >= SCRUB_AT) return RD_SCRUB;
  return RD_OK;
}

/* Boot an image of len blocks from the first copy that reads cleanly.
   copies[] holds each copy's start block. Returns copy index or -1;
   *scrub counts blocks that need rewriting. */
int boot_image(const struct nand *f, const int *copies, int ncopies, int len, int *scrub) {
  for (int c = 0; c < ncopies; c++) {
    int need = 0; bool ok = true;
    for (int i = 0; i < len && ok; i++) {
      int b = map_block(f, copies[c], i);
      if (b < 0) { ok = false; break; }
      enum rd r = read_block(f, b);
      if (r == RD_FAIL) ok = false;
      else if (r == RD_SCRUB) need++;
    }
    if (ok) { *scrub = need; return c; }
  }
  *scrub = 0;
  return -1;
}
