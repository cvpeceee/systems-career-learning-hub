import java.util.*;
// Retry client - transient-only retries, exponential backoff with cap, one idempotency key.  O(attempts).
class Solution {
    static boolean isTransient(int s) { return s == 429 || s == 500 || s == 502 || s == 503 || s == 504; }
    public String[] callWithRetry(String requestId, int[] statuses, int maxRetries, int baseMs) {
        final String key = requestId;
        List<String> log = new ArrayList<>();
        for (int attempt = 1; ; attempt++) {
            int s = statuses[attempt - 1];
            String line = "attempt " + attempt + " key=" + key + " status=" + s;
            boolean retry = isTransient(s) && attempt <= maxRetries;
            int wait = 0;
            if (retry) { wait = (int) Math.min(1000L, ((long) baseMs) << (attempt - 1)); line += " retry in " + wait + "ms"; }
            log.add(line);
            T.r("statuses", statuses, "attempt", attempt, "wait", wait);
            if (!retry) { log.add(s >= 200 && s < 300 ? "result=" + s : "result=failed " + s); break; }
        }
        return log.toArray(new String[0]);
    }
}
