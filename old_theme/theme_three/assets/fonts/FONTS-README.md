# Font Installation Guide — Scarlet Royal

## Required Font Files

Place your licensed font files in the following directories:

### 1. Neue Power Ultra (Logo wordmark only)
**Directory:** `old_theme/theme_three/assets/fonts/NeuePower/`

Required files (any ONE format is enough, but more = better browser support):
- `NeuePower-Ultra.woff2` ← Best (smallest file size)
- `NeuePower-Ultra.woff`
- `NeuePower-Ultra.otf`
- `NeuePower-Ultra.ttf`

### 2. Gotham (Headlines, navigation, buttons)
**Directory:** `old_theme/theme_three/assets/fonts/Gotham/`

Required files for each weight:
| Weight | Files needed |
|--------|-------------|
| Light (300) | `Gotham-Light.woff2` / `.woff` / `.otf` / `.ttf` |
| Book (400) | `Gotham-Book.woff2` / `.woff` / `.otf` / `.ttf` |
| Medium (500) | `Gotham-Medium.woff2` / `.woff` / `.otf` / `.ttf` |
| Bold (700) | `Gotham-Bold.woff2` / `.woff` / `.otf` / `.ttf` |
| Black (900) | `Gotham-Black.woff2` / `.woff` / `.otf` / `.ttf` |

### 3. Montserrat (Body text)
**No action needed** — loaded automatically from Google Fonts CDN.

## How to Convert Fonts
If you only have `.otf` or `.ttf` files, convert them to `.woff2` for best performance:
- Use https://transfonter.org/ or https://cloudconvert.com/

## Verification
After adding font files, refresh the page. Open browser DevTools → Elements → Computed → look for `font-family`. You should see:
- Logo: `Neue Power Ultra`
- Headings/Nav/Buttons: `Gotham`
- Body text: `Montserrat`
