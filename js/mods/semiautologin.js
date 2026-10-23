/**
 * mods/semiautologin.js
 * SemiAutoLogin — opens a popup to enter your password, then auto-sends /login <password>
 * when you press the Up arrow key (key code 38).
 * Adapted from the ModAPI-based SemiAutoLogin mod.
 */

const SemiAutoLoginMod = {
  name: "SemiAuto Login",
  desc: "Auto-login with Up arrow key",
  enabled: false,
  _password: "",
  _popupWin: null,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[SemiAutoLogin] ModAPI not found"); return; }

    ModAPI.require("player");
    var self = this;
    var w = 200, h = 200;

    function popupCenter(opts) {
      var dualScreenLeft = win.screenLeft !== undefined ? win.screenLeft : win.screenX;
      var dualScreenTop = win.screenTop !== undefined ? win.screenTop : win.screenY;
      var width = win.innerWidth || win.document.documentElement.clientWidth || win.screen.width;
      var height = win.innerHeight || win.document.documentElement.clientHeight || win.screen.height;
      var systemZoom = width / win.screen.availWidth;
      var left = (width - opts.w) / 2 / systemZoom + dualScreenLeft;
      var top = (height - opts.h) / 2 / systemZoom + dualScreenTop;
      return win.open(opts.url, opts.title, "scrollbars=yes,width=" + (opts.w / systemZoom) + ",height=" + (opts.h / systemZoom) + ",top=" + top + ",left=" + left);
    }

    var newWin = popupCenter({ url: "", title: "", w: 200, h: 100 });
    var pass = "";

    if (!newWin || newWin.closed || typeof newWin.closed === "undefined") {
      pass = win.prompt("login (popup failed!)");
      self._password = pass;
    } else {
      self._popupWin = newWin;
      newWin.document.body.innerHTML = "<center><form id='form'><input id='pass' type='password' autofocus/><br><br><input type='submit' value='Register'></form></center>";
      newWin.document.getElementById("form").onsubmit = function() {
        pass = newWin.document.getElementById("pass").value;
        self._password = pass;
        newWin.close();
      };
    }

    this._keyHandler = function(e) {
      if (!self.enabled) return;
      if (e.key === 38) { // Up arrow
        ModAPI.player.sendChatMessage({ message: "/login " + self._password });
      }
    };
    ModAPI.addEventListener("key", this._keyHandler);
  },

  disable: function(win) {
    this.enabled = false;
    if (this._popupWin && !this._popupWin.closed) {
      try { this._popupWin.close(); } catch (e) {}
    }
    this._password = "";
  }
};
