/**
 * mods/killaura.js
 * KillAura — automatically attacks nearby entities within range each tick.
 */

const KillAuraMod = {
  name: "KillAura",
  desc: "Auto-attack nearby entities",
  enabled: false,
  _intervalId: null,
  _range: 4.5,

  enable: function(win) {
    this.enabled = true;

    const tick = () => {
      if (!this.enabled) { return; }

      const mc = win.Minecraft || win.minecraft || win.theMinecraft;
      if (!mc) { this._intervalId = win.setTimeout(tick, 100); return; }

      try {
        const player = mc.thePlayer;
        if (!player || !mc.theWorld) { this._intervalId = win.setTimeout(tick, 100); return; }

        let entities = [];
        if (mc.theWorld.playerEntities) {
          entities = mc.theWorld.playerEntities;
        } else if (mc.theWorld.loadedEntityList) {
          entities = mc.theWorld.loadedEntityList;
        }

        for (let i = 0; i < entities.length; i++) {
          const ent = entities[i];
          if (ent === player) continue;

          let dx = 0, dy = 0, dz = 0;
          if (ent.posX !== undefined) {
            dx = ent.posX - player.posX;
            dy = ent.posY - player.posY;
            dz = ent.posZ - player.posZ;
          } else continue;

          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist <= this._range) {
            // Face the target
            const yaw = Math.atan2(-dx, dz) * 180 / Math.PI;
            const pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI;
            if (player.rotationYaw !== undefined) player.rotationYaw = yaw;
            if (player.rotationPitch !== undefined) player.rotationPitch = pitch;

            // Attack
            if (mc.playerController && mc.playerController.attackEntity) {
              mc.playerController.attackEntity(player, ent);
            }
            break; // Only attack one entity per tick
          }
        }
      } catch (e) { /* silent */ }

      this._intervalId = win.setTimeout(tick, 100);
    };

    tick();
    console.log("[KillAura] Enabled — auto-attacking nearby entities");
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.clearTimeout(this._intervalId);
      this._intervalId = null;
    }
    console.log("[KillAura] Disabled");
  }
};
