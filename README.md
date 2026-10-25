# FrameXTV Community — Stremio addon starter

A Cloudflare Workers Free-compatible **starter**, not yet a functional FrameXTV stream integration. It intentionally ships with **zero streams**: no verified, licensed source feed has been provided. The Worker returns a valid Stremio manifest and empty catalogs/streams until you configure authorized content.

## Deploy

1. Install Node.js 20+.
2. Open this project folder in a terminal.
3. Run `npm install`.
4. Run `npx wrangler login` and authorize Cloudflare in your browser. **Do not send anyone your Cloudflare password or API token.**
5. Run `npm run deploy`.
6. Copy the HTTPS `workers.dev` URL Wrangler prints and append `/manifest.json`.
7. Paste that URL into Stremio's addon install field.

Example URL format (not a deployed address): `https://framextv-stremio.YOUR-SUBDOMAIN.workers.dev/manifest.json`

## API

- `/manifest.json` — Stremio manifest
- `/catalog/movie/framextv-movie.json` — movies
- `/catalog/series/framextv-series.json` — series
- `/catalog/tv/framextv-tv.json` — live TV
- `/meta/{type}/{id}.json` — item metadata
- `/stream/{type}/{id}.json` — authorized playback sources
- `/health` — basic health check

## Add content

`src/index.ts` has a `CONTENT` array with `Item` definitions. Add only content and HTTPS stream URLs that you are authorized to publish. Use unique IDs prefixed `framextv:`. Series episodes use unique video IDs and streams must be mapped to episode IDs before release. This starter currently uses an in-memory list, not a production feed integration.

## Before public release

- Verify rights to publicly list and redistribute streams and artwork.
- Validate the FrameXTV site's actual API/feed and terms; **no FrameXTV endpoints have been verified**.
- Add per-episode stream mapping, refresh strategy, robust content validation, and pagination.
- Test playback and compatibility on target Stremio clients. Live TV support varies by client.
- Add rate limiting, monitoring, and a content removal contact.
- Respect Cloudflare Workers Free plan quotas; if exceeded, requests may fail.

This code does not scrape FrameXTV, bypass access controls, or proxy video.
