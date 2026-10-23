/**
 * mods/fasterminecarts.js
 * FasterMinecarts — increases the maximum speed of minecarts.
 * Use /minecart_speed {factor} in chat to adjust (default 1x = 0.4 blocks/tick).
 * Adapted from the ModAPI-based FasterMinecarts mod by ZXMushroom63.
 */

const FasterMinecartsMod = {
  name: "Faster Minecarts",
  desc: "Speed up minecarts (/minecart_speed)",
  enabled: false,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[FasterMinecarts] ModAPI not found"); return; }

    try { ModAPI.meta.title("Faster Minecarts"); } catch (e) {}
    try { ModAPI.meta.description("Faster minecarts! Use /minecart_speed {factor} to edit the minecart's speed."); } catch (e) {}

    var self = this;

    // Server-side code to hook the minecart speed cap
    if (ModAPI.dedicatedServer && ModAPI.dedicatedServer.appendCode) {
      ModAPI.dedicatedServer.appendCode(function () {
        ModAPI.addEventListener("processcommand", function (event) {
          if (event.command.toLowerCase().startsWith("/minecart_speed")) {
            var speed = parseFloat(event.command.substring("/minecart_speed ".length)) || 1;
            var trueSpeed = speed * 0.4;
            try {
              ModAPI.hooks.methods.nmei_EntityMinecart_getMaximumSpeed = function () { return trueSpeed; };
            } catch (e) { /* */ }
            try {
              event.sender.addChatMessage(
                ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str("Set minecart speed to " + speed))
              );
            } catch (e) { /* */ }
            event.preventDefault = true;
          }
        });
      });
    }

    // Client-side chat command fallback
    this._chatHandler = function(ev) {
      if (!self.enabled) return;
      var msg = (ev.message || "").toLowerCase().trim();
      if (msg.startsWith("/minecart_speed")) {
        try {
          var speed = parseFloat(msg.substring("/minecart_speed ".length)) || 1;
          var trueSpeed = speed * 0.4;
          if (ModAPI.hooks && ModAPI.hooks.methods) {
            ModAPI.hooks.methods.nmei_EntityMinecart_getMaximumSpeed = function () { return trueSpeed; };
          }
          try { ModAPI.displayToChat({ msg: "Set minecart speed to " + speed }); } catch (e2) {}
        } catch (e) { /* */ }
      }
    };

    if (ModAPI.addEventListener) {
      ModAPI.addEventListener("sendchatmessage", this._chatHandler);
    }
  },

  disable: function(win) {
    this.enabled = false;
    // Restore default minecart speed
    try {
      var ModAPI = win.ModAPI;
      if (ModAPI && ModAPI.hooks && ModAPI.hooks.methods) {
        ModAPI.hooks.methods.nmei_EntityMinecart_getMaximumSpeed = function () { return 0.4; };
      }
    } catch (e) { /* */ }
  }
};
