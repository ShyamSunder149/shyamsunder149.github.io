# Portfolio (Static)

A static software engineer portfolio.

## Setup

1. **Clone** the repo.
2. **Serve** locally:
   You can use any static file server, e.g., `python3 -m http.server` or `npx serve`.

   ```bash
   npx serve .
   ```
3. **Open** `http://localhost:3000`.

## Deployment

### Vercel

1. Push to GitHub.
2. Import project in Vercel.
3. Vercel will auto-detect it as a static site.
4. Deploy!

### GitHub Pages

1. Go to Settings > Pages.
2. Set source to `main` branch (root).

## Customization

- Edit `data/experience.json` and `data/skills.json` to update content.
- Edit `index.html` for main bio/text.
- Add `side-project` topic to GitHub repos to display them.
