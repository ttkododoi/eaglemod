/**
 * mods/xray.js
 * X-Ray — makes terrain transparent to reveal valuable ores, chests, and furnaces.
 * Adapted from the ModAPI-based Xray mod (replaces previous contentWindow version).
 * Toggle with the "X" key (key code 45) inside the game.
 */

const XRayMod = {
  name: "X-Ray",
  desc: "See ores through terrain (press X)",
  enabled: false,
  _xrayEnabled: false,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[X-Ray] ModAPI not found"); return; }

    var self = this;
    this._xrayEnabled = false;

    var targets = [
      "diamond_block", "diamond_ore", "gold_block", "gold_ore",
      "iron_block", "iron_ore", "coal_block", "coal_ore",
      "emerald_ore", "emerald_block", "redstone_ore", "redstone_block",
      "lapis_ore", "lapis_block", "chest", "furnace", "lit_furnace", "ender_chest"
    ];

    function update() {
      try {
        ModAPI.displayToChat({ msg: "xray Enabled!" });
        var allblocks = Object.keys(ModAPI.blocks);
        allblocks.forEach(function(block) {
          if (targets.includes(block)) {
            ModAPI.blocks[block].forceRender = true;
            ModAPI.blocks[block].reload();
          } else if (ModAPI.blocks[block] && ("noRender" in ModAPI.blocks[block])) {
            ModAPI.blocks[block].noRender = true;
            ModAPI.blocks[block].reload();
          }
        });
        ModAPI.reloadchunks();
      } catch (e) { /* */ }
    }

    function disableXray() {
      try {
        ModAPI.displayToChat({ msg: "xray Disabled!" });
        var allblocks = Object.keys(ModAPI.blocks);
        allblocks.forEach(function(block) {
          if (ModAPI.blocks[block] && ("noRender" in ModAPI.blocks[block])) {
            ModAPI.blocks[block].noRender = false;
            ModAPI.blocks[block].reload();
          }
        });
        ModAPI.reloadchunks();
      } catch (e) { /* */ }
    }

    // Store for cleanup
    this._disableXray = disableXray;

    this._keyHandler = function(ev) {
      if (!self.enabled) return;
      if (ev.key === 45) { // "X" key
        if (self._xrayEnabled) {
          disableXray();
          self._xrayEnabled = false;
        } else {
          update();
          self._xrayEnabled = true;
        }
      }
    };
    ModAPI.addEventListener("key", this._keyHandler);

    // Auto-enable xray on inject
    update();
    this._xrayEnabled = true;
  },

  disable: function(win) {
    this.enabled = false;
    if (this._xrayEnabled && this._disableXray) {
      this._disableXray();
    }
    this._xrayEnabled = false;
  }
};
