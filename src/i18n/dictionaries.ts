import type { Locale } from "./config";

/**
 * UI strings only. Product titles, descriptions, materials and care copy stay in
 * English in the catalogue — they are merchandising content, not interface text,
 * and this project does not pretend they are localized.
 *
 * `en` is the source of truth: its keys define the Dictionary type, so a missing
 * German key fails the build instead of rendering `undefined` at runtime.
 */
const en = {
  // Navigation
  "nav.home": "Home",
  "nav.women": "Women",
  "nav.men": "Men",
  "nav.knitwear": "Knitwear",
  "nav.outerwear": "Outerwear",
  "nav.accessories": "Accessories",
  "nav.search": "Search",
  "nav.wishlist": "Wishlist",
  "nav.bag": "Bag",

  // Shared actions
  "action.close": "Close",
  "action.clear": "Clear",
  "action.remove": "Remove",
  "action.change": "Change",
  "action.continueShopping": "Continue shopping",
  "action.viewBag": "View bag",
  "action.quickAdd": "Quick add",
  "action.added": "Added",

  // Product detail
  "pdp.colour": "Colour",
  "pdp.size": "Size",
  "pdp.selectColour": "Select a colour",
  "pdp.selectSize": "Select a size",
  "pdp.sizeGuide": "Size guide",
  "pdp.addToBag": "Add to bag",
  "pdp.addedToBag": "Added to bag",
  "pdp.soldOut": "Sold out",
  "pdp.inStock": "In stock",
  "pdp.lowStock": "Only {n} left",
  "pdp.selectSizeFirst": "Select a size to see availability",
  "pdp.soldOutInSize": "Sold out in this size",
  "pdp.detailsCare": "Details & care",
  "pdp.material": "Material",
  "pdp.care": "Care",
  "pdp.shippingReturns": "Shipping & returns",
  "pdp.fit": "Fit",
  "pdp.delivery": "Delivery",
  "pdp.wornWith": "Worn with",
  "pdp.enlarge": "Enlarge image",
  "pdp.viewAll": "View all",

  // Cart
  "cart.title": "Shopping Bag",
  "cart.empty": "Your bag is empty.",
  "cart.emptyBody":
    "Pieces you add will appear here. The current collection is a good place to start.",
  "cart.items": "{n} items",
  "cart.item": "{n} item",
  "cart.each": "{price} each",
  "cart.subtotal": "Subtotal",
  "cart.shipping": "Shipping",
  "cart.calculatedAtCheckout": "Calculated at checkout",
  "cart.complimentary": "Complimentary",
  "cart.freeShippingApplied": "Complimentary shipping applied.",
  "cart.freeShippingRemaining": "{amount} away from complimentary shipping.",
  "cart.orderSummary": "Order summary",
  "cart.checkout": "Checkout — demo store",
  "cart.checkoutNote":
    "This is a portfolio demo. No payment is taken and no order is placed.",
  "cart.increase": "Increase quantity of {title}, size {size}",
  "cart.decrease": "Decrease quantity of {title}, size {size}",
  "cart.soldOutSince": "Sold out since you added it",
  "cart.unavailable": "This piece is no longer available",
  "cart.overStock": "Only {n} available — reduce the quantity",
  "cart.bagLabel": "Shopping bag, {n} items",

  // Wishlist
  "wishlist.title": "Wishlist",
  "wishlist.empty": "Nothing saved yet.",
  "wishlist.emptyBody":
    "Tap the heart on any piece to keep it here — it stays on this device, no account needed.",
  "wishlist.saved": "{n} pieces saved",
  "wishlist.savedOne": "{n} piece saved",
  "wishlist.remove": "Remove {title} from wishlist",
  "wishlist.save": "Save {title} to wishlist",
  "wishlist.browse": "Browse the collection",
  "wishlist.hint":
    "Pick a size to add a saved piece to your bag — saved items do not carry a size until you choose one.",

  // Search
  "search.title": "Search",
  "search.placeholder": "Search pieces, fabrics, categories",
  "search.results": "{n} results",
  "search.resultOne": "{n} result",
  "search.noResults": "No results for “{q}”.",
  "search.noResultsBody":
    "Try a fabric or a category instead — “linen”, “knitwear”, “coat”.",
  "search.viewAll": "View all {n} results",
  "search.try": "Try",
  "search.orBrowse": "Or browse",

  // Region & currency
  "region.title": "Region & currency",
  "region.region": "Region",
  "region.currency": "Currency",
  "region.language": "Language",
  "region.rateNotice":
    "Reference prices converted from USD at a demonstration rate. Not a live market rate.",
  "region.demoNotice":
    "Region only changes how prices are shown. Shipping, duties and local payment are not configured in this demo.",

  // Footer
  "footer.shop": "Shop",
  "footer.clientCare": "Client Care",
  "footer.studio": "Studio",
  "footer.sizeGuide": "Size guide",
  "footer.allPieces": "All pieces",
  "footer.rights": "All rights reserved.",
} as const;

export type DictionaryKey = keyof typeof en;
export type Dictionary = Record<DictionaryKey, string>;

