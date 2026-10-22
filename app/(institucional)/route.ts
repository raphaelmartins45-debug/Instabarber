import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A página de apresentação (D-34) é o HTML único de landing/index.html, servido tal como está.
// Fica estática: lê-se no build e serve-se pela CDN.
export const dynamic = "force-static";

export async function GET() {
  const html = await readFile(join(process.cwd(), "landing", "index.html"), "utf8");
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
