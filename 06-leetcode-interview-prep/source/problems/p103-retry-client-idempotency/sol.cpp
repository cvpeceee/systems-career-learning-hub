// Retry client - transient-only retries, exponential backoff with cap, one idempotency key.  O(attempts).
class Solution {
    static bool transient(int s) { return s == 429 || s == 500 || s == 502 || s == 503 || s == 504; }
public:
    vector<string> callWithRetry(string requestId, vector<int> statuses, int maxRetries, int baseMs) {
        FN("callWithRetry");
        const string key = requestId;                        // created ONCE, reused by every attempt
        vector<string> log;
        for (int attempt = 1; ; attempt++) {
            int s = statuses[attempt - 1];
            string line = "attempt " + to_string(attempt) + " key=" + key + " status=" + to_string(s);
            bool retry = transient(s) && attempt <= maxRetries;
            int wait = 0;
            if (retry) { wait = (int)min<long long>(1000, (long long)baseMs << (attempt - 1)); line += " retry in " + to_string(wait) + "ms"; }
            log.push_back(line);
            TR("statuses", statuses, "attempt", attempt, "wait", wait);
            if (!retry) { log.push_back(s >= 200 && s < 300 ? "result=" + to_string(s) : "result=failed " + to_string(s)); break; }
        }
        return log;
    }
};
