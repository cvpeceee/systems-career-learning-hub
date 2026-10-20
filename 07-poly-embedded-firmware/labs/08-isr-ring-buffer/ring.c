/* Lock-free single-producer/single-consumer ring: the classic ISR->task queue.
 * Analogy: a conveyor belt where only one person loads and only one unloads,
 * so they never need to talk (no lock) — just look at the two counters.
 * Test: producer thread stands in for the ISR. Build with -fsanitize=thread to prove no races. */
#include <stdatomic.h>
#include <stdint.h>
#include <stdio.h>
#include <pthread.h>
#define CAP 256 /* power of two so index = counter & (CAP-1) */
typedef struct { _Atomic uint32_t head, tail; uint32_t data[CAP]; } ring_t;
static int ring_put(ring_t*r,uint32_t v){ /* ISR side */
  uint32_t h=atomic_load_explicit(&r->head,memory_order_relaxed);
  uint32_t t=atomic_load_explicit(&r->tail,memory_order_acquire);
  if(h-t==CAP) return 0; /* full: count an overrun, never block in an ISR */
  r->data[h&(CAP-1)]=v;
  atomic_store_explicit(&r->head,h+1,memory_order_release); return 1; }
static int ring_get(ring_t*r,uint32_t*v){ /* task side */
  uint32_t t=atomic_load_explicit(&r->tail,memory_order_relaxed);
  uint32_t h=atomic_load_explicit(&r->head,memory_order_acquire);
  if(h==t) return 0;
  *v=r->data[t&(CAP-1)];
  atomic_store_explicit(&r->tail,t+1,memory_order_release); return 1; }
static ring_t R; enum{N=2000000};
static void*prod(void*a){(void)a;for(uint32_t i=0;i<N;)if(ring_put(&R,i))i++;return 0;}
int main(void){pthread_t p;pthread_create(&p,0,prod,0);
  uint32_t exp=0,v;while(exp<N){if(ring_get(&R,&v)){if(v!=exp){printf("FAIL got %u want %u\n",v,exp);return 1;}exp++;}}
  pthread_join(p,0);printf("OK %u items in order, no loss\n",exp);return 0;}
