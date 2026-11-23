import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LIMITS, check, measure, report } from "../../tools/budget/budget.mjs";

/** Un faux dist/ : quelques fichiers aux tailles connues. */
let dist: string;

const write = (path: string, content: string | Buffer) => {
  const full = join(dist, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, content);
};
const gz = (content: string) => gzipSync(content, { level: 9 }).length;

beforeEach(() => {
  dist = mkdtempSync(join(tmpdir(), "budget-"));
});

afterEach(() => {
  rmSync(dist, { recursive: true, force: true });
});

describe("measure", () => {
  it("additionne le JavaScript et la CSS des assets, en brut et compressé", () => {
    write("_astro/a.js", "a".repeat(1000));
    write("_astro/b.js", "console.log(1);");
    write("_astro/style.css", "body{color:red}");

    const measures = measure(dist);
    expect(measures.js).toBe(1000 + 15);
    expect(measures.jsGzip).toBe(gz("a".repeat(1000)) + gz("console.log(1);"));
    expect(measures.cssGzip).toBe(gz("body{color:red}"));
  });

  it("ne compte que les assets construits, pas les fichiers de public/", () => {
    write("_astro/a.js", "x");
    write("demos/jeu/embed.js", "y".repeat(5000));

    expect(measure(dist).js).toBe(1);
  });

  it("retient la page HTML la plus lourde, sous-dossiers compris", () => {
    write("index.html", "<p>court</p>");
    write("en/projects/index.html", "<p>" + "long ".repeat(500) + "</p>");

    expect(measure(dist).htmlGzip.file.replaceAll("\\", "/")).toBe("en/projects/index.html");
  });

  it("retient la plus grosse image servie, sans les cartes d'aperçu JPEG", () => {
    write("_astro/fond.webp", Buffer.alloc(300));
    write("_astro/logo.svg", Buffer.alloc(100));
    write("_astro/carte.jpg", Buffer.alloc(9000));

    const { image } = measure(dist);
    expect(image.bytes).toBe(300);
    expect(image.file.replaceAll("\\", "/")).toBe("_astro/fond.webp");
  });

  it("retient la plus lourde des cartes d'aperçu, celle du site comprise", () => {
    write("_astro/dauphineo.Ab12.jpg", Buffer.alloc(500));
    write("og-v6.jpg", Buffer.alloc(800));
    write("og-v5.png", Buffer.alloc(9000));

    expect(measure(dist).card).toEqual({ file: "og-v6.jpg", bytes: 800 });
  });

  it("additionne les fichiers des démos, et eux seuls", () => {
    write("demos/jeu/embed.js", Buffer.alloc(700));
    write("demos/jeu/poster.jpg", Buffer.alloc(200));
    write("demos-notes.txt", Buffer.alloc(50));

    const measures = measure(dist);
    expect(measures.demos).toBe(900);
    expect(measures.card.bytes).toBe(0);
  });

  it("retient le plus lourd des PDF, le CV", () => {
    write("cv-public.pdf", Buffer.alloc(400));
    write("cv-public-en.pdf", Buffer.alloc(600));

    expect(measure(dist).pdf).toEqual({ file: "cv-public-en.pdf", bytes: 600 });
  });

  it("mesure zéro sur un site vide", () => {
    mkdirSync(join(dist, "_astro"));
    expect(measure(dist)).toEqual({
      js: 0,
      jsGzip: 0,
      cssGzip: 0,
      htmlGzip: { file: "", bytes: 0 },
      image: { file: "", bytes: 0 },
      card: { file: "", bytes: 0 },
      demos: 0,
      pdf: { file: "", bytes: 0 },
    });
  });
});

describe("check", () => {
  const measures = {
    js: 100,
    jsGzip: 50,
    cssGzip: 20,
    htmlGzip: { file: "index.html", bytes: 30 },
    image: { file: "_astro/fond.webp", bytes: 401 },
    card: { file: "og-v6.jpg", bytes: 90 },
    demos: 1000,
    pdf: { file: "cv.pdf", bytes: 200 },
  };
  const limits = { js: 100, jsGzip: 60, cssGzip: 20, htmlGzip: 40, image: 400 };

  it("accepte un poste au plafond et refuse celui qui le dépasse", () => {
    const results = check(measures, limits);

    expect(results.filter((r) => !r.ok).map((r) => r.key)).toEqual(["image"]);
    expect(results.find((r) => r.key === "image")).toMatchObject({
      bytes: 401,
      limit: 400,
      file: "_astro/fond.webp",
    });
  });

  it("vérifie chaque poste du budget du site", () => {
    expect(check(measures).map((r) => r.key)).toEqual(Object.keys(LIMITS));
  });

  it("dit lequel dépasse, et où", () => {
    const text = report(check(measures, limits));

    expect(text).toContain("ok  JavaScript : 0,1 Ko / 0,1 Ko");
    expect(text).toContain("KO  Plus grosse image : 0,4 Ko / 0,4 Ko (_astro/fond.webp)");
  });
});
