/**
 * versions.js
 * Version mappings for all supported game client embeds.
 * Each entry has an id, display label, runtime type (JS or WASM), iframe URL, and client name.
 */

const GAME_VERSIONS = [
  // ===== GX LAUNCHER (vanilla) =====
  { id: "1.8.8-js",    label: "1.8.8",   runtime: "JS",   url: "https://gx-launcher.github.io/game/1.8.8/index.html",         client: "GX Launcher" },
  { id: "1.8.8-wasm",  label: "1.8.8",   runtime: "WASM", url: "https://gx-launcher.github.io/game/1.8.8-wasm/index.html",     client: "GX Launcher" },
  { id: "1.5.2-js",    label: "1.5.2",   runtime: "JS",   url: "https://gx-launcher.github.io/game/1.5.2/index.html",         client: "GX Launcher" },
  { id: "1.5.2-wasm",  label: "1.5.2",   runtime: "WASM", url: "https://gx-launcher.github.io/game/1.5.2-wasm/index.html",     client: "GX Launcher" },
  { id: "1.12.2-js",   label: "1.12.2",  runtime: "JS",   url: "https://gx-launcher.github.io/game/1.12.2/index.html",        client: "GX Launcher" },
  { id: "1.12.2-wasm", label: "1.12.2",  runtime: "WASM", url: "https://gx-launcher.github.io/game/1.12.2-wasm/index.html",    client: "GX Launcher" },
  { id: "1.13.2-js",   label: "1.13.2",  runtime: "JS",   url: "https://gx-launcher.github.io/game/1.13.2/index.html",        client: "GX Launcher" },
  { id: "1.13.2-wasm", label: "1.13.2",  runtime: "WASM", url: "https://gx-launcher.github.io/game/1.13.2-wasm/index.html",    client: "GX Launcher" },
  { id: "1.14.4-js",   label: "1.14.4",  runtime: "JS",   url: "https://gx-launcher.github.io/game/1.14.4/index.html",        client: "GX Launcher" },
  { id: "1.14.4-wasm", label: "1.14.4",  runtime: "WASM", url: "https://gx-launcher.github.io/game/1.14.4-wasm/index.html",    client: "GX Launcher" },
  { id: "1.16.5-js",   label: "1.16.5",  runtime: "JS",   url: "https://gx-launcher.github.io/game/1.16.5/index.html",        client: "GX Launcher" },
  { id: "1.16.5-wasm", label: "1.16.5",  runtime: "WASM", url: "https://gx-launcher.github.io/game/1.16.5-wasm/index.html",    client: "GX Launcher" },
  { id: "26.2-wasm",   label: "26.2",    runtime: "WASM", url: "https://gx-launcher.github.io/game/26.2-wasm/index.html",      client: "GX Launcher" },
  { id: "26.3-wasm",   label: "26.3",    runtime: "WASM", url: "https://gx-launcher.github.io/game/26.3-wasm/index.html",      client: "GX Launcher" },

  // ===== ASTRA CLIENT =====
  { id: "astra-2",         label: "Astra Client 2", runtime: "WASM", url: "https://astraclient.com/play",                  client: "Astra Client" },
  { id: "astra-1.8",       label: "Astra 1.8",       runtime: "JS",   url: "https://astraclientorg.github.io/",              client: "Astra Client" },

  // ===== TUFF CLIENT =====
  { id: "tuff-wasm",  label: "Tuff Client", runtime: "WASM", url: "https://eaglercraft.dev/clients/Tuff%20Client%20WASM/", client: "Tuff Client" },
  { id: "tuff-js",    label: "Tuff Client", runtime: "JS",   url: "https://eaglercraft.dev/clients/Tuff%20Client%20JS/",  client: "Tuff Client" },

  // ===== RESENT CLIENT =====
  { id: "resent-4-js", label: "Resent 4.0", runtime: "JS", url: "https://eaglercraft.dev/clients/Resent%20Client%204.0%20JS%20%5B%20BETA%20%5D/", client: "Resent Client" },

  // ===== STARLIKE =====
  { id: "starlike-wasm", label: "Starlike", runtime: "WASM", url: "https://starlike.zumbiepig.dev/wasm.html", client: "Starlike" },

  // ===== EAGLERCRAFT.DEV (vanilla) =====
  { id: "eagler-1.12.2", label: "Eagler 1.12.2", runtime: "WASM", url: "https://eaglercraft.dev/", client: "Eaglercraft" },

  // ===== EAGLERCRAFTX 1.8 =====
  { id: "eaglerx-1.8", label: "EaglerX 1.8", runtime: "JS", url: "https://eaglercraftx1-8.github.io/", client: "EaglercraftX" },
];
