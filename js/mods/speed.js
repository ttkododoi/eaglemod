/**
 * mods/speed.js
 * Speed — increases the player's horizontal movement speed multiplier.
 */

const SpeedMod = {
  name: "Speed",
  desc: "Move faster than normal",
  enabled: false,
  _intervalId: null,
  _boost: 2.0,

  enable: function(win) {
    this.enabled = true;

    const tick = () => {
      if (!this.enabled) { return; }

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (!mc) { this._intervalId = win.setTimeout(tick, 50); return; }

      try {
        const player = mc.thePlayer;
        if (!player) { this._intervalId = win.setTimeout(tick, 50); return; }

        // Apply a speed boost to horizontal motion
        if (player.motionX !== undefined && player.motionZ !== undefined) {
          const moving = Math.abs(player.motionX) > 0.01 || Math.abs(player.motionZ) > 0.01;
          if (moving) {
            player.motionX *= this._boost;
            player.motionZ *= this._boost;
          }
        }

        // Also try setting the speed attribute if available
        if (player.capabilities && player.capabilities.walkSpeed !== undefined) {
          if (player.capabilities._originalWalkSpeed === undefined) {
            player.capabilities._originalWalkSpeed = player.capabilities.walkSpeed;
          }
          player.capabilities.walkSpeed = 0.3;
        }
      } catch (e) { /* silent */ }

      this._intervalId = win.setTimeout(tick, 50);
    };

    tick();
    console.log("[Speed] Enabled — movement speed boosted");
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
        if (mc.thePlayer.capabilities._originalWalkSpeed !== undefined) {
          mc.thePlayer.capabilities.walkSpeed = mc.thePlayer.capabilities._originalWalkSpeed;
          delete mc.thePlayer.capabilities._originalWalkSpeed;
        }
      } catch (e) { /* silent */ }
    }
    console.log("[Speed] Disabled");
  }
};
