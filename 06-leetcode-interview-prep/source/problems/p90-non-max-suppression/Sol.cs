using System; using System.Collections.Generic; using System.Linq;
// Non-Max Suppression - sort by score, keep best, suppress overlaps with IoU > thr.  O(n^2).
public class Solution {
    double Iou(int[] a, int[] b) {
        int w = Math.Max(0, Math.Min(a[2], b[2]) - Math.Max(a[0], b[0]));
        int h = Math.Max(0, Math.Min(a[3], b[3]) - Math.Max(a[1], b[1]));
        double inter = (double)w * h;
        double uni = (double)(a[2] - a[0]) * (a[3] - a[1]) + (double)(b[2] - b[0]) * (b[3] - b[1]) - inter;
        return inter / uni;
    }
    public int[] Nms(int[][] boxes, double thr) {
        int n = boxes.Length;
        var order = Enumerable.Range(0, n).OrderByDescending(i => boxes[i][4]).ToArray();
        var gone = new bool[n]; var keep = new List<int>();
        for (int x = 0; x < n; x++) {
            int i = order[x]; if (gone[i]) continue;
            keep.Add(i);
            for (int y = x + 1; y < n; y++) { int j = order[y]; if (!gone[j] && Iou(boxes[i], boxes[j]) > thr) gone[j] = true; }
            T.R("keep", keep, "i", i);
        }
        return keep.ToArray();
    }
}
