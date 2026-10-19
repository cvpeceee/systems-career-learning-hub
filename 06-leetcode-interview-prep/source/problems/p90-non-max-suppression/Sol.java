import java.util.*;
// Non-Max Suppression - sort by score, keep best, suppress overlaps with IoU > thr.  O(n^2).
class Solution {
    double iou(int[] a, int[] b) {
        int w = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
        int h = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
        double inter = (double) w * h;
        double uni = (double) (a[2] - a[0]) * (a[3] - a[1]) + (double) (b[2] - b[0]) * (b[3] - b[1]) - inter;
        return inter / uni;
    }
    public int[] nms(int[][] boxes, double thr) {
        int n = boxes.length;
        Integer[] order = new Integer[n]; for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Integer.compare(boxes[b][4], boxes[a][4]));
        boolean[] gone = new boolean[n]; List<Integer> keep = new ArrayList<>();
        for (int x = 0; x < n; x++) {
            int i = order[x]; if (gone[i]) continue;
            keep.add(i);
            for (int y = x + 1; y < n; y++) { int j = order[y]; if (!gone[j] && iou(boxes[i], boxes[j]) > thr) gone[j] = true; }
            T.r("keep", keep, "i", i);
        }
        return keep.stream().mapToInt(v -> v).toArray();
    }
}
