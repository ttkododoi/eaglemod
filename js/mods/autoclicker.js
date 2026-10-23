/**
 * mods/autoclicker.js
 * Autoclicker — automatically clicks the mouse at a configurable CPS rate.
 * Adapted from the ModAPI-based Autoclicker mod.
 */

const AutoclickerMod = {
  name: "Autoclicker",
  desc: "Auto-clicks at 2 CPS",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[Autoclicker] ModAPI not found"); return; }

    var cps = 2;
    var self = this;

    function click() {
      if (!self.enabled) return;
      ModAPI.clickMouse();
    }

    var intervalTime = 1000 / cps;
    this._intervalId = win.setInterval(click, intervalTime);
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId) {
      win.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
};
