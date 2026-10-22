from playwright.sync_api import sync_playwright
URL="file:///home/claude/instabarber/landing/index.html"
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (1200,390):
        pg=b.new_page(viewport={"width":w,"height":900}); pg.goto(URL)
        pg.click("#send"); print("vazio:",pg.inner_text("#err"))
        pg.fill("#f-nome","Miguel"); pg.click("#send"); print("1 nome:",pg.inner_text("#err"))
        pg.fill("#f-nome","Miguel Santos"); pg.fill("#f-tel","12345"); pg.click("#send"); print("tel:",pg.inner_text("#err"))
        pg.fill("#f-tel","912 345 678"); pg.fill("#f-mail","abc"); pg.click("#send"); print("mail:",pg.inner_text("#err"))
        pg.fill("#f-mail","miguel@central.pt"); pg.click("#send")
        print("passo:",pg.inner_text("#step"),"| passo2 visível:",pg.is_visible("#passo2"),"| skip:",pg.is_visible("#skip"))
        pg.locator("#contacto").screenshot(path=f"p2_{w}.png")
        pg.select_option("#f-dist","Viseu"); pg.fill("#f-cid","Viseu"); pg.fill("#f-barb","Central"); pg.select_option("#f-dif","Faltas e desmarcações")
        pg.click("#send"); print("fim:",pg.inner_text("#done-t"),"|",__import__("urllib.parse").parse.unquote(pg.get_attribute("#wa","href"))[:260].replace("\n"," / "))
        print("overflow:",pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
    pg=b.new_page(); pg.goto(URL); pg.fill("#f-nome","Ana Silva"); pg.fill("#f-tel","+351 912345678"); pg.fill("#f-mail","a@b.pt"); pg.click("#send"); pg.click("#skip"); print("skip:",pg.inner_text("#done-t"))
    b.close()
