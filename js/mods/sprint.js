/**
 * mods/sprint.js
 * Sprint — automatically sprints whenever the player moves forward.
 */

const SprintMod = {
  name: "Sprint",
  desc: "Auto-sprint when moving forward",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;

    const tick = () => {
      if (!this.enabled) return;

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (!mc) { this._intervalId = win.setTimeout(tick, 100); return; }

      try {
        const player = mc.thePlayer;
        if (!player) { this._intervalId = win.setTimeout(tick, 100); return; }

        const movingForward = (player.moveForward !== undefined && player.moveForward > 0);

        if (movingForward && !player.isSprinting()) {
          if (player.setSprinting) {
            player.setSprinting(true);
          } else if (player.sprinting !== undefined) {
            player.sprinting = true;
          }
        } else if (!movingForward && player.isSprinting && player.isSprinting()) {
          if (player.setSprinting) {
            player.setSprinting(false);
          }
        }
      } catch (e) { /* silent */ }

      this._intervalId = win.setTimeout(tick, 100);
    };

    tick();
    console.log("[Sprint] Enabled — auto-sprint while moving forward");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    console.log("[Sprint] Disabled");
  }
};
