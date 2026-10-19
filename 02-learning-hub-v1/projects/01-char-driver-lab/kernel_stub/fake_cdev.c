// STUB ONLY — educational skeleton. Do not ship. Load only in a disposable VM.
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/uaccess.h>

#define DRV_NAME "fake_cdev"
static dev_t devno;
static struct cdev fake_cdev;

static int fake_open(struct inode *inode, struct file *file) {
  pr_info(DRV_NAME ": open\n");
  return 0;
}
static int fake_release(struct inode *inode, struct file *file) {
  pr_info(DRV_NAME ": release\n");
  return 0;
}
static ssize_t fake_read(struct file *f, char __user *buf, size_t n, loff_t *p) {
  const char msg[] = "hello-from-fake-cdev\n";
  size_t len = min(n, sizeof(msg) - 1);
  if (copy_to_user(buf, msg, len)) return -EFAULT;
  return len;
}
static const struct file_operations fops = {
  .owner = THIS_MODULE,
  .open = fake_open,
  .release = fake_release,
  .read = fake_read,
};
static int __init fake_init(void) {
  int ret = alloc_chrdev_region(&devno, 0, 1, DRV_NAME);
  if (ret) return ret;
  cdev_init(&fake_cdev, &fops);
  ret = cdev_add(&fake_cdev, devno, 1);
  if (ret) { unregister_chrdev_region(devno, 1); return ret; }
  pr_info(DRV_NAME ": loaded major=%d\n", MAJOR(devno));
  return 0;
}
static void __exit fake_exit(void) {
  cdev_del(&fake_cdev);
  unregister_chrdev_region(devno, 1);
  pr_info(DRV_NAME ": unloaded\n");
}
module_init(fake_init);
module_exit(fake_exit);
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Educational fake char device stub");
