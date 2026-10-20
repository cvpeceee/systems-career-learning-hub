#include "../lesson_38_1.cpp"
#include <cassert>
#include <cstdio>
int main() {
  std::vector<Pkg> repo = {{"libc", 2, {}}, {"libc", 3, {}}, {"libssl", 3, {{"libc", 2}}}, {"app", 1, {{"libssl", 3}, {"libc", 3}}}};
  Plan p = resolve(repo, {{"app", 1}});
  assert(p.ok && p.order.size() == 3 && p.order[0] == "libc-3" && p.order.back() == "app-1");
  assert(!resolve(repo, {{"nope", 1}}).ok);
  assert(!resolve(repo, {{"libc", 4}}).ok);
  std::vector<Pkg> cyc = {{"a", 1, {{"b", 1}}}, {"b", 1, {{"a", 1}}}};
  Plan c = resolve(cyc, {{"a", 1}}); assert(!c.ok && c.error == "dependency cycle");
  // conflict: x picked at v1 first (needs >=1), later y requires x>=2
  std::vector<Pkg> conf = {{"x", 1, {}}, {"y", 1, {{"x", 2}}}, {"top", 1, {{"y", 1}, {"x", 1}}}};
  std::vector<Pkg> conf2 = conf; conf2.push_back({"x", 2, {}});
  assert(resolve(conf2, {{"top", 1}}).ok);   // highest x satisfies both
  std::vector<std::string> w;
  Config m = merge_fragments({{{"CONFIG_A", "y"}, {"CONFIG_B", "y"}}, {{"CONFIG_B", "n"}}}, w);
  assert(m["CONFIG_B"] == "n" && w.size() == 1);
  assert(missing_after_build({{"CONFIG_LOCK", "y"}}, {{"CONFIG_A", "y"}}).size() == 1);
  assert(missing_after_build({{"CONFIG_OFF", "n"}}, {}).empty());
  printf("38.1 ok\n");
}
