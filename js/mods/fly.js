/**
 * mods/fly.js
 * Fly — toggles creative-like flight by enabling the player's flight ability
 * and applying upward velocity when the jump key is held.
 */

const FlyMod = {
  name: "Fly",
  desc: "Enable creative-like flight",
  enabled: false,
  _intervalId: null,
  _originalFlying: null,

  enable: function(win) {
    this.enabled = true;

    const tick = () => {
      if (!this.enabled) { return; }

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (!mc) { this._intervalId = win.setTimeout(tick, 50); return; }

      try {
        const player = mc.thePlayer;
        if (!player) { this._intervalId = win.setTimeout(tick, 50); return; }

        if (this._originalFlying === null) {
          this._originalFlying = player.capabilities ? player.capabilities.isFlying : false;
        }

        if (player.capabilities) {
          player.capabilities.allowFlying = true;
          player.capabilities.isFlying = true;
        }
        // Cancel downward velocity to prevent sinking
        if (player.motionY < 0) {
          player.motionY = 0;
        }
      } catch (e) { /* silent */ }

      this._intervalId = win.setTimeout(tick, 50);
    };

    tick();
    console.log("[Fly] Enabled — flight mode active");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }

    const mc = win ? (win.Minecraft || win.minecraft || win.theMinecraft) : null;
    if (mc && mc.thePlayer && mc.thePlayer.capabilities) {
      try {
        mc.thePlayer.capabilities.isFlying = false;
        mc.thePlayer.capabilities.allowFlying = false;
      } catch (e) { /* silent */ }
    }
    this._originalFlying = null;
    console.log("[Fly] Disabled");
  }
};
