#!/usr/bin/env python3
"""Build + test every solution in C++ (ASan/UBSan), Java and C#, and record real C++ execution traces."""
import json, os, subprocess, sys, re, glob, shutil
ROOT=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(ROOT,'out'); COMMON=os.path.join(ROOT,'common')
def load(pid):
    ns={}; exec(open(os.path.join(ROOT,'problems',pid,'meta.py')).read(),ns); return ns['M']
def canon(v,t):
    if t=='bool': return 'true' if v else 'false'
    if t=='double': return '%.5f'%v
    if t in('int','long'): return str(v)
    if t=='string': return json.dumps(v)
    if t=='tree': return v.replace(' ','')
    if t=='list': return '['+','.join(map(str,v))+']'
    if t=='string[]': return '['+','.join(json.dumps(x) for x in v)+']'
    if isinstance(v,list): return '['+','.join(canon(x,'int[]' if t=='int[][]' or t=='lists' else 'int') for x in v)+']'
    raise Exception(t)
def cs_str(s): return json.dumps(s)
def lit(v,t,lang):
    if t=='bool': return 'true' if v else 'false'
    if t=='int': return str(v)
    if t=='long': return str(v)+('LL' if lang=='cpp' else 'L')
    if t=='double': return repr(float(v))
    if t=='string': return ('string(%s)' if lang=='cpp' else '%s')%json.dumps(v)
    if t=='int[]':
        b=','.join(map(str,v)); return {'cpp':'vector<int>{%s}','java':'new int[]{%s}','cs':'new int[]{%s}'}[lang]%b
    if t=='string[]':
        b=','.join(json.dumps(x) for x in v); return {'cpp':'vector<string>{%s}','java':'new String[]{%s}','cs':'new string[]{%s}'}[lang]%b
    if t=='int[][]':
        if lang=='cpp': return 'vector<vector<int>>{%s}'%','.join('{%s}'%','.join(map(str,r)) for r in v)
        if lang=='java': return 'new int[][]{%s}'%','.join('{%s}'%','.join(map(str,r)) for r in v)
        return 'new int[][]{%s}'%','.join('new int[]{%s}'%','.join(map(str,r)) for r in v)
    if t=='tree': return {'cpp':'util::parseTree(%s)','java':'Util.parseTree(%s)','cs':'Util.ParseTree(%s)'}[lang]%json.dumps(v)
    if t=='list':
        b=','.join(map(str,v)); return {'cpp':'util::parseList(vector<int>{%s})','java':'Util.parseList(new int[]{%s})','cs':'Util.ParseList(new int[]{%s})'}[lang]%b
    raise Exception(t)
def cpp_main(M,trace):
    sig=M['sig']; L=['#include "common.h"','#include "sol.cpp"','int main(){ int pass=0,total=0; (void)pass;']
    cases=[M['tests'][M.get('traceCase',0)]] if trace else M['tests']
    for i,c in enumerate(cases):
        L.append('{')
        for j,(n,t) in enumerate(sig['params']): L.append('  auto a%d=%s;'%(j,lit(c['args'][j],t,'cpp')))
        call='Solution().%s(%s)'%(sig['fn'],','.join('a%d'%j for j in range(len(sig['params']))))
        if trace: L.append('  auto r=%s; (void)r;'%call)
        else:
            L.append('  auto r=%s; string got=util::S(r); string exp=R"X(%s)X"; total++;'%(call,canon(c['expect'],sig['ret'])))
            L.append('  if(got==exp) pass++; else printf("FAIL case %d: got %%s expected %%s\\n",got.c_str(),exp.c_str());'%i)
        rt=sig['ret']
        for j,(n,t) in enumerate(sig['params']):
            if t in('tree','list') and rt!=t: L.append('  util::free%s(a%d);'%('Tree' if t=='tree' else 'List',j))
        if rt in('tree','list'): L.append('  util::free%s(r);'%('Tree' if rt=='tree' else 'List'))
        L.append('}')
    L.append('  tr::dump(); return 0; }' if trace else '  printf("PASS %d/%d\\n",pass,total); return pass==total?0:1; }')
    return '\n'.join(L)
def jc_main(M,lang):
    sig=M['sig']; fn=sig['fn'] if lang=='java' else sig['fn'][0].upper()+sig['fn'][1:]
    U='Util.s' if lang=='java' else 'Util.S'
    L=(['import java.util.*;','public class Main { public static void main(String[] argv){ int pass=0,total=0;'] if lang=='java'
       else ['using System; using System.Collections.Generic;','public static class MainClass { public static int Main(){ int pass=0,total=0;'])
    for i,c in enumerate(M['tests']):
        L.append('{')
        for j,(n,t) in enumerate(sig['params']): L.append('  var a%d=%s;'%(j,lit(c['args'][j],t,lang)))
        L.append('  object r=new Solution().%s(%s); string got=%s(r); string exp=%s; total++;'%(fn,','.join('a%d'%j for j in range(len(sig['params']))),U,json.dumps(canon(c['expect'],sig['ret']))))
        if lang=='java': L[-1]=L[-1].replace('object r','Object r').replace('string got','String got').replace('string exp','String exp')
        pr='System.out.println' if lang=='java' else 'Console.WriteLine'
        L.append('  if(got.equals(exp)) pass++; else %s("FAIL case %d: got "+got+" expected "+exp);'%(pr,i) if lang=='java'
                 else '  if(got==exp) pass++; else %s("FAIL case %d: got "+got+" expected "+exp);'%(pr,i))
        L.append('}')
    if lang=='java': L.append('  System.out.println("PASS "+pass+"/"+total); if(pass!=total) System.exit(1); } }')
    else: L.append('  Console.WriteLine("PASS "+pass+"/"+total); return pass==total?0:1; } }')
    return '\n'.join(L)
