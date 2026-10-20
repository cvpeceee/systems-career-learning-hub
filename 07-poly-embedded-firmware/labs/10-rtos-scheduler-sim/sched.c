/* Tiny priority-preemptive tick scheduler sim (FreeRTOS-style ideas, no hardware).
 * Analogy: an ER triage nurse: each tick, the highest-priority READY patient is seen.
 * Shows: priority inversion and fix with priority inheritance on a mutex. */
#include <stdio.h>
#include <string.h>
typedef struct{const char*n;int prio,base,ready_at,work,holds;}task_t;
static int run(int inherit){
  task_t T[3]={{"LOW (logger)",1,1,0,4,0},{"MED (stats)",2,2,2,6,0},{"HIGH (USB ISR task)",3,3,1,2,0}};
  int mutex_owner=-1,high_done=-1;char line[64];int L=0;
  for(int tick=0;tick<20;tick++){
    int pick=-1;
    for(int i=0;i<3;i++){ if(T[i].ready_at>tick||T[i].work<=0)continue;
      if(i!=0&&i==2&&mutex_owner==0){ if(inherit&&T[0].prio<T[2].prio)T[0].prio=T[2].prio; continue;} /* HIGH blocks on mutex */
      if(pick<0||T[i].prio>T[pick].prio)pick=i;}
    if(pick<0)break;
    if(pick==0&&mutex_owner<0)mutex_owner=0;
    T[pick].work--; line[L++]="LMH"[pick];
    if(pick==0&&T[0].work==0){mutex_owner=-1;T[0].prio=T[0].base;}
    if(pick==2&&T[2].work==0&&high_done<0)high_done=tick;}
  line[L]=0; printf("%s inheritance: timeline %s  HIGH finished at tick %d\n",inherit?"WITH   ":"WITHOUT",line,high_done);
  return high_done;}
int main(void){int a=run(0),b=run(1);printf(b<a?"OK inheritance cut HIGH latency %d->%d ticks\n":"FAIL\n",a,b);return !(b<a);}
