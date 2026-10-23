/**
 * mods/autorespawn.js
 * AutoRespawn — automatically respawns the player when they die.
 * Adapted from the ModAPI-based AutoRespawn mod.
 */

const AutoRespawnMod = {
  name: "AutoRespawn",
  desc: "Auto-respawn on death",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[AutoRespawn] ModAPI not found"); return; }

    ModAPI.require("player");
    var self = this;

    var tick = function() {
      if (!self.enabled) return;
      try {
        if (ModAPI.player) {
          if (ModAPI.player.isPlayer && !ModAPI.player.isPlayer()) return;
          if (ModAPI.player.isEntityAlive && !ModAPI.player.isEntityAlive()) {
            ModAPI.player.respawnPlayer();
          }
        }
      } catch (e) { /* */ }
    };

    this._intervalId = win.setInterval(tick, 200);
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId) {
      win.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
};
