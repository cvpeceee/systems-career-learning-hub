#include <deque>
#include <functional>
#include <map>
#include <mutex>
#include <string>
#include <vector>

struct QoS { bool reliable = false; size_t depth = 10; };

template <class T>
class Bus {
  struct Sub { QoS q; std::deque<T> box; std::function<void(const T &)> cb; size_t dropped = 0; };
  std::mutex mu_;
  std::map<std::string, std::vector<Sub>> subs_;
 public:
  void subscribe(const std::string &topic, QoS q, std::function<void(const T &)> cb) {
    std::lock_guard<std::mutex> g(mu_);
    subs_[topic].push_back(Sub{q, {}, std::move(cb)});
  }

  // Returns false if a reliable subscriber's queue is full (caller must retry).
  bool publish(const std::string &topic, const T &msg) {
    std::lock_guard<std::mutex> g(mu_);
    auto it = subs_.find(topic);
    if (it == subs_.end()) return true;
    for (Sub &s : it->second)
      if (s.q.reliable && s.box.size() >= s.q.depth) return false;
    for (Sub &s : it->second) {
      if (s.box.size() >= s.q.depth) { s.box.pop_front(); ++s.dropped; }
      s.box.push_back(msg);
    }
    return true;
  }

  // Deliver queued messages. Callbacks run outside the lock.
  void spin() {
    std::vector<std::pair<std::function<void(const T &)>, T>> work;
    {
      std::lock_guard<std::mutex> g(mu_);
      for (auto &kv : subs_)
        for (Sub &s : kv.second)
          while (!s.box.empty()) { work.emplace_back(s.cb, s.box.front()); s.box.pop_front(); }
    }
    for (auto &w : work) w.first(w.second);
  }

  size_t dropped(const std::string &topic, size_t i) {
    std::lock_guard<std::mutex> g(mu_);
    return subs_[topic].at(i).dropped;
  }
};
