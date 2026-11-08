import { describe, expect, it } from "vitest";

import {
  COUNT_DOMAIN,
  COUNT_ENDPOINT,
  SKIP_KEY,
  countUrl,
  externalReferrer,
  isCounted,
  saveCounted,
  shouldCount,
  type SkipStore,
} from "../../src/lib/analytics";
import { site } from "../../src/data/site";

/** Un stockage en mémoire, à la place de `localStorage`. */
function memoryStore(initial: Record<string, string> = {}): SkipStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

/** Un stockage refusé, comme en navigation privée stricte. */
const refused = (): SkipStore => {
  throw new Error("SecurityError");
};

const visit = { hostname: COUNT_DOMAIN, domain: COUNT_DOMAIN, skip: null };

describe("compteur d'audience", () => {
  it("compte sur le domaine du site, celui des mentions légales", () => {
    expect(COUNT_DOMAIN).toBe(site.registrar.domain);
    expect(new URL(COUNT_ENDPOINT).protocol).toBe("https:");
    expect(new URL(COUNT_ENDPOINT).pathname).toBe("/count");
    expect(shouldCount(visit)).toBe(true);
  });

  it("ne compte rien ailleurs : dev, aperçu, tests", () => {
    for (const hostname of ["localhost", "127.0.0.1", `www.${COUNT_DOMAIN}`]) {
      expect(shouldCount({ ...visit, hostname }), hostname).toBe(false);
    }
  });

  it("respecte le refus, Do Not Track et Global Privacy Control", () => {
    expect(shouldCount({ ...visit, skip: "t" })).toBe(false);
    expect(shouldCount({ ...visit, doNotTrack: "1" })).toBe(false);
    expect(shouldCount({ ...visit, globalPrivacyControl: true })).toBe(false);
    // Do Not Track à « 0 » ou absent ne refuse rien.
    expect(shouldCount({ ...visit, doNotTrack: "0", globalPrivacyControl: false })).toBe(true);
  });

  it("ne compte pas un navigateur piloté", () => {
    expect(shouldCount({ ...visit, webdriver: true })).toBe(false);
  });
});

describe("provenance", () => {
  it("garde une page d'un autre site", () => {
    const from = "https://www.linkedin.com/in/someone";
    expect(externalReferrer(from, COUNT_DOMAIN)).toBe(from);
  });

  it("n'envoie ni les paramètres ni l'ancre de la page d'origine", () => {
    expect(externalReferrer("https://www.google.com/search?q=damien+aravena#top", COUNT_DOMAIN)).toBe(
      "https://www.google.com/search",
    );
  });

  it("ignore une page du site, une provenance vide ou illisible", () => {
    expect(externalReferrer(`https://${COUNT_DOMAIN}/projects/`, COUNT_DOMAIN)).toBe("");
    expect(externalReferrer("", COUNT_DOMAIN)).toBe("");
    expect(externalReferrer("pas une adresse", COUNT_DOMAIN)).toBe("");
  });
});

describe("adresse de la page vue", () => {
  it("porte la page, son titre, la provenance et la largeur d'écran", () => {
    const url = new URL(
      countUrl(COUNT_ENDPOINT, {
        path: "/projects/",
        title: "Projets & cie",
        referrer: "https://example.com/",
        width: 1440,
        random: "0.42",
      }),
    );

    expect(`${url.origin}${url.pathname}`).toBe(COUNT_ENDPOINT);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      p: "/projects/",
      t: "Projets & cie",
      r: "https://example.com/",
      s: "1440",
      rnd: "0.42",
    });
  });
});

describe("refus d'être compté", () => {
  it("compte par défaut, et plus après un refus", () => {
    const store = memoryStore();
    expect(isCounted(() => store)).toBe(true);

    expect(saveCounted(() => store, false)).toBe(false);
    expect(store.data[SKIP_KEY]).toBe("t");
    expect(isCounted(() => store)).toBe(false);

    expect(saveCounted(() => store, true)).toBe(true);
    expect(store.data).not.toHaveProperty(SKIP_KEY);
    expect(isCounted(() => store)).toBe(true);
  });

  it("garde la clé de GoatCounter, posée aussi depuis son tableau de bord", () => {
    expect(SKIP_KEY).toBe("skipgc");
    expect(isCounted(() => memoryStore({ skipgc: "t" }))).toBe(false);
  });

  it("reste sur « compté » quand le stockage refuse", () => {
    expect(isCounted(refused)).toBe(true);
    expect(saveCounted(refused, false)).toBe(true);
  });
});
