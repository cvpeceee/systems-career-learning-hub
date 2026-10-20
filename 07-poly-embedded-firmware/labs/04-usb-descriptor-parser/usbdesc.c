/* Parse a USB configuration descriptor blob like `lsusb -v` does.
 * Analogy: the descriptor set is a device's résumé; the host reads it top-down
 * (config -> IADs -> interfaces -> endpoints) to decide which drivers to bind.
 * Built-in sample: a simplified conference-camera composite: UVC (video) + UAC (audio) + HID.
 * Usage: ./usbdesc            (sample)   or   ./usbdesc file.bin  (raw bytes, e.g. from usbmon) */
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
static const char *cls(uint8_t c){switch(c){case 1:return "Audio(UAC)";case 3:return "HID";case 2:return "CDC";case 0x0e:return "Video(UVC)";case 0x0a:return "CDC-Data";case 0xef:return "Misc(IAD composite)";case 0xff:return "Vendor";case 0:return "per-interface";default:return "?";}}
static const char *xfer(uint8_t a){static const char*t[]={"Control","Isochronous","Bulk","Interrupt"};return t[a&3];}
static const uint8_t sample[] = {
 9,2, 0,0, 4,1,0,0x80,250,            /* CONFIG: wTotalLength patched below, 4 interfaces, 500mA */
 8,0x0b, 0,2, 0x0e,3,0,0,             /* IAD: ifaces 0-1 = video function */
 9,4, 0,0,1, 0x0e,1,0,0,              /* IF0 VideoControl, 1 ep */
 7,5, 0x83,3, 16,0, 8,                /* EP3 IN interrupt (status) */
 9,4, 1,0,0, 0x0e,2,0,0,              /* IF1 VideoStreaming alt0: zero bandwidth */
 9,4, 1,1,1, 0x0e,2,0,0,              /* IF1 alt1: streaming */
 7,5, 0x81,5, 0x00,0x14, 1,           /* EP1 IN isoc, 1024 x (2+1) mult = high-bandwidth */
 9,4, 2,0,0, 0x01,1,0,0,              /* IF2 AudioControl */
 9,4, 2,1,1, 0x01,2,0,0,              /* (demo) AudioStreaming alt1 */
 7,5, 0x82,5, 0xC0,0x00, 4,           /* EP2 IN isoc 192 bytes (48kHz*2ch*16bit /1000) */
 9,4, 3,0,1, 0x03,0,0,0,              /* IF3 HID (mute/volume buttons) */
 7,5, 0x84,3, 8,0, 10,                /* EP4 IN interrupt */
};
int main(int argc,char**argv){
  uint8_t b[4096]; size_t n=0;
  if(argc>1){FILE*f=fopen(argv[1],"rb");if(!f){perror("open");return 1;}n=fread(b,1,sizeof b,f);fclose(f);}
  else{for(n=0;n<sizeof sample;n++)b[n]=sample[n]; b[2]=n&0xff; b[3]=n>>8;}
  size_t i=0; int bad=0;
  while(i+2<=n){
    uint8_t L=b[i],T=b[i+1];
    if(L<2||i+L>n){printf("!! malformed descriptor at offset %zu (bLength=%u)\n",i,L);bad=1;break;}
    switch(T){
     case 1: printf("DEVICE  bcdUSB=%x.%02x class=%s VID:PID=%04x:%04x bMaxPacketSize0=%u configs=%u\n",b[i+3],b[i+2],cls(b[i+4]),b[i+8]|b[i+9]<<8,b[i+10]|b[i+11]<<8,b[i+7],b[i+17]);break;
     case 2: printf("CONFIG  wTotalLength=%u bNumInterfaces=%u bmAttributes=0x%02x MaxPower=%umA\n",b[i+2]|b[i+3]<<8,b[i+4],b[i+7],b[i+8]*2);
             if(i+(size_t)(b[i+2]|b[i+3]<<8)>n){printf("!! wTotalLength runs past end of data (%zu bytes present)\n",n-i);bad=1;} break;
     case 0x0b: printf("  IAD   first=%u count=%u class=%s\n",b[i+2],b[i+3],cls(b[i+4]));break;
     case 4: printf("  IF%u alt%u  class=%s subclass=%u endpoints=%u\n",b[i+2],b[i+3],cls(b[i+5]),b[i+6],b[i+4]);break;
     case 5:{unsigned mps=b[i+4]|b[i+5]<<8; printf("    EP 0x%02x %s %-11s maxpkt=%u mult=%u interval=%u\n",b[i+2],(b[i+2]&0x80)?"IN ":"OUT",xfer(b[i+3]),mps&0x7ff,((mps>>11)&3)+1,b[i+6]);break;}
     default: printf("  (type 0x%02x len %u — class-specific, skipped)\n",T,L);
    }
    i+=L;
  }
  printf("%s: parsed %zu bytes\n", bad?"FAIL":"OK", i);
  return bad;
}
