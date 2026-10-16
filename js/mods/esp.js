/**
 * mods/esp.js
 * ESP — highlights entities (players, mobs) through walls via the game's render loop.
 * Hooks into the Eaglercraft/Minecraft WebGL canvas to draw outline overlays.
 *
 * Injection target: the iframe's contentWindow (same-origin) or game console (cross-origin).
 */

const ESPMod = {
  name: "ESP",
  desc: "See entities through walls",
  enabled: false,
  _intervalId: null,
  _hookFn: null,

  enable: function(win) {
    this.enabled = true;
    const doc = win.document;
    const canvas = doc.querySelector("canvas");
    if (!canvas) { console.warn("[ESP] No canvas found"); return; }

    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) { console.warn("[ESP] No WebGL context"); return; }

    // ESP overlay: draw on a 2D canvas stacked above the WebGL canvas
    let overlay = doc.getElementById("_esp_overlay");
    if (!overlay) {
      overlay = doc.createElement("canvas");
      overlay.id = "_esp_overlay";
      overlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
      canvas.parentElement.appendChild(overlay);
    }

    const ctx2d = overlay.getContext("2d");

    const drawLoop = () => {
      if (!this.enabled) return;
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      ctx2d.clearRect(0, 0, overlay.width, overlay.height);

      // Attempt to read entity list from the game runtime.
      // Eaglercraft exposes entities through the Minecraft instance.
      // Different versions expose different APIs, so we try several paths.
      const mc = win.Minecraft || win.minecraft || (win.theMinecraft);
      let entities = [];

      if (mc) {
        // Try common Eaglercraft entity access patterns
        try {
          if (mc.theWorld && mc.theWorld.playerEntities) {
            entities = mc.theWorld.playerEntities;
          } else if (mc.theWorld && mc.theWorld.loadedEntityList) {
            entities = mc.theWorld.loadedEntityList;
          } else if (mc.getIntegratedServer && mc.getIntegratedServer()) {
            const world = mc.getIntegratedServer().worldServers[0];
            if (world) entities = world.playerEntities;
          }
        } catch (e) { /* silent — entity access varies by version */ }
      }

      // Draw bounding boxes for each entity
      ctx2d.lineWidth = 2;
      for (let i = 0; i < entities.length; i++) {
        const ent = entities[i];
        let x, y, z, w, h;

        try {
          if (ent.posX !== undefined) {
            x = ent.posX; y = ent.posY; z = ent.posZ;
          } else if (ent.getPosition) {
            const pos = ent.getPosition();
            x = pos.x; y = pos.y; z = pos.z;
          } else continue;

          // Project 3D world coords to 2D screen coords
          // Uses the game's active render manager if available
          const proj = this._project(win, canvas, x, y, z);
          if (!proj) continue;

          w = 40;
          h = 80;

          // Color: red for players, orange for mobs
          const isPlayer = ent instanceof (win.EntityPlayer || win.EntityPlayerSP || Object);
          ctx2d.strokeStyle = isPlayer ? "#ff0000" : "#ff8800";
          ctx2d.strokeRect(proj.x - w / 2, proj.y - h, w, h);

          // Name label
          ctx2d.fillStyle = isPlayer ? "#ff0000" : "#ff8800";
          ctx2d.font = "12px monospace";
          const name = ent.getName ? ent.getName() : (ent.username || "Entity");
          ctx2d.fillText(name, proj.x - w / 2, proj.y - h - 4);
        } catch (e) { /* skip malformed entity */ }
      }

      this._intervalId = win.requestAnimationFrame(drawLoop);
    };

    this._hookFn = drawLoop;
    win.requestAnimationFrame(drawLoop);
    console.log("[ESP] Enabled");
  },

  _project: function(win, canvas, x, y, z) {
    // Attempt to use the game's active render/view system for projection.
    // Falls back to a simple centering heuristic if unavailable.
    const mc = win.Minecraft || win.minecraft || win.theMinecraft;
    try {
      if (mc && mc.entityRenderer) {
        // Use the game's own projection if accessible
        const er = mc.entityRenderer;
        if (er.getFOVModifier && er.cameraPosition) {
          // Simplified screen-space projection
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          return { x: cx + (x - er.cameraPosition.x) * 10, y: cy - (y - er.cameraPosition.y) * 10 };
        }
      }
    } catch (e) { /* fall through */ }

    // Fallback: center of screen
    return { x: canvas.width / 2, y: canvas.height / 2 };
  },

  disable: function(win) {
    this.enabled = false;
    if (this._intervalId && win) {
      win.cancelAnimationFrame(this._intervalId);
      this._intervalId = null;
    }
    if (win && win.document) {
      const overlay = win.document.getElementById("_esp_overlay");
      if (overlay) overlay.remove();
    }
    console.log("[ESP] Disabled");
  }
};
