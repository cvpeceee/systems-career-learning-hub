#pragma once
#include <sys/types.h>
#include <cstdint>
#include <mutex>
#include <condition_variable>
#include <deque>
#include <string>
#include <atomic>
#include <thread>

// Mimics a tiny char device: ring buffer + IRQ simulation + ioctl status.
class VirtualDevice {
public:
  enum Ioctl : unsigned long { GET_STATUS = 0x1001, SET_IRQ_RATE = 0x1002, CLEAR = 0x1003 };

  struct Status {
    uint64_t bytes_written = 0;
    uint64_t bytes_read = 0;
    uint64_t irq_count = 0;
    uint32_t queue_depth = 0;
    uint32_t irq_rate_hz = 5;
  };

  VirtualDevice();
  ~VirtualDevice();

  int open();
  int release();
  ssize_t write(const char* buf, size_t n);
  ssize_t read(char* buf, size_t n);   // may block until data or IRQ-fed byte
  int ioctl(unsigned long cmd, void* arg);

private:
  void irqThreadMain();

  std::mutex mu_;
  std::condition_variable cv_;
  std::deque<char> q_;
  Status st_{};
  std::atomic<bool> open_{false};
  std::atomic<bool> stop_{false};
  std::thread irq_thread_;
  static constexpr size_t kCap = 256;
};
