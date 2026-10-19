// Buffer pool with CLOCK (second-chance) replacement.  O(1) amortized per request.
class Solution {
public:
    vector<int> clockPool(int n, vector<int> reqs) {
        FN("clockPool");
        vector<int> frames(n, -1), ref(n, 0);
        unordered_map<int, int> where;                       // page -> frame
        int hand = 0;
        for (int page : reqs) {
            if (where.count(page)) ref[where[page]] = 1;     // hit: just set the bit
            else {
                while (frames[hand] != -1 && ref[hand] == 1) { ref[hand] = 0; hand = (hand + 1) % n; }   // second chance
                if (frames[hand] != -1) where.erase(frames[hand]);   // evict
                frames[hand] = page; ref[hand] = 1; where[page] = hand;
                hand = (hand + 1) % n;
            }
            TR("frames", frames, "ref", ref, "hand", hand, "page", page);
        }
        return frames;
    }
};
