# Mason64 — House of Chess

Static one-page site. No build step, no dependencies to install.

## Files

- `index.html` — the page
- `chess-scene.js` — the scroll-driven 3D board (three.js, loaded from a CDN)
- `styles.css` — design tokens and component classes

## Run locally

Needs a local server (the 3D scene is an ES module):

```
npx serve .
```

## Push to GitHub

```
git init
git add .
git commit -m "Mason64 landing page"
git branch -M main
git remote add origin https://github.com/rahulkhanna5/mason64.git
git push -u origin main
```

## Deploy on Vercel

Import the repo at vercel.com/new. It's a static site — leave Framework Preset
as "Other", no build command, output directory `.`. If the repo root is the
parent of this folder, set Root Directory to `site`.

## Editing

- WhatsApp number: search `919549551895` in `index.html` (5 links).
- Prices and tier names: the three `.card` blocks in the `#collection` section.
- Board and piece geometry, colours, and the scroll animation: `chess-scene.js`.
