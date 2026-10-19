// Median of two sorted arrays - binary search the cut in the smaller array.  O(log min(m,n)).
class Solution {
public:
    double findMedianSortedArrays(vector<int> A, vector<int> B) {
        FN("findMedianSortedArrays");
        if (A.size() > B.size()) swap(A, B);                 // search the shorter array
        int m = A.size(), n = B.size(), half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;             // cut A after i, B after j
            int aL = i ? A[i - 1] : INT_MIN, aR = i < m ? A[i] : INT_MAX;
            int bL = j ? B[j - 1] : INT_MIN, bR = j < n ? B[j] : INT_MAX;
            TR("A", A, "B", B, "lo", lo, "i", i, "hi", hi, "j", j);
            if (aL <= bR && bL <= aR) {                      // every left <= every right
                if ((m + n) % 2) return max(aL, bL);
                return (max(aL, bL) + (double)min(aR, bR)) / 2.0;
            }
            if (aL > bR) hi = i - 1;                         // took too many from A
            else lo = i + 1;                                 // took too few from A
        }
        return 0;                                            // unreachable for valid input
    }
};
