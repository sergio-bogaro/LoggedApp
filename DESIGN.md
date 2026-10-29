# Logged — design notes

## Idea

A personal register, not a dashboard. The app should read like a well-kept
ledger: paper, ink, hairline rules, one clear entry per title, and artwork
that is allowed to bring the colour.

## Palette

| Role | Light | Dark |
|---|---|---|
| ground | `#fbfbf9` paper | `#131518` |
| ink | `#14171a` | `#e8e8e2` |
| muted | `#6e7276` | `#9aa0a6` |
| line | `#dcdcd6` | `#2a2e33` |
| signal | `#2f5d50` | `#7fb3a0` |
| rating | `#a3791f` | `#d8b871` |

The categorical ramp (`--type-film` … `--type-music`) is reserved for media
types. It is used by the type rule, the cover fallback and the doughnut. Time
and rating charts use ink so colour never implies the wrong category.

## Type

- **Newsreader** — page titles, section headings, numerals, poster initials.
- **Archivo** — body, UI, labels, metadata.
- Page titles use `text-title` (clamped 28–34px). Section headings stay at
  `text-step-4`; the contrast between the two is the hierarchy.
- Numerals in the register and statistics are tabular.

## Layout

- Main content: `max-width: 1280px`, centred, 16/24/32px side padding.
- Top bar: 48px, sticky, solid paper with a light blur.
- Content rhythm: 24px inside a page, 40px between register sections,
  48px between settings sections.
- Reading widths: settings 1040px, media details 1100px, search band 900px.
- Row rules are hairlines; cards use one 8px poster radius and a hairline,
  never a stack of shadows.

## Motion

Quiet by default. 150–200ms ease-out for hover and focus. The register row
answers with a background wash, a type rule that grows and a poster that lifts
1px. Buttons press down 1px. Charts draw without animation. Under
`prefers-reduced-motion` the global CSS rule removes the transitions.

## States

- Missing cover → `PosterFallback`: paper, type rule, serif initials. It is
  honest placeholder artwork, not a fake cover.
- Empty states are dashed planes with an icon, a serif title, one sentence and
  one action where the user can take it.
- Errors use the same plane with an alert icon.
- Loading mirrors the final layout: poster skeletons keep the same radius,
  grid and gradient as the loaded cards.

## Entry screens

The welcome page is a split composition: wordmark, statement and the seven
media types on the left; access and preferences on the right. Login, register
and onboarding use the same wordmark above a single centred card. The 404 is
the same system with a display numeral instead of a form.
