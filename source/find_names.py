import re, json, sys
PATS = {
 "jsx": r',(\w+)=(\w+),(\w+)=\2;var \w+=\w+\(null\),\w+=\(e\)=>e\.replace',
 "useState": r'(\w+)=function\(e\)\{return \w+\.H\.useState\(e\)\}',
 "useMemo": r'(\w+)=function\(e,t\)\{return \w+\.H\.useMemo\(e,t\)\}',
 "useRef": r'(\w+)=function\(e\)\{return \w+\.H\.useRef\(e\)\}',
 "useEffect": r'(\w+)=function\(e,t\)\{return \w+\.H\.useEffect\(e,t\)\}',
 "useCallback": r'(\w+)=function\(e,t\)\{return \w+\.H\.useCallback\(e,t\)\}',
 "Slider": r'function (\w+)\(\{label:e,value:t,min:a,max:n,step:s=1,onChange:r',
 "Toggle": r'function (\w+)\(\{label:e,value:t,onChange:a\}\)\{return \w+\("button",\{type:"button",className:`sim-toggle',
 "Choice": r'function (\w+)\(\{options:e,value:t,onChange:a,label:n\}\)\{return \w+\("div",\{className:"sim-choice"',
 "Bar": r'function (\w+)\(\{label:e,value:t,max:a=100,tone:n,text:s\}\)',
 "Verdict": r'function (\w+)\(\{ok:e,children:t\}\)\{return \w+\("div",\{className:`sim-verdict',
 "TL": r'function (\w+)\(e,t\)\{return \w+\("span",\{className:"two-layer"',
}
def find(s):
    out = {}
    for k, p in PATS.items():
        m = re.search(p, s)
        if not m: out[k] = None; continue
        out[k] = m.group(2) if k == "jsx" else m.group(1)
    return out
if __name__ == "__main__":
    for b in sys.argv[1:]:
        print(b, json.dumps(find(open(b).read())))
