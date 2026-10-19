// Bus Routes - BFS where nodes are buses; stop -> buses index.  O(total stops).
class Solution {
public:
    int numBusesToDestination(vector<vector<int>> routes, int source, int target) {
        FN("numBusesToDestination");
        if (source == target) return 0;
        unordered_map<int, vector<int>> busesAt;                 // stop -> buses serving it
        for (int b = 0; b < (int)routes.size(); b++) for (int s : routes[b]) busesAt[s].push_back(b);
        vector<bool> usedBus(routes.size(), false); unordered_set<int> seenStop{source};
        vector<int> frontier;
        for (int b : busesAt[source]) { usedBus[b] = true; frontier.push_back(b); }
        for (int level = 1; !frontier.empty(); level++) {
            TR("frontier", frontier, "level", level);
            vector<int> next;
            for (int b : frontier)
                for (int s : routes[b]) {
                    if (s == target) return level;
                    if (!seenStop.insert(s).second) continue;
                    for (int nb : busesAt[s]) if (!usedBus[nb]) { usedBus[nb] = true; next.push_back(nb); }   // transfer
                }
            frontier = next;
        }
        return -1;
    }
};
