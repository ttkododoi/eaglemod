/**
 * mods/statshud.js
 * StatsHUD — advanced stats overlay (FPS, coordinates, biome, etc.)
 * Loads the obfuscated StatsHud script via fetch + eval for same-origin,
 * or generates a console-injection note for cross-origin iframes.
 */

const StatsHudMod = {
  name: "Stats HUD",
  desc: "Advanced on-screen stats overlay",
  enabled: false,
  _loaded: false,

  enable: function(win) {
    this.enabled = true;
    var self = this;

    // Try same-origin: fetch the raw script and eval in the iframe context
    if (win && win.document) {
      try {
        fetch("js/mods/statshud-raw.js")
          .then(function (r) { return r.text(); })
          .then(function (code) {
            try {
              win.eval(code);
              self._loaded = true;
              console.log("[StatsHUD] Injected via fetch+eval");
            } catch (e) {
              console.warn("[StatsHUD] eval failed:", e.message);
            }
          })
          .catch(function (e) {
            console.warn("[StatsHUD] fetch failed:", e.message);
          });
        return;
      } catch (e) { /* fall through */ }
    }

    // Cross-origin: cannot inject directly
    console.warn("[StatsHUD] Cross-origin — open js/mods/statshud-raw.js, copy all content, and paste into the game console.");
  },

  disable: function(win) {
    this.enabled = false;
    // The StatsHud overlay is rendered by the obfuscated script;
    // there is no clean teardown. The user can reload the game to clear it.
    this._loaded = false;
  }
};
