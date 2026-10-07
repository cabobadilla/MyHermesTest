# Hello World — 10 Landing Page Style Options

A single self-contained `index.html` (vanilla HTML/CSS/JS, no build step) that renders the
same "Hello World" hero in **10 professional landing-page styles**. Each option pairs a
researched color palette with a Google Fonts typeface pairing, and every option ships a
light **and** a dark color system (not a naive inversion).

## Features

- 10 full-width sections, each with eyebrow, H1, lead, primary CTA, ghost CTA, and a spec bar
  (option number, style name, bg/surface/accent/text hex swatches, font pairing).
- `prefers-color-scheme: dark` support for every option, plus a fixed top-right toggle
  cycling **Auto → Light → Dark** via `data-theme` on `<html>`.
- WCAG AA contrast verified numerically in both modes (body ≥ 4.5:1, headings ≥ 3:1).
- In-page index nav (#1 … #10), responsive at 375px and 1440px, Google Fonts with `display=swap`
  and system fallbacks (no layout shift).
- Only external resources: `fonts.googleapis.com` / `fonts.gstatic.com`.

## The 10 combos

| # | Style name | Palette family | Accent (light) | Heading font | Body font | Vibe / best for |
|---|------------|----------------|----------------|--------------|-----------|-----------------|
| 1 | Slate Trust | cool neutral + blue | `#2563eb` | Inter | Inter | SaaS, dashboards |
| 2 | Jakarta Enterprise | indigo | `#4f46e5` | Plus Jakarta Sans | Inter | web apps, corporate |
| 3 | Sora Fintech | emerald | `#047857` | Sora | DM Sans | fintech, AI, data |
| 4 | Manrope Wellbeing | warm amber + sand | `#b45309` | Manrope | Nunito Sans | health, friendly brands |
| 5 | Playfair Editorial | rose/maroon | `#be123c` | Playfair Display | Inter | luxury, editorial |
| 6 | Space Grotesk Neo | violet (neo-chromatic) | `#7c3aed` | Space Grotesk | Inter | Web3, AI, creative tech |
| 7 | Outfit Startup | teal | `#0f766e` | Outfit | Work Sans | startup landing |
| 8 | Montserrat Corporate | cyan | `#0e7490` | Montserrat | Hind | corporate, structured |
| 9 | DM Serif Professional | zinc neutral | `#52525b` | DM Serif Display | DM Sans | professional services |
| 10 | Baskerville Authority | high-contrast mono | `#000000` | Libre Baskerville | Source Sans 3 | publishing, law, finance |

## How to view

- **Local:** open `index.html` directly in a browser, or run `python3 -m http.server` and visit
  `http://localhost:8000/`.
- **GitHub Pages:** push to your repository and enable Pages on the root of your branch —
  the file works as a static asset at a subpath.
- Use the **Auto / Light / Dark** button (top right) to cycle themes; the numbered nav jumps
  between options.
