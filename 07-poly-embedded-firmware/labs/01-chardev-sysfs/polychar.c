// polychar: a char device ("a mailbox with a door at /dev/polychar") + sysfs knob + ioctl.
// Analogy: /dev node = mailbox door; file_operations = rules for what happens at the door.
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/miscdevice.h>
#include <linux/uaccess.h>
#include <linux/mutex.h>
#include <linux/ioctl.h>

#define BUF_SZ 256
#define POLY_IOC_CLEAR _IO('p', 1)
static char buf[BUF_SZ];
static size_t len;
static DEFINE_MUTEX(lock);
static unsigned int writes; /* exposed via sysfs */

static ssize_t pc_read(struct file *f, char __user *u, size_t n, loff_t *off)
{
	ssize_t r;
	mutex_lock(&lock);
	r = simple_read_from_buffer(u, n, off, buf, len);
	mutex_unlock(&lock);
	return r;
}
static ssize_t pc_write(struct file *f, const char __user *u, size_t n, loff_t *off)
{
	if (n > BUF_SZ) n = BUF_SZ;
	mutex_lock(&lock);
	if (copy_from_user(buf, u, n)) { mutex_unlock(&lock); return -EFAULT; }
	len = n; writes++;
	mutex_unlock(&lock);
	return n;
}
static long pc_ioctl(struct file *f, unsigned int cmd, unsigned long arg)
{
	if (cmd != POLY_IOC_CLEAR) return -ENOTTY;
	mutex_lock(&lock); len = 0; mutex_unlock(&lock);
	return 0;
}
static const struct file_operations fops = {
	.owner = THIS_MODULE, .read = pc_read, .write = pc_write,
	.unlocked_ioctl = pc_ioctl, .llseek = default_llseek,
};
static ssize_t writes_show(struct device *d, struct device_attribute *a, char *b)
{ return sysfs_emit(b, "%u\n", writes); }
static DEVICE_ATTR_RO(writes);
static struct attribute *pc_attrs[] = { &dev_attr_writes.attr, NULL };
ATTRIBUTE_GROUPS(pc);

static struct miscdevice mdev = {
	.minor = MISC_DYNAMIC_MINOR, .name = "polychar", .fops = &fops,
	.groups = pc_groups, .mode = 0666,
};
module_misc_device(mdev);
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Lab 01: misc char device with sysfs + ioctl");
