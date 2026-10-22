# AUREL STUDIO — Design System

Phase 1 scope: homepage. Tokens here govern every later page, so changes cost more
than they look.

## Position

Modern essentials studio, US/UK/EU, editorial minimalism. The reference set is
COS / ARKET / ZARA's higher end — the target is *quiet*, not *loud*.

**Modes at play.** The homepage is **Persuade** (attention, atmosphere, a point of
view). Collection, PDP and checkout are **Operate** (scanability first). They share
tokens and typography, never the same layout density: the homepage gets large
negative space, the commerce pages get tighter rhythm.

## Typography

| Role | Face | Notes |
|---|---|---|
| Display / headings | Instrument Serif 400 | One weight only. Negative tracking (`-0.02em`), line-height `0.94` |
| Body / UI | Schibsted Grotesk 400 · 500 | 500 reserved for micro-labels and buttons |
| Numerals | Schibsted Grotesk, tabular | Prices and counts use `.tnum` |

Deliberately **not** Inter / Roboto / Geist / Plus Jakarta / Space Grotesk / Fraunces.
Those are the six faces AI-generated storefronts converge on; the detector flags them
as `overused-font`.

Scale is fluid, `clamp()` based, no breakpoint steps:

| Token | Size |
|---|---|
| Hero H1 | `clamp(2.6rem, 8vw, 8.25rem)` |
| Section H2 | `clamp(1.75rem, 3.4vw, 2.75rem)` |
| Editorial H2 | `clamp(1.9rem, 4.2vw, 3.5rem)` |
| Statement H2 | `clamp(1.7rem, 3.8vw, 3.1rem)` |
| Body | `0.85–0.95rem`, line-height `1.6` |
| Micro-label | `0.6875rem`, tracking `0.22em`, uppercase |

Rules:
- One idea per line at display sizes; headings cap at `15–18ch`.
- Micro-labels are the only uppercase text. Never uppercase a sentence.
- Body copy never exceeds `60ch`.

## Colour

No accent colour. The palette is warm neutral surfaces plus near-black ink; every
"highlight" is a value shift, never a hue.

| Token | Value | Use |
|---|---|---|
| `bone` | `#F4F1EA` | Page background |
| `cream` | `#FBF9F5` | Text on ink surfaces |
| `sand` | `#E7E1D4` | Image placeholders, pressed states |
| `ink` | `#17160F` | Primary text, announcement bar |
| `graphite` | `#2B2922` | Dark image backdrop |
| `stone` | `#6F6A5D` | Secondary text |
| `mist` | `#A8A294` | Tertiary text, eyebrows on bone |
| `line` | `#DDD7CA` | Hairlines only |

Contrast: body ink-on-bone is 14.8:1; `stone` on bone is 4.9:1 (passes AA);
`mist` is decorative-only and never carries prose.

## Space & layout

- Container: `max-w-[1560px]`, gutters `24 / 40 / 56px` (`px-6 md:px-10 lg:px-14`).
- Section rhythm: `py-20` → `py-28` on desktop; the statement block goes `py-36`.
- Grid: 12 columns on desktop. Editorial blocks deliberately start at column 4 —
  the left gutter stays empty so the page reads as a printed spread.
- Asymmetry is structural: the second collection card drops `mt-28`. Do not
  "fix" it into a row.

## Components

**Header** — announcement bar (ink, 36px) + sticky header (76px desktop / 64px
mobile) on flat bone with a single hairline. Wordmark is centred and set in
letter-spaced sans, not a logo image. Mega menu is CSS-only (hover + focus-within),
full-width, no shadow.

**Product card** — 3:4 image, no border, no shadow, no radius. Second image
crossfades on hover; image scale caps at `1.03`. Meta sits under the image: title,
category + season, colour dots, price right-aligned. Never wrap a card in a panel.

**Links & buttons** — text-first. Primary action is a micro-label with a 1px bottom
border that darkens on hover; secondary is the same label with no border. No filled
pills, no rounded rectangles, no icons-in-circles.

**Forms** — underline inputs only (`border-b`), label above in micro-label, no
box, no filled background.

## Motion

One curve: `cubic-bezier(0.16, 1, 0.3, 1)`. Durations `300ms` (hover), `500–700ms`
(image), `900ms` (reveal).

- Reveal-on-scroll: `IntersectionObserver`, 18px rise + fade. Elements already in
  view at mount never hide, so first paint is never empty.
- `prefers-reduced-motion` disables every transition and reveal.
- No parallax, no scroll-jacking, no attention-seeking loops.

## Bans

1. No box-shadows, anywhere.
2. No border radius except circles (colour dots) — images and panels stay square.
3. No accent colour, no gradients as decoration. The one permitted gradient is the
   hero's bottom scrim, and it exists only for headline legibility.
4. No nested cards, no cards-in-cards, no "icon in a rounded tile above a heading".
5. No uppercase prose, no letter-spaced body copy.
6. No stock-photo collage: if an image does not fit the tone, crop tighter or drop
   the section — never add a decorative frame to compensate.

