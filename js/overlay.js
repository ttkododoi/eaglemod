/**
 * overlay.js
 * Builds the mod overlay UI, handles Right-Shift toggle, and wires up
 * mod toggle switches to the ModLoader.
 * Also manages custom mod creation (user-pasted JavaScript).
 */

const Overlay = {
  visible: false,
  modStates: {},

  init: function() {
    this._buildModList();
    this._buildCustomModSection();
    this._bindEvents();
  },

  _buildModList: function() {
    const list = document.getElementById("modList");
    list.innerHTML = "";

    const mods = [
      // Built-in mods
      { id: "esp",             mod: ESPMod },
      { id: "xray",            mod: XRayMod },
      { id: "killaura",        mod: KillAuraMod },
      { id: "fly",             mod: FlyMod },
      { id: "speed",           mod: SpeedMod },
      { id: "bhop",            mod: BhopMod },
      { id: "sprint",          mod: SprintMod },
      { id: "velocity",        mod: VelocityMod },
      { id: "nofall",          mod: NoFallMod },
      { id: "fullbright",      mod: FullbrightMod },
      { id: "antiafk",         mod: AntiAFKMod },
      { id: "hud",             mod: HUDMod },
      // ModAPI-based mods (from user-provided pack)
      { id: "autoclicker",     mod: AutoclickerMod },
      { id: "autofish",        mod: AutoFishMod },
      { id: "autorespawn",     mod: AutoRespawnMod },
      { id: "blink",           mod: BlinkMod },
      { id: "semiautologin",   mod: SemiAutoLoginMod },
      { id: "statshud",        mod: StatsHudMod },
      { id: "veinminer",       mod: VeinMinerMod },
      { id: "fasterminecarts", mod: FasterMinecartsMod }
    ];

    mods.forEach(({ id, mod }) => {
      this._addModItem(list, id, mod.name, mod.desc, false);
      this.modStates[id] = false;
    });

    list.querySelectorAll("input[type=checkbox]").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const modId = e.target.dataset.modId;
        this.modStates[modId] = e.target.checked;
        this._onToggle(modId, e.target.checked);
      });
    });
  },

  _addModItem: function(container, modId, name, desc, isCustom) {
    const item = document.createElement("div");
    item.className = "mod-item" + (isCustom ? " mod-item-custom" : "");
    item.dataset.modId = modId;

    item.innerHTML = `
      <div class="mod-item-info">
        <div class="mod-item-name">${name}${isCustom ? ' <span class="custom-badge">CUSTOM</span>' : ""}</div>
        <div class="mod-item-desc">${desc}</div>
      </div>
      <div class="mod-item-controls">
        ${isCustom ? '<button class="mod-remove-btn" title="Remove">×</button>' : ""}
        <label class="mod-toggle">
          <input type="checkbox" data-mod-id="${modId}" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    `;
    container.appendChild(item);

    const cb = item.querySelector("input[type=checkbox]");
    cb.addEventListener("change", (e) => {
      this._onToggle(modId, e.target.checked);
    });

    if (isCustom) {
      item.querySelector(".mod-remove-btn").addEventListener("click", () => {
        ModLoader.removeCustomMod(modId);
        item.remove();
        this._setModStatus("Custom mod removed", "");
      });
    }
  },

  _buildCustomModSection: function() {
    const addBtn = document.getElementById("addCustomModBtn");
    const nameInput = document.getElementById("customModName");
    const codeInput = document.getElementById("customModCode");

    if (!addBtn) return;

    addBtn.addEventListener("click", () => {
      const name = nameInput.value.trim() || "Unnamed Mod";
      const code = codeInput.value.trim();

      if (!code) {
        this._setModStatus("Paste some JavaScript code first", "error");
        return;
      }

      const id = ModLoader.addCustomMod(name, code);
      const list = document.getElementById("modList");
      this._addModItem(list, id, name, "User-pasted JavaScript", true);

      nameInput.value = "";
      codeInput.value = "";

      this._setModStatus(`Custom mod "${name}" added — toggle to inject`, "success");
    });
  },

  _onToggle: function(modId, enabled) {
    const isCustom = modId.startsWith("custom_");

    if (isCustom) {
      if (enabled) {
        const result = ModLoader.injectCustomMod(modId);
        if (result.success) {
          if (result.method === "direct") {
            this._setModStatus("Custom mod injected ✓", "success");
          } else {
            this._setModStatus("Cross-origin — copy script to inject", "error");
            this._showConsoleScript(ModLoader.customMods[modId].name, result.script);
          }
        } else {
          this._setModStatus(`Injection failed — ${result.error}`, "error");
        }
      } else {
        ModLoader.disableCustomMod(modId);
        this._setModStatus("Custom mod disabled", "");
      }
      return;
    }

    const mod = ModLoader.modRegistry[modId];
    if (!mod) return;

    if (enabled) {
      const result = ModLoader.enableMod(modId);
      if (result.success) {
        if (result.method === "direct") {
          this._setModStatus(`${mod.name}: injected ✓`, "success");
        } else if (result.method === "console") {
          this._setModStatus(`${mod.name}: cross-origin — copy script below`, "error");
          this._showConsoleScript(mod.name, result.script);
        }
      } else {
        this._setModStatus(`${mod.name}: failed — ${result.error || "unknown"}`, "error");
      }
    } else {
      ModLoader.disableMod(modId);
      this._setModStatus(`${mod.name}: disabled`, "");
    }
  },

  _setModStatus: function(text, type) {
    const statusEl = document.getElementById("modStatus");
    statusEl.textContent = text;
    statusEl.className = "mod-status" + (type ? " " + type : "");

    clearTimeout(this._statusTimeout);
    this._statusTimeout = setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "mod-status";
    }, 3000);
  },

  _showConsoleScript: function(modName, script) {
    let modal = document.getElementById("_consoleScriptModal");
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "_consoleScriptModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;";
    modal.innerHTML = `
      <div style="background:#1c1c1e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;max-width:600px;width:90%;">
        <h3 style="color:#0A84FF;margin-bottom:8px;font-size:18px;">${modName} — Console Injection</h3>
        <p style="color:rgba(235,235,245,0.6);font-size:13px;margin-bottom:12px;line-height:1.5;">
          The game runs in a cross-origin iframe. To inject this mod:<br>
          1. Right-click the game area → Inspect Element<br>
          2. Switch to the iframe's execution context (dropdown in Console tab)<br>
          3. Paste the script below and press Enter
        </p>
        <textarea readonly style="width:100%;height:200px;background:#000;color:#32d74b;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px;font-family:monospace;font-size:11px;resize:none;">${script.replace(/</g, "<").replace(/>/g, ">")}</textarea>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button id="_copyScriptBtn" style="flex:1;background:#0A84FF;color:#fff;border:none;padding:10px;border-radius:10px;cursor:pointer;font-weight:600;">Copy to Clipboard</button>
          <button id="_closeScriptBtn" style="flex:1;background:rgba(255,255,255,0.1);color:#fff;border:none;padding:10px;border-radius:10px;cursor:pointer;">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("_copyScriptBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(script).then(() => {
        const btn = document.getElementById("_copyScriptBtn");
        btn.textContent = "Copied ✓";
        setTimeout(() => { btn.textContent = "Copy to Clipboard"; }, 1500);
      });
    });

    document.getElementById("_closeScriptBtn").addEventListener("click", () => {
      modal.remove();
    });
  },

  _bindEvents: function() {
    document.addEventListener("keydown", (e) => {
      if (e.code === "ShiftRight") {
        e.preventDefault();
        this.toggle();
      }
    });

    document.getElementById("injectAllBtn").addEventListener("click", () => {
      const results = ModLoader.injectAll();
      if (results.length === 0) {
        this._setModStatus("No mods enabled", "");
        return;
      }

      const allDirect = results.every(r => r.method === "direct");
      const anyConsole = results.some(r => r.method === "console");

      if (allDirect) {
        this._setModStatus(`Injected ${results.length} mod(s) ✓`, "success");
      } else if (anyConsole) {
        this._setModStatus("Some mods need console injection (cross-origin)", "error");
        results.filter(r => r.method === "console").forEach(r => {
          const name = r.id.startsWith("custom_") ? ModLoader.customMods[r.id].name : ModLoader.modRegistry[r.id].name;
          this._showConsoleScript(name, r.script);
        });
      }
    });

    document.getElementById("clearModsBtn").addEventListener("click", () => {
      ModLoader.clearAll();
      this.resetToggles();
      this._setModStatus("All mods cleared", "");
    });
  },

  resetToggles: function() {
    document.querySelectorAll("#modList input[type=checkbox]").forEach(cb => {
      cb.checked = false;
    });
    Object.keys(this.modStates).forEach(id => this.modStates[id] = false);
  },

  clearCustomMods: function() {
    document.querySelectorAll("#modList .mod-item-custom").forEach(item => item.remove());
    ModLoader.customMods = {};
  },

  toggle: function() {
    this.visible = !this.visible;
    const overlay = document.getElementById("modOverlay");
    if (this.visible) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }
  }
};
