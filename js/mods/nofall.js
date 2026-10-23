/**
 * mods/nofall.js
 * NoFall — continuously resets the player's fall distance to prevent fall damage.
 */

const NoFallMod = {
  name: "NoFall",
  desc: "Prevent all fall damage",
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
        if (player) {
          if (player.fallDistance !== undefined) {
            player.fallDistance = 0;
          }
          // Also try the obfuscated field name used in some versions
          if (player.field_70143_R !== undefined) {
            player.field_70143_R = 0;
          }
        }
      } catch (e) { /* silent */ }

      this._intervalId = win.setTimeout(tick, 50);
    };

    tick();
    console.log("[NoFall] Enabled — fall damage negated");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    console.log("[NoFall] Disabled");
  }
};
