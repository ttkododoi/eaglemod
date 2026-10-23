/**
 * mods/fullbright.js
 * Fullbright — forces maximum gamma so caves and dark areas are fully lit.
 * Adapted from the ModAPI-based Fullbright mod (replaces previous contentWindow version).
 * Toggle with the PageUp key (key code 33) inside the game.
 */

const FullbrightMod = {
  name: "Fullbright",
  desc: "Max gamma — no darkness",
  enabled: false,
  _toggled: false,
  _gamma: 1000,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[Fullbright] ModAPI not found"); return; }

    ModAPI.require("settings");
    var self = this;
    this._toggled = true;

    // Apply fullbright immediately
    try {
      ModAPI.settings.gammaSetting = this._gamma;
      ModAPI.settings.reload();
    } catch (e) { /* */ }

    // Allow toggling with PageUp key
    this._keyHandler = function(ev) {
      if (!self.enabled) return;
      if (ev.key === 33) {
        if (!self._toggled) {
          ModAPI.settings.gammaSetting = self._gamma;
          ModAPI.settings.reload();
          try { ModAPI.displayToChat({ msg: "fullbright enabled!" }); } catch (e) {}
          self._toggled = true;
        } else {
          ModAPI.settings.gammaSetting = 1;
          ModAPI.settings.reload();
          try { ModAPI.displayToChat({ msg: "fullbright disabled!" }); } catch (e) {}
          self._toggled = false;
        }
      }
    };
    ModAPI.addEventListener("key", this._keyHandler);
  },

  disable: function(win) {
    this.enabled = false;
    var ModAPI = win.ModAPI;
    if (ModAPI && ModAPI.settings) {
      try {
        ModAPI.settings.gammaSetting = 1;
        ModAPI.settings.reload();
      } catch (e) { /* */ }
    }
    this._toggled = false;
  }
};
