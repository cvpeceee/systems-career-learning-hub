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
