import { beforeEach, describe, expect, it, vi } from "vitest";

import BaseLayout from "../../src/layouts/BaseLayout.astro";
import { site } from "../../src/data/site";
import { SITE_ORIGIN, meta, renderPage } from "../helpers/render";

/**
 * Les métadonnées d'aperçu ne se voient jamais en naviguant sur le site : elles
 * n'apparaissent que dans un partage LinkedIn ou un résultat de recherche, une
 * fois la page en ligne. Elles sont donc vérifiées ici plutôt qu'à l'œil.
 */
const options = (pathname = "/portfolio/") => ({
  request: new Request(`${SITE_ORIGIN}${pathname}`),
  props: { title: "Damien — Portfolio" },
  slots: { default: "<p>contenu</p>" },
});

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("BaseLayout", () => {
  it("rend un document complet en français", async () => {
    const { html, document } = await renderPage(BaseLayout, options());

    expect(html).toMatch(/^<!doctype html>/i);
    expect(document.documentElement.getAttribute("lang")).toBe("fr");
    expect(meta(document, "viewport")).toContain("width=device-width");
  });

  it("reprend la description du site quand la page n'en donne pas", async () => {
    const { document } = await renderPage(BaseLayout, options());
    expect(meta(document, "description")).toBe(site.description);
  });

  it("préfère la description de la page quand elle en a une", async () => {
    const { document } = await renderPage(BaseLayout, {
      ...options(),
      props: { title: "Projets", description: "Une autre description." },
    });

    expect(meta(document, "description")).toBe("Une autre description.");
  });

  it("donne une URL canonique absolue, propre à la page", async () => {
    const { document } = await renderPage(BaseLayout, options("/portfolio/projects"));
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");

    expect(canonical).toBe(`${SITE_ORIGIN}/portfolio/projects`);
  });

  describe("carte d'aperçu", () => {
    it("pointe vers une image absolue : les robots ignorent les chemins relatifs", async () => {
      const { document } = await renderPage(BaseLayout, options());
      const image = meta(document, "og:image")!;

      expect(new URL(image).origin).toBe(SITE_ORIGIN);
      expect(image).toContain("/portfolio/");
    });

    it("versionne le nom de l'image, seul moyen de vider le cache de LinkedIn", async () => {
      // ⚠️ Republier sous le même nom ne met pas l'aperçu à jour : LinkedIn
      // garde l'ancienne image indéfiniment.
      expect(meta((await renderPage(BaseLayout, options())).document, "og:image"))
        .toMatch(/og-v\d+\.png$/);
    });

    it("annonce les dimensions attendues par les aperçus", async () => {
      const { document } = await renderPage(BaseLayout, options());
      const width = Number(meta(document, "og:image:width"));
      const height = Number(meta(document, "og:image:height"));

      // Le rapport dit « 1,91:1 » est en réalité celui de 1200 × 630.
      expect(width / height).toBeCloseTo(1200 / 630, 3);
      // En dessous de 1200 px de large, l'aperçu est réduit puis réencodé : flou.
      expect(width).toBeGreaterThanOrEqual(1200);
    });

    it("décrit l'image et le reste de la carte", async () => {
      const { document } = await renderPage(BaseLayout, options());

      expect(meta(document, "og:image:alt")).toBeTruthy();
      expect(meta(document, "og:type")).toBe("website");
      expect(meta(document, "og:locale")).toBe("fr_FR");
      expect(meta(document, "og:site_name")).toBe(site.title);
      expect(meta(document, "twitter:card")).toBe("summary_large_image");
    });

    it("fait suivre l'URL de la page dans la carte", async () => {
      const { document } = await renderPage(BaseLayout, options("/portfolio/projects"));
      expect(meta(document, "og:url")).toBe(`${SITE_ORIGIN}/portfolio/projects`);
    });
  });

  describe("politique de sécurité du contenu", () => {
    /** Les directives déclarées, indexées par nom. */
    async function directives() {
      const { document } = await renderPage(BaseLayout, options());
      const content = document
        .querySelector('meta[http-equiv="content-security-policy"]')
        ?.getAttribute("content");

      expect(content, "aucune politique déclarée").toBeTruthy();

      return Object.fromEntries(
        content!.split(";").map((rule) => {
          const [name, ...values] = rule.trim().split(/\s+/);
          return [name, values.join(" ")];
        }),
      );
    }

    it("interdit un <base> injecté, un greffon et tout envoi de formulaire", async () => {
      expect(await directives()).toMatchObject({
        "base-uri": "'self'",
        "object-src": "'none'",
        "form-action": "'none'",
      });
    });

    it("ne déclare aucune directive que la balise <meta> ignorerait", async () => {
      // `frame-ancestors`, `report-uri` et `sandbox` n'ont d'effet qu'en en-tête
      // HTTP : les écrire ici donnerait l'illusion d'une protection.
      const noms = Object.keys(await directives());

      for (const ignorée of ["frame-ancestors", "report-uri", "sandbox"]) {
        expect(noms).not.toContain(ignorée);
      }
    });

    it("n'ouvre pas 'unsafe-inline' au détour d'une directive de script", async () => {
      // Une politique qui autorise tout l'inline ne protège de rien : mieux vaut
      // ne pas déclarer la directive que la déclarer ouverte.
      const noms = Object.keys(await directives());

      expect(noms).not.toContain("script-src");
      expect(noms).not.toContain("default-src");
    });
  });

  it("précharge la matière du fond dès le HTML", async () => {
    // Déclarée en `background-image`, elle n'était découverte qu'après le CSS :
    // le flou de la barre n'avait alors rien à flouter et arrivait en retard.
    const { document } = await renderPage(BaseLayout, options());
    const preload = document.querySelector('link[rel="preload"][as="image"]');

    expect(preload?.getAttribute("type")).toBe("image/webp");
    expect(preload?.getAttribute("fetchpriority")).toBe("high");
    expect(preload?.getAttribute("href")).toBeTruthy();
  });

  it("distingue l'accueil des autres pages", async () => {
    const accueil = await renderPage(BaseLayout, options("/portfolio/"));
    const projets = await renderPage(BaseLayout, options("/portfolio/projects"));

    expect(accueil.document.body.getAttribute("data-home")).toBe("true");
    expect(projets.document.body.getAttribute("data-home")).toBe("false");
  });

  it("traite « /portfolio » et « /portfolio/ » comme la même page", async () => {
    const { document } = await renderPage(BaseLayout, options("/portfolio"));
    expect(document.body.getAttribute("data-home")).toBe("true");
  });

  it("place le contenu de la page dans un <main> repérable", async () => {
    const { document } = await renderPage(BaseLayout, options());
    const main = document.querySelector("main");

    expect(main?.getAttribute("id")).toBe("main");
    expect(main?.textContent).toContain("contenu");
  });

  it("encadre le contenu du header et du footer", async () => {
    const { document } = await renderPage(BaseLayout, options());

    expect(document.querySelector("header")).toBeTruthy();
    expect(document.querySelector("footer")).toBeTruthy();
    expect(document.querySelector("[data-back-to-top]")).toBeTruthy();
  });

  it("garde un filet de sécurité sur la révélation au défilement", async () => {
    // ⚠️ Si le module qui révèle les blocs n'arrive jamais, le drapeau doit se
    // retirer seul : sans ce garde-fou, une erreur de chargement cacherait la
    // moitié du site pour toujours.
    const { html } = await renderPage(BaseLayout, options());

    expect(html).toContain("data-reveal-armed");
    expect(html).toContain("data-reveal-ready");
    expect(html).toContain("setTimeout");
  });

  it("réarme la révélation sur le document entrant à chaque navigation", async () => {
    // ⚠️ L'échange de vue recopie les attributs de `<html>` : un drapeau posé à
    // l'exécution est effacé, et la révélation ne marchait que sur la première
    // page.
    const { html } = await renderPage(BaseLayout, options());
    expect(html).toContain("astro:before-swap");
    expect(html).toContain("newDocument");
  });

  it("respecte prefers-reduced-motion avant même de poser le drapeau", async () => {
    const { html } = await renderPage(BaseLayout, options());
    expect(html).toContain("prefers-reduced-motion");
  });
});
