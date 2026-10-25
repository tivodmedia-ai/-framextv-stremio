/** Stremio addon skeleton for Cloudflare Workers.
 * No third-party scraping or unverified streams are bundled.
 * Populate CONTENT only with material you have permission to distribute.
 */
interface Env { ADDON_NAME?: string }
type Kind = 'movie' | 'series' | 'tv';
type Item = {
  id: string; type: Kind; name: string; poster?: string;
  description?: string; genres?: string[];
  streams?: { title?: string; url: string; behaviorHints?: { notWebReady?: boolean } }[];
  videos?: { id: string; title: string; season: number; episode: number; released?: string }[];
};
const CONTENT: Item[] = [];
const TYPES: Kind[] = ['movie', 'series', 'tv'];
const CATALOGS = TYPES.map(type => ({ type, id: `framextv-${type}`, name: `FrameXTV ${type === 'tv' ? 'Live TV' : type === 'movie' ? 'Movies' : 'Series'}`, extra: [{ name: 'search', isRequired: false }] }));
const headers = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=60' };
function json(data: unknown, status = 200): Response { return new Response(JSON.stringify(data), { status, headers }); }
function meta(item: Item) { return { id: item.id, type: item.type, name: item.name, poster: item.poster, description: item.description, genres: item.genres, videos: item.videos }; }
function validUrl(url: string): boolean { try { const u = new URL(url); return u.protocol === 'https:'; } catch { return false; } }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/' || path === '/health') return json({ status: 'ok', addon: env.ADDON_NAME || 'FrameXTV Community', items: CONTENT.length });
    if (path === '/manifest.json') return json({
      id: 'community.framextv.stremio', version: '0.1.0',
      name: env.ADDON_NAME || 'FrameXTV Community',
      description: 'Community addon framework. Catalogs appear when authorized sources are configured.',
      resources: ['catalog', 'meta', 'stream'], types: TYPES, catalogs: CATALOGS,
      idPrefixes: ['framextv:'], behaviorHints: { configurable: false }
    });
    const match = path.match(/^\/(catalog|meta|stream)\/(movie|series|tv)\/([^/]+)\.json$/);
    if (!match) return json({ error: 'Not found' }, 404);
    const [, resource, type, encoded] = match;
    let identifier: string;
    try { identifier = decodeURIComponent(encoded); } catch { return json({ error: 'Bad identifier' }, 400); }
    if (resource === 'catalog') {
      if (identifier !== `framextv-${type}`) return json({ metas: [] });
      const search = url.searchParams.get('search')?.toLowerCase().trim();
      const metas = CONTENT.filter(x => x.type === type && (!search || x.name.toLowerCase().includes(search))).map(meta);
      return json({ metas });
    }
    const item = CONTENT.find(x => x.type === type && (x.id === identifier || x.videos?.some(v => v.id === identifier)));
    if (resource === 'meta') return json({ meta: item ? meta(item) : null });
    const streams = item?.streams?.filter(s => validUrl(s.url)) || [];
    return json({ streams });
  }
} satisfies ExportedHandler<Env>;
