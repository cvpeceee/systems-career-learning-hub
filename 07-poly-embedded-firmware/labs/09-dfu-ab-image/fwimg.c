/* Firmware-update image check + A/B slot selection (what DFU/OTA does before switching).
 * Analogy: two bridges across a river; you rebuild one while traffic uses the other,
 * inspect it (CRC + version), then switch traffic. If it collapses (boot fails 3x), switch back. */
#include <stdio.h>
#include <stdint.h>
#include <string.h>
typedef struct { uint32_t magic, version, size, crc; } hdr_t;
#define MAGIC 0x504F4C59u /* 'POLY' */
static uint32_t crc32(const uint8_t*p,size_t n){uint32_t c=~0u;while(n--){c^=*p++;for(int k=0;k<8;k++)c=(c>>1)^(0xEDB88320u&-(c&1));}return ~c;}
typedef struct { hdr_t h; uint8_t body[64]; int boot_tries; int good; } slot_t;
static int verify(const slot_t*s,uint32_t min_ver){
  if(s->h.magic!=MAGIC) return printf("  reject: bad magic\n"),0;
  if(s->h.size>sizeof s->body) return printf("  reject: size\n"),0;
  if(crc32(s->body,s->h.size)!=s->h.crc) return printf("  reject: CRC mismatch (corrupt download)\n"),0;
  if(s->h.version<min_ver) return printf("  reject: rollback v%u < v%u (anti-rollback)\n",s->h.version,min_ver),0;
  return 1; }
static void make(slot_t*s,uint32_t ver,const char*txt){memset(s,0,sizeof*s);s->h.magic=MAGIC;s->h.version=ver;s->h.size=strlen(txt);memcpy(s->body,txt,s->h.size);s->h.crc=crc32(s->body,s->h.size);}
int main(void){
  printf("crc32(\"123456789\")=0x%08X (expect 0xCBF43926)\n",crc32((const uint8_t*)"123456789",9));
  slot_t A,B; make(&A,5,"fw v5 running"); A.good=1; int active=0; uint32_t minv=5;
  puts("1) download v6 to B, flip one bit in transit"); make(&B,6,"fw v6 new"); B.body[2]^=1;
  if(!verify(&B,minv)) puts("  stay on A");
  puts("2) download v6 cleanly"); make(&B,6,"fw v6 new");
  if(verify(&B,minv)){active=1;B.boot_tries=0;puts("  B marked pending; reboot into B");}
  puts("3) B fails to boot 3 times (watchdog)"); for(B.boot_tries=1;B.boot_tries<=3;B.boot_tries++)printf("  boot try %d: fail\n",B.boot_tries);
  active=0; puts("  bootloader falls back to A");
  puts("4) attacker offers signed-but-old v4"); slot_t O; make(&O,4,"fw v4 vulnerable"); verify(&O,minv);
  printf("RESULT active=%c (expect A)\n", active?'B':'A'); return active!=0; }
