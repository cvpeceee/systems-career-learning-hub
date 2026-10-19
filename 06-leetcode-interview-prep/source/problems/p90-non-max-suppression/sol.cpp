// Non-Max Suppression - sort by score, keep best, suppress overlaps with IoU > thr.  O(n^2).
class Solution {
    double iou(const vector<int>& a, const vector<int>& b) {
        int w = max(0, min(a[2], b[2]) - max(a[0], b[0]));     // overlap width (0 if apart)
        int h = max(0, min(a[3], b[3]) - max(a[1], b[1]));
        double inter = (double)w * h;
        double uni = (double)(a[2] - a[0]) * (a[3] - a[1]) + (double)(b[2] - b[0]) * (b[3] - b[1]) - inter;
        return inter / uni;
    }
public:
    vector<int> nms(vector<vector<int>> boxes, double thr) {
        FN("nms");
        int n = boxes.size();
        vector<int> order(n); iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b) { return boxes[a][4] > boxes[b][4]; });
        vector<bool> gone(n, false); vector<int> keep;
        for (int x = 0; x < n; x++) {
            int i = order[x]; if (gone[i]) continue;
            keep.push_back(i);                                  // most confident survivor
            for (int y = x + 1; y < n; y++) {
                int j = order[y];
                if (!gone[j] && iou(boxes[i], boxes[j]) > thr) gone[j] = true;
            }
            TR("keep", keep, "i", i);
        }
        return keep;
    }
};
