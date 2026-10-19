using System;
// CIDR firewall - parse to 32-bit, compare masked prefixes, first match wins.  O(rules) per ip.
public class Solution {
    static uint ParseIp(string s) { uint v = 0; foreach (var p in s.Split('.')) v = (v << 8) | uint.Parse(p); return v; }
    static uint MaskOf(int p) => p == 0 ? 0u : 0xFFFFFFFFu << (32 - p);
    public string[] Check(string[] rules, string[] ips) {
        var output = new string[ips.Length];
        for (int i = 0; i < ips.Length; i++) {
            uint ip = ParseIp(ips[i]); string decision = "DENY";
            foreach (var r in rules) {
                int sp = r.IndexOf(' '), sl = r.IndexOf('/');
                uint net = ParseIp(r[(sp + 1)..sl]), m = MaskOf(int.Parse(r[(sl + 1)..]));
                if ((ip & m) == (net & m)) { decision = r[..sp]; break; }
            }
            output[i] = decision;
            T.R("out", output, "i", i);
        }
        return output;
    }
}
