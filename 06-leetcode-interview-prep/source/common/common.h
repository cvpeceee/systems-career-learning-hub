// common.h - shared helpers for the C++ solutions (tree/list types, parsing, printing)
#pragma once
#include <bits/stdc++.h>
using namespace std;
struct TreeNode { int val; TreeNode *left, *right; TreeNode(int v):val(v),left(nullptr),right(nullptr){} };
struct ListNode { int val; ListNode *next; ListNode(int v):val(v),next(nullptr){} };
#include "trace.h"
namespace util {
inline TreeNode* parseTree(const string& s){
  vector<string> tok; string cur;
  for(char c: s){ if(c=='['||c==']'||c==' ') continue; if(c==','){tok.push_back(cur);cur.clear();} else cur+=c; }
  if(!cur.empty()) tok.push_back(cur);
  if(tok.empty()||tok[0]=="null") return nullptr;
  TreeNode* root=new TreeNode(stoi(tok[0])); queue<TreeNode*> q; q.push(root); size_t i=1;
  while(!q.empty() && i<tok.size()){ TreeNode* n=q.front(); q.pop();
    if(i<tok.size() && tok[i]!="null"){ n->left=new TreeNode(stoi(tok[i])); q.push(n->left);} i++;
    if(i<tok.size() && tok[i]!="null"){ n->right=new TreeNode(stoi(tok[i])); q.push(n->right);} i++; }
  return root; }
inline void freeTree(TreeNode* n){ if(!n) return; freeTree(n->left); freeTree(n->right); delete n; }
inline ListNode* parseList(const vector<int>& v){ ListNode d(0); ListNode* t=&d; for(int x: v){ t->next=new ListNode(x); t=t->next;} return d.next; }
inline void freeList(ListNode* n){ while(n){ ListNode* x=n->next; delete n; n=x; } }
inline string S(int v){ return to_string(v); }
inline string S(long long v){ return to_string(v); }
inline string S(bool v){ return v?"true":"false"; }
inline string S(double v){ char b[64]; snprintf(b,sizeof b,"%.5f",v); return b; }
inline string S(const string& s){ return "\""+s+"\""; }
template<class T> string S(const vector<T>& v){ string r="["; for(size_t i=0;i<v.size();i++){ if(i) r+=","; r+=S(v[i]); } return r+"]"; }
inline string S(TreeNode* root){ vector<string> out; queue<TreeNode*> q; q.push(root);
  while(!q.empty()){ TreeNode* n=q.front(); q.pop(); if(!n){ out.push_back("null"); continue;} out.push_back(to_string(n->val)); q.push(n->left); q.push(n->right);}
  while(!out.empty()&&out.back()=="null") out.pop_back();
  string r="["; for(size_t i=0;i<out.size();i++){ if(i) r+=","; r+=out[i]; } return r+"]"; }
inline string S(ListNode* n){ vector<int> v; while(n){ v.push_back(n->val); n=n->next;} return S(v); }
}
