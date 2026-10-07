# BRIEF — 10 professional landing-page style options

Implement a SINGLE self-contained file `index.html` (vanilla, no build step) that
showcases a "Hello World" hero rendered in **10 different professional landing-page
style options**. Each option combines a researched COLOR PALETTE + FONT PAIRING.
This is for GitHub Pages, so it must work as a static file at a subpath.

## Hard requirements

1. `index.html` at the REPO ROOT (GitHub Pages serves from root).
2. **No local asset files.** Google Fonts via `<link>` to `fonts.googleapis.com` is
   REQUIRED here (we want the real typefaces). No other external deps, no JS libs.
3. Each of the 10 options is a full-width section with:
   - an eyebrow/kicker, a large `Hello World` headline, a 1–2 line subhead,
     a primary CTA button and a secondary ghost button,
   - a small "spec bar" showing: option number, style name, hex swatches
     (bg / surface / accent / text) and the font pairing name.
4. `prefers-color-scheme: dark` support for EVERY option, plus a fixed top-right
   toggle cycling **Auto → Light → Dark** via `data-theme` on `<html>`.
5. WCAG AA: body text ≥ 4.5:1, large headings ≥ 3:1, in BOTH modes. Verify numerically.
6. Also generate `README.md` (short: what it is, the 10 combos in a table, how to view).

## The 10 researched combos (implement exactly these)

Research basis: 2026 SaaS landing-page guidance favors restrained 2-color palettes
with ONE protected CTA accent, disciplined neutrals, and separate light/dark color
systems (not naive inversion). Font pairings follow the "contrast, not conflict"
rule — one voicey heading face over one neutral, readable body face.

| # | Style name                | Palette family      | Accent (light) | Heading font        | Body font      | Vibe / best for            |
|---|---------------------------|---------------------|----------------|---------------------|----------------|----------------------------|
| 1 | Slate Trust               | cool neutral + blue | `#2563eb`      | Inter               | Inter          | SaaS, dashboards           |
| 2 | Jakarta Enterprise        | indigo              | `#4f46e5`      | Plus Jakarta Sans   | Inter          | web apps, corporate        |
| 3 | Sora Fintech              | emerald             | `#047857`      | Sora                | DM Sans        | fintech, AI, data          |
| 4 | Manrope Wellbeing         | warm amber + sand   | `#b45309`      | Manrope             | Nunito Sans    | health, friendly brands    |
| 5 | Playfair Editorial        | rose/maroon         | `#be123c`      | Playfair Display    | Inter          | luxury, editorial          |
| 6 | Space Grotesk Neo         | violet (neo-chromatic)| `#7c3aed`    | Space Grotesk       | Inter          | Web3, AI, creative tech    |
| 7 | Outfit Startup            | teal                | `#0f766e`      | Outfit              | Work Sans      | startup landing            |
| 8 | Montserrat Corporate      | cyan                | `#0e7490`      | Montserrat          | Hind           | corporate, structured      |
| 9 | DM Serif Professional     | zinc neutral        | `#52525b`      | DM Serif Display    | DM Sans        | professional services      |
| 10| Baskerville Authority     | high-contrast mono  | `#000000`      | Libre Baskerville   | Source Sans 3  | publishing, law, finance   |

Rules for the palettes:
- Light mode: near-white/very light tinted background, subtle surface, dark text.
- Dark mode: deep near-black/slate background (NOT pure inversion), light text, and
  **desaturated accents** — redesign the accent lightness for dark, do not reuse the
  light hex verbatim on a dark surface.
- Option 10 (mono) stays strictly black/white/grey with one accent-free treatment.
- Keep exactly ONE accent per option; do not spray color across decorative elements.

Google Fonts link must load only the weights used:
headings 600/700, body 400 (+500 if needed). Use `display=swap`.

## Typography scale (apply to all options)

- H1 hero: clamp(2.25rem, 6vw, 3.5rem), line-height 1.1–1.15, weight 700
- Lead/subhead: 1.125rem, line-height 1.6
- Body: 1rem (never below 16px), line-height 1.65
- Eyebrow: 0.8125rem, uppercase, letter-spacing .08em
- Container max-width ~72rem, comfortable padding, generous vertical rhythm

## Layout / quality bar

- Sticky-ish vertical stack of sections, each with its own background so the
  palettes are directly comparable.
- Responsive: works at 375px and 1440px.
- Subtle borders, soft shadows, rounded corners (12–16px), smooth transitions.
- A small in-page index/nav at the top linking to each option (#1..#10).
- No layout shift from font loading (set sensible fallbacks).

## Process

1. Write `index.html` and `README.md`.
2. VERIFY BEFORE FINISHING, and fix anything that fails:
   - every option appears exactly once (count sections == 10);
   - each Google font family referenced is actually loaded in the `<link>`;
   - compute contrast ratios for body text vs its background AND heading vs
     background, in light and dark, for all 10 options — print a table and the
     pass/fail, then fix any failing pair by adjusting the color;
   - `node --check` on any inline JS;
   - no forbidden external resources (only fonts.googleapis.com / fonts.gstatic.com).
3. Print the final verification results.
