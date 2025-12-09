// Campaign Map Data for "The Spire of the Lich King"
// Each map is represented as a 2D grid with tile types

// Tile legend:
// '.' = grass
// 'D' = dark grass (corrupted)
// '#' = wall
// 'f' = stone floor
// 'd' = door
// 'w' = water
// 'T' = tree
// 'c' = cobblestone
// 'W' = wood floor
// 'p' = path
// 'k' = dark stone (crypt)
// 'v' = void
// 't' = dirt
// 'P' = player start
// 'E' = enemy
// 'N' = NPC
// 'C' = chest
// 'U' = stairs up
// 'S' = stairs down
// 'A' = altar

const maps = {
  oakhaven: {
    name: "Oakhaven Village",
    description: "A peaceful village, your journey begins here",
    width: 20,
    height: 15,
    tiles: [
      "..........TT........",
      "..cc.....TTT........",
      ".cccc.....TT........",
      ".cNcc................",
      ".cccc................",
      "..cc..##d##..........",
      "......#WWW#...##d##..",
      "......#WWW#...#WWW#..",
      "......#WWW#...#CWW#..",
      "......##d##...##d##..",
      ".....................",
      "..P..................",
      ".......wwwwwwww......",
      ".......wwwwwwww......",
      "...TT...wwwwww......T"
    ]
  },

  blackwoodForest: {
    name: "Blackwood Forest",
    description: "A dark forest corrupted by evil magic",
    width: 20,
    height: 15,
    tiles: [
      "TTTDDDTTTDDDTTTTDDTT",
      "TTDDDDDTDDDDDTTDDDDT",
      "TDDDDDDDDDDDDDDDDTTT",
      "TDDDT.DpppDD.DDDTTTT",
      "DDD...DpppD...DDTTTT",
      "DD.P..DpppD....DTTTT",
      "DD....DpppD...EDTTTT",
      "DDD...DpppDD...DTTTT",
      "TDDD..DpppDDD..DTTTT",
      "TTDD.DDpppDD..DDTTTT",
      "TTTD.DDpppDDD.DDTTTT",
      "TTTD..DpppDD..DDTTTT",
      "TTDD...pppD....DTTTT",
      "TTTD...pppDD.CDDTTTT",
      "TTTT...ppppDDDDTTTTT"
    ]
  },

  towerInterior: {
    name: "Tower - Foyer",
    description: "The entrance hall of the ancient tower",
    width: 16,
    height: 16,
    tiles: [
      "################",
      "#fffffffffffffff",
      "#fffffffffffff#",
      "#fff.....fffff#",
      "#ff.......ffff#",
      "#ff...P...ffff#",
      "#ff.......ffff#",
      "#fff.....fffff#",
      "#ffffffUffffff#",
      "#fffffffffffff#",
      "#ff#d#####d#ff#",
      "#ff#fffff#fff#",
      "#E.#fCfff#.E.#",
      "#..#fffff#...#",
      "#..dfffffd...#",
      "################"
    ]
  },

  alchemistLab: {
    name: "Tower - Alchemist's Lab",
    description: "A laboratory filled with strange experiments",
    width: 16,
    height: 16,
    tiles: [
      "################",
      "#fffffffffffff#",
      "#fffffffffffff#",
      "#ff##ff##ffff#",
      "#ff##ff##ffff#",
      "#fffffffffffff#",
      "#fffffffffffff#",
      "#ffff...ffffff#",
      "#fffC...Cfffff#",
      "#ffff...ffffff#",
      "#fffffffffffff#",
      "#ffPffffffEff#",
      "#fffffffffffff#",
      "#ffffffDffffff#",
      "#fffffffffffff#",
      "################"
    ]
  },

  catacombs: {
    name: "Underground Catacombs",
    description: "Ancient burial chambers beneath the tower",
    width: 18,
    height: 14,
    tiles: [
      "##################",
      "#kkkkkk#kkkkkkkk##",
      "#kkkkkk#kkkkkkkkE#",
      "#U#d####kkkkkkk###",
      "#k#kkkkkkk###d#kk#",
      "#k#kCkkkk##kkk#Ck#",
      "#k#kkkk###kkk###k#",
      "#k####d#kkkkkk#kk#",
      "#kkkkkk#kkEkk##kk#",
      "#P#kkk##kkkkk#kkk#",
      "###kkk#kkkk###kkk#",
      "#Ekkk##kkkk#Ckkk##",
      "#kkkk#kkkkkk#kkkk#",
      "##################"
    ]
  },

  voidSanctum: {
    name: "Void Sanctum",
    description: "The lich's ritual chamber, where darkness reigns",
    width: 16,
    height: 16,
    tiles: [
      "################",
      "#vvvvvvvvvvvvv#",
      "#vvvvvvvvvvvvv#",
      "#vvv........vvv#",
      "#vv..........vv#",
      "#vv....vv....vv#",
      "#vv...vvvv...vv#",
      "#vv...vvvv...vv#",
      "#vv...vAAv...vv#",
      "#vv...vvvv...vv#",
      "#vv....vv....vv#",
      "#vv....P.....vv#",
      "#vvv........vvv#",
      "#vvvvv.E.vvvvv#",
      "#vvvvvvvvvvvvv#",
      "################"
    ]
  },

  // Bonus: Hex grid example
  hexExample: {
    name: "Hex Grid Example",
    description: "Example of offset hex tile layout",
    width: 15,
    height: 12,
    isHex: true,
    tiles: [
      "...TT...TT...TT",
      "..TT...TT...TT.",
      "...TT.ppp.TT...",
      "..TT..ppp..TT..",
      "...T..pPp..T...",
      "..TT..ppp..TT..",
      "...TT.ppp.TT...",
      "..TTTTpppTTTT..",
      "...wwwwwwwww...",
      "..wwwwwwwwww...",
      "...wwwwwwww....",
      "...............",
    ]
  }
};

