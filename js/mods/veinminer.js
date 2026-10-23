/**
 * mods/veinminer.js
 * VeinMiner — mines entire veins of ore or trees while crouching.
 * Uses ModAPI's dedicated server hooks to intercept block harvesting.
 * Adapted from the ModAPI-based VeinMiner mod by ZXMushroom63.
 */

const VeinMinerMod = {
  name: "Vein Miner",
  desc: "Mine ore veins while crouching",
  enabled: false,
  _conf: null,

  enable: function(win) {
    this.enabled = true;
    var ModAPI = win.ModAPI;
    if (!ModAPI) { console.warn("[VeinMiner] ModAPI not found"); return; }

    try { ModAPI.meta.title("Vein Miner"); } catch (e) {}
    try { ModAPI.meta.description("Vein-mines trees & ores while crouching."); } catch (e) {}

    var self = this;
    var conf = {
      doLogs: true,
      doOres: true,
      doGravel: false,
      doClay: false
    };

    // Try to load saved config
    try {
      var saved = win.localStorage.getItem("trc_mod::conf");
      if (saved) Object.assign(conf, JSON.parse(saved));
    } catch (e) { /* */ }

    self._conf = conf;

    // Push config to the server context
    if (ModAPI.dedicatedServer && ModAPI.dedicatedServer.appendCode) {
      ModAPI.dedicatedServer.appendCode("globalThis.VEINMINERCONF = " + JSON.stringify(conf) + ";");

      ModAPI.dedicatedServer.appendCode(function () {
        ModAPI.addEventListener("bootstrap", function () {
          var targettedBlockIds = [];
          if (VEINMINERCONF.doLogs) targettedBlockIds.push("log", "log2");
          if (VEINMINERCONF.doOres) targettedBlockIds.push("coal_ore", "gold_ore", "iron_ore", "lapis_ore", "quartz_ore", "diamond_ore", "emerald_ore", "redstone_ore", "lit_redstone_ore");
          if (VEINMINERCONF.doGravel) targettedBlockIds.push("gravel");
          if (VEINMINERCONF.doClay) targettedBlockIds.push("clay");

          var valid_log_blocks = targettedBlockIds.map(function (x) { return ModAPI.blocks[x].getRef(); });

          function stringifyBlockPos(blockPos) {
            return blockPos.x + "," + blockPos.y + "," + blockPos.z;
          }

          function getNeighbors(blockPos) {
            return [
              blockPos.down(1), blockPos.up(1),
              blockPos.north(1), blockPos.south(1), blockPos.east(1), blockPos.west(1),
              blockPos.down(1).north(1), blockPos.down(1).south(1), blockPos.down(1).east(1), blockPos.down(1).west(1),
              blockPos.up(1).north(1), blockPos.up(1).south(1), blockPos.up(1).east(1), blockPos.up(1).west(1),
              blockPos.north(1).east(1), blockPos.north(1).west(1), blockPos.south(1).east(1), blockPos.south(1).west(1),
              blockPos.down(1).north(1).east(1), blockPos.down(1).north(1).west(1),
              blockPos.down(1).south(1).east(1), blockPos.down(1).south(1).west(1),
              blockPos.up(1).north(1).east(1), blockPos.up(1).north(1).west(1),
              blockPos.up(1).south(1).east(1), blockPos.up(1).south(1).west(1)
            ];
          }

          function getBlockGraph(blockPos, getBlockState, targetType) {
            var closed = [stringifyBlockPos(blockPos)];
            var logs = [];
            var open = getNeighbors(blockPos);
            var maxIters = 120;
            var i = 0;
            while (open.length > 0 && i < maxIters) {
              var target = open.pop();
              closed.push(stringifyBlockPos(target));
              i++;
              var iBlockState = getBlockState(target.getRef());
              if (iBlockState.block.getRef() === targetType) {
                logs.push(target);
                var neighbors = getNeighbors(target);
                for (var j = 0; j < neighbors.length; j++) {
                  if (!closed.includes(stringifyBlockPos(neighbors[j]))) {
                    open.push(neighbors[j]);
                  }
                }
              }
            }
            return logs;
          }

          var axes = [ModAPI.items.iron_axe, ModAPI.items.stone_axe, ModAPI.items.golden_axe, ModAPI.items.wooden_axe, ModAPI.items.diamond_axe].map(function (x) { return x.getRef(); });

          valid_log_blocks.forEach(function (b) {
            var originalHarvest = b.$harvestBlock;
            b.$harvestBlock = function ($theWorld, $player, $blockpos, $blockstate, $tileentity) {
              var args = arguments;
              var blockState = ModAPI.util.wrap($blockstate);
              var player = ModAPI.util.wrap($player);
              try {
                if (player.isSneaking() && !ModAPI.util.isCritical()) {
                  ModAPI.promisify(async function () {
                    var world = ModAPI.util.wrap($theWorld);
                    var harvestCall = ModAPI.promisify(ModAPI.is_1_12 ? player.interactionManager.tryHarvestBlock : player.theItemInWorldManager.tryHarvestBlock);
                    var blocks = getBlockGraph(ModAPI.util.wrap($blockpos), ModAPI.promisify(world.getBlockState), b);
                    for (var k = 0; k < blocks.length; k++) {
                      await harvestCall(blocks[k].getRef());
                    }
                  })();
                }
              } catch (e) { /* */ }
              originalHarvest.apply(this, args);
            };
          });
        });
      });
    }
  },

  disable: function(win) {
    this.enabled = false;
    // VeinMiner hooks are server-side; clearing the enabled flag stops new operations
  }
};
