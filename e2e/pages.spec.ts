import {
  afterNavigation,
  expect,
  scrollSettled,
  scrollToId,
  scrollToY,
  scrollY,
  test,
} from "./helpers";

/**
 * Le reste des scripts du site : apparition au défilement, sommaire des
 * fiches, retour en haut et pagination. Chaque test échoue aussi sur une
 * erreur de console (voir helpers.ts).
 */

const routes = [
  "",
  "projects",
  "projects/page/2",
  "projects/musigma",
  "en/",
  "en/projects",
  "en/projects/musigma",
  "legal",
  "en/legal",
  "accessibility",
  "en/accessibility",
  "sitemap",
  "en/sitemap",
  "colophon",
  "en/colophon",
];

// Les fiches renommées d'après leur projet : un lien vers l'ancienne adresse,
// déjà partagé, mène toujours à la fiche, dans les deux langues.
for (const [from, to, title] of [
  ["projects/sae-3-01-2026", "projects/passe", "PASSE"],
  ["en/projects/developpement-application", "en/projects/musigma", "Musigma"],
]) {
  test(`/${from} renvoie à /${to}`, async ({ page }) => {
    await page.goto(from);

    await expect(page).toHaveURL(new RegExp(`/${to}/?$`));
    await expect(page.locator("h1")).toHaveText(title);
  });
}

for (const route of routes) {
  test(`/${route} s'ouvre sans erreur`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
}

for (const route of routes.filter((path) => !path.startsWith("en/"))) {
  test(`/${route} ne laisse aucun signe partir seul à la ligne`, async ({ page }) => {
    // Le texte s'écrit avec des espaces normales ; le build doit les avoir
    // rendues insécables devant « ; : ? ! », Markdown des fiches compris.
    await page.goto(route);

    const text = await page.locator("body").evaluate((body) => {
      const copy = body.cloneNode(true) as HTMLElement;
      copy.querySelectorAll("script, style, code, pre").forEach((element) => element.remove());
      return copy.textContent ?? "";
    });

    expect(text.match(/.{0,30} [;:?!»]/g) ?? []).toEqual([]);
  });
}

test.describe("apparition au défilement", () => {
  test("un bloc sous la ligne de flottaison apparaît quand on l'atteint", async ({ page }) => {
    await page.goto("");
    const block = page.locator("#contact .reveal").first();
    await expect(block).not.toHaveAttribute("data-revealed");

    await scrollToId(page, "contact");

    await expect(block).toHaveAttribute("data-revealed");
    await expect(block).toHaveCSS("opacity", "1");
  });

  test.describe("sous prefers-reduced-motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("rien n'est masqué", async ({ page }) => {
      await page.goto("");

      await expect(page.locator("html")).not.toHaveAttribute("data-reveal-armed");
      await expect(page.locator("#contact .reveal").first()).toHaveCSS("opacity", "1");
    });
  });
});

test("le focus clavier garde l'arrondi des boutons et des cartes", async ({ page }) => {
  // Une règle de focus hors couche écrasait les arrondis Tailwind : un élément
  // focalisé passait à 2 px de rayon, et ses coins devenaient carrés.
  await page.goto("");
  const radius = (locator: ReturnType<typeof page.locator>) =>
    locator.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);

  for (const element of [
    page.getByRole("link", { name: "Voir mes projets" }),
    page.locator("#projects a[href*='/projects/']").filter({ has: page.locator("h3") }).first(),
  ]) {
    const before = await radius(element);
    expect(parseFloat(before)).toBeGreaterThan(2);

    await element.focus();
    expect(await element.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
    expect(await radius(element)).toBe(before);
  }
});

test("sur grand écran, le texte n'est jamais replié", async ({ page }) => {
  await page.goto("");

  for (const id of ["about", "skills", "soft-skills"]) {
    const block = page.locator(`#${id} [data-read-more]`);
    await expect(block.locator(":scope > button"), id).toBeHidden();
    await expect(block.locator(".read-more-text > p:visible"), id).toHaveCount(
      await block.locator(".read-more-text > p").count(),
    );
  }
});

