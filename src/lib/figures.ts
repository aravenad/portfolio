import type { Element, ElementContent } from "hast";
import type { HastPluginDefinition } from "satteri";

import { frenchSpacing } from "./typography";

/** Un paragraphe qui ne contient qu'une image, blancs mis à part. */
function loneImage(paragraph: Element): Element | undefined {
  const children = paragraph.children.filter(
    (child) => !(child.type === "text" && child.value.trim() === ""),
  );
  const [only] = children;
  return children.length === 1 && only.type === "element" && only.tagName === "img"
    ? only
    : undefined;
}

/**
 * Une capture d'écran seule sur sa ligne, dans le corps des fiches, devient une
 * figure légendée : `![texte alternatif](image.webp "Légende")`. Le texte
 * alternatif décrit l'image pour qui ne la voit pas ; le titre Markdown, lui,
 * s'affiche dessous pour tout le monde, au lieu de n'apparaître qu'au survol.
 *
 * La légende ne passe pas par les plugins de texte : elle reçoit ici les
 * apostrophes typographiques et les espaces insécables du reste de la fiche.
 * Une image sans titre, ou prise dans une phrase, reste telle quelle.
 */
export const satteriFigures: HastPluginDefinition = {
  name: "figures",
  element: {
    filter: ["p"],
    visit(node, ctx) {
      const image = loneImage(node);
      const title = image?.properties?.title;
      if (!image || typeof title !== "string" || !title.trim()) return;

      const { title: _, ...properties } = image.properties;
      const caption: ElementContent = {
        type: "element",
        tagName: "figcaption",
        properties: {},
        children: [{ type: "text", value: frenchSpacing(title.trim().replace(/'/g, "’")) }],
      };

      ctx.replaceNode(node, {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [{ ...image, properties }, caption],
      });
    },
  },
};
