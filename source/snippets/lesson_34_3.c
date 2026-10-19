#include <openssl/sha.h>
#include <stdbool.h>
#include <string.h>

#define BLK 4096
#define H SHA256_DIGEST_LENGTH       /* 32 bytes */

static void hash_pair(const unsigned char *a, const unsigned char *b, unsigned char *out) {
  unsigned char buf[2 * H];
  memcpy(buf, a, H); memcpy(buf + H, b, H);
  SHA256(buf, sizeof buf, out);
}

/* Build a binary Merkle tree. n must be a power of two. tree has 2n-1 entries:
   leaves at [n-1 .. 2n-2], root at [0]. */
void build(const unsigned char *data, int n, unsigned char (*tree)[H]) {
  for (int i = 0; i < n; i++) SHA256(data + (size_t)i * BLK, BLK, tree[n - 1 + i]);
  for (int i = n - 2; i >= 0; i--) hash_pair(tree[2 * i + 1], tree[2 * i + 2], tree[i]);
}

/* Verify block i using only the sibling hashes on its path, against a trusted root. */
bool verify(const unsigned char *block, int i, int n, unsigned char (*tree)[H], const unsigned char *root) {
  unsigned char cur[H];
  SHA256(block, BLK, cur);
  for (int node = n - 1 + i; node > 0; node = (node - 1) / 2) {
    bool left = (node % 2) == 1;
    int sib = left ? node + 1 : node - 1;
    unsigned char up[H];
    if (left) hash_pair(cur, tree[sib], up); else hash_pair(tree[sib], cur, up);
    memcpy(cur, up, H);
  }
  return memcmp(cur, root, H) == 0;
}
