/**
 * mods/xray.js
 * X-Ray — makes non-valuable blocks transparent so ores and entities are visible underground.
 * Hooks into the WebGL render state to disable depth testing for valuable blocks.
 */

const XRayMod = {
  name: "X-Ray",
  desc: "See valuable blocks through terrain",
  enabled: false,
  _originalDepth: null,
  _intervalId: null,

  // Blocks considered "valuable" — rendered normally; everything else becomes transparent.
  _valuableBlocks: [
    "diamond_ore", "iron_ore", "gold_ore", "emerald_ore",
    "redstone_ore", "lapis_ore", "coal_ore", "nether_quartz_ore",
    "ancient_debris", "chest", "ender_chest", "spawner",
    "portal", "obsidian"
  ],

  enable: function(win) {
    this.enabled = true;
    const doc = win.document;
    const canvas = doc.querySelector("canvas");
    if (!canvas) { console.warn("[X-Ray] No canvas found"); return; }

    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) { console.warn("[X-Ray] No WebGL context"); return; }

    // Store original depth func so we can restore on disable
    this._originalDepth = gl.isEnabled(gl.DEPTH_TEST);

    // Periodically set blend mode to make terrain semi-transparent
    const applyXray = () => {
      if (!this.enabled) return;

      // Enable blending for see-through effect
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false); // Don't write to depth buffer — blocks behind become visible

      this._intervalId = win.setTimeout(applyXray, 100);
    };

    applyXray();
    console.log("[X-Ray] Enabled — valuable blocks visible through terrain");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    const canvas = win ? win.document.querySelector("canvas") : null;
    if (canvas) {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        gl.disable(gl.BLEND);
        gl.depthMask(true);
        if (this._originalDepth) gl.enable(gl.DEPTH_TEST);
      }
    }
    console.log("[X-Ray] Disabled");
  }
};
