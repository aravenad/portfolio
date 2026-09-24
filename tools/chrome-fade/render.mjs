/**
 * Rastérise chrome-fade.svg en PNG, fidèlement : c'est Chrome qui dessine le
 * SVG, filtres `feTurbulence` et `feDisplacementMap` compris — ImageMagick et
 * librsvg ne les rendent pas à l'identique.
 *
 *   node tools/chrome-fade/render.mjs
 *
 * Sortie : src/assets/chrome-fade.webp, blanc et transparence, sans perte, à la
 * taille du viewBox (1600 × 1024) — 104 Ko, contre 174 Ko en PNG pour les mêmes
 * pixels. Réduite de moitié, l'image faisait apparaître vingt fois plus de
 * pixels différents du SVG sur la page rendue : la pleine taille reste.
 *
 * Pourquoi une image : un masque SVG est redessiné à chaque palier de zoom.
 * Avec ces deux filtres, sur la surface du haut de page, le zoom au pavé
 * tactile de Firefox saccadait — fond et contenu ensemble.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

import sharp from "sharp";

const here = new URL(".", import.meta.url);
const svg = readFileSync(new URL("chrome-fade.svg", here), "utf8");
const out = new URL("../../src/assets/chrome-fade.webp", here);
const [W, H] = [1600, 1024];

const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn("google-chrome", ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/chrome-fade-${port}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
for (let i = 0; i < 50 && !ws; i++) {
  try {
    const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch {}
  await sleep(200);
}
// La connexion peut s'être ouverte pendant l'attente : ne pas guetter un
// événement déjà passé.
if (ws.readyState !== WebSocket.OPEN) await new Promise((r) => ws.addEventListener("open", r));

let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  pending.get(m.id)?.(m);
});
const send = (method, params = {}) =>
  new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });

await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
const html = `<!doctype html><style>html,body{margin:0;background:transparent}img{display:block;width:${W}px;height:${H}px}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}">`;
await send("Page.navigate", { url: "data:text/html;base64," + Buffer.from(html).toString("base64") });
await sleep(1500);
const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
await sharp(Buffer.from(shot.result.data, "base64"))
  .webp({ lossless: true, effort: 6 })
  .toFile(out.pathname);

ws.close();
chrome.kill();
console.log(`écrit : ${out.pathname}`);
