// Container with most water - two pointers from both ends.  O(n) time, O(1) space.
class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, best = 0;
        while (l < r) {
            int area = Math.min(height[l], height[r]) * (r - l);   // water level = shorter wall
            best = Math.max(best, area);
            if (height[l] < height[r]) l++; else r--;               // move the shorter wall inward
        }
        return best;
    }
}
