/**
 * mod-loader.js
 * Handles injecting mod scripts into the running game iframe context.
 *
 * Supports:
 *  - Built-in mods (ESP, X-Ray, Fly, etc.)
 *  - Custom user-pasted JavaScript mods
 *
 * Two injection strategies:
 * 1. Same-origin: Direct contentWindow access.
 * 2. Cross-origin: Generates console-pasteable scripts.
 */

const ModLoader = {
  gameWindow: null,
  modRegistry: {},
  customMods: {},

  init: function() {
    this.modRegistry = {
      // Built-in mods (direct contentWindow access)
      esp:            ESPMod,
      xray:           XRayMod,
      bhop:           BhopMod,
      fullbright:     FullbrightMod,
      sprint:         SprintMod,
      hud:            HUDMod,
      fly:            FlyMod,
      nofall:         NoFallMod,
      speed:          SpeedMod,
      killaura:       KillAuraMod,
      velocity:       VelocityMod,
      antiafk:        AntiAFKMod,
      // ModAPI-based mods (from user-provided pack)
      autoclicker:    AutoclickerMod,
      autofish:       AutoFishMod,
      autorespawn:    AutoRespawnMod,
      blink:          BlinkMod,
      semiautologin:  SemiAutoLoginMod,
      statshud:       StatsHudMod,
      veinminer:      VeinMinerMod,
      fasterminecarts: FasterMinecartsMod
    };
  },

  attach: function(iframe) {
    try {
      this.gameWindow = iframe.contentWindow;
      this.gameWindow.document;
      return true;
    } catch (e) {
      this.gameWindow = null;
      return false;
    }
  },

  enableMod: function(modId) {
    const mod = this.modRegistry[modId];
    if (!mod) { console.warn("[ModLoader] Unknown mod:", modId); return false; }

    if (this.gameWindow) {
      try {
        mod.enable(this.gameWindow);
        return { success: true, method: "direct" };
      } catch (e) {
        return { success: false, error: e.message };
      }
    } else {
      const script = this._generateConsoleScript(modId, mod);
      return { success: true, method: "console", script: script };
    }
  },

  disableMod: function(modId) {
    const mod = this.modRegistry[modId];
    if (!mod) return false;

    if (this.gameWindow) {
      try { mod.disable(this.gameWindow); } catch (e) { /* */ }
    } else {
      mod.enabled = false;
    }
    return true;
  },

  injectAll: function() {
    const results = [];
    for (const [id, mod] of Object.entries(this.modRegistry)) {
      if (mod.enabled) {
        results.push({ id, ...this.enableMod(id) });
      }
    }
    for (const [id, custom] of Object.entries(this.customMods)) {
      if (custom.enabled) {
        results.push({ id, ...this.injectCustomMod(id) });
      }
    }
    return results;
  },

  clearAll: function() {
    for (const [id, mod] of Object.entries(this.modRegistry)) {
      if (mod.enabled) this.disableMod(id);
    }
    for (const [id, custom] of Object.entries(this.customMods)) {
      if (custom.enabled) this.disableCustomMod(id);
    }
  },

  // ===== CUSTOM MOD SUPPORT =====

  addCustomMod: function(name, code) {
    const id = "custom_" + Date.now();
    this.customMods[id] = { name, code, enabled: false };
    return id;
  },

  removeCustomMod: function(id) {
    if (this.customMods[id]) {
      if (this.customMods[id].enabled) {
        this.disableCustomMod(id);
      }
      delete this.customMods[id];
    }
  },

  injectCustomMod: function(id) {
    const custom = this.customMods[id];
    if (!custom) return { success: false, error: "Unknown custom mod" };

    if (this.gameWindow) {
      try {
        const fn = new this.gameWindow.Function(custom.code);
        fn.call(this.gameWindow);
        custom.enabled = true;
        return { success: true, method: "direct" };
      } catch (e) {
        return { success: false, error: e.message };
      }
    } else {
      const script = `(function(){\n/* ${custom.name} — paste into game console */\n${custom.code}\n})();`;
      custom.enabled = true;
      return { success: true, method: "console", script: script };
    }
  },

  disableCustomMod: function(id) {
    const custom = this.customMods[id];
    if (!custom) return;
    if (this.gameWindow) {
      try {
        if (this.gameWindow.__gx_custom_cleanup && this.gameWindow.__gx_custom_cleanup[id]) {
          this.gameWindow.__gx_custom_cleanup[id]();
          delete this.gameWindow.__gx_custom_cleanup[id];
        }
      } catch (e) { /* */ }
    }
    custom.enabled = false;
  },

  // ===== CONSOLE SCRIPT GENERATION =====

  _generateConsoleScript: function(modId, mod) {
    return `(function(){/* ${mod.name} — paste into game console */\n` +
           `var win = window;\n` +
           `var mod = ${this._serializeMod(mod)};\n` +
           `mod.enable(win);\n` +
           `window.__gx_mods = window.__gx_mods || {};\n` +
           `window.__gx_mods['${modId}'] = mod;\n` +
           `console.log('[${mod.name}] Injected via console');\n` +
           `})();`;
  },

  _serializeMod: function(mod) {
    const props = [];
    for (const key of Object.keys(mod)) {
      const val = mod[key];
      if (typeof val === "function") {
        props.push(`${key}: ${val.toString()}`);
      } else if (typeof val === "string") {
        props.push(`${key}: ${JSON.stringify(val)}`);
      } else if (typeof val === "number" || typeof val === "boolean") {
        props.push(`${key}: ${String(val)}`);
      } else if (val === null) {
        props.push(`${key}: null`);
      } else if (Array.isArray(val)) {
        props.push(`${key}: ${JSON.stringify(val)}`);
      } else if (typeof val === "object") {
        try { props.push(`${key}: ${JSON.stringify(val)}`); } catch (e) { /* skip non-serializable */ }
      }
    }
    return `{${props.join(", ")}}`;
  }
};