test.describe("fiche projet", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("projects/musigma");
  });

  test("le sommaire suit la section lue et y mène", async ({ page }) => {
    const sidebar = page.locator('nav[data-toc="sidebar"]');

    // Deux sections assez longues pour que la suivante reste sous la ligne de
    // lecture quand leur titre est en haut : une section de deux lignes
    // laisserait la main à sa voisine, et le test mesurerait la mise en page.
    const [first, second] = await page.evaluate(() => {
      const ids = [...document.querySelectorAll<HTMLAnchorElement>('nav[data-toc="sidebar"] a')].map(
        (link) => decodeURIComponent(link.hash.slice(1)),
      );
      const tops = ids.map((id) => document.getElementById(id)!.getBoundingClientRect().top);
      return ids.filter((_, i) => i + 1 < ids.length && tops[i + 1] - tops[i] > 200);
    });
    const link = (id: string) => sidebar.locator(`a[href="#${id}"]`);

    await scrollToId(page, first, -100);
    await expect(link(first)).toHaveAttribute("aria-current", "location");
    await expect(sidebar.locator("[aria-current]")).toHaveCount(1);

    await link(second).click();
    await expect(page.locator(`[id="${second}"]`)).toBeInViewport();
    await expect(link(second)).toHaveAttribute("aria-current", "location");
    await expect(sidebar.locator("[aria-current]")).toHaveCount(1);
  });

  test("le bouton de retour en haut apparaît au défilement et remonte", async ({ page }) => {
    const button = page.locator("[data-back-to-top]");
    await expect(button).not.toHaveAttribute("data-visible");

    await scrollToY(page, 2000);
    await expect(button).toHaveAttribute("data-visible");

    await button.click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(button).not.toHaveAttribute("data-visible");
  });
});

test("le sommaire allume l'entrée cliquée, même quand la ligne de lecture en désignerait une autre", async ({
  page,
}) => {
  // Les deux pièges de la règle de franchissement, sur une vraie fiche : un `h2`
  // suivi aussitôt d'un `h3` (« Réalisation »), et une section de fin de page
  // que la ligne, descendue, dépasse (« Compétences mobilisées »).
  await page.goto("projects/site-capgemini");
  const sidebar = page.locator('nav[data-toc="sidebar"]');

  for (const id of ["réalisation", "competences-mobilisees"]) {
    const link = sidebar.locator(`a[href="#${id}"]`);

    await link.click();
    await expect(page.locator(`[id="${id}"]`)).toBeInViewport();
    // L'entrée doit tenir une fois le saut fini. Il faut attendre qu'il le
    // soit : un coup de molette pendant le saut doux est ignoré par Chrome,
    // qui finit le saut et rallume la dernière section.
    await scrollSettled(page);
    await expect(link).toHaveAttribute("aria-current", "location");
    await expect(sidebar.locator("[aria-current]")).toHaveCount(1);
  }

  // Le lecteur reprend la main : le surlignage suit de nouveau le défilement.
  await page.mouse.wheel(0, -1500);
  await expect(sidebar.locator('a[href="#competences-mobilisees"]')).not.toHaveAttribute(
    "aria-current",
  );
});

test("la pagination change de page et y place l'indicateur", async ({ page }) => {
  await page.goto("projects");
  const pagination = page.locator("[data-pagination]");
  await expect(pagination.locator('[aria-current="page"]')).toHaveAttribute("data-page", "1");

  await afterNavigation(page, () => pagination.locator('a[data-page="2"]').click());

  await expect(page).toHaveURL(/\/projects\/page\/2\/$/);
  const current = pagination.locator('[aria-current="page"]');
  await expect(current).toHaveAttribute("data-page", "2");

  // L'indicateur glisse depuis la page 1 puis se pose sur la page courante,
  // à la bordure du lien près (il est placé dans son cadre intérieur).
  const indicator = current.locator("[data-page-indicator]");
  await expect
    .poll(async () => {
      const [a, b] = await Promise.all([indicator.boundingBox(), current.boundingBox()]);
      return Math.abs(a!.x - b!.x);
    })
    .toBeLessThanOrEqual(1);
});

