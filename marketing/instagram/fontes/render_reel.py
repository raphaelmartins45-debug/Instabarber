"""Uso: python3 render_reel.py reel.html nome-do-video
Reels 1080x1920, 30 s, 30 fps = 900 imagens. O HTML tem de expor window.setT(t) (t em segundos).
Precisa de Playwright (Chromium) e ffmpeg. Gera saida/<nome>.mp4 com faixa de áudio muda
(a música junta-se na app do Instagram, da Coleção de Sons)."""
import sys, os, subprocess, shutil
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)) + '/'
html, nome = sys.argv[1], sys.argv[2]
fr = D + 'frames_' + nome + '/'
os.makedirs(fr, exist_ok=True); os.makedirs(D + 'saida', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    pg.goto('file://' + D + html); pg.wait_for_timeout(500)
    for i in range(900):
        pg.evaluate(f'setT({i/30})')
        pg.screenshot(path=fr + f'f{i:04d}.jpg', type='jpeg', quality=92)
    b.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', fr + 'f%04d.jpg',
                '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p', '-crf', '20', '-c:a', 'aac', '-b:a', '96k', D + f'saida/{nome}.mp4'], check=True)
shutil.rmtree(fr)
print('ok', D + f'saida/{nome}.mp4')
