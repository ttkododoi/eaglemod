# GX Launcher — Modded

## Overview
A browser-based game launcher that mirrors the GX Launcher layout, embeds Minecraft client versions via iframes, and includes a JavaScript mod injection overlay.

## Tech Stack
- Pure static site: HTML, CSS, vanilla JavaScript (no build step, no framework)
- Served by nginx:alpine in Docker
- No backend, no database, no external credentials needed

## Project Structure
```
index.html              — Main launcher page (sidebar, version grid, game viewport, mod overlay)
css/style.css           — Dark-theme styling matching GX Launcher aesthetic
js/versions.js          — Version → iframe URL mappings for all supported game clients
js/app.js               — Main app logic: version grid, selection, launch, view transitions
js/mod-loader.js        — Mod injection system (same-origin direct injection + cross-origin console scripts)
js/overlay.js           — Mod overlay UI (Right-Shift toggle, toggle switches, status feedback)
js/mods/esp.js          — ESP mod: entity highlighting through walls
js/mods/xray.js         — X-Ray mod: transparent terrain to reveal valuable blocks
js/mods/bhop.js         — Bhop mod: auto-jump while moving for speed
js/mods/fullbright.js   — Fullbright mod: max gamma, no darkness
js/mods/sprint.js       — Sprint mod: auto-sprint when moving forward
js/mods/hud.js          — HUD mod: FPS & coordinates overlay
nginx.conf              — nginx server config for Docker
docker-compose.base44.yml — Docker compose for development
```

## Running Locally
```bash
docker compose -f docker-compose.base44.yml up -d
# Open http://localhost:3000
```

## How Mod Injection Works
The game runs in an iframe from `gx-launcher.github.io`. Because the launcher and the game are on different origins, the browser's Same-Origin Policy blocks direct JavaScript access to the iframe's `contentWindow`.

### Same-origin scenario
If the launcher is hosted on the same origin as the game (e.g. both on `gx-launcher.github.io`), the ModLoader can directly call `iframe.contentWindow` to inject mod scripts. Mods hook into the game's `Minecraft` instance and its WebGL canvas.

### Cross-origin scenario (default)
When cross-origin, the ModLoader generates a self-contained console-pasteable script for each enabled mod. The user:
1. Right-clicks the game iframe → Inspect Element
2. Opens the Console tab
3. Selects the iframe's execution context from the dropdown at the top of the console
4. Pastes the generated script and presses Enter

The overlay's "Inject All Active" button handles both scenarios: direct injection for same-origin, and showing copy-paste scripts for cross-origin.

### Mod overlay controls
- **Right-Shift**: Toggle the mod overlay menu
- Individual toggles: Enable/disable each mod
- "Inject All Active": Inject all enabled mods at once
- "Clear All Mods": Disable and remove all mods

## Setup Quirk
The sandbox creates directories with `0700` permissions. nginx workers run as a non-root user and get a 403. Fix with `chmod -R a+rX .` on the host before starting compose. If the container fails with 403, re-run the chmod and recreate.

## Verification
- `curl http://localhost:3000/` returns the launcher HTML page
- Version grid populates with all 16 game version cards (8 versions × 2 runtimes, minus the 2 WASM-only)
- Selecting a version + clicking LAUNCH loads the iframe
- Right-Shift opens/closes the mod overlay with 6 mod toggle switches
