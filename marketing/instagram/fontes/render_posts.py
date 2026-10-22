"""Uso: python3 render_posts.py posts5.html a b c [largura] [altura]
Cada argumento depois do HTML é o id de uma secção (#a, #b...). Gera saida/<id>.png.
Mostra o excesso de conteúdo (overflow) de cada peça: tem de ser 0."""
import sys, os
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)) + '/'
html = sys.argv[1]
args = sys.argv[2:]
w, h = 1080, 1350
if len(args) >= 2 and args[-1].isdigit() and args[-2].isdigit():
    w, h = int(args[-2]), int(args[-1]); args = args[:-2]
os.makedirs(D + 'saida', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': w, 'height': h})
    pg.goto('file://' + D + html); pg.wait_for_timeout(700)
    for i in args:
        over = pg.evaluate("(i)=>{const e=document.getElementById(i);return e.scrollHeight-e.clientHeight}", i)
        print(i, 'overflow', over)
        pg.locator('#' + i).screenshot(path=D + f'saida/{html[:-5]}-{i}.png')
    b.close()
