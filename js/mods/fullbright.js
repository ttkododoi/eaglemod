/**
 * mods/fullbright.js
 * Fullbright — forces maximum gamma/brightness so caves and dark areas are fully lit.
 */

const FullbrightMod = {
  name: "Fullbright",
  desc: "Max gamma — no darkness",
  enabled: false,
  _originalGamma: null,

  enable: function(win) {
    this.enabled = true;
    const mc = win.Minecraft || win.minecraft || win.theMinecraft;
    if (!mc) {
      console.warn("[Fullbright] No Minecraft instance found");
      return;
    }

    try {
      // Try multiple gamma access patterns across versions
      if (mc.gameSettings) {
        if (mc.gameSettings.gammaSetting !== undefined) {
          this._originalGamma = mc.gameSettings.gammaSetting;
          mc.gameSettings.gammaSetting = 16.0;
        } else if (mc.gameSettings.field_74333_O !== undefined) {
          this._originalGamma = mc.gameSettings.field_74333_O;
          mc.gameSettings.field_74333_O = 16.0;
        }
      }
      console.log("[Fullbright] Enabled — gamma set to max");
    } catch (e) {
      console.warn("[Fullbright] Could not set gamma:", e);
    }
  },

  disable: function(win) {
    this.enabled = false;
    const mc = win ? (win.Minecraft || win.minecraft || win.theMinecraft) : null;
    if (mc && mc.gameSettings && this._originalGamma !== null) {
      try {
        if (mc.gameSettings.gammaSetting !== undefined) {
          mc.gameSettings.gammaSetting = this._originalGamma;
        } else if (mc.gameSettings.field_74333_O !== undefined) {
          mc.gameSettings.field_74333_O = this._originalGamma;
        }
      } catch (e) { /* silent */ }
    }
    this._originalGamma = null;
    console.log("[Fullbright] Disabled");
  }
};
