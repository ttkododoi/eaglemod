/**
 * overlay.js
 * Builds the mod overlay UI, handles Right-Shift toggle, and wires up
 * mod toggle switches to the ModLoader.
 */

const Overlay = {
  visible: false,
  modStates: {}, // { modId: boolean }

  init: function() {
    this._buildModList();
    this._bindEvents();
  },

  _buildModList: function() {
    const list = document.getElementById("modList");
    list.innerHTML = "";

    const mods = [
      { id: "esp",       mod: ESPMod },
      { id: "xray",      mod: XRayMod },
      { id: "bhop",      mod: BhopMod },
      { id: "fullbright",mod: FullbrightMod },
      { id: "sprint",    mod: SprintMod },
      { id: "hud",       mod: HUDMod }
    ];

    mods.forEach(({ id, mod }) => {
      const item = document.createElement("div");
      item.className = "mod-item";
      item.innerHTML = `
        <div class="mod-item-info">
          <div class="mod-item-name">${mod.name}</div>
          <div class="mod-item-desc">${mod.desc}</div>
        </div>
        <label class="mod-toggle">
          <input type="checkbox" data-mod-id="${id}" />
          <span class="toggle-slider"></span>
        </label>
      `;
      list.appendChild(item);

      // Store initial state
      this.modStates[id] = false;
    });

    // Wire up toggles
    list.querySelectorAll("input[type=checkbox]").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const modId = e.target.dataset.modId;
        this.modStates[modId] = e.target.checked;
        this._onToggle(modId, e.target.checked);
      });
    });
  },

  _onToggle: function(modId, enabled) {
    const statusEl = document.getElementById("modStatus");
    const mod = ModLoader.modRegistry[modId];
    if (!mod) return;

    if (enabled) {
      const result = ModLoader.enableMod(modId);
      if (result.success) {
        if (result.method === "direct") {
          statusEl.textContent = `${mod.name}: injected ✓`;
          statusEl.className = "mod-status success";
        } else if (result.method === "console") {
          statusEl.textContent = `${mod.name}: cross-origin — copy script below`;
          statusEl.className = "mod-status error";
          this._showConsoleScript(mod.name, result.script);
        }
      } else {
        statusEl.textContent = `${mod.name}: injection failed — ${result.error || "unknown"}`;
        statusEl.className = "mod-status error";
      }
    } else {
      ModLoader.disableMod(modId);
      statusEl.textContent = `${mod.name}: disabled`;
      statusEl.className = "mod-status";
    }

    // Auto-clear status after 3s
    clearTimeout(this._statusTimeout);
    this._statusTimeout = setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "mod-status";
    }, 3000);
  },

  _showConsoleScript: function(modName, script) {
    // For cross-origin iframes: create a temporary textarea with the script
    // so the user can copy it and paste into the game's dev console.
    let modal = document.getElementById("_consoleScriptModal");
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "_consoleScriptModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;";
    modal.innerHTML = `
      <div style="background:#1a1a1a;border:1px solid #2d2d2d;border-radius:8px;padding:24px;max-width:600px;width:90%;">
        <h3 style="color:#e60000;margin-bottom:8px;">${modName} — Console Injection</h3>
        <p style="color:#888;font-size:12px;margin-bottom:12px;">
          The game runs in a cross-origin iframe. To inject this mod:<br>
          1. Right-click the game area → Inspect Element<br>
          2. Switch to the iframe's execution context (dropdown in Console tab)<br>
          3. Paste the script below and press Enter
        </p>
        <textarea readonly style="width:100%;height:200px;background:#0d0d0d;color:#0f0;border:1px solid #2d2d2d;border-radius:4px;padding:8px;font-family:monospace;font-size:11px;resize:none;">${script.replace(/</g, "<")}</textarea>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button id="_copyScriptBtn" style="flex:1;background:#2d2d2d;color:#fff;border:none;padding:8px;border-radius:4px;cursor:pointer;">Copy to Clipboard</button>
          <button id="_closeScriptBtn" style="flex:1;background:#2d2d2d;color:#fff;border:none;padding:8px;border-radius:4px;cursor:pointer;">Close</button>
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
    // Right-Shift toggles the overlay
    document.addEventListener("keydown", (e) => {
      if (e.code === "ShiftRight") {
        e.preventDefault();
        this.toggle();
      }
    });

    // Inject All button
    document.getElementById("injectAllBtn").addEventListener("click", () => {
      const statusEl = document.getElementById("modStatus");
      const results = ModLoader.injectAll();

      if (results.length === 0) {
        statusEl.textContent = "No mods enabled";
        statusEl.className = "mod-status";
        return;
      }

      const allDirect = results.every(r => r.method === "direct");
      const anyConsole = results.some(r => r.method === "console");

      if (allDirect) {
        statusEl.textContent = `Injected ${results.length} mod(s) ✓`;
        statusEl.className = "mod-status success";
      } else if (anyConsole) {
        statusEl.textContent = "Some mods need console injection (cross-origin)";
        statusEl.className = "mod-status error";
        // Show console scripts for cross-origin mods
        results.filter(r => r.method === "console").forEach(r => {
          this._showConsoleScript(r.id, r.script);
        });
      }

      clearTimeout(this._statusTimeout);
      this._statusTimeout = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.className = "mod-status";
      }, 4000);
    });

    // Clear All button
    document.getElementById("clearModsBtn").addEventListener("click", () => {
      ModLoader.clearAll();
      // Uncheck all toggles
      document.querySelectorAll("#modList input[type=checkbox]").forEach(cb => {
        cb.checked = false;
      });
      Object.keys(this.modStates).forEach(id => this.modStates[id] = false);

      const statusEl = document.getElementById("modStatus");
      statusEl.textContent = "All mods cleared";
      statusEl.className = "mod-status";
      clearTimeout(this._statusTimeout);
      this._statusTimeout = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.className = "mod-status";
      }, 2000);
    });
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