const de: Dictionary = {
  "nav.home": "Startseite",
  "nav.women": "Damen",
  "nav.men": "Herren",
  "nav.knitwear": "Strick",
  "nav.outerwear": "Jacken & Mäntel",
  "nav.accessories": "Accessoires",
  "nav.search": "Suche",
  "nav.wishlist": "Merkliste",
  "nav.bag": "Warenkorb",

  "action.close": "Schließen",
  "action.clear": "Leeren",
  "action.remove": "Entfernen",
  "action.change": "Ändern",
  "action.continueShopping": "Weiter einkaufen",
  "action.viewBag": "Warenkorb ansehen",
  "action.quickAdd": "Schnell hinzufügen",
  "action.added": "Hinzugefügt",

  "pdp.colour": "Farbe",
  "pdp.size": "Größe",
  "pdp.selectColour": "Farbe wählen",
  "pdp.selectSize": "Größe wählen",
  "pdp.sizeGuide": "Größentabelle",
  "pdp.addToBag": "In den Warenkorb",
  "pdp.addedToBag": "Zum Warenkorb hinzugefügt",
  "pdp.soldOut": "Ausverkauft",
  "pdp.inStock": "Auf Lager",
  "pdp.lowStock": "Nur noch {n} verfügbar",
  "pdp.selectSizeFirst": "Größe wählen, um die Verfügbarkeit zu sehen",
  "pdp.soldOutInSize": "In dieser Größe ausverkauft",
  "pdp.detailsCare": "Details & Pflege",
  "pdp.material": "Material",
  "pdp.care": "Pflege",
  "pdp.shippingReturns": "Versand & Rückgabe",
  "pdp.fit": "Passform",
  "pdp.delivery": "Lieferung",
  "pdp.wornWith": "Dazu getragen",
  "pdp.enlarge": "Bild vergrößern",
  "pdp.viewAll": "Alle ansehen",

  "cart.title": "Warenkorb",
  "cart.empty": "Ihr Warenkorb ist leer.",
  "cart.emptyBody":
    "Hier erscheinen die Teile, die Sie hinzufügen. Die aktuelle Kollektion ist ein guter Anfang.",
  "cart.items": "{n} Artikel",
  "cart.item": "{n} Artikel",
  "cart.each": "{price} pro Stück",
  "cart.subtotal": "Zwischensumme",
  "cart.shipping": "Versand",
  "cart.calculatedAtCheckout": "Wird an der Kasse berechnet",
  "cart.complimentary": "Kostenlos",
  "cart.freeShippingApplied": "Kostenloser Versand aktiv.",
  "cart.freeShippingRemaining": "Noch {amount} bis zum kostenlosen Versand.",
  "cart.orderSummary": "Zusammenfassung",
  "cart.checkout": "Zur Kasse — Demo-Shop",
  "cart.checkoutNote":
    "Dies ist eine Portfolio-Demo. Es erfolgt keine Zahlung und keine Bestellung.",
  "cart.increase": "Menge erhöhen: {title}, Größe {size}",
  "cart.decrease": "Menge verringern: {title}, Größe {size}",
  "cart.soldOutSince": "Seit dem Hinzufügen ausverkauft",
  "cart.unavailable": "Dieses Teil ist nicht mehr verfügbar",
  "cart.overStock": "Nur {n} verfügbar — Menge reduzieren",
  "cart.bagLabel": "Warenkorb, {n} Artikel",

  "wishlist.title": "Merkliste",
  "wishlist.empty": "Noch nichts gespeichert.",
  "wishlist.emptyBody":
    "Tippen Sie bei einem Teil auf das Herz — es bleibt auf diesem Gerät, ohne Konto.",
  "wishlist.saved": "{n} gespeicherte Teile",
  "wishlist.savedOne": "{n} gespeichertes Teil",
  "wishlist.remove": "{title} von der Merkliste entfernen",
  "wishlist.save": "{title} zur Merkliste hinzufügen",
  "wishlist.browse": "Kollektion ansehen",
  "wishlist.hint":
    "Wählen Sie eine Größe, um ein gespeichertes Teil in den Warenkorb zu legen.",

  "search.title": "Suche",
  "search.placeholder": "Teile, Stoffe, Kategorien suchen",
  "search.results": "{n} Ergebnisse",
  "search.resultOne": "{n} Ergebnis",
  "search.noResults": "Keine Ergebnisse für „{q}“.",
  "search.noResultsBody":
    "Versuchen Sie einen Stoff oder eine Kategorie — „Leinen“, „Strick“, „Mantel“.",
  "search.viewAll": "Alle {n} Ergebnisse ansehen",
  "search.try": "Vorschläge",
  "search.orBrowse": "Oder stöbern",

  "region.title": "Region & Währung",
  "region.region": "Region",
  "region.currency": "Währung",
  "region.language": "Sprache",
  "region.rateNotice":
    "Referenzpreise, aus USD zu einem Demo-Kurs umgerechnet. Kein tagesaktueller Marktkurs.",
  "region.demoNotice":
    "Die Region ändert nur die Anzeige der Preise. Versand, Zoll und lokale Zahlung sind in dieser Demo nicht eingerichtet.",

  "footer.shop": "Shop",
  "footer.clientCare": "Kundenservice",
  "footer.studio": "Studio",
  "footer.sizeGuide": "Größentabelle",
  "footer.allPieces": "Alle Teile",
  "footer.rights": "Alle Rechte vorbehalten.",
};

export const dictionaries: Record<Locale, Dictionary> = { en, de };

/** Interpolates `{n}` style placeholders. Unknown keys fall back to English. */
export function translate(
  locale: Locale,
  key: DictionaryKey,
  vars?: Record<string, string | number>,
): string {
  const template = dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
  if (!vars) return template;

  return Object.entries(vars).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}
