using System; using System.Collections.Generic;
// Retry client - transient-only retries, exponential backoff with cap, one idempotency key.  O(attempts).
public class Solution {
    static bool IsTransient(int s) => s == 429 || s == 500 || s == 502 || s == 503 || s == 504;
    public string[] CallWithRetry(string requestId, int[] statuses, int maxRetries, int baseMs) {
        string key = requestId;
        var log = new List<string>();
        for (int attempt = 1; ; attempt++) {
            int s = statuses[attempt - 1];
            string line = $"attempt {attempt} key={key} status={s}";
            bool retry = IsTransient(s) && attempt <= maxRetries;
            int wait = 0;
            if (retry) { wait = (int)Math.Min(1000L, (long)baseMs << (attempt - 1)); line += $" retry in {wait}ms"; }
            log.Add(line);
            T.R("statuses", statuses, "attempt", attempt, "wait", wait);
            if (!retry) { log.Add(s >= 200 && s < 300 ? "result=" + s : "result=failed " + s); break; }
        }
        return log.ToArray();
    }
}
