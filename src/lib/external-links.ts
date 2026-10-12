import type { Element, ElementContent } from "hast";
import type { HastPluginDefinition } from "satteri";

import { ui } from "../data/ui";

/** Le tracé d'Arrow.astro, la flèche des boutons « Voir le site » et « Voir le code ». */
const ARROW_PATH = "M2.5 8h11M9 3.5 13.5 8 9 12.5";

/** Un lien vers un autre site, par opposition aux ancres et aux pages du portfolio. */
export function isExternal(href: unknown): href is string {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}

const arrow: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ariaHidden: "true",
    className: ["ml-0.5", "inline-block", "size-[0.8em]", "-rotate-45", "align-baseline"],
  },
  children: [{ type: "element", tagName: "path", properties: { d: ARROW_PATH }, children: [] }],
};

/**
 * Les liens vers un autre site, dans le corps des fiches, s'ouvrent dans un
 * nouvel onglet, comme les boutons du site et du dépôt sous l'en-tête : le
 * lecteur y passe pour revenir à la fiche, qui doit rester où il l'a laissée.
 *
 * Ils reçoivent donc le même signal : la flèche oblique pour les yeux, et
 * « (nouvel onglet) » pour les lecteurs d'écran. La langue se lit dans le
 * chemin de la fiche, puisque les fiches anglaises vivent sous `projects/en/`.
 *
 * La flèche partage un bloc insécable avec le dernier mot du lien : sans lui,
 * elle pouvait passer seule à la ligne. Un gluon (U+2060) ne suffit pas,
 * Chrome coupe quand même devant un SVG. Le libellé masqué vient après le bloc.
 */
export const satteriExternalLinks: HastPluginDefinition = {
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      if (!isExternal(node.properties?.href)) return;

      const lang = ctx.fileURL?.pathname.includes("/projects/en/") ? "en" : "fr";

      ctx.setProperty(node, "target", "_blank");
      ctx.setProperty(node, "rel", "noopener noreferrer");

      const last = node.children.at(-1);
      const [, head = "", word = ""] =
        last?.type === "text" ? /^(.*?)(\S*)$/s.exec(last.value)! : [];

      if (last && word) {
        const replacement: ElementContent[] = [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["whitespace-nowrap"] },
            children: [{ type: "text", value: word }, arrow],
          },
        ];
        if (head) replacement.unshift({ type: "text", value: head });
        ctx.replaceNode(last, replacement);
      } else {
        ctx.appendChild(node, arrow);
      }

      ctx.appendChild(node, {
        type: "element",
        tagName: "span",
        properties: { className: ["sr-only"] },
        children: [{ type: "text", value: ` ${ui[lang].projects.links.newTab}` }],
      });
    },
  },
};
