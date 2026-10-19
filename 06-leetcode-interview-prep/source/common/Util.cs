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
// T - execution tracer for the C# visualizer. T.R("name", value, ...) records the line + locals;
// the call stack comes from System.Diagnostics.StackTrace. Disabled unless T.On.
public static class T {
  public static bool On = false; static readonly List<string> steps = new List<string>(); static readonly Dictionary<int,string> fv = new Dictionary<int,string>();
  static string Esc(string s) => "\"" + s.Replace("\\","\\\\").Replace("\"","\\\"") + "\"";
  public static string J(object o){
    if(o==null) return "null";
    if(o is int||o is long||o is short||o is uint) return Convert.ToString(o,CultureInfo.InvariantCulture);
    if(o is double d) return double.IsInfinity(d)?"\"inf\"":d.ToString("G4",CultureInfo.InvariantCulture);
    if(o is bool b) return b?"true":"false";
    if(o is char||o is string) return Esc(o.ToString());
    if(o is TreeNode tn){ var outv=new List<string>(); var q=new Queue<TreeNode>(); q.Enqueue(tn); while(q.Count>0){ var n=q.Dequeue(); if(n==null){ outv.Add("null"); continue; } outv.Add(n.val.ToString()); q.Enqueue(n.left); q.Enqueue(n.right); }
      while(outv.Count>0&&outv[outv.Count-1]=="null") outv.RemoveAt(outv.Count-1); return "{\"tree\":["+string.Join(",",outv)+"]}"; }
    if(o is ListNode ln){ var v=new List<string>(); int c=0; while(ln!=null&&c++<50){ v.Add(ln.val.ToString()); ln=ln.next; } return "{\"list\":["+string.Join(",",v)+"]}"; }
    if(o is System.Runtime.CompilerServices.ITuple t){ var v=new List<string>(); for(int i=0;i<t.Length;i++) v.Add(J(t[i])); return "["+string.Join(",",v)+"]"; }
    var ty=o.GetType();
    if(ty.IsGenericType&&ty.GetGenericTypeDefinition()==typeof(PriorityQueue<,>)){ var items=(IEnumerable)ty.GetProperty("UnorderedItems").GetValue(o); var v=new List<(string,IComparable)>();
      foreach(var it in items){ var tt=(System.Runtime.CompilerServices.ITuple)it; v.Add((J(tt[0]),(IComparable)tt[1])); } v.Sort((a,c)=>a.Item2.CompareTo(c.Item2)); return "{\"heap\":["+string.Join(",",v.ConvertAll(x=>x.Item1))+"]}"; }
    if(o is IDictionary dict){ var keys=new List<string>(); var m=new SortedDictionary<string,string>(StringComparer.Ordinal); foreach(DictionaryEntry e in dict) m[Convert.ToString(e.Key,CultureInfo.InvariantCulture)]=J(e.Value);
      var parts=new List<string>(); foreach(var kv in m) parts.Add(Esc(kv.Key)+":"+kv.Value); return "{\"map\":{"+string.Join(",",parts)+"}}"; }
    if(ty.IsGenericType&&(ty.GetGenericTypeDefinition()==typeof(HashSet<>)||ty.GetGenericTypeDefinition()==typeof(SortedSet<>))){ var v=new List<string>(); foreach(var x in (IEnumerable)o) v.Add(J(x)); v.Sort(StringComparer.Ordinal); return "{\"set\":["+string.Join(",",v)+"]}"; }
    if(ty.IsGenericType&&ty.GetGenericTypeDefinition()==typeof(Stack<>)){ var v=new List<string>(); foreach(var x in (IEnumerable)o) v.Add(J(x)); v.Reverse(); return "{\"stack\":["+string.Join(",",v)+"]}"; }
    if(o is IEnumerable en){ var v=new List<string>(); foreach(var x in en) v.Add(J(x)); return "["+string.Join(",",v)+"]"; }
    return Esc(o.ToString()); }
  public static void R(params object[] kv){
    if(!On||steps.Count>=600) return;
    var st=new System.Diagnostics.StackTrace(1,true); var fr=new List<System.Diagnostics.StackFrame>();
    foreach(var f in st.GetFrames()){ var m=f.GetMethod(); var dt=m?.DeclaringType; if(dt==null) continue; var ns=dt.Namespace??""; if(dt==typeof(T)||dt.Name=="MainClass"||ns.StartsWith("System")) continue; fr.Add(f); }
    int depth=fr.Count; var v=new List<string>();
    for(int i=0;i+1<kv.Length;i+=2) v.Add(Esc((string)kv[i])+":"+J(kv[i+1]));
    fv[depth]="{"+string.Join(",",v)+"}"; foreach(var k in new List<int>(fv.Keys)) if(k>depth) fv.Remove(k);
    var fs=new List<string>();
    for(int dd=1;dd<=depth;dd++){ var name=fr[depth-dd].GetMethod().Name; if(name.Contains("<")) name="lambda"; fs.Add("{\"f\":"+Esc(name)+",\"v\":"+(fv.TryGetValue(dd,out var x)?x:"{}")+"}"); }
    steps.Add("{\"l\":"+fr[0].GetFileLineNumber()+",\"k\":\"step\",\"s\":["+string.Join(",",fs)+"]}"); }
  public static List<int> Vals(PriorityQueue<ListNode,int> q){ var l=new List<int>(); foreach(var (e,_) in q.UnorderedItems) l.Add(e.val); l.Sort(); return l; }
  public static string Dump() => "{\"truncated\":"+(steps.Count>=600?"true":"false")+",\"steps\":["+string.Join(",",steps)+"]}";
}
