/**
 * mods/antiafk.js
 * AntiAFK — periodically sends small movement input to prevent being kicked for inactivity.
 */

const AntiAFKMod = {
  name: "AntiAFK",
  desc: "Prevent AFK kick",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;
    let toggle = false;

    const tick = () => {
      if (!this.enabled) { return; }

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (!mc) { this._intervalId = win.setTimeout(tick, 2000); return; }

      try {
        const player = mc.thePlayer;
        if (!player) { this._intervalId = win.setTimeout(tick, 2000); return; }

        // Rotate slightly to simulate activity
        toggle = !toggle;
        if (player.rotationYaw !== undefined) {
          player.rotationYaw += toggle ? 1.5 : -1.5;
        }
      } catch (e) { /* silent */ }

      // Every ~2 seconds is enough to avoid most AFK timers
      this._intervalId = win.setTimeout(tick, 2000);
    };

    tick();
    console.log("[AntiAFK] Enabled — AFK kick prevention active");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    console.log("[AntiAFK] Disabled");
  }
};
