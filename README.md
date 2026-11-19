# IslaViva RD 🌴

Multilingual Dominican Republic portal prototype (Español, Kreyòl, Deutsch, English, Français).

## Deployment
Connect this repository to Cloudflare Pages (production branch: `main`; Framework preset: None; Build command: empty; Output directory: `/`).

## Content automation
A scheduled GitHub Action retrieves headline metadata from publicly available RSS feeds every three hours. It publishes links, not full third-party articles. The frontend reads `data/news.json`, when available.

**Status:** Prototype. News metadata is not a licensed editorial feed or translated content. Weather, newsletter signup, and local services are not yet connected. Never treat demo cards as verified current information.
