using System;
// Container with most water - two pointers from both ends.  O(n) time, O(1) space.
public class Solution {
    public int MaxArea(int[] height) {
        int l = 0, r = height.Length - 1, best = 0;
        while (l < r) {
            int area = Math.Min(height[l], height[r]) * (r - l);   // water level = shorter wall
            best = Math.Max(best, area);
            if (height[l] < height[r]) l++; else r--;               // move the shorter wall inward
        }
        return best;
    }
}
