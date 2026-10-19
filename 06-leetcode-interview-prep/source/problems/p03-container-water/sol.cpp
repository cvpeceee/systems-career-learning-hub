// Container with most water - two pointers from both ends.  O(n) time, O(1) space.
class Solution {
public:
    int maxArea(vector<int>& height) {
        FN("maxArea");
        int l = 0, r = (int)height.size() - 1, best = 0;
        while (l < r) {
            int area = min(height[l], height[r]) * (r - l);   // level set by shorter wall
            best = max(best, area);
            TR("height", height, "l", l, "r", r, "area", area, "best", best);
            if (height[l] < height[r]) ++l;   // shorter wall can't do better with less width
            else --r;
        }
        TR("height", height, "l", l, "r", r, "best", best);
        return best;
    }
};
