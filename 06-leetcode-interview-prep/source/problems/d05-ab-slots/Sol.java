// A/B OTA slots - tiny state machine; the running slot is never written.
class ABSlots {
    private int act = 0, tries = 0; private boolean pend = false;
    private final String[] ver;
    ABSlots(String v) { ver = new String[]{v, "0"}; }
    private String slot(int s) { return (s == 0 ? "A" : "B") + ":" + ver[s]; }
    String install(String v) {
        if (pend) return "busy";
        ver[1 - act] = v; pend = true; tries = 3;          // inactive slot only
        return "ok";
    }
    String boot(String result) {
        if (!pend) return "booted:" + slot(act);
        if (result.equals("good")) { act = 1 - act; pend = false; return "switched:" + slot(act); }   // commit
        if (--tries == 0) { pend = false; return "rollback:" + slot(act); }                            // give up
        return "retry:" + tries;
    }
    String status() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 2; i++) {
            if (i > 0) sb.append(',');
            sb.append(slot(i));
            if (i == act) sb.append('*');
            if (pend && i != act) sb.append('?');
        }
        return sb.toString();
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; ABSlots m = null;
        for (int i = 0; i < ops.length; i++) {
            switch (ops[i]) {
                case "ABSlots": m = new ABSlots(args[i]); out[i] = "null"; break;
                case "install": out[i] = m.install(args[i]); break;
                case "boot": out[i] = m.boot(args[i]); break;
                default: out[i] = m.status();
            }
        }
        return out;
    }
}
