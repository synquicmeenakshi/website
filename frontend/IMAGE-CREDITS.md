# Image credits

## Supplied by the client

The eight service illustrations, one per discipline, used across the home-page
mosaic, the services index and each service page:

| File | Service |
|---|---|
| `svc-astrology.png` | Astrology |
| `svc-numerology.png` | Numerology |
| `svc-vastu.png` | Vastu Shastra |
| `svc-rune.png` | Rune Card Reading |
| `svc-karma.png` | Karma Alignment |
| `svc-swar.png` | Swar Vigyan |
| `svc-remedies.png` | Spiritual Remedies & Counselling |
| `svc-graphology.png` | Graphology |

Also supplied: `portrait-hero.png`, `scene-astrology.png`,
`scene-numerology.png`, `scene-vastu.png`, `paper-texture.png`.

`zodiac-sun.png` is cropped from the booking-page reference
(`~/Desktop/assets/image.png`) with all of its text removed; that page's text is
set in code.

Unused supplied files (`kundli-chart.png`, `arch-frame.png`,
`ornament-mandala.png`, `disc-saffron.png`, `zodiac-wheel.png`) were left out of
the repo. The originals remain in `~/Desktop/` and `~/Desktop/assets/`.

## Photography — Unsplash

Downloaded and served locally from `public/img/`. The Unsplash License permits
free commercial and non-commercial use without permission; attribution is not
required but is given here.

| File | Subject | Used for |
|---|---|---|
| `in-hawamahal.jpg` | Hawa Mahal, Jaipur | Hero cell, services masthead |
| `in-diya-plate.jpg` | Lit diya on a plate of flowers | Nav panel |
| `in-rudraksha.jpg` | Rudraksha mala | Rune Reading detail |
| `temple-sky.jpg` | Temple against sky | Why Meenakshi band |
| `temple-arch.jpg` | Temple archway | Hero cell, journey, booking corners |
| `temple-hall.jpg` | Pillared stone corridor | Nav panel, journey |
| `ritual-brass.jpg` | Incense in a brass bowl | Nav panel |
| `ritual-incense.jpg` | Single incense stick | Nav panel |
| `ritual-smoke.jpg` | Rising smoke | Karma / Swar details |
| `ritual-plate.jpg` | Brass offering plate | Nav panel, remedies detail |
| `pen-writing.jpg` | Fountain pen on written paper | Nav panel, graphology detail |
| `pen-ink.jpg` | Fountain pen nib with ink | Graphology detail |

**Before launch:** convert everything here to WebP/AVIF at delivery resolution.
The supplied PNGs in particular are 1–2.5MB each and account for most of the
build weight.

## Drawn, not sourced

The zodiac chakra, north-Indian bhava chart, yantra, numerology square, rune
cast, the twelve rashi glyphs and the starfield are SVG, in
`src/components/Jyotish.jsx`. They take `currentColor`, fill their container and
never crop. The hero's astrology cell and the featured-astrology spread use
them; the mosaic now uses the supplied artwork instead.
