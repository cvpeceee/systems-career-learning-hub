// Trapping Rain Water - two pointers; the side with the smaller running max is settled.  O(n), O(1).
class Solution {
public:
    int trap(vector<int> height) {
        FN("trap");
        int l = 0, r = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            leftMax = max(leftMax, height[l]);
            rightMax = max(rightMax, height[r]);
            if (leftMax <= rightMax) {             // left wall is the bottleneck
                water += leftMax - height[l];      // level here is exactly leftMax
                l++;
            } else {                               // right wall is the bottleneck
                water += rightMax - height[r];
                r--;
            }
            TR("height", height, "l", l, "r", r, "leftMax", leftMax, "rightMax", rightMax, "water", water);
        }
        return water;
    }
};
