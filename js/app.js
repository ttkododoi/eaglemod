/**
 * app.js
 * Main application logic — builds the version grid, handles selection/launch,
 * and transitions between the home and play views.
 */

(function() {
  let selectedVersion = null;

  function init() {
    buildVersionGrid();
    populateVersionSelect();
    ModLoader.init();
    Overlay.init();
    bindEvents();
  }

  /**
   * Build the visual version card grid.
   */
  function buildVersionGrid() {
    const grid = document.getElementById("versionGrid");
    grid.innerHTML = "";

    GAME_VERSIONS.forEach(v => {
      const card = document.createElement("div");
      card.className = "version-card";
      card.dataset.versionId = v.id;

      const runtimeClass = v.runtime.toLowerCase();
      const iconEmoji = v.runtime === "WASM" ? "⚡" : "JS";

      card.innerHTML = `
        <div class="version-card-icon">${iconEmoji}</div>
        <div class="version-card-version">v${v.label}</div>
        <div class="version-card-type">Client</div>
        <div class="version-card-runtime ${runtimeClass}">${v.runtime}</div>
      `;

      card.addEventListener("click", () => selectVersion(v));
      grid.appendChild(card);
    });
  }

  /**
   * Populate the bottom-bar version dropdown.
   */
  function populateVersionSelect() {
    const select = document.getElementById("versionSelect");
    select.innerHTML = '<option value="">— Choose —</option>';

    GAME_VERSIONS.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = `v${v.label} (${v.runtime})`;
      select.appendChild(opt);
    });
  }

  /**
   * Select a version from either the grid or dropdown.
   */
  function selectVersion(version) {
    selectedVersion = version;

    // Update grid card highlight
    document.querySelectorAll(".version-card").forEach(card => {
      card.classList.toggle("selected", card.dataset.versionId === version.id);
    });

    // Update dropdown
    const select = document.getElementById("versionSelect");
    select.value = version.id;

    // Update mode label
    document.getElementById("modeLabel").textContent = `MODE: ${version.runtime}`;

    // Enable launch
    document.getElementById("launchBtn").disabled = false;
    document.getElementById("statusText").textContent = `READY: v${version.label} ${version.runtime}`;
  }

  /**
   * Launch the selected version — switches to the play view and loads the iframe.
   */
  function launchGame() {
    if (!selectedVersion) return;

    document.getElementById("viewHome").classList.add("hidden");
    document.getElementById("viewPlay").classList.remove("hidden");

    const frame = document.getElementById("gameFrame");
    frame.src = selectedVersion.url;

    // Update status
    document.getElementById("statusText").textContent = `PLAYING: v${selectedVersion.label} ${selectedVersion.runtime}`;

    // Attempt to attach mod loader to the iframe (will fail silently if cross-origin)
    frame.addEventListener("load", function onLoad() {
      frame.removeEventListener("load", onLoad);
      const sameOrigin = ModLoader.attach(frame);

      if (!sameOrigin) {
        const statusEl = document.getElementById("modStatus");
        statusEl.textContent = "Cross-origin iframe — mods need console injection";
        statusEl.className = "mod-status error";
        console.info("[App] Iframe is cross-origin. Use the mod overlay to generate console-injectable scripts.");
      } else {
        console.info("[App] Same-origin iframe — mods can be injected directly.");
      }
    });
  }

  /**
   * Go back to the home/version-selection view.
   */
  function goBack() {
    // Stop all mods before leaving
    ModLoader.clearAll();
    Overlay.modStates = {};
    document.querySelectorAll("#modList input[type=checkbox]").forEach(cb => cb.checked = false);

    // Hide overlay
    document.getElementById("modOverlay").classList.add("hidden");
    Overlay.visible = false;

    // Clear iframe
    const frame = document.getElementById("gameFrame");
    frame.src = "about:blank";
    ModLoader.gameWindow = null;

    // Switch views
    document.getElementById("viewPlay").classList.add("hidden");
    document.getElementById("viewHome").classList.remove("hidden");

    document.getElementById("statusText").textContent = "READY";
  }

  /**
   * Bind all UI event listeners.
   */
  function bindEvents() {
    // Version dropdown change
    document.getElementById("versionSelect").addEventListener("change", (e) => {
      if (!e.target.value) return;
      const v = GAME_VERSIONS.find(g => g.id === e.target.value);
      if (v) selectVersion(v);
    });

    // Launch button
    document.getElementById("launchBtn").addEventListener("click", launchGame);
    document.getElementById("launchBtn").disabled = true;

    // Back button
    document.getElementById("backBtn").addEventListener("click", goBack);

    // Sidebar nav (just visual — all routes show the game view)
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        item.classList.add("active");
      });
    });

    // Prevent Right-Shift from doing anything else (browser shortcuts)
    document.addEventListener("keydown", (e) => {
      if (e.code === "ShiftRight") e.preventDefault();
    });
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
