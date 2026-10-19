// ThreadSanitizer stress for the SPSC queue: built with -fsanitize=thread; any race aborts (halt_on_error=1).
#include "common.h"
#include "sol.cpp"
int main() {
    bool a = spscStress(64, 200000), b = spscStress(1, 50000), c = spscStress(1024, 200000);
    printf("TSAN SPSC stress: cap64=%s cap1=%s cap1024=%s\n", a ? "ok" : "FAIL", b ? "ok" : "FAIL", c ? "ok" : "FAIL");
    return a && b && c ? 0 : 1;
}