## Commerce surfaces (phase 2)

The catalogue is **Operate** mode. It keeps the type and palette but drops the
homepage's air: tighter rhythm, more information per screen, no decorative imagery
beyond the product photography.

**Collection layout** — 12 columns split `210px` filter rail / fluid grid. The rail is
sticky and hairline-separated; on phones it becomes a left drawer with the same control
set, never a separate mobile design.

**Filter controls** — colour rows are swatch + name + count; size is a chip row; price is
a checkbox row with a drawn tick. All of them are real `<input type="checkbox">` with
`sr-only`, so keyboard and screen-reader behaviour comes from the platform. Every change
rewrites the URL; the panel dims while the server re-renders.

**Active filter chips** — bordered micro-labels with the value and an `×`. They sit above
the grid, never in the rail, so the rail stays a stable shape.

**Product card states** — default, hover (second frame + `1.03` scale), quick-add open
(inline size picker, sold-out sizes struck through and disabled), sold out (label over the
image, quick add disabled). Quick add and quick view sit on a bone bar over the image;
hidden until hover on desktop, always visible on touch — hover is not an input on phones.

**Product detail** — gallery left, purchase panel right and sticky. Colour swatches and
size chips are the only filled elements on the page: `ink` fill means selected. Sold-out
sizes keep a hairline border, go `mist` and struck — never red.

**Dialogs** (quick view, size guide, image zoom) — bone panels, no radius, no shadow, a
full-bleed `ink/45` scrim. Close on `×` and `Escape`; body scroll locked; focus moves to
the close control on open.

**Empty and loading states** — the empty state is a sentence plus a single action, aligned
to the same column as the grid heading. Loading is a skeleton that mirrors the real layout
so nothing jumps when the filtered view resolves.

## Overlays (phase 3)

Two overlays, one grammar: a full-bleed `ink/45` scrim, a bone panel, a hairline edge, no
radius, no shadow. Both lock body scroll, close on `Escape` and on the scrim, move focus to
the first control on open, and return focus to whatever opened them on close.

**Cart drawer** — 430px max, full width on phones, slides from the right in 400ms. Header
row with the bag count, scrolling line list, pinned footer with the summary. The empty state
is a sentence, a line of guidance and one link; it never shows an illustration.

**Search dialog** — drops from the top rather than sliding from a side, because it is a
temporary mode, not a place. Input is a single underlined field with no box; results are
rows, not cards. Suggestions are bordered chips so the empty state still looks composed.

**Line item** — 3:4 thumbnail, title, colour/size, unit price, quantity stepper, remove.
The stepper is the only bordered control in the row; the remove action is plain text. Stock
notes sit under the stepper in `stone`, and a dead line switches to `ink` — never red.

**Prices in a cart** — unit price left, line total right. Totals are always recomputed from
the catalogue, so a stale snapshot can never show a wrong subtotal.

**Checkout** — a filled sand button with `mist` type, permanently `disabled`, directly
followed by one sentence explaining that no payment is taken. A button that does nothing is
not allowed; a button that explains why is.

## Cross-border presentation (phase 4)

**Currency** — the symbol and the grouping change; nothing else does. A price is always
`ink`, never a different weight or colour for a converted amount, and a converted price is
never dressed up as a promotion. The demo-rate notice is set in `stone` at `0.7rem`, directly
under the block it qualifies — not in a footer disclaimer nobody reads.

**Region dialog** — same grammar as the cart drawer and search: bone panel, hairlines,
uppercase micro-labels, serif title, everything on one axis. Regions are plain rows with the
currency code right-aligned, because a row of four flags would be decoration, not
information. Currency and language are bordered chips so the three decisions read as one
group.

**Language** — German is a UI translation, and it shows: headings stay Instrument Serif (the
serif carries Latin diacritics without adjustment), the uppercase micro-labels keep their
tracking, and no string gets longer than its container at 375px. Product copy stays English
and is never machine-translated to look complete.

**Metadata** is part of the design system, not an afterthought: the site title uses the same
em-dash cadence as the headlines, product descriptions are the copy already written for the
page, and OG images are the product's own campaign frame rather than a generic brand card.

## Responsive

`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Only `md` and `lg` carry layout
changes; everything else is fluid. Hero uses `svh` so mobile browser chrome does not
clip the campaign image. Product meta stacks under the title below `md` and moves to a
right-aligned column at `md`, so prices line up. The region trigger lives in the header only
from `lg`; below that it lives in the footer block, so no icon row ever overflows at 375px.

## Open items for later phases

- Motion library (Motion) is intentionally not installed — the reveal, the drawer, the
  dialogs and the progress bar are CSS transitions.
- Demo checkout is phase 5; the disabled affordance is already in place.
- Search is a weighted token scan; a real index is only worth it at catalogue scale.
- A German launch would need `/de` routes, server-side dictionaries and `hreflang`. The
  typed dictionary and locale switch already exist; only the routing layer is missing.



