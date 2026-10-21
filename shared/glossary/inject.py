"""Inline the shared glossary + jargon helper into each course HTML (idempotent; marker-delimited)."""
import re,sys,os
H=os.path.dirname(os.path.abspath(__file__)); R=os.path.dirname(os.path.dirname(H))
DATA=open(H+'/glossary-data.js').read(); JS=open(H+'/lineguides.js').read()+'\n'+open(H+'/jargon.js').read()
FILES={
 '02-learning-hub-v1/index.html':'.view.active',
 '03-skills-academy/index.html':'#main',
 '04-interactive-tutorial/Improved_Interactive_Tutorial_with_Tesla_Track.html':'.lesson-article,.sim-card,.drill',
 '04-interactive-tutorial/Improved_Interactive_Tutorial.html':'.lesson-article,.sim-card,.drill',
 '05-tesla-track/Tesla_FSD_AI_Optimus_Track.html':'.lesson-article,.sim-card,.drill',
 '06-leetcode-interview-prep/index.html':'#app',
 '04-interactive-tutorial/videos/oct20/index.html':'body',
}
for f,roots in FILES.items():
    p=R+'/'+f; s=open(p).read()
    s=re.sub(r'<!--JARGON-START-->.*?<!--JARGON-END-->\n?','',s,flags=re.S)
    blk=f'<!--JARGON-START--><script>{DATA}window.JARGON_ROOTS={roots!r};</script><script>{JS}</script><!--JARGON-END-->\n'
    i=s.rfind('</body>'); s=s[:i]+blk+s[i:] if i>=0 else s+blk
    open(p,'w').write(s); print('injected',f)
