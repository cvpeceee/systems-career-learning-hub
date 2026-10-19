#include "../lesson_36_5.cpp"
#include <cassert>
#include <cstdio>
#include <atomic>
#include <thread>
int main() {
  Bus<int> bus;
  std::vector<int> fast, slow, rel;
  bus.subscribe("cam", QoS{false, 3}, [&](const int &x) { slow.push_back(x); });
  for (int i = 0; i < 10; ++i) assert(bus.publish("cam", i));
  bus.spin();
  assert((slow == std::vector<int>{7, 8, 9}) && bus.dropped("cam", 0) == 7);
  bus.subscribe("cmd", QoS{true, 2}, [&](const int &x) { rel.push_back(x); bus.publish("echo", x); });
  assert(bus.publish("cmd", 1) && bus.publish("cmd", 2) && !bus.publish("cmd", 3));
  bus.spin();   // callback publishes: must not deadlock
  assert((rel == std::vector<int>{1, 2}));
  Bus<int> b2; std::atomic<int> n{0};
  b2.subscribe("t", QoS{false, 1000000}, [&](const int &) { n++; });
  std::vector<std::thread> ts;
  for (int t = 0; t < 4; ++t) ts.emplace_back([&] { for (int i = 0; i < 2000; ++i) b2.publish("t", i); });
  std::thread sp([&] { for (int i = 0; i < 200; ++i) b2.spin(); });
  for (auto &t : ts) t.join();
  sp.join(); b2.spin();
  assert(n == 8000);
  (void)fast;
  printf("36.5 ok\n");
}
