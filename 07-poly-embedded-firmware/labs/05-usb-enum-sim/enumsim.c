/* USB enumeration state machine (USB 2.0 ch.9) simulated host<->device.
 * Analogy: a new hire's first day: arrive (attach), get a desk number (SET_ADDRESS),
 * hand over résumé (GET_DESCRIPTOR), get assigned a job (SET_CONFIGURATION).
 * Inject a fault with: ./enumsim fail-address  -> shows the host's retry/reset path. */
#include <stdio.h>
#include <string.h>
typedef enum {ATTACHED,POWERED,DEFAULT,ADDRESS,CONFIGURED} st_t;
static const char*N[]={"ATTACHED","POWERED","DEFAULT","ADDRESS","CONFIGURED"};
static st_t s=ATTACHED; static int addr=0, fail_addr=0, tries=0;
static void go(st_t n,const char*why){printf("  device: %-10s -> %-10s (%s)\n",N[s],N[n],why);s=n;}
static int dev_setup(const char*req,int val){
  printf("host -> SETUP %-26s addr=%d\n",req,addr);
  if(!strcmp(req,"SET_ADDRESS")){ if(fail_addr&&tries++<1){printf("  device: (no ACK — STALL/timeout)\n");return -1;} addr=val; go(ADDRESS,"status stage done, now answers at new address"); }
  else if(!strcmp(req,"SET_CONFIGURATION")){ if(s!=ADDRESS)return -1; go(CONFIGURED,"endpoints enabled; class drivers may bind"); }
  else printf("  device -> DATA IN (%s)\n", req);
  return 0;
}
int main(int c,char**v){
  fail_addr = c>1 && !strcmp(v[1],"fail-address");
  puts("== cable plugged: VBUS 5V detected");      go(POWERED,"VBUS present");
  puts("== device pulls D+ high (full/high-speed signal)");
  for(int attempt=0;attempt<3;attempt++){
    puts("host: USB bus reset (SE0 >=10ms), high-speed chirp K/J"); addr=0; go(DEFAULT,"reset, address 0");
    dev_setup("GET_DESCRIPTOR(DEVICE,64)",0);
    puts("  host learns bMaxPacketSize0=64");
    if(dev_setup("SET_ADDRESS",7)==0) goto addressed;
    puts("host: SET_ADDRESS failed -> port reset and retry");
  }
  puts("host: giving up: 'device not accepting address' (see dmesg)"); return 1;
addressed:
  dev_setup("GET_DESCRIPTOR(DEVICE,18)",0);
  dev_setup("GET_DESCRIPTOR(CONFIG,9)",0);
  puts("  host reads wTotalLength, then asks for all of it");
  dev_setup("GET_DESCRIPTOR(CONFIG,total)",0);
  dev_setup("GET_DESCRIPTOR(STRING)",0);
  dev_setup("SET_CONFIGURATION",1);
  puts("== uvcvideo + snd-usb-audio + usbhid bind; /dev/video0 appears");
  return s==CONFIGURED?0:1;
}
