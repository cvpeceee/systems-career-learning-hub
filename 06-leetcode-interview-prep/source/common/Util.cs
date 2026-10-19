// Util.cs - shared helpers for the C# solutions (tree/list types, parsing, printing)
using System; using System.Collections; using System.Collections.Generic; using System.Globalization; using System.Text;
public class TreeNode { public int val; public TreeNode left, right; public TreeNode(int v){ val=v; } }
public class ListNode { public int val; public ListNode next; public ListNode(int v){ val=v; } }
public static class Util {
  public static TreeNode ParseTree(string s){
    s=s.Replace("[","").Replace("]","").Replace(" ","");
    if(s.Length==0) return null; var t=s.Split(',');
    if(t[0]=="null") return null;
    var root=new TreeNode(int.Parse(t[0])); var q=new Queue<TreeNode>(); q.Enqueue(root); int i=1;
    while(q.Count>0 && i<t.Length){ var n=q.Dequeue();
      if(i<t.Length && t[i]!="null"){ n.left=new TreeNode(int.Parse(t[i])); q.Enqueue(n.left);} i++;
      if(i<t.Length && t[i]!="null"){ n.right=new TreeNode(int.Parse(t[i])); q.Enqueue(n.right);} i++; }
    return root; }
  public static ListNode ParseList(int[] v){ var d=new ListNode(0); var t=d; foreach(int x in v){ t.next=new ListNode(x); t=t.next; } return d.next; }
  public static string S(object o){
    if(o==null) return "[]";
    if(o is bool b) return b?"true":"false";
    if(o is double d) return d.ToString("F5",CultureInfo.InvariantCulture);
    if(o is string str) return "\""+str+"\"";
    if(o is TreeNode tn){ var outv=new List<string>(); var q=new Queue<TreeNode>(); q.Enqueue(tn);
      while(q.Count>0){ var n=q.Dequeue(); if(n==null){ outv.Add("null"); continue; } outv.Add(n.val.ToString()); q.Enqueue(n.left); q.Enqueue(n.right); }
      while(outv.Count>0 && outv[outv.Count-1]=="null") outv.RemoveAt(outv.Count-1);
      return "["+string.Join(",",outv)+"]"; }
    if(o is ListNode ln){ var v=new List<int>(); while(ln!=null){ v.Add(ln.val); ln=ln.next; } return S(v); }
    if(o is IEnumerable e){ var sb=new StringBuilder("["); bool f=true; foreach(var x in e){ if(!f) sb.Append(","); f=false; sb.Append(S(x)); } return sb.Append("]").ToString(); }
    return Convert.ToString(o,CultureInfo.InvariantCulture); }
}
