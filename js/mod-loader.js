/**
 * mod-loader.js
 * Handles injecting mod scripts into the running game iframe context.
 *
 * Two injection strategies:
 *  1. Same-origin: If the iframe is same-origin with the launcher, we can directly
 *     access iframe.contentWindow and eval mod scripts into it.
 *  2. Cross-origin: The iframe is from gx-launcher.github.io. Direct DOM/JS access
 *     is blocked by the Same-Origin Policy. In this case we:
 *     - Generate a console-pasteable script for each active mod.
 *     - Use postMessage to request the game to load mods (if the game supports it).
 *     - Provide a "Copy" button so the user can paste into the game's dev console.
 */

const ModLoader = {
  gameWindow: null,
  modRegistry: {},

  init: function() {
    // Register all available mods
    this.modRegistry = {
      esp: ESPMod,
      xray: XRayMod,
      bhop: BhopMod,
      fullbright: FullbrightMod,
      sprint: SprintMod,
      hud: HUDMod
    };
  },

  /**
   * Set the current game iframe and attempt to access its contentWindow.
   * Returns true if same-origin access is available, false otherwise.
   */
  attach: function(iframe) {
    try {
      this.gameWindow = iframe.contentWindow;
      // Test access — throws if cross-origin
      this.gameWindow.document;
      return true;
    } catch (e) {
      this.gameWindow = null;
      return false;
    }
  },

  /**
   * Enable a mod by name. Injects into the iframe if same-origin,
   * otherwise returns the script string for manual console injection.
   */
  enableMod: function(modId) {
    const mod = this.modRegistry[modId];
    if (!mod) { console.warn("[ModLoader] Unknown mod:", modId); return false; }

    if (this.gameWindow) {
      // Same-origin: inject directly
      try {
        mod.enable(this.gameWindow);
        return { success: true, method: "direct" };
      } catch (e) {
        console.error("[ModLoader] Direct injection failed:", e);
        return { success: false, error: e.message };
      }
    } else {
      // Cross-origin: generate console-injectable script
      const script = this._generateConsoleScript(modId, mod);
      return { success: true, method: "console", script: script };
    }
  },

  /**
   * Disable a mod by name.
   */
  disableMod: function(modId) {
    const mod = this.modRegistry[modId];
    if (!mod) return false;

    if (this.gameWindow) {
      try { mod.disable(this.gameWindow); } catch (e) { /* */ }
    } else {
      mod.enabled = false; // At least update local state
    }
    return true;
  },

  /**
   * Inject all currently-enabled mods at once (for same-origin).
   * For cross-origin, returns a combined script string.
   */
  injectAll: function() {
    const results = [];
    for (const [id, mod] of Object.entries(this.modRegistry)) {
      if (mod.enabled) {
        results.push({ id, ...this.enableMod(id) });
      }
    }
    return results;
  },

  /**
   * Clear/disable all mods.
   */
  clearAll: function() {
    for (const [id, mod] of Object.entries(this.modRegistry)) {
      if (mod.enabled) {
        this.disableMod(id);
      }
    }
  },

  /**
   * Generate a self-contained console-pasteable script for a mod.
   * The script includes the mod's full source so it can be pasted into
   * the game iframe's developer console (opened via F12 > console, with
   * the iframe's execution context selected).
   */
  _generateConsoleScript: function(modId, mod) {
    // Build a script that recreates the mod object and enables it in the
    // game's own window context.
    return `(function(){${mod.toString ? "" : ""}/* ${mod.name} — paste into game console */\n` +
           `var win = window;\n` +
           `var mod = ${this._serializeMod(mod)};\n` +
           `mod.enable(win);\n` +
           `window.__gx_mods = window.__gx_mods || {};\n` +
           `window.__gx_mods['${modId}'] = mod;\n` +
           `console.log('[${mod.name}] Injected via console');\n` +
           `})();`;
  },

  /**
   * Serialize a mod object into a console-safe string.
   * Extracts the enable/disable functions as source code.
   */
  _serializeMod: function(mod) {
    const props = [];
    props.push(`name: ${JSON.stringify(mod.name)}`);
    props.push(`desc: ${JSON.stringify(mod.desc)}`);
    props.push(`enabled: false`);
    props.push(`_intervalId: null`);

    // Serialize methods
    if (mod.enable) props.push(`enable: ${mod.enable.toString()}`);
    if (mod.disable) props.push(`disable: ${mod.disable.toString()}`);
    if (mod._project) props.push(`_project: ${mod._project.toString()}`);

    // Serialize static data
    if (mod._valuableBlocks) {
      props.push(`_valuableBlocks: ${JSON.stringify(mod._valuableBlocks)}`);
    }
    if (mod._originalGamma !== undefined) props.push(`_originalGamma: ${mod._originalGamma}`);

    return `{${props.join(", ")}}`;
  }
};
