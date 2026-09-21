import { describe, expect, it } from "vitest";

import Pagination from "../../src/components/ui/Pagination.astro";
import { render } from "../helpers/render";

/**
 * La fenêtre de pagination — première page, dernière, voisines immédiates, et
 * des ellipses pour les trous — n'est pas exportée : elle se lit dans le DOM
 * rendu, ce qui la teste telle que l'utilisateur la voit.
 */
async function paginate(currentPage: number, totalPages: number) {
  const { document } = await render(Pagination, {
    props: { currentPage, totalPages, href: (page: number) => `/p/${page}` },
  });

  const items = [...document.querySelectorAll("li")]
    .filter((li) => li.querySelector("[data-page]") || li.getAttribute("aria-hidden") === "true")
    .map((li) => {
      const link = li.querySelector("[data-page]");
      return link ? Number(link.getAttribute("data-page")) : "…";
    });

  return { document, items };
}

describe("Pagination", () => {
  it("ne s'affiche pas quand il n'y a qu'une page", async () => {
    const { document } = await render(Pagination, {
      props: { currentPage: 1, totalPages: 1, href: (page: number) => `/p/${page}` },
    });

    expect(document.querySelector("[data-pagination]")).toBeNull();
  });

  it("montre toutes les pages tant qu'elles tiennent", async () => {
    expect((await paginate(1, 3)).items).toEqual([1, 2, 3]);
  });

  it("coupe la série d'une ellipsis quand un trou apparaît", async () => {
    expect((await paginate(1, 9)).items).toEqual([1, 2, "…", 9]);
  });

  it("garde une voisine de chaque côté au milieu de la série", async () => {
    expect((await paginate(5, 9)).items).toEqual([1, "…", 4, 5, 6, "…", 9]);
  });

  it("remplace même un trou d'une seule page par une ellipsis", async () => {
    // Le cas ne se présente qu'à partir de cinq pages, soit vingt-cinq projets :
    // la règle reste uniforme plutôt que de gagner une exception pour un trou
    // d'un seul numéro.
    expect((await paginate(4, 5)).items).toEqual([1, "…", 3, 4, 5]);
  });

  it("ne répète jamais un numéro aux extrémités", async () => {
    expect((await paginate(1, 2)).items).toEqual([1, 2]);
    expect((await paginate(2, 2)).items).toEqual([1, 2]);
  });

  it("marque la page courante et elle seule", async () => {
    const { document } = await paginate(5, 9);
    const current = [...document.querySelectorAll('[data-page][aria-current="page"]')];

    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("data-page")).toBe("5");
  });

  it("construit chaque lien avec la fonction fournie", async () => {
    const { document } = await paginate(2, 4);

    for (const link of document.querySelectorAll("[data-page]")) {
      expect(link.getAttribute("href")).toBe(`/p/${link.getAttribute("data-page")}`);
    }
  });

  it("neutralise « Précédent » sur la première page", async () => {
    const { document } = await paginate(1, 5);
    const previous = document.querySelector("li:first-child a");

    expect(previous?.hasAttribute("href")).toBe(false);
    expect(previous?.getAttribute("aria-disabled")).toBe("true");
    expect(previous?.getAttribute("tabindex")).toBe("-1");
  });

  it("neutralise « Suivant » sur la dernière page", async () => {
    const { document } = await paginate(5, 5);
    const next = document.querySelector("li:last-child a");

    expect(next?.hasAttribute("href")).toBe(false);
    expect(next?.getAttribute("aria-disabled")).toBe("true");
  });

  it("active les deux flèches au milieu de la série", async () => {
    const { document } = await paginate(3, 5);
    const steps = [document.querySelector("li:first-child a"), document.querySelector("li:last-child a")];

    expect(steps.map((step) => step?.getAttribute("href"))).toEqual(["/p/2", "/p/4"]);
  });

  it("cache les ellipses aux lecteurs d'écran", async () => {
    const { document } = await paginate(5, 9);

    for (const node of document.querySelectorAll("li[aria-hidden='true']")) {
      expect(node.textContent?.trim()).toBe("…");
    }
  });

  it("nomme le bloc de navigation", async () => {
    const { document } = await render(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 2,
        href: (page: number) => `/p/${page}`,
        label: "Pages de projets",
      },
    });

    expect(document.querySelector("nav")?.getAttribute("aria-label")).toBe("Pages de projets");
  });

  it("donne un libellé accessible à chaque numéro", async () => {
    const { document } = await paginate(1, 3);

    for (const link of document.querySelectorAll("[data-page]")) {
      expect(link.getAttribute("aria-label")).toBe(`Page ${link.getAttribute("data-page")}`);
    }
  });
});
