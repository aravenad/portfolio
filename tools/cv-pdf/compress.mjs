/**
 * Allège le CV public exporté par Chrome, sans toucher à rien d'autre que ses
 * images.
 *
 *   node tools/cv-pdf/compress.mjs <export.pdf> public/cv-damien-aravena-bravo-public.pdf
 *
 * Chrome (Skia) intègre une image PNG telle quelle, compressée sans perte :
 * le bandeau chromé du CV pèse à lui seul 720 Ko sur 790. Ce script réencode
 * chaque image de ce genre en JPEG (qualité 88, invisible à l'écran comme à
 * l'impression) et laisse tout le reste octet pour octet : texte, polices,
 * liens, métadonnées.
 *
 * Ghostscript (`gs -sDEVICE=pdfwrite`) ferait la même économie, mais il
 * réécrit tout le document, polices comprises. Sur l'export anglais, dont
 * Chrome écrit les polices en Type 3, il perdait les ligatures au copier :
 * « configuration » devenait « conìguration », et c'est ce texte que lisent
 * les logiciels de recrutement.
 *
 * Ne traite que ce que Chrome produit : une table xref classique, des images
 * RVB 8 bits en FlateDecode, sans masque ni prédicteur. Une autre image est
 * laissée telle quelle, et le script dit laquelle.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

import sharp from "sharp";

const QUALITY = 88;

/** Les objets image d'un PDF, avec la position de leur dictionnaire et de leur flux. */
function images(pdf) {
  const text = pdf.toString("latin1");
  const found = [];
  const object = /(\d+) 0 obj\s*<<((?:(?!>>\s*stream)[\s\S])*?)>>\s*stream\r?\n/g;

  for (const match of text.matchAll(object)) {
    const dict = match[2];
    if (!/\/Subtype\s*\/Image\b/.test(dict)) continue;
    const length = Number(dict.match(/\/Length (\d+)(?!\s+\d+\s+R)/)?.[1]);
    found.push({
      id: match[1],
      dict,
      start: match.index,
      dataStart: match.index + match[0].length,
      length,
    });
  }
  return found;
}

/** Ce qui empêche de réencoder cette image sans risque, ou rien. */
function obstacle(dict) {
  if (!/\/Filter \/FlateDecode\b/.test(dict)) return "pas en FlateDecode";
  if (!/\/BitsPerComponent 8\b/.test(dict)) return "pas en 8 bits";
  if (/\/SMask|\/Mask|\/DecodeParms|\/Decode\b/.test(dict)) return "masque ou prédicteur";
  if (!/\/ColorSpace (\/DeviceRGB|\[\/ICCBased \d+ 0 R\])/.test(dict)) return "pas en RVB";
  return null;
}

/** Les décalages de la table xref, réécrits pour un flux qui change de taille. */
function shiftXref(text, after, delta) {
  const xref = text.lastIndexOf("\nxref");
  const head = text.slice(0, xref);
  const tail = text
    .slice(xref)
    .replace(/^(\d{10}) (\d{5}) n/gm, (line, offset, generation) => {
      const value = Number(offset);
      const moved = value > after ? value + delta : value;
      return `${String(moved).padStart(10, "0")} ${generation} n`;
    })
    .replace(/startxref\r?\n(\d+)/, (_, offset) => `startxref\n${Number(offset) + delta}`);
  return head + tail;
}

async function compress(input) {
  let pdf = input;
  // De la dernière à la première : les positions des précédentes restent justes.
  for (const image of images(pdf).reverse()) {
    const why = obstacle(image.dict);
    if (why) {
      console.warn(`objet ${image.id} laissé tel quel : ${why}`);
      continue;
    }
    const width = Number(image.dict.match(/\/Width (\d+)/)[1]);
    const height = Number(image.dict.match(/\/Height (\d+)/)[1]);
    const pixels = inflateSync(pdf.subarray(image.dataStart, image.dataStart + image.length));
    if (pixels.length !== width * height * 3) {
      console.warn(`objet ${image.id} laissé tel quel : ${pixels.length} octets pour ${width} × ${height}`);
      continue;
    }

    const jpeg = await sharp(pixels, { raw: { width, height, channels: 3 } })
      .jpeg({ quality: QUALITY, progressive: false })
      .toBuffer();
    if (jpeg.length >= image.length) continue;

    const dict = image.dict
      .replace("/Filter /FlateDecode", "/Filter /DCTDecode")
      .replace(/\/Length \d+/, `/Length ${jpeg.length}`);
    const text = pdf.toString("latin1");
    const header = text.slice(image.start, image.dataStart).replace(image.dict, dict);
    const end = image.dataStart + image.length;

    const rebuilt = Buffer.concat([
      pdf.subarray(0, image.start),
      Buffer.from(header, "latin1"),
      jpeg,
      pdf.subarray(end),
    ]);
    const delta = rebuilt.length - pdf.length;
    pdf = Buffer.from(shiftXref(rebuilt.toString("latin1"), image.start, delta), "latin1");

    console.log(`objet ${image.id} : ${kb(image.length)} → ${kb(jpeg.length)} en JPEG`);
  }
  return pdf;
}

const kb = (bytes) => `${Math.round(bytes / 1024)} Ko`;

const [from, to] = process.argv.slice(2);
if (!from || !to) {
  console.error("usage : node tools/cv-pdf/compress.mjs <export.pdf> <sortie.pdf>");
  process.exit(1);
}
const before = readFileSync(from);
const after = await compress(before);
writeFileSync(to, after);
console.log(`${from} : ${kb(before.length)} → ${kb(after.length)}`);
