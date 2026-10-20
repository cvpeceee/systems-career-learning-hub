// Interrupt top-half/bottom-half pattern using a timer as a stand-in IRQ source
// (so it runs on any PC). Analogy: doorbell (top half) vs. actually unpacking the delivery (work).
#include <linux/module.h>
#include <linux/timer.h>
#include <linux/workqueue.h>
#include <linux/atomic.h>

static struct timer_list t;
static struct work_struct w;
static atomic_t pending = ATOMIC_INIT(0);
static unsigned long handled;

static void bottom_half(struct work_struct *ws)
{	/* process context: may sleep, take mutexes, do I2C */
	int n = atomic_xchg(&pending, 0);
	handled += n;
	pr_info("polyirq: bottom half drained %d events (total %lu)\n", n, handled);
}
static void fake_irq(struct timer_list *tl)
{	/* atomic context: NO sleeping. Ack, record, defer. */
	atomic_inc(&pending);
	schedule_work(&w);
	mod_timer(&t, jiffies + HZ / 2);
}
static int __init pi_init(void)
{
	INIT_WORK(&w, bottom_half);
	timer_setup(&t, fake_irq, 0);
	mod_timer(&t, jiffies + HZ / 2);
	return 0;
}
static void __exit pi_exit(void)
{
	timer_delete_sync(&t);
	cancel_work_sync(&w);
}
module_init(pi_init); module_exit(pi_exit);
MODULE_LICENSE("GPL");
