/**
 * mods/hud.js
 * FPS & Coordinates HUD — displays a live overlay showing FPS, X/Y/Z coordinates,
 * and direction facing. Renders in the launcher's HUD overlay element (not inside the iframe).
 */

const HUDMod = {
  name: "FPS & Coords HUD",
  desc: "On-screen FPS and position display",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;
    const hudEl = document.getElementById("hudOverlay");
    if (hudEl) hudEl.classList.remove("hidden");

    const update = () => {
      if (!this.enabled) return;

      let fps = "—", x = "—", y = "—", z = "—", facing = "—";

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (mc) {
        // FPS
        try {
          if (mc.debugFPS !== undefined) fps = mc.debugFPS;
          else if (mc.getFps) fps = mc.getFps();
          else if (typeof mc.currentFps === "number") fps = mc.currentFps;
        } catch (e) { /* */ }

        // Coordinates
        try {
          const player = mc.thePlayer;
          if (player) {
            if (player.posX !== undefined) {
              x = player.posX.toFixed(1);
              y = player.posY.toFixed(1);
              z = player.posZ.toFixed(1);
            } else if (player.getPosition) {
              const p = player.getPosition();
              x = p.x.toFixed(1); y = p.y.toFixed(1); z = p.z.toFixed(1);
            }

            // Facing direction
            if (player.rotationYaw !== undefined) {
              const yaw = ((player.rotationYaw % 360) + 360) % 360;
              const dirs = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"];
              facing = dirs[Math.round(yaw / 45) % 8];
            }
          }
        } catch (e) { /* */ }
      }

      if (hudEl) {
        hudEl.textContent =
          `FPS: ${fps}\n` +
          `XYZ: ${x} / ${y} / ${z}\n` +
          `Facing: ${facing}`;
      }

      this._intervalId = win.setTimeout(update, 200);
    };

    update();
    console.log("[HUD] Enabled — FPS & Coords overlay active");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    const hudEl = document.getElementById("hudOverlay");
    if (hudEl) {
      hudEl.classList.add("hidden");
      hudEl.textContent = "";
    }
    console.log("[HUD] Disabled");
  }
};
