/**
 * mods/bhop.js
 * Bhop (Bunny Hop) — automatically jumps when the player is moving forward,
 * giving a speed-boost movement pattern.
 */

const BhopMod = {
  name: "Bhop",
  desc: "Auto-jump while moving for speed",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;

    const tick = () => {
      if (!this.enabled) return;

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (!mc) { this._intervalId = win.setTimeout(tick, 50); return; }

      try {
        const player = mc.thePlayer;
        if (!player) { this._intervalId = win.setTimeout(tick, 50); return; }

        // Check if the player is moving (has horizontal velocity or forward input)
        const movingForward = (player.moveForward !== undefined && player.moveForward > 0) ||
                              (Math.abs(player.motionX) > 0.01 || Math.abs(player.motionZ) > 0.01);

        // Check if on ground
        const onGround = player.onGround !== undefined ? player.onGround : (player.field_70122_E !== undefined ? player.field_70122_E : true);

        if (movingForward && onGround) {
          // Simulate a jump
          if (player.jump) {
            player.jump();
          } else {
            // Set upward velocity directly
            player.motionY = 0.42; // Standard Minecraft jump velocity
          }
        }
      } catch (e) { /* silent */ }

      this._intervalId = win.setTimeout(tick, 50); // ~20 TPS
    };

    tick();
    console.log("[Bhop] Enabled — auto-jump while moving");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    console.log("[Bhop] Disabled");
  }
};
