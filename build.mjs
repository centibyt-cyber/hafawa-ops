import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const SUPABASE_URL = "https://rcilynwwfgopfokkxdlf.supabase.co";
const SUPABASE_ANON = "sb_publishable_vp3O7YHURSEwiKnrMiZ4_Q_9nA6oIJO";
const OUT = "dist";
const APP_VERSION = "v23";
const V = APP_VERSION + "-" + Date.now().toString(36); /* cache-buster: index.html is no-cache, assets get a fresh ?v= on every build */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

await build({
  entryPoints: ["src/main.jsx"],
  outfile: `${OUT}/app.js`,
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019"],
  jsx: "automatic",
  loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  charset: "utf8",
});

execSync(`npx tailwindcss -c src/tailwind.config.js -i src/input.css -o ${OUT}/app.css --minify`, { stdio: "inherit" });

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1E1B33"/><text x="32" y="43" font-family="Segoe UI,Tahoma,sans-serif" font-size="30" font-weight="700" fill="#B8934E" text-anchor="middle">HF</text></svg>`
  );

writeFileSync(
  `${OUT}/index.html`,
  `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>لاونج حفاوة — نظام التشغيل</title>
<meta name="description" content="Hafawa Lounge Operations System — HACCP, cleaning, linen, inventory." />
<meta name="theme-color" content="#1E1B33" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Hafawa Ops" />
<link rel="icon" href="${ICON}" />
<link rel="apple-touch-icon" href="${ICON}" />
<link rel="manifest" href="manifest.webmanifest" />
<link rel="preconnect" href="${SUPABASE_URL}" crossorigin />
<link rel="stylesheet" href="app.css?v=${V}" />
<style>html,body{margin:0;padding:0;background:#F7F6FB;-webkit-text-size-adjust:100%}</style>
<script>window.HF_CONFIG={SUPABASE_URL:"${SUPABASE_URL}",SUPABASE_ANON:"${SUPABASE_ANON}",VERSION:"${V}"};</script>
</head>
<body>
<div id="root"></div>
<noscript style="display:block;padding:24px;font-family:Tahoma,sans-serif;text-align:center">هذا النظام يحتاج تفعيل JavaScript في المتصفح.</noscript>
<script src="app.js?v=${V}"></script>
</body>
</html>
`
);

writeFileSync(
  `${OUT}/manifest.webmanifest`,
  JSON.stringify(
    {
      name: "لاونج حفاوة — نظام التشغيل",
      short_name: "Hafawa Ops",
      lang: "ar",
      dir: "rtl",
      start_url: ".",
      scope: ".",
      display: "standalone",
      background_color: "#F7F6FB",
      theme_color: "#1E1B33",
      icons: [{ src: ICON, sizes: "any", type: "image/svg+xml", purpose: "any" }],
    },
    null,
    2
  )
);

writeFileSync(`${OUT}/.nojekyll`, "");
writeFileSync(`${OUT}/404.html`, `<meta http-equiv="refresh" content="0;url=./" />`);
console.log("build ok");
