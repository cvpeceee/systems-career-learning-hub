#include <stdint.h>
#include <string.h>

enum { ETH_HDR = 14, IPV4_HDR = 20, UDP_HDR = 8, VXLAN_HDR = 8, VXLAN_PORT = 4789 };
enum { VXLAN_OVERHEAD = ETH_HDR + IPV4_HDR + UDP_HDR + VXLAN_HDR };

/* Largest inner frame payload that fits the underlay MTU. Underlay MTU counts IP + UDP + VXLAN + inner Ethernet. */
int inner_mtu(int underlay_mtu) { return underlay_mtu - (IPV4_HDR + UDP_HDR + VXLAN_HDR + ETH_HDR); }

/* VXLAN header: flags(8) reserved(24) VNI(24) reserved(8), network byte order. */
void vxlan_build(uint8_t h[VXLAN_HDR], uint32_t vni) {
  memset(h, 0, VXLAN_HDR);
  h[0] = 0x08;
  h[4] = (uint8_t)(vni >> 16); h[5] = (uint8_t)(vni >> 8); h[6] = (uint8_t)vni;
}

/* Returns the VNI, or -1 if the header is not a valid VXLAN header. */
long vxlan_parse(const uint8_t *h, size_t len) {
  if (len < VXLAN_HDR || (h[0] & 0x08) == 0) return -1;
  return ((long)h[4] << 16) | ((long)h[5] << 8) | (long)h[6];
}

/* Forwarding database: (MAC, VNI) -> remote VTEP IPv4, with aging. */
typedef struct { uint8_t mac[6]; uint32_t vni; uint32_t vtep; uint64_t seen; int used; } FdbEntry;
typedef struct { FdbEntry e[256]; uint64_t max_age; } Fdb;

static int fdb_find(const Fdb *f, const uint8_t mac[6], uint32_t vni) {
  for (int i = 0; i < 256; i++)
    if (f->e[i].used && f->e[i].vni == vni && memcmp(f->e[i].mac, mac, 6) == 0) return i;
  return -1;
}

/* Learn from a received packet: inner source MAC lives behind the outer source IP. Returns 0, or -1 if full. */
int fdb_learn(Fdb *f, const uint8_t mac[6], uint32_t vni, uint32_t vtep, uint64_t now) {
  int i = fdb_find(f, mac, vni);
  if (i < 0) for (i = 0; i < 256 && f->e[i].used; i++) {}
  if (i == 256) return -1;
  memcpy(f->e[i].mac, mac, 6); f->e[i].vni = vni; f->e[i].vtep = vtep; f->e[i].seen = now; f->e[i].used = 1;
  return 0;
}

/* Look up where to send. Returns the VTEP IP, or 0 meaning "unknown: flood or ask the controller". */
uint32_t fdb_lookup(Fdb *f, const uint8_t mac[6], uint32_t vni, uint64_t now) {
  int i = fdb_find(f, mac, vni);
  if (i < 0) return 0;
  if (now - f->e[i].seen > f->max_age) { f->e[i].used = 0; return 0; }
  return f->e[i].vtep;
}
