// Util.java - shared helpers for the Java solutions (tree/list types, parsing, printing)
import java.util.*;
class TreeNode { int val; TreeNode left, right; TreeNode(int v){ val=v; } }
class ListNode { int val; ListNode next; ListNode(int v){ val=v; } }
class Util {
  static TreeNode parseTree(String s){
    s=s.replace("[","").replace("]","").replace(" ","");
    if(s.isEmpty()) return null; String[] t=s.split(",");
    if(t[0].equals("null")) return null;
    TreeNode root=new TreeNode(Integer.parseInt(t[0])); ArrayDeque<TreeNode> q=new ArrayDeque<>(); q.add(root); int i=1;
    while(!q.isEmpty() && i<t.length){ TreeNode n=q.poll();
      if(i<t.length && !t[i].equals("null")){ n.left=new TreeNode(Integer.parseInt(t[i])); q.add(n.left);} i++;
      if(i<t.length && !t[i].equals("null")){ n.right=new TreeNode(Integer.parseInt(t[i])); q.add(n.right);} i++; }
    return root; }
  static ListNode parseList(int[] v){ ListNode d=new ListNode(0), t=d; for(int x: v){ t.next=new ListNode(x); t=t.next; } return d.next; }
  static String s(Object o){
    if(o==null) return "[]";
    if(o instanceof Boolean) return ((Boolean)o)?"true":"false";
    if(o instanceof Double) return String.format(Locale.ROOT,"%.5f",(Double)o);
    if(o instanceof String) return "\""+o+"\"";
    if(o instanceof int[]){ int[] a=(int[])o; StringBuilder b=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0) b.append(","); b.append(a[i]); } return b.append("]").toString(); }
    if(o instanceof Object[]){ Object[] a=(Object[])o; StringBuilder b=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0) b.append(","); b.append(s(a[i])); } return b.append("]").toString(); }
    if(o instanceof List){ List<?> a=(List<?>)o; StringBuilder b=new StringBuilder("["); for(int i=0;i<a.size();i++){ if(i>0) b.append(","); b.append(s(a.get(i))); } return b.append("]").toString(); }
    if(o instanceof TreeNode){ List<String> out=new ArrayList<>(); ArrayDeque<Object> q=new ArrayDeque<>(); q.add(o); final Object NUL=new Object();
      while(!q.isEmpty()){ Object x=q.poll(); if(x==NUL){ out.add("null"); continue; } TreeNode n=(TreeNode)x; out.add(""+n.val); q.add(n.left==null?NUL:n.left); q.add(n.right==null?NUL:n.right); }
      while(!out.isEmpty() && out.get(out.size()-1).equals("null")) out.remove(out.size()-1);
      return "["+String.join(",",out)+"]"; }
    if(o instanceof ListNode){ List<Integer> v=new ArrayList<>(); ListNode n=(ListNode)o; while(n!=null){ v.add(n.val); n=n.next; } return s(v); }
    return o.toString(); }
}
// T - execution tracer for the Java visualizer. T.r("name", value, ...) records the line + locals;
// the call stack is read with StackWalker, so no enter/exit calls are needed. Disabled unless T.on.
class T {
  static boolean on = false; static final List<String> steps = new ArrayList<>(); static final Map<Integer,String> fv = new HashMap<>();
  static String esc(String s){ return "\"" + s.replace("\\","\\\\").replace("\"","\\\"") + "\""; }
  static String j(Object o){
    if(o==null) return "null";
    if(o instanceof Integer||o instanceof Long||o instanceof Short) return o.toString();
    if(o instanceof Double){ double d=(Double)o; return Double.isInfinite(d)?"\"inf\"":String.format(Locale.ROOT,"%.4g",d); }
    if(o instanceof Boolean) return o.toString();
    if(o instanceof Character||o instanceof String) return esc(o.toString());
    if(o instanceof int[]){ int[] a=(int[])o; StringBuilder b=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0)b.append(','); b.append(a[i]); } return b.append(']').toString(); }
    if(o instanceof long[]){ long[] a=(long[])o; StringBuilder b=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0)b.append(','); b.append(a[i]); } return b.append(']').toString(); }
    if(o instanceof boolean[]){ boolean[] a=(boolean[])o; StringBuilder b=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0)b.append(','); b.append(a[i]); } return b.append(']').toString(); }
    if(o instanceof char[]) return j(new String((char[])o).chars().mapToObj(c->(char)c).collect(java.util.stream.Collectors.toList()));
    if(o instanceof Object[]) return j(Arrays.asList((Object[])o));
    if(o instanceof TreeNode){ List<String> out=new ArrayList<>(); ArrayDeque<Object> q=new ArrayDeque<>(); q.add(o); Object N=new Object();
      while(!q.isEmpty()){ Object x=q.poll(); if(x==N){ out.add("null"); continue; } TreeNode n=(TreeNode)x; out.add(""+n.val); q.add(n.left==null?N:n.left); q.add(n.right==null?N:n.right); }
      while(!out.isEmpty()&&out.get(out.size()-1).equals("null")) out.remove(out.size()-1); return "{\"tree\":["+String.join(",",out)+"]}"; }
    if(o instanceof ListNode){ StringBuilder b=new StringBuilder("{\"list\":["); ListNode n=(ListNode)o; int c=0; while(n!=null&&c<50){ if(c++>0)b.append(','); b.append(n.val); n=n.next; } return b.append("]}").toString(); }
    if(o instanceof PriorityQueue){ List<Object> v=new ArrayList<>(); PriorityQueue<Object> q=new PriorityQueue<>((PriorityQueue<Object>)o); while(!q.isEmpty()) v.add(q.poll()); return "{\"heap\":"+j(v)+"}"; }
    if(o instanceof Map){ TreeMap<String,Object> m=new TreeMap<>(); for(Map.Entry<?,?> e:((Map<?,?>)o).entrySet()) m.put(String.valueOf(e.getKey()),e.getValue());
      StringBuilder b=new StringBuilder("{\"map\":{"); boolean f=true; for(Map.Entry<String,Object> e:m.entrySet()){ if(!f)b.append(','); f=false; b.append(esc(e.getKey())).append(':').append(j(e.getValue())); } return b.append("}}").toString(); }
    if(o instanceof Set){ List<String> v=new ArrayList<>(); for(Object x:(Set<?>)o) v.add(j(x)); Collections.sort(v); return "{\"set\":["+String.join(",",v)+"]}"; }
    if(o instanceof Collection){ StringBuilder b=new StringBuilder("["); boolean f=true; for(Object x:(Collection<?>)o){ if(!f)b.append(','); f=false; b.append(j(x)); } return b.append(']').toString(); }
    return esc(o.toString()); }
  static void r(Object... kv){
    if(!on||steps.size()>=600) return;
    List<StackWalker.StackFrame> fr=StackWalker.getInstance().walk(s->s.filter(f->{String c=f.getClassName(); return !c.equals("T")&&!c.equals("Main")&&!c.startsWith("java.")&&!c.startsWith("jdk.");}).collect(java.util.stream.Collectors.toList()));
    int depth=fr.size(); StringBuilder v=new StringBuilder("{");
    for(int i=0;i+1<kv.length;i+=2){ if(i>0)v.append(','); v.append(esc((String)kv[i])).append(':').append(j(kv[i+1])); }
    fv.put(depth,v.append('}').toString()); fv.keySet().removeIf(d->d>depth);
    StringBuilder s=new StringBuilder("{\"l\":"+fr.get(0).getLineNumber()+",\"k\":\"step\",\"s\":[");
    for(int d=1;d<=depth;d++){ if(d>1)s.append(','); String name=fr.get(depth-d).getMethodName(); if(name.startsWith("lambda$")) name="lambda"; s.append("{\"f\":"+esc(name)+",\"v\":"+fv.getOrDefault(d,"{}")+"}"); }
    steps.add(s.append("]}").toString()); }
  static List<Object> rev(Collection<?> c){ List<Object> l=new ArrayList<>(c); Collections.reverse(l); return l; }   // ArrayDeque-as-stack iterates top-first
  static List<Integer> vals(Collection<ListNode> c){ List<Integer> l=new ArrayList<>(); for(ListNode x:c) l.add(x.val); Collections.sort(l); return l; }   // heap of list nodes -> sorted values
  static String dump(){ return "{\"truncated\":"+(steps.size()>=600)+",\"steps\":["+String.join(",",steps)+"]}"; }
}
