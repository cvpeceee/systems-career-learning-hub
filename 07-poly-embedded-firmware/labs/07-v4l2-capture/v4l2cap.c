/* Minimal V4L2 mmap streaming capture: the same ioctl dance every camera app/HAL does.
 * Analogy: you lend the driver N empty trays (REQBUFS/QBUF); it hands back full ones (DQBUF);
 * you look, then hand them back. Test without a camera:  sudo modprobe vivid ; ./v4l2cap /dev/video0 30 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <sys/ioctl.h>
#include <sys/mman.h>
#include <linux/videodev2.h>
#define NB 4
static int xioctl(int fd, unsigned long r, void *a){int e;do e=ioctl(fd,r,a);while(e==-1&&errno==EINTR);return e;}
#define CHECK(x) do{ if((x)<0){perror(#x);return 1;} }while(0)
int main(int argc,char**argv){
  const char*dev=argc>1?argv[1]:"/dev/video0"; int frames=argc>2?atoi(argv[2]):30;
  int fd=open(dev,O_RDWR); CHECK(fd);
  struct v4l2_capability cap={0}; CHECK(xioctl(fd,VIDIOC_QUERYCAP,&cap));
  printf("driver=%s card=%s\n",cap.driver,cap.card);
  if(!(cap.device_caps&V4L2_CAP_VIDEO_CAPTURE)||!(cap.device_caps&V4L2_CAP_STREAMING)){fprintf(stderr,"not a streaming capture node\n");return 1;}
  struct v4l2_format f={.type=V4L2_BUF_TYPE_VIDEO_CAPTURE};
  f.fmt.pix.width=640;f.fmt.pix.height=480;f.fmt.pix.pixelformat=V4L2_PIX_FMT_YUYV;f.fmt.pix.field=V4L2_FIELD_NONE;
  CHECK(xioctl(fd,VIDIOC_S_FMT,&f));
  printf("format %ux%u fourcc=%.4s sizeimage=%u\n",f.fmt.pix.width,f.fmt.pix.height,(char*)&f.fmt.pix.pixelformat,f.fmt.pix.sizeimage);
  struct v4l2_requestbuffers rb={.count=NB,.type=V4L2_BUF_TYPE_VIDEO_CAPTURE,.memory=V4L2_MEMORY_MMAP};
  CHECK(xioctl(fd,VIDIOC_REQBUFS,&rb));
  void*mem[NB];size_t len[NB];
  for(unsigned i=0;i<rb.count;i++){struct v4l2_buffer b={.type=rb.type,.memory=rb.memory,.index=i};
    CHECK(xioctl(fd,VIDIOC_QUERYBUF,&b));len[i]=b.length;
    mem[i]=mmap(NULL,b.length,PROT_READ|PROT_WRITE,MAP_SHARED,fd,b.m.offset); if(mem[i]==MAP_FAILED){perror("mmap");return 1;}
    CHECK(xioctl(fd,VIDIOC_QBUF,&b));}
  enum v4l2_buf_type t=V4L2_BUF_TYPE_VIDEO_CAPTURE; CHECK(xioctl(fd,VIDIOC_STREAMON,&t));
  struct timeval prev={0};
  for(int n=0;n<frames;n++){struct v4l2_buffer b={.type=t,.memory=V4L2_MEMORY_MMAP};
    CHECK(xioctl(fd,VIDIOC_DQBUF,&b));
    double dt=prev.tv_sec?(b.timestamp.tv_sec-prev.tv_sec)*1e3+(b.timestamp.tv_usec-prev.tv_usec)/1e3:0; prev=b.timestamp;
    printf("frame %2d seq=%u bytes=%u dt=%.1fms first_px=0x%02x\n",n,b.sequence,b.bytesused,dt,((unsigned char*)mem[b.index])[0]);
    CHECK(xioctl(fd,VIDIOC_QBUF,&b));}
  CHECK(xioctl(fd,VIDIOC_STREAMOFF,&t));
  for(unsigned i=0;i<rb.count;i++)munmap(mem[i],len[i]);
  close(fd);puts("OK");return 0;}
