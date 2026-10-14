import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageMetadata } from "../src/translations.js";

export const SITE_ORIGIN = "https://www.rangnova.com";
export const ROUTES = Object.keys(pageMetadata.en);
const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/rangnova-mark.webp`;
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..");

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getAttribute(tag, attributeName) {
  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return tag.match(new RegExp(`\\b${escapedName}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2];
}

function replaceMetaContent(html, selectorAttribute, selectorValue, content) {
  let found = false;
  const updated = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    if (getAttribute(tag, selectorAttribute) !== selectorValue) return tag;

    found = true;
    const escapedContent = escapeHtmlAttribute(content);
    return tag.replace(
      /(\bcontent\s*=\s*)(["'])[\s\S]*?\2/i,
      (_match, prefix, quote) => `${prefix}${quote}${escapedContent}${quote}`,
    );
  });

  if (!found) {
    throw new Error(`Required metadata tag not found: ${selectorAttribute}="${selectorValue}"`);
  }
  return updated;
}

function replaceCanonicalHref(html, canonicalUrl) {
  let found = false;
  const updated = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (getAttribute(tag, "rel") !== "canonical") return tag;

    found = true;
    const escapedUrl = escapeHtmlAttribute(canonicalUrl);
    return tag.replace(
      /(\bhref\s*=\s*)(["'])[\s\S]*?\2/i,
      (_match, prefix, quote) => `${prefix}${quote}${escapedUrl}${quote}`,
    );
  });

  if (!found) throw new Error('Required canonical link not found: rel="canonical"');
  return updated;
}

export function renderRouteHtml(shellHtml, route) {
  const metadata = pageMetadata.en[route];
  if (!metadata) throw new Error(`No English page metadata configured for route: ${route}`);

  const [title, description] = metadata;
  const canonicalUrl = `${SITE_ORIGIN}${route === "/" ? "/" : route}`;
  if (!/<title\b[^>]*>[\s\S]*?<\/title>/i.test(shellHtml)) {
    throw new Error("Required title element not found.");
  }
  let html = shellHtml.replace(
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    () => `<title>${escapeHtmlAttribute(title)}</title>`,
  );

  html = replaceMetaContent(html, "name", "description", description);
  html = replaceMetaContent(html, "property", "og:title", title);
  html = replaceMetaContent(html, "property", "og:description", description);
  html = replaceMetaContent(html, "property", "og:url", canonicalUrl);
  html = replaceMetaContent(html, "property", "og:image", SOCIAL_IMAGE_URL);
  html = replaceMetaContent(html, "property", "og:locale", "en_US");
  html = replaceMetaContent(html, "name", "twitter:title", title);
  html = replaceMetaContent(html, "name", "twitter:description", description);
  html = replaceMetaContent(html, "name", "twitter:image", SOCIAL_IMAGE_URL);
  html = replaceCanonicalHref(html, canonicalUrl);
  return html;
}

export async function generatePrerenderedRoutes({
  shellHtml,
  outputDirectory,
} = {}) {
  if (typeof shellHtml !== "string") {
    throw new TypeError("A built index.html shell must be provided.");
  }
  if (typeof outputDirectory !== "string") {
    throw new TypeError("An output directory must be provided.");
  }

  for (const route of ROUTES) {
    const routeDirectory = route === "/"
      ? outputDirectory
      : path.join(outputDirectory, route.slice(1));
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(
      path.join(routeDirectory, "index.html"),
      renderRouteHtml(shellHtml, route),
      "utf8",
    );
  }
}

async function run() {
  const outputDirectory = path.join(PROJECT_ROOT, "dist");
  const shellHtml = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  await generatePrerenderedRoutes({ shellHtml, outputDirectory });
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  await run();
}
