# IslaViva RD 🌴

Multilingual Dominican Republic portal prototype (Español, Kreyòl, Deutsch, English, Français).

## Deployment
Connect this repository to Cloudflare Pages (production branch: `main`; Framework preset: None; Build command: empty; Output directory: `/`).

## Content automation
A scheduled GitHub Action retrieves headline metadata from publicly available RSS feeds every three hours. It publishes links, not full third-party articles. The frontend reads `data/news.json`, when available.

**Status:** Prototype. News metadata is not a licensed editorial feed or translated content. Weather, newsletter signup, and local services are not yet connected. Never treat demo cards as verified current information.

<!-- Cloudflare Git integration verification: 2026-11-19 -->

<!-- Trigger Cloudflare Pages deployment after enabling Web Analytics: 2026-11-19 -->

## Multilingual content policy (required)

IslaViva RD supports five interface languages: Spanish (`es`), German (`de`), English (`en`), French (`fr`), and Haitian Creole (`ht`).

All new root-level editorial HTML pages must:
1. Provide Spanish source content in HTML for basic discoverability.
2. Include the selector `id="guide-language"` with all five language options.
3. Load the shared script `<script src="/guide-i18n.js" defer></script>` before `</body>`.
4. Add every visible source-text fragment and its four translations to `guide-i18n.js`.
5. Honor the existing `islaviva-language` localStorage preference, so the choice carries between the homepage and guides.
6. Keep canonical metadata, indexability, and navigation back to the homepage.

Run `node scripts/check-guides.mjs` to verify all root content pages; the GitHub workflow `Check five-language guides` also runs on affected pushes and pull requests. It reports failures but does **not** by itself prevent Cloudflare deployment. A new content page is not ready until this check passes and translations are manually reviewed for quality. External merchant names and URLs are not translated.

For standalone SEO in each language, distinct localized URLs and `hreflang` tags would be an additional future improvement. Current guide translation runs in the browser and the Spanish source remains the canonical crawled document.
