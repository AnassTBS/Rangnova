import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { pageMetadata } from "../src/translations.js";
import {
  generatePrerenderedRoutes,
  ROUTES,
  SITE_ORIGIN,
} from "../scripts/prerender-routes.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("generates initial route metadata for every configured public route", async () => {
  const shellHtml = await readFile(path.join(projectRoot, "index.html"), "utf8");
  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "rangnova-prerender-"));

  try {
    await generatePrerenderedRoutes({ shellHtml, outputDirectory });

    assert.deepEqual(ROUTES, [
      "/",
      "/services",
      "/about",
      "/contact",
      "/privacy",
      "/careers",
    ]);

    for (const route of ROUTES) {
      const routeDirectory = route === "/"
        ? outputDirectory
        : path.join(outputDirectory, route.slice(1));
      const html = await readFile(path.join(routeDirectory, "index.html"), "utf8");
      const [title, description] = pageMetadata.en[route];
      const canonicalUrl = `${SITE_ORIGIN}${route === "/" ? "/" : route}`;

      assert.match(html, new RegExp(`<title>${escapeRegExp(escapeHtml(title))}</title>`), route);
      assert.match(html, new RegExp(`<meta\\s+name="description"\\s+content="${escapeRegExp(escapeHtml(description))}"`), route);
      assert.match(html, new RegExp(`<link\\s+rel="canonical"\\s+href="${escapeRegExp(canonicalUrl)}"`), route);
      assert.match(html, new RegExp(`<meta\\s+property="og:title"\\s+content="${escapeRegExp(escapeHtml(title))}"`), route);
      assert.match(html, new RegExp(`<meta\\s+property="og:description"\\s+content="${escapeRegExp(escapeHtml(description))}"`), route);
      assert.match(html, new RegExp(`<meta\\s+property="og:url"\\s+content="${escapeRegExp(canonicalUrl)}"`), route);
      assert.match(html, new RegExp(`<meta\\s+property="og:image"\\s+content="${SITE_ORIGIN}/rangnova-mark\\.webp"`), route);
      assert.match(html, /<meta\s+property="og:locale"\s+content="en_US"/, route);
      assert.match(html, new RegExp(`<meta\\s+name="twitter:title"\\s+content="${escapeRegExp(escapeHtml(title))}"`), route);
      assert.match(html, new RegExp(`<meta\\s+name="twitter:description"\\s+content="${escapeRegExp(escapeHtml(description))}"`), route);
      assert.match(html, new RegExp(`<meta\\s+name="twitter:image"\\s+content="${SITE_ORIGIN}/rangnova-mark\\.webp"`), route);
      assert.doesNotMatch(html, /https:\/\/rangnova\.com(?:\/|["'<])/);
      assert.match(html, /<div id="root"><\/div>/);
      assert.match(html, /application\/ld\+json/);
      assert.match(html, /<script type="module" src="\/src\/main\.jsx"><\/script>/);
    }
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

test("routes only configured public paths and preserves clean-URL redirects", async () => {
  const vercelConfig = JSON.parse(
    await readFile(path.join(projectRoot, "vercel.json"), "utf8"),
  );
  const publicRoutes = ["/services", "/about", "/contact", "/careers", "/privacy"];

  assert.deepEqual(vercelConfig.rewrites, publicRoutes
    .map((route) => ({
      source: route,
      destination: `${route}/index.html`,
    })));

  assert.deepEqual(vercelConfig.redirects, publicRoutes
    .map((route) => ({
      source: `${route}/`,
      destination: route,
      permanent: true,
    })));
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
