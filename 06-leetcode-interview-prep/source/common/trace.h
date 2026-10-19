// trace.h - instrumentation used ONLY when compiled with -DTRACE.
// TR("name",value,...) records the current line + locals; FN("f") pushes a call-stack frame (popped automatically).
#pragma once
#ifdef TRACE
namespace tr {
using namespace std;
inline string esc(const string& s){ string r="\""; for(char c: s){ if(c=='"'||c=='\\'){r+='\\';r+=c;} else if(c=='\n') r+="\\n"; else r+=c; } return r+"\""; }
inline string J(int v){ return to_string(v); }
inline string J(long v){ return to_string(v); }
inline string J(long long v){ return to_string(v); }
inline string J(unsigned v){ return to_string(v); }
inline string J(unsigned long v){ return to_string(v); }
inline string J(double v){ if(std::isinf(v)) return "\"inf\""; char b[48]; snprintf(b,sizeof b,"%.4g",v); return b; }
inline string J(bool v){ return v?"true":"false"; }
inline string J(char c){ return esc(string(1,c)); }
inline string J(const string& s){ return esc(s); }
inline string J(const char* s){ return esc(s); }
inline string J(TreeNode* root){ // level order with nulls -> {"tree":[...]}
  vector<string> out; queue<TreeNode*> q; q.push(root);
  while(!q.empty()){ TreeNode* n=q.front(); q.pop(); if(!n){ out.push_back("null"); continue;} out.push_back(to_string(n->val)); q.push(n->left); q.push(n->right);}
  while(!out.empty()&&out.back()=="null") out.pop_back();
  string r="{\"tree\":["; for(size_t i=0;i<out.size();i++){ if(i) r+=","; r+=out[i]; } return r+"]}"; }
inline string J(ListNode* n){ string r="{\"list\":["; int c=0; while(n && c<50){ if(c) r+=","; r+=to_string(n->val); n=n->next; c++; } return r+"]}"; }
template<class A,class B> string J(const pair<A,B>& p);
template<class T> string J(const vector<T>& v);
template<class T> string J(const deque<T>& v);
template<class T> string J(const list<T>& v);
template<class T> string J(const set<T>& v);
template<class T> string J(const unordered_set<T>& v);
template<class K,class V> string J(const map<K,V>& m);
template<class K,class V> string J(const unordered_map<K,V>& m);
template<class T,class C,class Cmp> string J(priority_queue<T,C,Cmp> q);
template<class T> string J(queue<T> q);
template<class T> string J(stack<T> q);
template<class It> string arr(It b, It e){ string r="["; bool f=true; for(;b!=e;++b){ if(!f) r+=","; f=false; r+=J(*b);} return r+"]"; }
template<class A,class B> string J(const pair<A,B>& p){ return "["+J(p.first)+","+J(p.second)+"]"; }
template<class T> string J(const vector<T>& v){ return arr(v.begin(),v.end()); }
template<class T> string J(const deque<T>& v){ return arr(v.begin(),v.end()); }
template<class T> string J(const list<T>& v){ return arr(v.begin(),v.end()); }
template<class T> string J(const set<T>& v){ return "{\"set\":"+arr(v.begin(),v.end())+"}"; }
template<class T> string J(const unordered_set<T>& v){ set<T> s(v.begin(),v.end()); return J(s); }
template<class K> string key(const K& k){ string s=J(k); if(s.size() && s[0]=='"') return s; return esc(s); }
template<class K,class V> string J(const map<K,V>& m){ string r="{\"map\":{"; bool f=true; for(auto& kv: m){ if(!f) r+=","; f=false; r+=key(kv.first)+":"+J(kv.second);} return r+"}}"; }
template<class K,class V> string J(const unordered_map<K,V>& m){ map<K,V> o(m.begin(),m.end()); return J(o); }
template<class T,class C,class Cmp> string J(priority_queue<T,C,Cmp> q){ vector<T> v; while(!q.empty()){ v.push_back(q.top()); q.pop(); } return "{\"heap\":"+J(v)+"}"; }
template<class T> string J(queue<T> q){ vector<T> v; while(!q.empty()){ v.push_back(q.front()); q.pop(); } return "{\"queue\":"+J(v)+"}"; }
template<class T> string J(stack<T> q){ vector<T> v; while(!q.empty()){ v.push_back(q.top()); q.pop(); } reverse(v.begin(),v.end()); return "{\"stack\":"+J(v)+"}"; }
struct Frame { string fn; string vars; };
inline vector<Frame> st; inline vector<string> steps; inline bool full=false; inline int lastLine=0;
inline string stackJson(){ string r="["; for(size_t i=0;i<st.size();i++){ if(i) r+=","; r+="{\"f\":"+esc(st[i].fn)+",\"v\":"+st[i].vars+"}"; } return r+"]"; }
inline void push(const string& kind,int line){ if(steps.size()>=600){ full=true; return; } steps.push_back("{\"l\":"+to_string(line)+",\"k\":\""+kind+"\",\"s\":"+stackJson()+"}"); }
inline void vars(string&){}
template<class V,class... R> void vars(string& o,const char* n,const V& v,R&&... rest){ if(o.size()>1) o+=","; o+=esc(n)+":"+J(v); vars(o,rest...); }
template<class... A> void emit(int line,A&&... a){ string o="{"; vars(o,a...); o+="}"; if(!st.empty()) st.back().vars=o; lastLine=line; push("step",line); }
struct Scope { Scope(const string& n,int line){ st.push_back({n,"{}"}); lastLine=line; push("call",line);} ~Scope(){ push("ret",lastLine); st.pop_back(); } };
inline void dump(){ printf("{\"truncated\":%s,\"steps\":[",full?"true":"false"); for(size_t i=0;i<steps.size();i++){ if(i) printf(","); printf("%s",steps[i].c_str()); } printf("]}\n"); }
}
#define FN(n) tr::Scope _tr_scope(n,__LINE__)
#define TR(...) tr::emit(__LINE__,__VA_ARGS__)
#else
#define FN(n)
#define TR(...)
#endif
