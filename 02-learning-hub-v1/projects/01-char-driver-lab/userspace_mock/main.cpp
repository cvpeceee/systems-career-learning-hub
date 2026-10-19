// Virtual char-device simulator — teaching stand-in for a Linux cdev.
#include "virtual_device.hpp"
#include <atomic>
#include <chrono>
#include <cstdio>
#include <iostream>
#include <string>
#include <thread>

static void print_status(VirtualDevice& dev) {
  VirtualDevice::Status st{};
  if (dev.ioctl(VirtualDevice::GET_STATUS, &st) == 0) {
    std::printf("status: wr=%llu rd=%llu irq=%llu q=%u rate=%uHz\n",
                (unsigned long long)st.bytes_written,
                (unsigned long long)st.bytes_read,
                (unsigned long long)st.irq_count,
                st.queue_depth, st.irq_rate_hz);
  }
}

int main() {
  VirtualDevice dev;
  dev.open();
  std::puts("=== VirtualDevice lab ===");
  std::puts("Commands: w <text> | r [n] | s (status) | i <hz> | c (clear) | q");

  std::atomic<bool> run{true};
  std::thread reader([&] {
    char buf[64];
    while (run) {
      ssize_t n = dev.read(buf, sizeof(buf) - 1);
      if (n > 0) {
        buf[n] = 0;
        std::printf("[reader] got %zd bytes: \"%s\"\n", n, buf);
        std::fflush(stdout);
      } else {
        std::this_thread::sleep_for(std::chrono::milliseconds(20));
      }
    }
  });

  std::string line;
  while (std::printf("> "), std::fflush(stdout), std::getline(std::cin, line)) {
    if (line.empty()) continue;
    if (line == "q") break;
    if (line == "s") { print_status(dev); continue; }
    if (line == "c") { dev.ioctl(VirtualDevice::CLEAR, nullptr); continue; }
    if (line[0] == 'w' && line.size() > 2) {
      auto payload = line.substr(2);
      auto n = dev.write(payload.data(), payload.size());
      std::printf("wrote %zd\n", n);
      continue;
    }
    if (line[0] == 'r') { print_status(dev); continue; }
    if (line[0] == 'i' && line.size() > 2) {
      uint32_t hz = static_cast<uint32_t>(std::stoul(line.substr(2)));
      dev.ioctl(VirtualDevice::SET_IRQ_RATE, &hz);
      std::printf("irq rate -> %u Hz\n", hz);
      continue;
    }
    std::puts("unknown command");
  }

  run = false;
  dev.release();
  reader.join();
  std::puts("bye");
  return 0;
}