def sh(cmd,cwd): 
    p=subprocess.run(cmd,cwd=cwd,shell=True,capture_output=True,text=True,timeout=300); return p.returncode,p.stdout+p.stderr
def strip_trace(src):
    """Remove TR(...)/FN(...) lines; return display code and map original line -> display line."""
    lines=src.split('\n'); disp=[]; mp={}
    for i,l in enumerate(lines,1):
        if re.match(r'\s*(TR|FN)\(',l): mp[i]=-1; continue
        l=re.sub(r'(TR|FN)\((?:"[^"]*"|[^;"])*\);\s*','',l)
        disp.append(l); mp[i]=len(disp)
    # a TR line maps to the closest previous real line (the statement it reports on)
    last=1; fixed={}
    for i in range(1,len(lines)+1):
        if mp[i]==-1: fixed[i]=last
        else: fixed[i]=mp[i]; last=mp[i] if lines[i-1].strip() else last
    return '\n'.join(disp),fixed
def build(pid):
    M=load(pid); src=os.path.join(ROOT,'problems',pid); d=os.path.join(OUT,pid); shutil.rmtree(d,ignore_errors=True)
    res={}
    for lang in('cpp','java','cs'): os.makedirs(os.path.join(d,lang))
    # C++
    c=os.path.join(d,'cpp'); shutil.copy(os.path.join(src,'sol.cpp'),c)
    for f in('common.h','trace.h'): shutil.copy(os.path.join(COMMON,f),c)
    open(os.path.join(c,'main.cpp'),'w').write(cpp_main(M,False)); open(os.path.join(c,'trace.cpp'),'w').write(cpp_main(M,True))
    rc,o=sh('g++ -std=c++17 -g -O1 -Wall -Wextra -fsanitize=address,undefined -fno-sanitize-recover=all main.cpp -o t && ./t','%s'%c); res['cpp']=(rc==0,o.strip()[-600:])
    rc2,o2=sh('g++ -std=c++17 -O0 -DTRACE -fsanitize=address,undefined trace.cpp -o tr && ./tr',c)
    if rc2!=0: res['trace']=(False,o2[-600:]); trace=None
    else: trace=json.loads(o2.strip().split('\n')[-1]); res['trace']=(True,'%d steps'%len(trace['steps']))
    # Java
    j=os.path.join(d,'java'); shutil.copy(os.path.join(src,'Sol.java'),j); shutil.copy(os.path.join(COMMON,'Util.java'),j)
    open(os.path.join(j,'Main.java'),'w').write(jc_main(M,'java'))
    rc,o=sh('javac -Xlint:none -d . Util.java Sol.java Main.java && java -cp . Main',j); res['java']=(rc==0,o.strip()[-600:])
    # C#
    s=os.path.join(d,'cs'); shutil.copy(os.path.join(src,'Sol.cs'),s); shutil.copy(os.path.join(COMMON,'Util.cs'),s)
    open(os.path.join(s,'Main.cs'),'w').write(jc_main(M,'cs'))
    P=os.path.join(ROOT,'csproj')
    for f in glob.glob(P+'/*.cs'): os.remove(f)
    for f in glob.glob(s+'/*.cs'): shutil.copy(f,P)
    rc,o=sh('export DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1 PATH=/opt/dotnet:$PATH; rm -f bin/Debug/net8.0/t.dll; dotnet build -v q -nologo 2>&1 | grep -E "error|rror\\(s\\)" ; dotnet bin/Debug/net8.0/t.dll',P); res['cs']=(rc==0,o.strip()[-600:])
    raw=open(os.path.join(src,'sol.cpp')).read(); disp,mp=strip_trace(raw)
    if trace:
        for st in trace['steps']: st['l']=mp.get(st['l'],st['l'])
    code={'cpp':disp,'java':open(os.path.join(src,'Sol.java')).read(),'cs':open(os.path.join(src,'Sol.cs')).read()}
    json.dump({'meta':M,'code':code,'trace':trace,'results':{k:{'ok':v[0],'log':v[1]} for k,v in res.items()}},open(os.path.join(d,'bundle.json'),'w'))
    return res
if __name__=='__main__':
    ids=sys.argv[1:] or sorted(os.listdir(os.path.join(ROOT,'problems')))
    bad=0
    for pid in ids:
        r=build(pid); line=pid+': '+'  '.join('%s=%s'%(k,'OK' if v[0] else 'FAIL') for k,v in r.items())
        tail={k:v[1].split('\n')[-1] for k,v in r.items() if k!='trace'}
        print(line,'|',tail)
        for k,v in r.items():
            if not v[0]: bad+=1; print('---',k,'\n',v[1])
    sys.exit(1 if bad else 0)
