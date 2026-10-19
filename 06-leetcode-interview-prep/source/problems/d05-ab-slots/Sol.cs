using System.Text;
// A/B OTA slots - tiny state machine; the running slot is never written.
public class ABSlots {
    private int act = 0, tries = 0; private bool pend = false;
    private readonly string[] ver;
    public ABSlots(string v) { ver = new[] { v, "0" }; }
    private string Slot(int s) => (s == 0 ? "A" : "B") + ":" + ver[s];
    public string Install(string v) {
        if (pend) return "busy";
        ver[1 - act] = v; pend = true; tries = 3;          // inactive slot only
        T.R("ver", ver, "act", act, "pend", pend, "tries", tries);
        return "ok";
    }
    public string Boot(string result) {
        if (!pend) return "booted:" + Slot(act);
        if (result == "good") { act = 1 - act; pend = false; T.R("ver", ver, "act", act, "pend", pend, "tries", tries); return "switched:" + Slot(act); }   // commit
        T.R("ver", ver, "act", act, "pend", pend, "tries", tries - 1);
        if (--tries == 0) { pend = false; return "rollback:" + Slot(act); }                      // give up
        return "retry:" + tries;
    }
    public string Status() {
        var sb = new StringBuilder();
        for (int i = 0; i < 2; i++) {
            if (i > 0) sb.Append(',');
            sb.Append(Slot(i));
            if (i == act) sb.Append('*');
            if (pend && i != act) sb.Append('?');
        }
        return sb.ToString();
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; ABSlots m = null;
        for (int i = 0; i < ops.Length; i++) {
            switch (ops[i]) {
                case "ABSlots": m = new ABSlots(args[i]); output[i] = "null"; break;
                case "install": output[i] = m.Install(args[i]); break;
                case "boot": output[i] = m.Boot(args[i]); break;
                default: output[i] = m.Status(); break;
            }
        }
        return output;
    }
}
