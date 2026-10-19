// Median of two sorted arrays - binary search the cut in the smaller array.  O(log min(m,n)).
class Solution {
    public double findMedianSortedArrays(int[] A, int[] B) {
        if (A.length > B.length) { int[] t = A; A = B; B = t; }
        int m = A.length, n = B.length, half = (m + n + 1) / 2, lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int aL = i > 0 ? A[i - 1] : Integer.MIN_VALUE, aR = i < m ? A[i] : Integer.MAX_VALUE;
            int bL = j > 0 ? B[j - 1] : Integer.MIN_VALUE, bR = j < n ? B[j] : Integer.MAX_VALUE;
            T.r("A", A, "B", B, "lo", lo, "i", i, "hi", hi, "j", j);
            if (aL <= bR && bL <= aR)
                return (m + n) % 2 == 1 ? Math.max(aL, bL) : (Math.max(aL, bL) + (double) Math.min(aR, bR)) / 2.0;
            if (aL > bR) hi = i - 1; else lo = i + 1;
        }
        return 0;
    }
}
