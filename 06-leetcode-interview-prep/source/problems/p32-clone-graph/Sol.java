import java.util.*;
// Clone Graph - BFS with a map original->clone.  O(V+E).
class GNode { int val; List<GNode> nb = new ArrayList<>(); GNode(int v) { val = v; } }
class Solution {
    public int[][] cloneGraph(int[][] adj) {
        int n = adj.length; GNode[] orig = new GNode[n];
        for (int i = 0; i < n; i++) orig[i] = new GNode(i + 1);
        for (int i = 0; i < n; i++) for (int j : adj[i]) orig[i].nb.add(orig[j - 1]);
        Map<GNode, GNode> copy = new IdentityHashMap<>();
        ArrayDeque<GNode> q = new ArrayDeque<>(); q.add(orig[0]); copy.put(orig[0], new GNode(1));
        while (!q.isEmpty()) {
            GNode cur = q.poll();
            for (GNode nb : cur.nb) {
                if (!copy.containsKey(nb)) { copy.put(nb, new GNode(nb.val)); q.add(nb); }
                copy.get(cur).nb.add(copy.get(nb));
            }
        }
        Set<GNode> originals = Collections.newSetFromMap(new IdentityHashMap<>()); originals.addAll(Arrays.asList(orig));
        int[][] out = new int[n][0];
        for (GNode c : copy.values()) {
            if (originals.contains(c)) return new int[0][];
            int[] row = new int[c.nb.size()];
            for (int k = 0; k < row.length; k++) { if (originals.contains(c.nb.get(k))) return new int[0][]; row[k] = c.nb.get(k).val; }
            out[c.val - 1] = row;
        }
        return out;
    }
}
