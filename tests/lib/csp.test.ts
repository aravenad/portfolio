import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { COUNT_ENDPOINT } from "../../src/lib/analytics";
import {
  BASE_POLICY,
  collectHashes,
  inlineScripts,
  scriptHash,
  sitePolicy,
  withPolicy,
} from "../../src/lib/csp";

/** Les directives d'une politique, indexées par nom. */
function directives(policy: string): Record<string, string[]> {
  return Object.fromEntries(
    policy.split(";").map((rule) => {
      const [name, ...values] = rule.trim().split(/\s+/);
      return [name, values];
    }),
  );
}

const page = (head: string) =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="content-security-policy" content="${BASE_POLICY}">${head}</head><body></body></html>`;

describe("inlineScripts", () => {
  it("garde le code des scripts en ligne, classiques et modules", () => {
    const html = page(`<script>let a = 1;</script><script type="module">import "x";</script>`);

    expect(inlineScripts(html)).toEqual(["let a = 1;", 'import "x";']);
  });

  it("laisse les scripts à src, qui relèvent de 'self'", () => {
    expect(inlineScripts(page(`<script type="module" src="/_astro/a.js"></script>`))).toEqual([]);
  });

  it("laisse les blocs de données, que le navigateur n'exécute pas", () => {
    expect(
      inlineScripts(page(`<script type="application/ld+json">{"@type":"Person"}</script>`)),
    ).toEqual([]);
  });

  it("garde le code tel quel, espaces et retours compris : l'empreinte porte sur chaque octet", () => {
    const code = "\n  (() => {\n    document.documentElement.dataset.theme = 'dark';\n  })();\n";

    expect(inlineScripts(page(`<script>${code}</script>`))).toEqual([code]);
  });
});

describe("scriptHash", () => {
  it("donne l'empreinte SHA-256 en base 64, entre apostrophes", () => {
    const code = "alert(1)";
    const digest = createHash("sha256").update(code).digest("base64");

    expect(scriptHash(code)).toBe(`'sha256-${digest}'`);
  });

  it("hache le texte en UTF-8, comme le navigateur", () => {
    const code = 'const é = "à";';
    const digest = createHash("sha256").update(Buffer.from(code, "utf8")).digest("base64");

    expect(scriptHash(code)).toBe(`'sha256-${digest}'`);
  });
});

describe("collectHashes", () => {
  it("réunit les scripts de toutes les pages, une fois chacun", () => {
    const hashes = collectHashes([
      page("<script>a()</script>"),
      page("<script>a()</script><script>b()</script>"),
    ]);

    expect([...hashes].sort()).toEqual([scriptHash("a()"), scriptHash("b()")].sort());
  });
});

describe("sitePolicy", () => {
  const policy = directives(sitePolicy([scriptHash("a()"), scriptHash("b()")]));

  it("n'autorise que les scripts du site et ceux dont l'empreinte est connue", () => {
    expect(policy["script-src"]).toEqual(
      ["'self'", ...[scriptHash("a()"), scriptHash("b()")].sort()],
    );
  });

  it("n'ouvre jamais 'unsafe-inline' ni 'unsafe-eval' aux scripts", () => {
    // Une politique qui autorise tout l'inline ne protège de rien.
    expect(policy["script-src"]).not.toContain("'unsafe-inline'");
    expect(policy["script-src"]).not.toContain("'unsafe-eval'");
  });

  it("limite tout le reste au site", () => {
    expect(policy["default-src"]).toEqual(["'self'"]);
  });

  it("laisse passer le pixel de comptage et les SVG de la feuille de style", () => {
    expect(policy["img-src"]).toEqual(["'self'", "data:", new URL(COUNT_ENDPOINT).origin]);
  });

  it("garde les directives de la page rendue", () => {
    expect(policy).toMatchObject(directives(BASE_POLICY));
  });

  it("ne déclare aucune directive que la balise <meta> ignorerait", () => {
    // `frame-ancestors`, `report-uri` et `sandbox` n'ont d'effet qu'en en-tête
    // HTTP : les écrire ici donnerait l'illusion d'une protection.
    for (const ignored of ["frame-ancestors", "report-uri", "sandbox"]) {
      expect(Object.keys(policy)).not.toContain(ignored);
    }
  });

  it("ne dépend pas de l'ordre des pages", () => {
    expect(sitePolicy([scriptHash("b()"), scriptHash("a()")])).toBe(
      sitePolicy([scriptHash("a()"), scriptHash("b()")]),
    );
  });
});

describe("withPolicy", () => {
  it("remplace la politique de la page", () => {
    const html = withPolicy(page("<title>x</title>"), "default-src 'self'");

    expect(html).toContain(`<meta http-equiv="content-security-policy" content="default-src 'self'">`);
    expect(html).not.toContain(BASE_POLICY);
    expect(html).toContain("<title>x</title>");
  });

  it("laisse de côté une page qui n'en déclare pas", () => {
    // La démo et les redirections ne passent pas par BaseLayout.
    expect(withPolicy("<html><head></head></html>", "default-src 'self'")).toBeNull();
  });
});
