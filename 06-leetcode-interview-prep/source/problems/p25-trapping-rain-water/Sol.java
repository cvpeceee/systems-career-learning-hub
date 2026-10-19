// Trapping Rain Water - two pointers; the side with the smaller running max is settled.  O(n), O(1).
class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            leftMax = Math.max(leftMax, height[l]);
            rightMax = Math.max(rightMax, height[r]);
            if (leftMax <= rightMax) { water += leftMax - height[l]; l++; }   // left side settled
            else { water += rightMax - height[r]; r--; }                      // right side settled
            T.r("height", height, "l", l, "r", r, "leftMax", leftMax, "rightMax", rightMax, "water", water);
        }
        return water;
    }
}
