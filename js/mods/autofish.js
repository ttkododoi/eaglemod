/**
 * mods/autofish.js
 * AutoFish — automatically reels in and recasts the fishing rod when a fish bites.
 * Adapted from the ModAPI-based AutoFish mod.
 */

const AutoFishMod = {
  name: "AutoFish",
  desc: "Auto-reel fishing rod on splash",
  enabled: false,
  _intervalId: null,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[AutoFish] ModAPI not found"); return; }

    ModAPI.require("player");
    var self = this;
    var timer = 0;
    var fishRodId = ModAPI.items.fishing_rod.getID();

    function rightClick() {
      try {
        var inv = ModAPI.player.inventory.mainInventory;
        var cur = ModAPI.player.inventory.currentItem;
        if (!inv[cur] || inv[cur].itemId !== fishRodId) return;
        ModAPI.rightClickMouse();
        timer = 15;
      } catch (e) { /* */ }
    }

    // Listen for splash sound = fish bite
    this._splashHandler = function(ev) {
      if (!self.enabled) return;
      if (ev.soundName === "random.splash") {
        rightClick();
      }
    };
    ModAPI.addEventListener("packetsoundeffect", this._splashHandler);

    // Periodic re-cast
    var tick = function() {
      if (!self.enabled) return;
      try {
        var inv = ModAPI.player.inventory.mainInventory;
        var cur = ModAPI.player.inventory.currentItem;
        if (inv[cur] && inv[cur].itemId === fishRodId) {
          if (timer > 0) { timer--; return; }
          if (ModAPI.player.fishEntity) return;
          rightClick();
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
    // Note: ModAPI event listeners can't be cleanly removed;
    // they check self.enabled and no-op when disabled.
  }
};
