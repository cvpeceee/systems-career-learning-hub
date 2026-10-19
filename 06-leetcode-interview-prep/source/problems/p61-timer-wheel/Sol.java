import java.util.*;
// Hashed timer wheel - bucket = fireTime % S; each tick inspects one bucket.  O(1) add/cancel.
class TimerWheel {
    final int S; long now = 0;
    final List<TreeSet<String>> slot = new ArrayList<>();
    final Map<String, Long> fireAt = new HashMap<>();
    TimerWheel(int s) { S = s; for (int i = 0; i < s; i++) slot.add(new TreeSet<>()); }
    void add(String id, long delay) { long t = now + delay; fireAt.put(id, t); slot.get((int) (t % S)).add(id); }
    boolean cancel(String id) {
        Long t = fireAt.remove(id);
        if (t == null) return false;
        slot.get((int) (t % S)).remove(id); return true;
    }
    String tick() {
        now++;
        List<String> fired = new ArrayList<>();
        Iterator<String> it = slot.get((int) (now % S)).iterator();
        while (it.hasNext()) { String id = it.next(); if (fireAt.get(id) == now) { fired.add(id); fireAt.remove(id); it.remove(); } }
        return String.join(",", fired);
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; TimerWheel w = null;
        for (int i = 0; i < ops.length; i++) {
            switch (ops[i]) {
                case "Wheel": w = new TimerWheel(Integer.parseInt(args[i])); out[i] = "null"; break;
                case "add": { String[] a = args[i].split(","); w.add(a[0], Long.parseLong(a[1])); out[i] = "null"; break; }
                case "cancel": out[i] = String.valueOf(w.cancel(args[i])); break;
                default: out[i] = w.tick();
            }
            T.r("op", ops[i], "arg", args[i], "now", w.now, "wheel", w.slot, "out", out[i]);
        }
        return out;
    }
}