// Tile type to CSS class mapping
const tileTypeMap = {
  '.': 'grass',
  'D': 'dark-grass',
  '#': 'wall',
  'f': 'stone-floor',
  'd': 'door',
  'w': 'water',
  'T': 'tree',
  'c': 'cobblestone',
  'W': 'wood-floor',
  'p': 'path',
  'k': 'crypt-floor',
  'v': 'void',
  't': 'dirt',
  'P': 'grass player',
  'E': 'stone-floor enemy',
  'N': 'cobblestone npc',
  'C': 'stone-floor chest',
  'U': 'stone-floor stairs-up',
  'S': 'stone-floor stairs-down',
  'A': 'void altar'
};

// Render a map to a container element
function renderMap(mapData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Create tilemap container
  const tilemapDiv = document.createElement('div');
  tilemapDiv.className = 'tilemap-container';

  // Add title
  const titleDiv = document.createElement('div');
  titleDiv.className = 'tilemap-title';
  titleDiv.textContent = mapData.name;
  tilemapDiv.appendChild(titleDiv);

  // Add description
  const descDiv = document.createElement('div');
  descDiv.className = 'tilemap-title';
  descDiv.style.fontSize = '12px';
  descDiv.style.color = '#aaa';
  descDiv.textContent = mapData.description;
  tilemapDiv.appendChild(descDiv);

  // Create grid
  const gridDiv = document.createElement('div');
  gridDiv.className = 'tilemap-grid';
  gridDiv.style.gridTemplateColumns = `repeat(${mapData.width}, 32px)`;

  // Apply hex grid styling if needed
  if (mapData.isHex) {
    gridDiv.style.gap = '0px';
  }

  // Render tiles
  for (let y = 0; y < mapData.tiles.length; y++) {
    const row = mapData.tiles[y];
    for (let x = 0; x < row.length; x++) {
      const tileChar = row[x];
      const tileClasses = tileTypeMap[tileChar] || 'grass';

      const tileDiv = document.createElement('div');
      tileDiv.className = `tile ${tileClasses.split(' ').map(c => 'tile-' + c).join(' ')}`;
      tileDiv.dataset.x = x;
      tileDiv.dataset.y = y;
      tileDiv.dataset.type = tileChar;

      // Hex grid offset
      if (mapData.isHex && y % 2 === 1) {
        tileDiv.style.marginLeft = '16px';
      }

      gridDiv.appendChild(tileDiv);
    }
  }

  tilemapDiv.appendChild(gridDiv);
  container.appendChild(tilemapDiv);
}

// Render all maps
function renderAllMaps() {
  const container = document.getElementById('maps-container');
  if (!container) {
    console.error('Maps container not found');
    return;
  }

  // Clear container
  container.innerHTML = '';

  // Render each map
  Object.keys(maps).forEach(mapKey => {
    const mapDiv = document.createElement('div');
    mapDiv.id = `map-${mapKey}`;
    mapDiv.style.display = 'inline-block';
    mapDiv.style.verticalAlign = 'top';
    container.appendChild(mapDiv);
    renderMap(maps[mapKey], `map-${mapKey}`);
  });
}

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { maps, renderMap, renderAllMaps };
}
