import { assets } from 'pilot-assets';
import { handlePilot } from './pilot.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handlePilot(request, env);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    if (url.pathname === '/robots.txt') return new Response('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /#operations\n', { headers: { 'Content-Type': 'text/plain' } });
    if (url.pathname === '/sitemap.xml') return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url.origin}/</loc></url><url><loc>${url.origin}/privacy</loc></url><url><loc>${url.origin}/terms</loc></url></urlset>`, { headers: { 'Content-Type': 'application/xml' } });
    const asset = assets[url.pathname] ?? (['/', '/privacy', '/terms'].includes(url.pathname) ? assets['/index.html'] : null);
    if (!asset) return new Response('Page not found', { status: 404 });
    const headers = {
      'Content-Type': asset.type,
      'Cache-Control': url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    };
    const bytes = Uint8Array.from(atob(asset.body), c => c.charCodeAt(0));
    return new Response(request.method === 'HEAD' ? null : bytes, { headers });
  },
};
