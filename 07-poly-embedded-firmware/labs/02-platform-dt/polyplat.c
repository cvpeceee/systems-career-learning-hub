// Platform driver matched from Device Tree. Analogy: DT = the house blueprint;
// compatible string = the name tag the driver looks for at the door.
#include <linux/module.h>
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/gpio/consumer.h>

struct polyplat { struct gpio_desc *reset; u32 lanes; };

static int polyplat_probe(struct platform_device *pdev)
{
	struct device *dev = &pdev->dev;
	struct polyplat *p = devm_kzalloc(dev, sizeof(*p), GFP_KERNEL);
	if (!p) return -ENOMEM;
	if (of_property_read_u32(dev->of_node, "poly,lanes", &p->lanes))
		p->lanes = 4;
	/* devm_ = auto-freed on unbind; optional so lab works without a real GPIO */
	p->reset = devm_gpiod_get_optional(dev, "reset", GPIOD_OUT_HIGH);
	if (IS_ERR(p->reset))
		return dev_err_probe(dev, PTR_ERR(p->reset), "reset gpio\n");
	if (p->reset) { gpiod_set_value_cansleep(p->reset, 0); }
	platform_set_drvdata(pdev, p);
	dev_info(dev, "probed: lanes=%u reset=%s\n", p->lanes, p->reset ? "yes" : "none");
	return 0;
}
static const struct of_device_id polyplat_of[] = {
	{ .compatible = "poly,hdmi-bridge-demo" }, { }
};
MODULE_DEVICE_TABLE(of, polyplat_of);
static struct platform_driver polyplat_drv = {
	.probe = polyplat_probe,
	.driver = { .name = "polyplat", .of_match_table = polyplat_of },
};
module_platform_driver(polyplat_drv);
MODULE_LICENSE("GPL");
