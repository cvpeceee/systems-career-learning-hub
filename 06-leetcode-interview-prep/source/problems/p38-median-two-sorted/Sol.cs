using System;
// Median of two sorted arrays - binary search the cut in the smaller array.  O(log min(m,n)).
public class Solution {
    public double FindMedianSortedArrays(int[] A, int[] B) {
        if (A.Length > B.Length) (A, B) = (B, A);
        int m = A.Length, n = B.Length, half = (m + n + 1) / 2, lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int aL = i > 0 ? A[i - 1] : int.MinValue, aR = i < m ? A[i] : int.MaxValue;
            int bL = j > 0 ? B[j - 1] : int.MinValue, bR = j < n ? B[j] : int.MaxValue;
            T.R("A", A, "B", B, "lo", lo, "i", i, "hi", hi, "j", j);
            if (aL <= bR && bL <= aR)
                return (m + n) % 2 == 1 ? Math.Max(aL, bL) : (Math.Max(aL, bL) + (double)Math.Min(aR, bR)) / 2.0;
            if (aL > bR) hi = i - 1; else lo = i + 1;
        }
        return 0;
    }
}
