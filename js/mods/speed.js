/**
 * mods/speed.js
 * Speed — increases the player's movement speed while moving.
 * Adapted from the ModAPI-based Speed mod (replaces previous contentWindow version).
 */

const SpeedMod = {
  name: "Speed",
  desc: "Move faster while walking",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[Speed] ModAPI not found"); return; }

    ModAPI.require("player");
    var self = this;
    var newspeed = 10;
    var oldspeed = ModAPI.player.getSpeed ? ModAPI.player.getSpeed() : 0.1;

    var tick = function() {
      if (!self.enabled) return;
      try {
        if (ModAPI.player.isMoving && ModAPI.player.isMoving() === true) {
          ModAPI.player.setSpeed({ speed: newspeed });
        } else if (ModAPI.player.setSpeed) {
          ModAPI.player.setSpeed({ speed: oldspeed });
        }
      } catch (e) { /* */ }
    };

    this._intervalId = win.setInterval(tick, 50);
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId) {
      win.clearInterval(this._intervalId);
      this._intervalId = null;
    }
    try {
      var ModAPI = win.ModAPI;
      if (ModAPI && ModAPI.player && ModAPI.player.setSpeed && this._oldSpeed !== undefined) {
        ModAPI.player.setSpeed({ speed: this._oldSpeed });
      }
    } catch (e) { /* */ }
  }
};
