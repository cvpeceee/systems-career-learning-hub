#include "virtual_device.hpp"
#include <cstring>
#include <chrono>

VirtualDevice::VirtualDevice() {
  irq_thread_ = std::thread([this] { irqThreadMain(); });
}

VirtualDevice::~VirtualDevice() {
  stop_ = true;
  cv_.notify_all();
  if (irq_thread_.joinable()) irq_thread_.join();
}

int VirtualDevice::open() {
  open_ = true;
  return 0;
}

int VirtualDevice::release() {
  open_ = false;
  cv_.notify_all();
  return 0;
}

ssize_t VirtualDevice::write(const char* buf, size_t n) {
  if (!open_) return -1;
  std::lock_guard<std::mutex> lk(mu_);
  size_t got = 0;
  for (size_t i = 0; i < n && q_.size() < kCap; ++i) {
    q_.push_back(buf[i]);
    ++got;
  }
  st_.bytes_written += got;
  st_.queue_depth = static_cast<uint32_t>(q_.size());
  cv_.notify_all();
  return static_cast<ssize_t>(got);
}

ssize_t VirtualDevice::read(char* buf, size_t n) {
  if (!open_) return -1;
  std::unique_lock<std::mutex> lk(mu_);
  cv_.wait(lk, [&] { return stop_ || !open_ || !q_.empty(); });
  if (!open_ || stop_) return 0;
  size_t got = 0;
  while (got < n && !q_.empty()) {
    buf[got++] = q_.front();
    q_.pop_front();
  }
  st_.bytes_read += got;
  st_.queue_depth = static_cast<uint32_t>(q_.size());
  return static_cast<ssize_t>(got);
}

int VirtualDevice::ioctl(unsigned long cmd, void* arg) {
  std::lock_guard<std::mutex> lk(mu_);
  switch (cmd) {
    case GET_STATUS:
      if (!arg) return -1;
      *static_cast<Status*>(arg) = st_;
      return 0;
    case SET_IRQ_RATE:
      if (!arg) return -1;
      st_.irq_rate_hz = *static_cast<uint32_t*>(arg);
      if (st_.irq_rate_hz == 0) st_.irq_rate_hz = 1;
      return 0;
    case CLEAR:
      q_.clear();
      st_.queue_depth = 0;
      return 0;
    default:
      return -1;
  }
}

void VirtualDevice::irqThreadMain() {
  // Simulated hardware IRQ: periodically injects a marker byte and wakes readers.
  while (!stop_) {
    uint32_t hz;
    {
      std::lock_guard<std::mutex> lk(mu_);
      hz = st_.irq_rate_hz;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(1000 / std::max(1u, hz)));
    if (stop_ || !open_) continue;
    {
      std::lock_guard<std::mutex> lk(mu_);
      if (q_.size() < kCap) {
        q_.push_back('#');  // IRQ-fed marker
        st_.irq_count++;
        st_.queue_depth = static_cast<uint32_t>(q_.size());
      }
    }
    cv_.notify_all();
  }
}
