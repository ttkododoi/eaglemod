/**
 * mods/velocity.js
 * Velocity (Anti-Knockback) — zeroes out horizontal knockback velocity each tick.
 */

const VelocityMod = {
  name: "Velocity",
  desc: "Reduce knockback to zero",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;

    const tick = () => {
      if (!this.enabled) { return; }

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (!mc) { this._intervalId = win.setTimeout(tick, 50); return; }

      try {
        const player = mc.thePlayer;
        if (!player) { this._intervalId = win.setTimeout(tick, 50); return; }

        // If the player has a large sudden horizontal velocity (knockback), cancel it
        if (player.hurtTime !== undefined && player.hurtTime > 0) {
          player.motionX = 0;
          player.motionZ = 0;
        }
      } catch (e) { /* silent */ }

      this._intervalId = win.setTimeout(tick, 50);
    };

    tick();
    console.log("[Velocity] Enabled — knockback negated");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    console.log("[Velocity] Disabled");
  }
};
