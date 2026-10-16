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
   * Build the visual version card grid, grouped by client.
   */
  function buildVersionGrid() {
    const grid = document.getElementById("versionGrid");
    grid.innerHTML = "";

    // Group versions by client
    const groups = {};
    GAME_VERSIONS.forEach(v => {
      if (!groups[v.client]) groups[v.client] = [];
      groups[v.client].push(v);
    });

    // Render each client group with a section header
    Object.entries(groups).forEach(([clientName, versions]) => {
      const section = document.createElement("div");
      section.className = "client-section";
      section.innerHTML = `<div class="client-section-header">${clientName}</div>`;

      const cardRow = document.createElement("div");
      cardRow.className = "version-card-row";

      versions.forEach(v => {
        const card = document.createElement("div");
        card.className = "version-card";
        card.dataset.versionId = v.id;

        const runtimeClass = v.runtime.toLowerCase();
        const iconEmoji = v.runtime === "WASM" ? "⚡" : "JS";

        card.innerHTML = `
          <div class="version-card-icon">${iconEmoji}</div>
          <div class="version-card-version">${v.label}</div>
          <div class="version-card-type">${v.client}</div>
          <div class="version-card-runtime ${runtimeClass}">${v.runtime}</div>
        `;

        card.addEventListener("click", () => selectVersion(v));
        cardRow.appendChild(card);
      });

      section.appendChild(cardRow);
      grid.appendChild(section);
    });
  }

  /**
   * Populate the bottom-bar version dropdown.
   */
  function populateVersionSelect() {
    const select = document.getElementById("versionSelect");
    select.innerHTML = '<option value="">— Choose —</option>';

    // Group by client in dropdown
    const groups = {};
    GAME_VERSIONS.forEach(v => {
      if (!groups[v.client]) groups[v.client] = [];
      groups[v.client].push(v);
    });

    Object.entries(groups).forEach(([clientName, versions]) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = clientName;
      versions.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = `${v.label} (${v.runtime})`;
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
    });
  }

  /**
   * Select a version from either the grid or dropdown.
   */
  function selectVersion(version) {
    selectedVersion = version;

    document.querySelectorAll(".version-card").forEach(card => {
      card.classList.toggle("selected", card.dataset.versionId === version.id);
    });

    const select = document.getElementById("versionSelect");
    select.value = version.id;

    document.getElementById("modeLabel").textContent = `MODE: ${version.runtime}`;
    document.getElementById("launchBtn").disabled = false;
    document.getElementById("statusText").textContent = `READY: ${version.client} ${version.label}`;
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

    document.getElementById("statusText").textContent =
      `PLAYING: ${selectedVersion.client} ${selectedVersion.label}`;

    frame.addEventListener("load", function onLoad() {
      frame.removeEventListener("load", onLoad);
      const sameOrigin = ModLoader.attach(frame);

      if (!sameOrigin) {
        const statusEl = document.getElementById("modStatus");
        statusEl.textContent = "Cross-origin iframe — mods need console injection";
        statusEl.className = "mod-status error";
      } else {
        console.info("[App] Same-origin iframe — mods can be injected directly.");
      }
    });
  }

  /**
   * Go back to the home/version-selection view.
   */
  function goBack() {
    ModLoader.clearAll();
    Overlay.resetToggles();
    Overlay.clearCustomMods();

    document.getElementById("modOverlay").classList.add("hidden");
    Overlay.visible = false;

    const frame = document.getElementById("gameFrame");
    frame.src = "about:blank";
    ModLoader.gameWindow = null;

    document.getElementById("viewPlay").classList.add("hidden");
    document.getElementById("viewHome").classList.remove("hidden");
    document.getElementById("statusText").textContent = "READY";
  }

  function bindEvents() {
    document.getElementById("versionSelect").addEventListener("change", (e) => {
      if (!e.target.value) return;
      const v = GAME_VERSIONS.find(g => g.id === e.target.value);
      if (v) selectVersion(v);
    });

    document.getElementById("launchBtn").addEventListener("click", launchGame);
    document.getElementById("launchBtn").disabled = true;
    document.getElementById("backBtn").addEventListener("click", goBack);

    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        item.classList.add("active");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "ShiftRight") e.preventDefault();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
