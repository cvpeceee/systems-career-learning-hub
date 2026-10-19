import java.util.*;
// CIDR firewall - parse to 32-bit, compare masked prefixes, first match wins.  O(rules) per ip.
class Solution {
    static long parseIp(String s) { long v = 0; for (String p : s.split("\\.")) v = (v << 8) | Long.parseLong(p); return v; }
    static long maskOf(int p) { return p == 0 ? 0L : (0xFFFFFFFFL << (32 - p)) & 0xFFFFFFFFL; }
    public String[] check(String[] rules, String[] ips) {
        String[] out = new String[ips.length];
        for (int i = 0; i < ips.length; i++) {
            long ip = parseIp(ips[i]); String decision = "DENY";
            for (String r : rules) {
                int sp = r.indexOf(' '), sl = r.indexOf('/');
                long net = parseIp(r.substring(sp + 1, sl)), m = maskOf(Integer.parseInt(r.substring(sl + 1)));
                if ((ip & m) == (net & m)) { decision = r.substring(0, sp); break; }
            }
            out[i] = decision;
            T.r("out", out, "i", i);
        }
        return out;
    }
}