test("les filtres cherchent dans toutes les pages et se gardent dans l'adresse", async ({ page }) => {
  await page.goto("projects/");
  const cards = page.locator("[data-project-list] > li:visible");
  const pagination = page.locator("[data-projects-pagination]");
  const count = page.locator("[data-filters-count]");
  await expect(cards).toHaveCount(6);

  // Huit projets terminés, répartis sur les deux pages : la page 1 les montre tous.
  await page.getByLabel("Statut").selectOption("termine");
  await expect(cards).toHaveCount(8);
  await expect(count).toHaveText("8 projets sur 10");
  await expect(pagination).toBeHidden();
  await expect(page).toHaveURL(/\/projects\/\?status=termine$/);

  // Deux critères ensemble : il faut répondre aux deux.
  await page.getByLabel("Technologie").selectOption("Java");
  await expect(cards).toHaveCount(2);

  // Les applications web terminées : Dauphinéo seul, la SAÉ 3.01 est en cours.
  await page.getByLabel("Technologie").selectOption("");
  await page.getByRole("combobox", { name: "Type", exact: true }).selectOption("web-app");
  await expect(cards).toHaveCount(1);
  await expect(cards.locator("h2")).toHaveText("Dauphinéo");
  await expect(page).toHaveURL(/\/projects\/\?status=termine&kind=web-app$/);

  await page.getByRole("button", { name: "Effacer les filtres" }).click();
  await expect(cards).toHaveCount(6);
  await expect(count).toBeEmpty();
  await expect(pagination).toBeVisible();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByLabel("Statut")).toBeFocused();
});

test("un lien filtré s'ouvre filtré, même sur une autre page", async ({ page }) => {
  // Les deux projets en cours sont sur la page 1 ; la page 2 les trouve quand même.
  await page.goto("projects/page/2/?status=en-cours&tag=inconnue");
  const cards = page.locator("[data-project-list] > li:visible");

  await expect(page.getByLabel("Statut")).toHaveValue("en-cours");
  // Une valeur que la liste ne propose pas est ignorée plutôt que de tout vider.
  await expect(page.getByLabel("Technologie")).toHaveValue("");
  await expect(cards.locator("h2")).toHaveText(["PASSE", "Arrow Block"]);
  await expect(page.locator("[data-filters-empty]")).toBeHidden();
});

test.describe("sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("la liste des projets ne montre pas de filtres qui ne filtreraient rien", async ({ page }) => {
    // Le média `scripting` les masque : ils ne portent plus `hidden`, que le
    // script levait en les faisant apparaître (voir ProjectsList.astro).
    await page.goto("projects/");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-project-filters]")).toBeHidden();
    await expect(page.locator("[data-project-list] > li:visible")).toHaveCount(6);
  });
});

test("les filtres disent quand rien ne répond", async ({ page }) => {
  await page.goto("projects/?status=en-cours");

  // Aucun projet en cours n'est une base de données.
  await page.getByRole("combobox", { name: "Type", exact: true }).selectOption("database");
  await expect(page.locator("[data-project-list] > li:visible")).toHaveCount(0);
  await expect(page.locator("[data-filters-empty]")).toBeVisible();
  await expect(page.locator("[data-filters-count]")).toHaveText("0 projet sur 10");
});

test("le sommaire des mentions légales mène à chaque partie, sous le header", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("legal");
  const sidebar = page.locator('nav[data-toc="sidebar"]');

  await sidebar.getByRole("link", { name: "Propriété intellectuelle" }).click();

  const heading = page.locator("#legal-credits");
  await expect(heading).toBeInViewport();
  // Le titre n'est pas resté derrière le header collant (4rem).
  expect((await heading.boundingBox())?.y).toBeGreaterThanOrEqual(64);
  await expect(sidebar.getByRole("link", { name: "Propriété intellectuelle" })).toHaveAttribute(
    "aria-current",
    "location",
  );
});
