import {
  Archive,
  CookingPot,
  CupSoda,
  GlassWater,
  House,
  Lamp,
  ShoppingBag,
  Soup,
  SprayCan,
  UtensilsCrossed,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  bottle: GlassWater,
  tiffin: Soup,
  storage: Archive,
  cookware: CookingPot,
  kitchen: UtensilsCrossed,
  cleaning: SprayCan,
  cups: CupSoda,
  decor: Lamp,
  home: House,
  other: ShoppingBag,
};

/** Picks an icon from words in the category name, so new sheet categories get a sensible icon automatically. */
const rules: [RegExp, keyof typeof ICONS][] = [
  [/bottle|flask|sipper|water/i, "bottle"],
  [/tiffin|lunch|dabba/i, "tiffin"],
  [/storage|container|jar|box/i, "storage"],
  [/cook|pan|tawa|kadai|pressure/i, "cookware"],
  [/cutlery|spoon|plate|dinner|kitchen/i, "kitchen"],
  [/clean|wash|mop|broom|cloth/i, "cleaning"],
  [/cup|mug|glass|drink/i, "cups"],
  [/light|lamp|decor/i, "decor"],
  [/home|house|essential|bucket/i, "home"],
];

export function CategoryIcon({ category, ...props }: LucideProps & { category: string }) {
  const Icon = ICONS[rules.find(([re]) => re.test(category))?.[1] ?? "other"];
  return <Icon {...props} />;
}

/** Stable hue per category for tinted tiles and placeholders. */
export function categoryHue(category: string) {
  let h = 0;
  for (const ch of category) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
