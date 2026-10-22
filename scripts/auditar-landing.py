import re,sys
from playwright.sync_api import sync_playwright
F='/home/claude/instabarber/landing/index.html'
URL="file://"+F
raw=open(F,encoding='utf-8').read()
html=re.sub(r'data:[a-z/+]+;base64,[A-Za-z0-9+/=]+','DATA',raw)
prob=[]
# 1. estrutura
ids=re.findall(r'\sid="([^"]+)"',html)
for i in set(ids):
    if ids.count(i)>1: prob.append(f"id duplicado: {i}")
css=" ".join(re.findall(r'<style>(.*?)</style>',html,re.S))
cls=re.findall(r'(?m)^\.([a-z][\w-]*)\s*\{',css)
for c in set(cls):
    if cls.count(c)>1: prob.append(f"classe com regra base repetida (possível colisão): .{c}")
for h in re.findall(r'href="#([^"]+)"',html):
    if h not in ids: prob.append(f"âncora sem destino: #{h}")
# 2. escrita (pt-PT)
texto=re.sub(r'<(script|style)[^>]*>.*?</\1>','',html,flags=re.S); texto=re.sub(r'<[^>]+>',' ',texto)
br={'você':'tu/o senhor','vocês':'vós/vocês ok?','celular':'telemóvel','cadastr':'registo','equipe':'equipa','tela ':'ecrã','arquivo':'ficheiro','gerenciar':'gerir','agendamento':'marcação','usuário':'utilizador','baixar':'descarregar','clicar':'clicar ok','time ':'equipa','compartilh':'partilh','contato':'contacto','ação ':'ok','facial':'','ótimo':'ok','pra ':'para','a gente':'nós','legal':'','rápido':'ok','e-mail':'ok','fazer o login':'iniciar sessão','deletar':'apagar','salvar':'guardar','ativar':'ok','confira':'confirma','grátis':'ok'}
bad={'você':'tu','vocês':'vocês','celular':'telemóvel','cadastr':'registo','equipe':'equipa','tela ':'ecrã','arquivo':'ficheiro','gerenciar':'gerir','agendamento':'marcação','usuário':'utilizador','baixar':'descarregar','compartilh':'partilh','contato':'contacto','pra ':'para','a gente':'nós','deletar':'apagar','salvar':'guardar','confira':'confirma','gerente':'gestor?','fidelizaç':'ok'}
for k,v in bad.items():
    if k in texto.lower() and v not in ('ok','','gestor?','ok?'): 
        for m in re.finditer(re.escape(k),texto.lower()): prob.append(f"possível brasileirismo «{k}» → {v}: …{texto[max(0,m.start()-30):m.end()+30].strip()}…")
for pat,msg in ((r'  +(?=\S)',None),(r'\s[,.;:!?]',"espaço antes de pontuação"),(r'[,;:][^\s\d"<)/]',"falta espaço depois de pontuação"),(r'\.\.(?!\.)',"dois pontos"),(r'[A-Za-zÀ-ú]"[A-Za-zÀ-ú]',"aspas"),(r'(?i)\b(\w{3,})\s+\1\b',"palavra repetida")):
    if msg:
        for m in re.finditer(pat,texto):
            s=texto[max(0,m.start()-25):m.end()+25].replace('\n',' ')
            if 'http' in s or '@' in s or '.pt' in s or '.com' in s: continue
            prob.append(f"{msg}: …{s}…")
for pt in ('Instabarber','Insta Barber','instabarber ','Instabarber'):
    for m in re.finditer(re.escape(pt),texto):
        if pt!='instabarber ' : prob.append(f"marca mal escrita: {pt}")
# 3. layout
JS="""()=>{const out=[];const vw=innerWidth;
document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const cs=getComputedStyle(e);if(cs.position==='fixed')return;
 if(r.right>vw+1||r.left<-1)out.push('fora do ecrã: '+e.tagName+'.'+e.className+' '+(e.textContent||'').slice(0,30));
 const p=e.parentElement;if(p&&p!==document.body&&getComputedStyle(p).overflow==='visible'){const pr=p.getBoundingClientRect();if(pr.width&&(r.right>pr.right+2||r.left<pr.left-2)&&cs.display!=='inline')out.push('sai do contentor: '+e.tagName+'.'+e.className+' em '+p.tagName+'.'+p.className+' «'+(e.textContent||'').trim().slice(0,30)+'»');}
 if(e.scrollWidth>e.clientWidth+2&&['hidden','clip'].includes(cs.overflowX)&&e.clientWidth>0)out.push('texto cortado: '+e.tagName+'.'+e.className);
 if(e.matches('button,a.btn,.btn')&&r.height<40&&r.width>0)out.push('alvo de toque pequeno: '+(e.textContent||'').trim().slice(0,30)+' '+Math.round(r.height)+'px');
});
document.querySelectorAll('img').forEach(i=>{if(!i.complete||!i.naturalWidth)out.push('imagem não carrega: '+i.alt)});
return out}"""
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (1280,768,390,360):
        pg=b.new_page(viewport={"width":w,"height":900}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
        pg.goto(URL)
        for x in errs: prob.append(f"[{w}] erro JS: {x}")
        if pg.evaluate("document.documentElement.scrollWidth>innerWidth"): prob.append(f"[{w}] scroll horizontal")
        for x in pg.evaluate(JS): prob.append(f"[{w}] {x}")
        # ligações
        if w==390:
            for a in pg.query_selector_all('a[href^="#"]'):
                h=a.get_attribute('href')
                if h!='#' and not pg.query_selector(h): prob.append(f"link sem destino {h}")
        pg.screenshot(path=f"aud_top_{w}.png")
        if w in (1280,390): pg.locator("#contacto").screenshot(path=f"aud_contacto_{w}.png"); pg.locator("#calculadora").screenshot(path=f"aud_calc_{w}.png")
    b.close()
seen=set(); 
for x in prob:
    if x not in seen: print("-",x); seen.add(x)
print("TOTAL",len(seen))
