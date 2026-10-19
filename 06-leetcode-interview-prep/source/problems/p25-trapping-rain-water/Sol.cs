using System;
// Trapping Rain Water - two pointers; the side with the smaller running max is settled.  O(n), O(1).
public class Solution {
    public int Trap(int[] height) {
        int l = 0, r = height.Length - 1, leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            leftMax = Math.Max(leftMax, height[l]);
            rightMax = Math.Max(rightMax, height[r]);
            if (leftMax <= rightMax) { water += leftMax - height[l]; l++; }   // left side settled
            else { water += rightMax - height[r]; r--; }                      // right side settled
            T.R("height", height, "l", l, "r", r, "leftMax", leftMax, "rightMax", rightMax, "water", water);
        }
        return water;
    }
}
