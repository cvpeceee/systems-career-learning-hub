// ThreadSanitizer stress for the bounded blocking queue (-fsanitize=thread, halt_on_error=1).
#include "common.h"
#include "sol.cpp"
int main() {
    bool a = bbqStress(3, 4, 4, 20000), b = bbqStress(1, 2, 3, 6000), c = bbqStress(16, 8, 2, 10000);
    printf("TSAN BBQ stress: 4P4C=%s 2P3C=%s 8P2C=%s\n", a ? "ok" : "FAIL", b ? "ok" : "FAIL", c ? "ok" : "FAIL");
    return a && b && c ? 0 : 1;
}
