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

IslaViva RD supports five languages: Spanish (`es`), German (`de`), English (`en`), French (`fr`), and Haitian Creole (`ht`).

For each new editorial guide (for example `new-guide.html`):
1. Create a Spanish source HTML page at the repository root, including the shared `guide-i18n.js` language picker.
2. Add every visible Spanish text fragment and four translations to the dictionary in `guide-i18n.js`.
3. Publish **real, static translated HTML** under `de/new-guide.html`, `en/new-guide.html`, `fr/new-guide.html`, and `ht/new-guide.html`. Do not rely on JavaScript alone to translate the content for search engines.
4. Give all five pages their own language-appropriate title, meta description, self-referencing canonical, `<html lang>`, and reciprocal `hreflang` links including `x-default` (Spanish).
5. Link between related guides in the same selected language, and preserve `islaviva-language` on navigation. Keep the homepage linked and usable.
6. Add all five URLs to `sitemap.xml` with reciprocal `xhtml:link` language alternates; update `lastmod` only after substantive edits.
7. Run `node scripts/check-guides.mjs` and `node scripts/check-localized-seo.mjs`, and review actual language quality and live deployment.

The GitHub workflow `Check five-language guides` runs on relevant HTML/script changes. It reports failures but currently does not block the Cloudflare Pages deployment. The root Spanish page must remain crawlable without browser-language-based redirects.

**Current scope:** the homepage and both local guides each have five unique URLs with localized HTML, self-canonical links and reciprocal hreflang. The four localized homepages preserve the original full interactive homepage, with their main static copy translated in HTML and the remaining components rendered by the existing client-side translation code. Some dynamic or asynchronous news/service content can still depend on JavaScript and source-language data. This is not a guarantee of indexing or complete translation of every external data source.

Homepage URLs: `/`, `/de/`, `/en/`, `/fr/`, `/ht/`. All 15 localized URLs are in `sitemap.xml`. New homepage content must be added to all four static HTML homepages and verified across all five languages; keep relative data URLs rooted at `/data/` in subdirectory homepages.

## Single-source homepage workflow

The homepage now uses **one JavaScript runtime** (`assets/home-app.js`) and **one stylesheet** (`assets/home.css`) for all five languages. The Spanish homepage (`index.html`) is the canonical HTML layout source.

The localized homepage content and SEO head tags live in `home-locales.json`. The four language homepages (`de/index.html`, `en/index.html`, `fr/index.html`, `ht/index.html`) are **generated artifacts**, not files to edit by hand.

To regenerate them locally:
```sh
node scripts/build-homepages.mjs
node scripts/build-homepages.mjs --check
node scripts/check-home-runtime.mjs
node scripts/check-localized-seo.mjs
```

A GitHub Action (`Sync localized homepages`) regenerates and commits the four translated files on pushes to `main` that change `index.html`, `home-locales.json`, or the generator itself. The sync job needs repository GitHub Actions write permissions. The separate `Check five-language guides` workflow builds the localized files in its runner before validating them. A GitHub Actions run does not itself confirm that Cloudflare has deployed the new version.

**When extending the homepage:** update `index.html` as the shared layout; add or revise the corresponding entries for all four languages in `home-locales.json`; update common behavior in `assets/home-app.js` and styles in `assets/home.css`. Never create per-language copies of new JavaScript or CSS. New translatable static text should use `data-t` or `data-t-html`; the generator fails on missing locale entries. The root data-fetch paths must remain absolute, such as `/data/weather.json`.

## Continuous quality checks

GitHub Actions verifies IslaViva RD at three levels, without third-party monitoring subscriptions:

1. `Check five-language guides` checks generated homepages, translations, sitemap, canonical/hreflang and shared frontend structure on relevant commits.
2. `Check site and automation code` runs the Python news/SEO/fuel tests, JavaScript checks and feed JSON validation.
3. `Smoke-test public IslaViva RD website` checks all **15 deployed pages**, assets, canonical/hreflang links and weather/news data by HTTPS **twice daily** (07:23 and 19:23 UTC), and on changes to the smoke-test code.
4. `Browser regression test IslaViva RD` runs a real headless Chromium browser **once daily** (06:47 UTC), and on changes to the browser-test code. It checks visible temperature, news cards, three merchant cards, city switching, links and language switching.

The scheduled jobs show failures in GitHub Actions; they do **not** automatically message the site owner or guarantee an issue will be fixed. They are not substitutes for manual visual, accessibility, security or external-service checks. GitHub Actions usage is subject to the repository's GitHub billing/usage quotas; avoid claiming unlimited free compute. Public availability may temporarily diverge from the latest repository commit during Cloudflare deployment.
