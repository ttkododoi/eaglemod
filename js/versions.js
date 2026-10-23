/**
 * versions.js
 * Version mappings for all supported game client embeds + client metadata.
 */

/**
 * CLIENT_INFO — per-client metadata used for cards, colors, and descriptions.
 * gradient is a CSS linear-gradient string used as the card art background.
 */
const CLIENT_INFO = {
  "GX Launcher": {
    desc: "The original web-based Minecraft launcher with vanilla versions spanning 1.5.2 to 26.3.",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    tag: "Vanilla"
  },
  "Astra Client": {
    desc: "Feature-rich PvP client with custom HUD, kill effects, and performance optimizations.",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    tag: "PvP"
  },
  "Tuff Client": {
    desc: "Lightweight Eaglercraft client focused on stability and compatibility.",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    tag: "Stable"
  },
  "Resent Client": {
    desc: "Next-gen Eaglercraft client with modern UI and extended mod support.",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    tag: "Modern"
  },
  "Starlike": {
    desc: "Unique WASM-based client with smooth rendering and custom shaders.",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    tag: "WASM"
  },
  "Eaglercraft": {
    desc: "The classic Eaglercraft web client, running 1.12.2 in the browser via WASM.",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    tag: "Classic"
  },
  "EaglercraftX": {
    desc: "Enhanced EaglercraftX 1.8 runtime with improved performance and features.",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    tag: "1.8"
  },
  "DragonX": {
    desc: "Dragon-themed PvP client with dragon visuals, custom animations, and combat tools.",
    gradient: "linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)",
    tag: "PvP"
  },
  "UwU Client": {
    desc: "Cute and powerful utility client with anime-inspired UI and extensive mod collection.",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    tag: "Utility"
  },
  "Shadow Client": {
    desc: "Stealth-focused client with minimal HUD footprint and optimized reach hitboxes.",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
    tag: "Stealth"
  },
  "Precision Client": {
    desc: "Tournament-grade client with precise hit registration and frame-perfect input.",
    gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
    tag: "Competitive"
  },
  "Bullfrog Client": {
    desc: "Hop into action with Bullfrog — optimized for low-end devices and fast loads.",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    tag: "Lightweight"
  }
};

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

  // ===== DRAGONX CLIENT =====
  { id: "dragonx-js",  label: "DragonX 1.8", runtime: "JS",   url: "https://eaglercraft.dev/clients/DragonX%20Client%20JS/",  client: "DragonX" },
  { id: "dragonx-wasm", label: "DragonX 1.8", runtime: "WASM", url: "https://eaglercraft.dev/clients/DragonX%20Client%20WASM/", client: "DragonX" },

  // ===== UWU CLIENT =====
  { id: "uwu-js",   label: "UwU Client", runtime: "JS",   url: "https://eaglercraft.dev/clients/UwU%20Client%20JS/",  client: "UwU Client" },
  { id: "uwu-wasm", label: "UwU Client", runtime: "WASM", url: "https://eaglercraft.dev/clients/UwU%20Client%20WASM/", client: "UwU Client" },

  // ===== SHADOW CLIENT =====
  { id: "shadow-js",   label: "Shadow 1.8", runtime: "JS",   url: "https://eaglercraft.dev/clients/Shadow%20Client%20JS/",  client: "Shadow Client" },
  { id: "shadow-wasm",  label: "Shadow 1.8", runtime: "WASM", url: "https://eaglercraft.dev/clients/Shadow%20Client%20WASM/", client: "Shadow Client" },

  // ===== PRECISION CLIENT =====
  { id: "precision-wasm", label: "Precision 1.8", runtime: "WASM", url: "https://eaglercraft.dev/clients/Precision%20Client%20WASM/", client: "Precision Client" },

  // ===== BULLFROG CLIENT =====
  { id: "bullfrog-js", label: "Bullfrog 1.8", runtime: "JS", url: "https://eaglercraft.dev/clients/Bullfrog%20Client%20JS/", client: "Bullfrog Client" },
];
