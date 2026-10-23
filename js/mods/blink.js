/**
 * mods/blink.js
 * Blink — delays all outgoing packets while active, then releases them when deactivated.
 * Activate with ".blinkon" and deactivate with ".blinkoff" in chat.
 * Adapted from the ModAPI-based Blink mod.
 */

const BlinkMod = {
  name: "Blink",
  desc: "Delay packets (.blinkon/off in chat)",
  enabled: false,
  _blinking: false,
  _packets: [],

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[Blink] ModAPI not found"); return; }

    ModAPI.require("network");
    ModAPI.require("player");
    var self = this;
    this._blinking = false;
    this._packets = [];

    // Intercept outgoing packets while blinking
    this._eventHandler = function(ev) {
      if (!self.enabled || !self._blinking) return;
      if (ev.event && ev.event.startsWith("sendpacket") && ev.event !== "sendpacketkeepalive") {
        ev.data.preventDefault = true;
        self._packets.push(ev);
      }
    };
    ModAPI.addEventListener("event", this._eventHandler);

    function blinkOn() {
      if (self._blinking) return;
      self._blinking = true;
      try { ModAPI.displayToChat({ msg: "Blink activated." }); } catch (e) {}
    }

    function blinkOff() {
      if (!self._blinking) return;
      self._blinking = false;
      try { ModAPI.displayToChat({ msg: "Blink deactivated." }); } catch (e) {}

      self._packets.forEach(function(ev) {
        var data = ev.data;
        try {
          switch (ev.event) {
            case "sendpacketanimation":
              ModAPI.network.sendPacketAnimation();
              break;
            case "sendpacketentityaction":
              ModAPI.network.sendPacketEntityAction({ entityId: data.entityID, action: data.action, auxData: data.auxData });
              break;
            case "sendpacketinput":
              ModAPI.network.sendPacketInput({ strafeSpeed: data.strafeSpeed, forwardSpeed: data.forwardSpeed, jumping: data.jumping, sneaking: data.sneaking });
              break;
            case "sendpacketclosewindow":
              ModAPI.network.sendPacketCloseWindow({ windowId: data.windowId });
              break;
            case "sendpacketclickwindow":
              ModAPI.network.sendPacketClickWindow({ windowId: data.windowId, slotId: data.slotId, usedButton: data.usedButton, mode: data.mode, clickedItemRef: data.clickedItem ? data.clickedItem.getRef() : {}, actionNumber: data.actionNumber });
              break;
            case "sendpacketconfirmtransaction":
              ModAPI.network.sendPacketConfirmTransaction({ windowId: data.windowId, uid: data.uid, accepted: data.accepted });
              break;
            case "sendpacketchatmessage":
              ModAPI.network.sendPacketConfirmTransaction({ messageIn: data.message });
              break;
            case "sendpacketuseentity":
              ModAPI.network.sendPacketUseEntity({ entityId: data.entityId, action: data.action });
              break;
            case "sendpacketplayerposition":
              ModAPI.network.sendPacketPlayerPosition({ posX: data.x, posY: data.y, posZ: data.z, isOnGround: data.onGround });
              break;
            case "sendpacketplayerlook":
              ModAPI.network.sendPacketPlayerLook({ playerYaw: data.yaw, playerPitch: data.pitch, isOnGround: data.onGround });
              break;
            case "sendpacketplayerposlook":
              ModAPI.network.sendPacketPlayerPosLook({ playerX: data.x, playerY: data.y, playerZ: data.z, playerYaw: data.yaw, playerPitch: data.pitch, isOnGround: data.onGround });
              break;
            case "sendpacketplayer":
              ModAPI.network.sendPacketPlayer({ isOnGround: data.onGround });
              break;
            case "sendpacketplayerdigging":
              ModAPI.network.sendPacketPlayerDigging({ pos: data.position, facing: data.facing, action: data.status });
              break;
            case "sendpacketplayerblockplacement":
              ModAPI.network.sendPacketPlayerBlockPlacement({ stackRef: data.stack.getRef(), posRef: data.position.getRef(), placedBlockDirectionIn: data.placedBlockDirection, facingXIn: data.facingX, facingYIn: data.facingY, facingZIn: data.facingZ });
              break;
            case "sendpackethelditemchange":
              ModAPI.network.sendPacketHeldItemChange({ slotId: data.slotId });
              break;
            case "sendpacketcreativeinventoryaction":
              ModAPI.network.sendPacketCreativeInventoryAction({ slotId: data.slotId, stackRef: data.stack.getRef() });
              break;
            case "sendpacketenchantitem":
              ModAPI.network.sendPacketEnchantItem({ windowId: data.windowId, button: data.button });
              break;
            case "sendpacketupdatesign":
              ModAPI.network.sendPacketUpdateSign({ pos: data.pos, lines: data.lines });
              break;
            case "sendpacketplayerabilities":
              ModAPI.network.sendPacketPlayerAbilities({ capabilitiesRef: ModAPI.player.capabilities.getRef() });
              break;
            case "sendpackettabcomplete":
              ModAPI.network.sendPacketTabComplete({ msg: data.message, target: data.targetBlock });
              break;
            case "sendpacketclientsettings":
              ModAPI.network.sendPacketClientSettings({ lang: data.lang, view: data.view, chatVisibility: data.chatVisibility, enableColors: data.enableColors, modelPartFlags: data.modelPartFlags });
              break;
            case "sendpacketclientstatus":
              ModAPI.network.sendPacketClientStatus({ status: data.status });
              break;
            case "sendpacketspectate":
              ModAPI.network.sendPacketSpectate({ uuid: data.id });
              break;
            case "sendpacketresourcepackstatus":
              ModAPI.network.sendPacketResourcePackStatus({ hash: data.hash, status: data.status });
              break;
            default: break;
          }
        } catch (e) { /* */ }
      });
      self._packets = [];
    }

    this._blinkOn = blinkOn;
    this._blinkOff = blinkOff;

    // Chat command handler
    this._chatHandler = function(ev) {
      if (!self.enabled) return;
      var msg = ev.message.toLowerCase().trim();
      if (msg === ".blinkon") {
        ev.preventDefault = true;
        blinkOn();
      }
      if (msg === ".blinkoff") {
        ev.preventDefault = true;
        blinkOff();
      }
    };
    ModAPI.addEventListener("sendchatmessage", this._chatHandler);
  },

  disable: function(win) {
    this.enabled = false;
    // Release any pending packets
    if (this._blinking && this._blinkOff) {
      this._blinkOff();
    }
    this._blinking = false;
  }
};
