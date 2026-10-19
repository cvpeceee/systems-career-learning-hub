// Tiny lock contention microbench — systems interview intuition aid.
#include <atomic>
#include <chrono>
#include <cstdio>
#include <mutex>
#include <thread>
#include <vector>

static std::mutex mu;
static long long guarded = 0;
static std::atomic<long long> atomic_counter{0};

void with_mutex(int n) {
  for (int i = 0; i < n; ++i) {
    std::lock_guard<std::mutex> lk(mu);
    ++guarded;
  }
}
void with_atomic(int n) {
  for (int i = 0; i < n; ++i) atomic_counter.fetch_add(1, std::memory_order_relaxed);
}

template <typename F>
double time_ms(F f) {
  auto a = std::chrono::steady_clock::now();
  f();
  auto b = std::chrono::steady_clock::now();
  return std::chrono::duration<double, std::milli>(b - a).count();
}

int main() {
  const int N = 200000;
  const int T = 4;
  auto run = [&](auto fn) {
    std::vector<std::thread> th;
    for (int i = 0; i < T; ++i) th.emplace_back(fn, N);
    for (auto& t : th) t.join();
  };
  guarded = 0; atomic_counter = 0;
  double m = time_ms([&] { run(with_mutex); });
  double a = time_ms([&] { run(with_atomic); });
  std::printf("mutex sum=%lld time=%.2f ms\n", guarded, m);
  std::printf("atomic sum=%lld time=%.2f ms\n", atomic_counter.load(), a);
  std::printf("Takeaway: measure before locking debates; atomics ≠ always faster under all patterns.\n");
}
