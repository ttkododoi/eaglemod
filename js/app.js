/**
 * app.js
 * Main application logic — builds the version grid, handles selection/launch,
 * page navigation, and dynamic content for all views.
 */

(function() {
  let selectedVersion = null;

  const PAGES = ["game", "clients", "updatelog", "beta", "servers", "downloads", "discord"];

  function init() {
    buildVersionGrid();
    populateVersionSelect();
    buildClientsPage();
    buildUpdateLog();
    buildServersPage();
    buildDownloadsPage();
    bindEvents();
    ModLoader.init();
    Overlay.init();
  }

  // ===== VERSION GRID =====

  function buildVersionGrid() {
    const grid = document.getElementById("versionGrid");
    grid.innerHTML = "";

    const groups = {};
    GAME_VERSIONS.forEach(v => {
      if (!groups[v.client]) groups[v.client] = [];
      groups[v.client].push(v);
    });

    Object.entries(groups).forEach(([clientName, versions]) => {
      const info = CLIENT_INFO[clientName] || { gradient: "linear-gradient(135deg, #333, #222)", tag: "" };
      const section = document.createElement("div");
      section.className = "client-section";
      section.dataset.client = clientName;

      section.innerHTML = `
        <div class="client-section-header">
          <h2>${clientName}</h2>
          ${info.tag ? `<span class="client-tag">${info.tag}</span>` : ""}
          <div class="client-line"></div>
        </div>
      `;

      const cardRow = document.createElement("div");
      cardRow.className = "version-card-row";

      versions.forEach(v => {
        const card = document.createElement("div");
        card.className = "version-card";
        card.dataset.versionId = v.id;
        card.dataset.client = v.client;
        card.dataset.label = (v.label + " " + v.client).toLowerCase();

        const runtimeClass = v.runtime.toLowerCase();
        const icon = v.runtime === "WASM" ? "⚡" : "⚙";

        card.innerHTML = `
          <div class="version-card-art" style="background: ${info.gradient};">
            <span class="vc-icon">${icon}</span>
          </div>
          <div class="version-card-body">
            <div class="version-card-version">${v.label}</div>
            <div class="version-card-type">${v.client}</div>
            <span class="runtime-badge ${runtimeClass}">${v.runtime}</span>
          </div>
        `;

        card.addEventListener("click", () => selectVersion(v));
        cardRow.appendChild(card);
      });

      section.appendChild(cardRow);
      grid.appendChild(section);
    });
  }

  // ===== VERSION SELECT =====

  function populateVersionSelect() {
    const select = document.getElementById("versionSelect");
    select.innerHTML = '<option value="">— Choose a version —</option>';

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

  // ===== SELECTION & LAUNCH =====

  function selectVersion(version) {
    selectedVersion = version;

    document.querySelectorAll(".version-card").forEach(card => {
      card.classList.toggle("selected", card.dataset.versionId === version.id);
    });

    document.getElementById("versionSelect").value = version.id;
    document.getElementById("modeLabel").textContent = `MODE: ${version.runtime}`;
    document.getElementById("launchBtn").disabled = false;
    document.getElementById("statusText").textContent = `Ready: ${version.client} ${version.label}`;
  }

  function launchGame() {
    if (!selectedVersion) return;

    navigateTo("play");

    const frame = document.getElementById("gameFrame");
    frame.src = selectedVersion.url;

    document.getElementById("statusText").textContent =
      `Playing: ${selectedVersion.client} ${selectedVersion.label}`;

    frame.addEventListener("load", function onLoad() {
      frame.removeEventListener("load", onLoad);
      const sameOrigin = ModLoader.attach(frame);

      if (!sameOrigin) {
        const statusEl = document.getElementById("modStatus");
        statusEl.textContent = "Cross-origin iframe — mods need console injection";
        statusEl.className = "mod-status error";
      }
    });
  }

  function goBack() {
    ModLoader.clearAll();
    Overlay.resetToggles();
    Overlay.clearCustomMods();

    document.getElementById("modOverlay").classList.add("hidden");
    Overlay.visible = false;

    const frame = document.getElementById("gameFrame");
    frame.src = "about:blank";
    ModLoader.gameWindow = null;

    navigateTo("game");
    document.getElementById("statusText").textContent = "Ready";
  }

  // ===== PAGE NAVIGATION =====

  function navigateTo(page) {
    // Hide ALL views
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));

    if (page === "play") {
      document.getElementById("viewPlay").classList.remove("hidden");
      return;
    }

    const target = document.getElementById("view" + cap(page));
    if (target) target.classList.remove("hidden");

    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add("active");

    document.getElementById("mainContent").scrollTo(0, 0);
  }

  function cap(s) {
    if (s === "updatelog") return "Updatelog";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ===== CLIENTS PAGE =====

  function buildClientsPage() {
    const grid = document.getElementById("clientGrid");
    grid.innerHTML = "";

    const clients = Object.keys(CLIENT_INFO);
    clients.forEach(clientName => {
      const info = CLIENT_INFO[clientName];
      const versionCount = GAME_VERSIONS.filter(v => v.client === clientName).length;

      const card = document.createElement("div");
      card.className = "client-card";
      card.innerHTML = `
        <div class="client-card-banner" style="background: ${info.gradient};">
          <span class="client-initial">${clientName.charAt(0)}</span>
        </div>
        <div class="client-card-body">
          <div class="client-card-name">
            ${clientName}
            ${info.tag ? `<span class="client-tag">${info.tag}</span>` : ""}
          </div>
          <div class="client-card-desc">${info.desc}</div>
          <div class="client-card-meta">
            <span class="client-card-versions">${versionCount} version${versionCount !== 1 ? "s" : ""} available</span>
            <button class="client-card-btn">Browse</button>
          </div>
        </div>
      `;

      card.querySelector(".client-card-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        navigateTo("game");
        const search = document.getElementById("versionSearch");
        search.value = clientName;
        filterVersions();
      });

      card.addEventListener("click", () => {
        navigateTo("game");
        const search = document.getElementById("versionSearch");
        search.value = clientName;
        filterVersions();
      });

      grid.appendChild(card);
    });
  }

  // ===== UPDATE LOG =====

  function buildUpdateLog() {
    const timeline = document.getElementById("timeline");
    const updates = [
      {
        version: "v2.4",
        date: "Oct 2026",
        changes: [
          "Added 8 new ModAPI-based mods: Autoclicker, AutoFish, AutoRespawn, Blink, SemiAutoLogin, Stats HUD, Vein Miner, Faster Minecarts",
          "Replaced X-Ray, Speed, and Fullbright with ModAPI versions for better compatibility",
          "Improved mod serialization for console injection across all mods",
          "Total mod count increased to 20"
        ]
      },
      {
        version: "v2.3",
        date: "Oct 2026",
        changes: [
          "Added DragonX, UwU, Shadow, Precision, and Bullfrog clients",
          "Added 6 new mods: Fly, NoFall, Speed, KillAura, Velocity, AntiAFK",
          "Redesigned UI with Apple design philosophy",
          "Functional page navigation across all sidebar sections",
          "Added version search and filtering",
          "Improved version grid with gradient card art"
        ]
      },
      {
        version: "v2.2",
        date: "Oct 2026",
        changes: [
          "Added Astra, Tuff, Resent, and Starlike clients",
          "Added custom mod creation (paste your own JavaScript)",
          "Grouped version cards by client with section headers",
          "Added client grouping in the version dropdown"
        ]
      },
      {
        version: "v2.1",
        date: "Sep 2026",
        changes: [
          "Initial mod overlay with 6 built-in mods",
          "Right-Shift toggle for mod menu",
          "Same-origin direct injection + cross-origin console scripts",
          "HUD overlay for FPS and coordinates"
        ]
      },
      {
        version: "v2.0",
        date: "Sep 2026",
        changes: [
          "Web-based Minecraft launcher with iframe embedding",
          "14 vanilla versions from 1.5.2 to 26.3",
          "Dark theme UI with sidebar navigation"
        ]
      }
    ];

    timeline.innerHTML = updates.map(u => `
      <div class="timeline-item">
        <div class="timeline-version">${u.version}</div>
        <div class="timeline-date">${u.date}</div>
        <ul class="timeline-changes">
          ${u.changes.map(c => `<li>${c}</li>`).join("")}
        </ul>
      </div>
    `).join("");
  }

  // ===== BETA PAGE =====

  function buildBetaPage() {
    const grid = document.getElementById("betaGrid");
    grid.innerHTML = "";

    const betaVersions = GAME_VERSIONS.filter(v =>
      v.label.toLowerCase().includes("beta") ||
      v.client === "Resent Client" ||
      v.client === "Starlike"
    );

    if (betaVersions.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-secondary);padding:24px;">No beta clients available right now.</p>';
      return;
    }

    const groups = {};
    betaVersions.forEach(v => {
      if (!groups[v.client]) groups[v.client] = [];
      groups[v.client].push(v);
    });

    Object.entries(groups).forEach(([clientName, versions]) => {
      const info = CLIENT_INFO[clientName] || { gradient: "linear-gradient(135deg, #333, #222)", tag: "Beta" };
      const section = document.createElement("div");
      section.className = "client-section";
      section.innerHTML = `<div class="client-section-header"><h2>${clientName}</h2><span class="client-tag">BETA</span><div class="client-line"></div></div>`;

      const cardRow = document.createElement("div");
      cardRow.className = "version-card-row";

      versions.forEach(v => {
        const card = document.createElement("div");
        card.className = "version-card";
        card.dataset.versionId = v.id;

        card.innerHTML = `
          <div class="version-card-art" style="background: ${info.gradient};">
            <span class="vc-icon">${v.runtime === "WASM" ? "⚡" : "⚙"}</span>
          </div>
          <div class="version-card-body">
            <div class="version-card-version">${v.label}</div>
            <div class="version-card-type">${v.client}</div>
            <span class="runtime-badge ${v.runtime.toLowerCase()}">${v.runtime}</span>
          </div>
        `;

        card.addEventListener("click", () => {
          selectVersion(v);
          navigateTo("game");
          launchGame();
        });
        cardRow.appendChild(card);
      });

      section.appendChild(cardRow);
      grid.appendChild(section);
    });
  }

  // ===== SERVERS PAGE =====

  function buildServersPage() {
    const grid = document.getElementById("serverGrid");
    const servers = [
      { name: "Hypixel Eagles",  version: "1.8.8",  players: 1240, max: 2000, ping: 45,  icon: "🏰", gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
      { name: "CraftMine Network", version: "1.12.2", players: 580,  max: 1000, ping: 89,  icon: "⛏", gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
      { name: "SkyRealms",       version: "1.16.5", players: 320,  max: 500,  ping: 120, icon: "☁",  gradient: "linear-gradient(135deg, #4facfe, #00f2fe)" },
      { name: "PvP Arena",       version: "1.8.8",  players: 890,  max: 1500, ping: 32,  icon: "⚔",  gradient: "linear-gradient(135deg, #ff4e50, #f9d423)" },
      { name: "Anarchy MC",      version: "1.12.2", players: 150,  max: 300,  ping: 200, icon: "💀", gradient: "linear-gradient(135deg, #2c3e50, #4ca1af)" },
      { name: "Creative Hub",    version: "1.14.4", players: 410,  max: 800,  ping: 67,  icon: "🎨", gradient: "linear-gradient(135deg, #43e97b, #38f9d7)" }
    ];

    grid.innerHTML = servers.map(s => {
      const pingColor = s.ping < 60 ? "#32d74b" : s.ping < 120 ? "#ffd60a" : "#FF453A";
      return `
        <div class="server-card">
          <div class="server-card-header">
            <div class="server-icon" style="background: ${s.gradient};">${s.icon}</div>
            <div>
              <div class="server-name">${s.name}</div>
              <div class="server-version">Version ${s.version}</div>
            </div>
          </div>
          <div class="server-meta">
            <span class="server-meta-item">
              <span class="ping-dot" style="background: ${pingColor};"></span>
              ${s.ping}ms
            </span>
            <span class="server-meta-item">👥 ${s.players} / ${s.max}</span>
          </div>
          <button class="server-join-btn">Join Server</button>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".server-join-btn").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const server = servers[i];
        const v = GAME_VERSIONS.find(g => g.label.includes(server.version));
        if (v) {
          selectVersion(v);
          navigateTo("game");
          launchGame();
        }
      });
    });
  }

  // ===== DOWNLOADS PAGE =====

  function buildDownloadsPage() {
    const grid = document.getElementById("downloadGrid");
    const downloads = [
      { title: "Web (Browser)", desc: "Play instantly — no download needed.", icon: "🌐", badge: "Recommended", featured: true },
      { title: "macOS", desc: "Universal binary for Apple Silicon & Intel.", icon: "" },
      { title: "Windows", desc: "Windows 10 or later (64-bit).", icon: "⊞" },
      { title: "Linux", desc: "AppImage for most distributions.", icon: "🐧" }
    ];

    grid.innerHTML = downloads.map(d => `
      <div class="download-card ${d.featured ? "featured" : ""}">
        ${d.badge ? `<span class="download-badge">${d.badge}</span>` : ""}
        <div class="download-icon">${d.icon}</div>
        <div class="download-title">${d.title}</div>
        <div class="download-desc">${d.desc}</div>
        <button class="download-btn" data-platform="${d.title}">${d.featured ? "Play Now" : "Download"}</button>
      </div>
    `).join("");

    grid.querySelectorAll(".download-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.platform.includes("Web")) {
          navigateTo("game");
        } else {
          btn.textContent = "Coming Soon";
          setTimeout(() => { btn.textContent = btn.dataset.platform.includes("Web") ? "Play Now" : "Download"; }, 1500);
        }
      });
    });
  }

  // ===== SEARCH / FILTER =====

  function filterVersions() {
    const query = document.getElementById("versionSearch").value.trim().toLowerCase();
    document.querySelectorAll(".client-section").forEach(section => {
      let anyVisible = false;
      section.querySelectorAll(".version-card").forEach(card => {
        const match = !query || card.dataset.label.includes(query);
        card.style.display = match ? "" : "none";
        if (match) anyVisible = true;
      });
      section.style.display = anyVisible ? "" : "none";
    });
  }

  // ===== EVENTS =====

  function bindEvents() {
    document.getElementById("versionSelect").addEventListener("change", (e) => {
      if (!e.target.value) return;
      const v = GAME_VERSIONS.find(g => g.id === e.target.value);
      if (v) selectVersion(v);
    });

    document.getElementById("launchBtn").addEventListener("click", launchGame);
    document.getElementById("launchBtn").disabled = true;
    document.getElementById("backBtn").addEventListener("click", goBack);

    document.getElementById("versionSearch").addEventListener("input", filterVersions);

    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        navigateTo(page);
        if (page === "beta") buildBetaPage();
      });
    });

    document.getElementById("discordJoinBtn").addEventListener("click", (e) => {
      e.preventDefault();
      const btn = e.target;
      btn.textContent = "Opening Discord…";
      setTimeout(() => { btn.textContent = "Join Server"; }, 1500);
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
