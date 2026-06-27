/**
 * SpriteGen — Procedural Pixel Art Sprite Generator Library
 * 
 * Generate game-ready sprites for characters, monsters, buildings,
 * vehicles, plants, items, and props. Supports animation frames
 * and spritesheet export.
 * 
 * @example
 * // Browser (ES Module)
 * import { SpriteGen } from './spritegen.js';
 * const gen = new SpriteGen();
 * const canvas = gen.generate('char_side', { variant: 'warrior' });
 * 
 * // Phaser 4
 * const sprite = gen.toPhaserSprite(scene, 100, 100, 'char_side', { variant: 'ninja' });
 * 
 * // Animation frames (walk cycle)
 * const frames = gen.generateAnimFrames('char_side', { variant: 'warrior', frames: 4 });
 * const sheet = gen.toSpritesheet(scene, 'warrior_walk', frames);
 */

// ═══════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════
const PALETTES = {
  warm:    ['#e74c3c','#c0392b','#e67e22','#d35400','#f39c12','#e94560'],
  cool:    ['#3498db','#2980b9','#1abc9c','#16a085','#0abde3','#48dbfb'],
  earth:   ['#8b6914','#6b4226','#a0522d','#556b2f','#6b8e23','#808000'],
  magic:   ['#9b59b6','#8e44ad','#e056fd','#be2edd','#6c5ce7','#a29bfe'],
  dark:    ['#2c3e50','#34495e','#1a1a2e','#16213e','#0f3460','#533483'],
  light:   ['#ecf0f1','#bdc3c7','#dfe6e9','#ffeaa7','#fdcb6e','#f8c291'],
  nature:  ['#27ae60','#2ecc71','#00b894','#55efc4','#6ab04c','#badc58'],
  candy:   ['#fd79a8','#e84393','#fdcb6e','#ffeaa7','#a29bfe','#74b9ff'],
  skin:    ['#fad390','#e8b87b','#c8a07a','#a67c52','#8b5e3c','#6b4226'],
  fire:    ['#ff3838','#ff6348','#ff9f43','#feca57','#ff6b6b','#ee5a24'],
  ice:     ['#74b9ff','#a8d8ea','#dfe6e9','#b2ecec','#81ecec','#00cec9'],
  toxic:   ['#00b894','#55efc4','#badc58','#6ab04c','#05c46b','#0be881'],
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return {r,g,b};
}

function rgbToHex(r,g,b) {
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
}

function lighten(hex, amt) {
  const {r,g,b} = hexToRgb(hex);
  return rgbToHex(r+(255-r)*amt, g+(255-g)*amt, b+(255-b)*amt);
}

function darken(hex, amt) {
  const {r,g,b} = hexToRgb(hex);
  return rgbToHex(r*(1-amt), g*(1-amt), b*(1-amt));
}

function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(a,b) { return a + Math.floor(Math.random()*(b-a+1)); }
function randFloat(a,b) { return a + Math.random()*(b-a); }
function chance(p) { return Math.random() < p; }

// ═══════════════════════════════════════════
// CANVAS HELPERS
// ═══════════════════════════════════════════
function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function pixel(ctx, x, y, color, size=1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function outline(ctx, x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x+0.5, y+0.5, w-1, h-1);
}

function circle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fill();
}

function ellipse(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
  ctx.fill();
}

// ═══════════════════════════════════════════
// SPRITE GENERATION FUNCTIONS
// Each returns { draw(ctx, w, h, opts), variants, size }
// ═══════════════════════════════════════════

// ─── CHARACTER SIDE (32×48) ───────────────
function genCharSide(ctx, w, h, opts) {
  const variant = opts.variant || pick(['warrior','wizard','archer','ninja','robot','alien','viking','pirate','knight','cyborg']);
  const pal = opts.palette || [pickColor(), pickColor(), pickColor()];
  const skinC = opts.skin || pick(PALETTES.skin);
  const bodyC = pal[0], accC = pal[1], trimC = pal[2];

  ctx.clearRect(0,0,w,h);

  // --- Frame offset for animation ---
  const frame = opts.frame || 0;
  const totalFrames = opts.totalFrames || 1;
  const walkPhase = totalFrames > 1 ? Math.sin(frame / totalFrames * Math.PI * 2) : 0;
  const legOffset = walkPhase * 3;
  const armOffset = walkPhase * 2;
  const bodyBob = Math.abs(walkPhase) * 1;

  // Legs
  const legY = 34 + bodyBob;
  if (variant === 'robot') {
    rect(ctx, 8, legY - legOffset, 5, 12, '#888');
    rect(ctx, 19, legY + legOffset, 5, 12, '#888');
  } else {
    rect(ctx, 8, legY - legOffset, 5, 12, bodyC);
    rect(ctx, 19, legY + legOffset, 5, 12, bodyC);
    const bootC = variant === 'ninja' ? '#222' : variant === 'knight' ? '#aaa' : darken(bodyC, 0.3);
    rect(ctx, 7, legY - legOffset + 9, 7, 3, bootC);
    rect(ctx, 18, legY + legOffset + 9, 7, 3, bootC);
  }

  // Body
  const bodyY = 18 + bodyBob;
  if (variant === 'knight') {
    rect(ctx, 6, bodyY, 20, 17, '#888');
    rect(ctx, 7, bodyY+1, 18, 15, '#aaa');
  } else if (variant === 'robot') {
    rect(ctx, 6, bodyY, 20, 17, '#666');
    rect(ctx, 8, bodyY+2, 16, 6, '#888');
    rect(ctx, 10, bodyY+4, 4, 2, '#0f0');
    rect(ctx, 18, bodyY+4, 4, 2, '#f00');
  } else {
    rect(ctx, 7, bodyY, 18, 17, bodyC);
    rect(ctx, 7, bodyY+13, 18, 3, accC);
    if (variant === 'wizard') rect(ctx, 12, bodyY+2, 8, 10, trimC);
    if (variant === 'pirate') rect(ctx, 8, bodyY+2, 16, 3, '#fff');
  }

  // Arms
  const armY = bodyY + 1;
  if (variant === 'robot') {
    rect(ctx, 2, armY - armOffset, 5, 14, '#777');
    rect(ctx, 25, armY + armOffset, 5, 14, '#777');
  } else {
    rect(ctx, 3, armY - armOffset, 5, 14, bodyC);
    rect(ctx, 24, armY + armOffset, 5, 14, bodyC);
    circle(ctx, 5, armY - armOffset + 15, 2, skinC);
    circle(ctx, 27, armY + armOffset + 15, 2, skinC);
  }

  // Head
  const headY = 2 + bodyBob;
  if (variant === 'robot') {
    rect(ctx, 7, headY, 18, 16, '#777');
    rect(ctx, 8, headY+1, 16, 14, '#999');
    rect(ctx, 10, headY+4, 12, 5, '#001122');
    rect(ctx, 11, headY+5, 3, 3, '#0ff');
    rect(ctx, 18, headY+5, 3, 3, '#0ff');
    rect(ctx, 15, headY-4, 2, 4, '#aaa');
    circle(ctx, 16, headY-5, 2, '#f00');
  } else {
    rect(ctx, 7, headY, 18, 16, skinC);
    const eyeY = headY + 5;
    if (variant === 'ninja') {
      rect(ctx, 10, eyeY, 5, 2, '#fff');
      rect(ctx, 17, eyeY, 5, 2, '#fff');
      pixel(ctx, 12, eyeY, '#000', 2);
      pixel(ctx, 19, eyeY, '#000', 2);
    } else {
      pixel(ctx, 11, eyeY, '#fff', 3);
      pixel(ctx, 18, eyeY, '#fff', 3);
      pixel(ctx, 12, eyeY+1, '#222', 2);
      pixel(ctx, 19, eyeY+1, '#222', 2);
    }
    if (variant === 'warrior') {
      rect(ctx, 7, headY, 18, 5, '#888');
      rect(ctx, 6, headY+4, 20, 2, '#999');
    } else if (variant === 'wizard') {
      ctx.fillStyle = accC;
      ctx.beginPath();
      ctx.moveTo(16, headY-10); ctx.lineTo(9, headY+2); ctx.lineTo(23, headY+2); ctx.fill();
      circle(ctx, 16, headY-10, 2, trimC);
    } else if (variant === 'archer') {
      rect(ctx, 7, headY, 18, 4, '#5a3a1a');
      rect(ctx, 5, headY+2, 3, 8, '#5a3a1a');
    } else if (variant === 'ninja') {
      rect(ctx, 7, headY+1, 18, 8, '#222');
    } else if (variant === 'viking') {
      rect(ctx, 7, headY, 18, 5, '#8b4513');
      rect(ctx, 4, headY-3, 3, 8, '#eee');
      rect(ctx, 25, headY-3, 3, 8, '#eee');
    } else if (variant === 'pirate') {
      rect(ctx, 6, headY, 20, 4, '#222');
      rect(ctx, 23, headY-2, 5, 3, '#222');
    } else if (variant === 'cyborg') {
      rect(ctx, 17, eyeY-1, 6, 4, '#f00');
      rect(ctx, 23, headY+3, 3, 8, '#aaa');
    } else {
      const hairC = pick(['#2c1810','#8b4513','#f5d142','#c0392b','#2c3e50','#e8b87b']);
      rect(ctx, 7, headY, 18, 5, hairC);
    }
  }

  // Weapon
  if (variant === 'warrior' || variant === 'knight') {
    rect(ctx, 28, armY - armOffset - 4, 2, 20, '#ccc');
    rect(ctx, 27, armY - armOffset + 14, 4, 2, '#8b6914');
  } else if (variant === 'wizard') {
    rect(ctx, 29, armY + armOffset - 8, 2, 28, '#8b4513');
    circle(ctx, 30, armY + armOffset - 9, 3, trimC);
  }
}

// ─── CHARACTER TOP (32×32) ────────────────
function genCharTop(ctx, w, h, opts) {
  const variant = opts.variant || pick(['adventurer','mage','ranger','thief','cleric','merchant','noble','farmer','bard','monk']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const skinC = opts.skin || pick(PALETTES.skin);
  const bodyC = pal[0], accC = pal[1];

  ctx.clearRect(0,0,w,h);

  const frame = opts.frame || 0;
  const totalFrames = opts.totalFrames || 1;
  const walkPhase = totalFrames > 1 ? Math.sin(frame / totalFrames * Math.PI * 2) : 0;
  const armSwing = walkPhase * 3;

  // Shadow
  ellipse(ctx, 16, 28, 10, 4, 'rgba(0,0,0,0.15)');

  // Cloak
  if (['mage','cleric','noble'].includes(variant)) {
    ctx.fillStyle = accC;
    ctx.beginPath();
    ctx.moveTo(8, 14); ctx.lineTo(4, 26); ctx.lineTo(28, 26); ctx.lineTo(24, 14); ctx.fill();
  }

  // Body
  ellipse(ctx, 16, 18, 9, 11, bodyC);
  ellipse(ctx, 16, 17, 8, 10, lighten(bodyC, 0.1));

  // Head
  ellipse(ctx, 16, 8, 7, 7, skinC);
  ellipse(ctx, 16, 7, 6, 6, lighten(skinC, 0.05));

  // Hair/Hat
  const hairC = pick(['#2c1810','#8b4513','#f5d142','#c0392b','#2c3e50','#e8b87b']);
  if (variant === 'mage') {
    ellipse(ctx, 16, 5, 7, 5, accC);
    circle(ctx, 16, 5, 3, lighten(accC, 0.2));
  } else if (variant === 'thief') {
    ellipse(ctx, 16, 5, 7, 5, '#333');
  } else if (variant === 'cleric') {
    ellipse(ctx, 16, 5, 7, 5, '#fff');
    rect(ctx, 14, 1, 4, 10, '#fff');
    rect(ctx, 11, 4, 10, 3, '#fff');
  } else {
    ellipse(ctx, 16, 5, 6, 4, hairC);
  }

  // Eyes
  pixel(ctx, 13, 7, '#222', 2);
  pixel(ctx, 18, 7, '#222', 2);

  // Arms (animated swing)
  ellipse(ctx, 4 - armSwing, 18, 4, 7, skinC);
  ellipse(ctx, 28 + armSwing, 18, 4, 7, skinC);
}

// ─── MONSTER SIDE (40×40) ─────────────────
function genMonsterSide(ctx, w, h, opts) {
  const variant = opts.variant || pick(['slime','dragon','skeleton','goblin','ghost','spider','bat','golem','demon','plant']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const mainC = pal[0], accC = pal[1];

  ctx.clearRect(0,0,w,h);

  const frame = opts.frame || 0;
  const totalFrames = opts.totalFrames || 1;
  const bounce = totalFrames > 1 ? Math.abs(Math.sin(frame / totalFrames * Math.PI * 2)) * 3 : 0;

  if (variant === 'slime') {
    ctx.fillStyle = mainC;
    ctx.beginPath();
    ctx.moveTo(4, 36 - bounce);
    ctx.quadraticCurveTo(2, 20 - bounce, 10, 10 - bounce);
    ctx.quadraticCurveTo(20, 2 - bounce, 30, 10 - bounce);
    ctx.quadraticCurveTo(38, 20 - bounce, 36, 36 - bounce);
    ctx.quadraticCurveTo(20, 38 - bounce, 4, 36 - bounce);
    ctx.fill();
    ctx.fillStyle = lighten(mainC, 0.3);
    ctx.beginPath();
    ctx.ellipse(14, 16 - bounce, 6, 4, -0.3, 0, Math.PI*2);
    ctx.fill();
    ellipse(ctx, 14, 18 - bounce, 3, 4, '#fff');
    ellipse(ctx, 24, 18 - bounce, 3, 4, '#fff');
    pixel(ctx, 15, 19 - bounce, '#111', 2);
    pixel(ctx, 25, 19 - bounce, '#111', 2);

  } else if (variant === 'dragon') {
    ellipse(ctx, 18, 24, 12, 10, mainC);
    ellipse(ctx, 18, 26, 8, 7, lighten(mainC, 0.3));
    ellipse(ctx, 30, 14 - bounce, 8, 7, mainC);
    rect(ctx, 34, 12 - bounce, 5, 5, mainC);
    ellipse(ctx, 31, 12 - bounce, 2, 2, '#fff');
    pixel(ctx, 32, 12 - bounce, '#111', 1);
    ctx.fillStyle = accC;
    ctx.beginPath(); ctx.moveTo(27, 8 - bounce); ctx.lineTo(30, 3 - bounce); ctx.lineTo(32, 9 - bounce); ctx.fill();
    ctx.beginPath(); ctx.moveTo(33, 8 - bounce); ctx.lineTo(36, 3 - bounce); ctx.lineTo(36, 9 - bounce); ctx.fill();
    ctx.fillStyle = lighten(mainC, 0.2);
    ctx.beginPath(); ctx.moveTo(10, 16); ctx.lineTo(0, 4); ctx.lineTo(6, 18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(16, 14); ctx.lineTo(20, 2); ctx.lineTo(22, 16); ctx.fill();
    ctx.strokeStyle = mainC; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(6, 26); ctx.quadraticCurveTo(-2, 22, 0, 30); ctx.stroke();
    rect(ctx, 10, 32, 5, 6, mainC);
    rect(ctx, 22, 32, 5, 6, mainC);

  } else if (variant === 'ghost') {
    ctx.fillStyle = mainC; ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(4, 36 - bounce);
    ctx.quadraticCurveTo(4, 10 - bounce, 20, 6 - bounce);
    ctx.quadraticCurveTo(36, 10 - bounce, 36, 36 - bounce);
    ctx.lineTo(32, 32 - bounce); ctx.lineTo(28, 36 - bounce);
    ctx.lineTo(24, 32 - bounce); ctx.lineTo(20, 36 - bounce);
    ctx.lineTo(16, 32 - bounce); ctx.lineTo(12, 36 - bounce);
    ctx.lineTo(8, 32 - bounce); ctx.lineTo(4, 36 - bounce);
    ctx.fill(); ctx.globalAlpha = 1;
    ellipse(ctx, 14, 18 - bounce, 4, 5, '#fff');
    ellipse(ctx, 26, 18 - bounce, 4, 5, '#fff');
    pixel(ctx, 15, 19 - bounce, '#111', 2);
    pixel(ctx, 27, 19 - bounce, '#111', 2);

  } else if (variant === 'goblin') {
    ellipse(ctx, 20, 26, 9, 10, '#4a7c3f');
    ellipse(ctx, 20, 12 - bounce, 9, 8, '#5a9c4f');
    ctx.fillStyle = '#5a9c4f';
    ctx.beginPath(); ctx.moveTo(8, 10 - bounce); ctx.lineTo(3, 4 - bounce); ctx.lineTo(11, 12 - bounce); ctx.fill();
    ctx.beginPath(); ctx.moveTo(32, 10 - bounce); ctx.lineTo(37, 4 - bounce); ctx.lineTo(29, 12 - bounce); ctx.fill();
    ellipse(ctx, 16, 11 - bounce, 3, 2, '#fff');
    ellipse(ctx, 24, 11 - bounce, 3, 2, '#fff');
    pixel(ctx, 17, 11 - bounce, '#f00', 1);
    pixel(ctx, 25, 11 - bounce, '#f00', 1);
    rect(ctx, 13, 33, 5, 6, '#4a7c3f');
    rect(ctx, 22, 33, 5, 6, '#4a7c3f');

  } else if (variant === 'bat') {
    const wingFlap = totalFrames > 1 ? Math.sin(frame / totalFrames * Math.PI * 2) * 5 : 0;
    ctx.fillStyle = mainC;
    ctx.beginPath();
    ctx.moveTo(20, 20); ctx.quadraticCurveTo(0, 8 + wingFlap, 0, 20);
    ctx.quadraticCurveTo(6, 26, 20, 22); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20, 20); ctx.quadraticCurveTo(40, 8 + wingFlap, 40, 20);
    ctx.quadraticCurveTo(34, 26, 20, 22); ctx.fill();
    ellipse(ctx, 20, 22, 6, 8, darken(mainC, 0.2));
    circle(ctx, 20, 14, 5, darken(mainC, 0.1));
    ctx.fillStyle = darken(mainC, 0.1);
    ctx.beginPath(); ctx.moveTo(15, 11); ctx.lineTo(13, 5); ctx.lineTo(17, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(25, 11); ctx.lineTo(27, 5); ctx.lineTo(23, 10); ctx.fill();
    pixel(ctx, 17, 13, '#f00', 2);
    pixel(ctx, 22, 13, '#f00', 2);

  } else {
    // Generic fallback with bounce
    ellipse(ctx, 20, 22 - bounce, 12, 14, mainC);
    ellipse(ctx, 20, 10 - bounce, 8, 7, mainC);
    pixel(ctx, 17, 9 - bounce, '#fff', 3);
    pixel(ctx, 24, 9 - bounce, '#fff', 3);
    pixel(ctx, 18, 10 - bounce, '#111', 2);
    pixel(ctx, 25, 10 - bounce, '#111', 2);
  }
}

// ─── MONSTER TOP (40×40) ──────────────────
function genMonsterTop(ctx, w, h, opts) {
  const variant = opts.variant || pick(['blob','spider','hydra','serpent','mushroom','crab','wasp','worm','eye','fungus']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const mainC = pal[0], accC = pal[1];

  ctx.clearRect(0,0,w,h);

  ellipse(ctx, 20, 34, 14, 4, 'rgba(0,0,0,0.12)');

  if (variant === 'blob') {
    ctx.fillStyle = mainC;
    ctx.beginPath();
    ctx.moveTo(4, 30); ctx.quadraticCurveTo(2, 15, 12, 8);
    ctx.quadraticCurveTo(20, 2, 28, 8);
    ctx.quadraticCurveTo(38, 15, 36, 30);
    ctx.quadraticCurveTo(20, 34, 4, 30); ctx.fill();
    ellipse(ctx, 14, 14, 4, 3, lighten(mainC, 0.3));
    ellipse(ctx, 14, 18, 3, 3, '#fff');
    ellipse(ctx, 26, 18, 3, 3, '#fff');
    pixel(ctx, 15, 18, '#111', 2);
    pixel(ctx, 27, 18, '#111', 2);

  } else if (variant === 'spider') {
    ellipse(ctx, 20, 24, 8, 10, mainC);
    ellipse(ctx, 20, 14, 5, 5, darken(mainC, 0.1));
    for(let i=0;i<4;i++){
      const a = -0.8 + i*0.4;
      ctx.strokeStyle = mainC; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(14, 18+i*3); ctx.lineTo(14-Math.cos(a)*14, 18+i*3-Math.sin(a)*10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(26, 18+i*3); ctx.lineTo(26+Math.cos(a)*14, 18+i*3-Math.sin(a)*10); ctx.stroke();
    }
    pixel(ctx, 17, 12, '#f00', 2);
    pixel(ctx, 22, 12, '#f00', 2);

  } else if (variant === 'crab') {
    ellipse(ctx, 20, 20, 12, 8, mainC);
    ellipse(ctx, 20, 19, 10, 6, lighten(mainC, 0.15));
    rect(ctx, 14, 10, 2, 5, mainC);
    rect(ctx, 24, 10, 2, 5, mainC);
    circle(ctx, 15, 9, 3, '#fff');
    circle(ctx, 25, 9, 3, '#fff');
    pixel(ctx, 15, 9, '#111', 1);
    pixel(ctx, 25, 9, '#111', 1);
    ellipse(ctx, 4, 18, 5, 4, darken(mainC, 0.1));
    ellipse(ctx, 36, 18, 5, 4, darken(mainC, 0.1));

  } else {
    circle(ctx, 20, 22, 10, mainC);
    circle(ctx, 20, 22, 8, lighten(mainC, 0.15));
    pixel(ctx, 17, 20, '#fff', 3);
    pixel(ctx, 24, 20, '#fff', 3);
    pixel(ctx, 18, 21, '#111', 2);
    pixel(ctx, 25, 21, '#111', 2);
  }
}

// ─── BUILDING (48×48) ─────────────────────
function genBuilding(ctx, w, h, opts) {
  const variant = opts.variant || pick(['house','castle','tower','shop','barn','temple','hut','windmill','lighthouse','factory']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const wallC = pal[0], roofC = pal[1];

  ctx.clearRect(0,0,w,h);

  if (variant === 'house') {
    rect(ctx, 8, 20, 32, 24, wallC);
    rect(ctx, 9, 21, 30, 22, lighten(wallC, 0.08));
    ctx.fillStyle = roofC;
    ctx.beginPath(); ctx.moveTo(4, 22); ctx.lineTo(24, 4); ctx.lineTo(44, 22); ctx.fill();
    rect(ctx, 19, 32, 10, 12, darken(wallC, 0.3));
    circle(ctx, 27, 38, 1, '#ffd700');
    rect(ctx, 11, 26, 7, 7, '#87ceeb'); outline(ctx, 11, 26, 7, 7, '#555');
    rect(ctx, 30, 26, 7, 7, '#87ceeb'); outline(ctx, 30, 26, 7, 7, '#555');
    rect(ctx, 34, 6, 5, 12, '#666');

  } else if (variant === 'castle') {
    rect(ctx, 6, 16, 36, 28, '#aaa');
    rect(ctx, 7, 17, 34, 26, '#ccc');
    for(let i=0;i<5;i++) rect(ctx, 6+i*8, 12, 5, 6, '#aaa');
    rect(ctx, 2, 8, 10, 36, '#999');
    rect(ctx, 36, 8, 10, 36, '#999');
    ctx.fillStyle = roofC;
    ctx.beginPath(); ctx.moveTo(0,10); ctx.lineTo(7,0); ctx.lineTo(14,10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(34,10); ctx.lineTo(41,0); ctx.lineTo(48,10); ctx.fill();
    rect(ctx, 18, 28, 12, 16, '#5a3a1a');

  } else if (variant === 'tower') {
    rect(ctx, 14, 8, 20, 38, wallC);
    ctx.fillStyle = roofC;
    ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(24, 0); ctx.lineTo(38, 10); ctx.fill();
    for(let i=0;i<3;i++){
      rect(ctx, 19, 14+i*10, 8, 6, '#87ceeb');
      outline(ctx, 19, 14+i*10, 8, 6, '#555');
    }
    rect(ctx, 19, 38, 8, 8, darken(wallC, 0.3));

  } else {
    rect(ctx, 8, 16, 32, 28, wallC);
    ctx.fillStyle = roofC;
    ctx.beginPath(); ctx.moveTo(4, 18); ctx.lineTo(24, 4); ctx.lineTo(44, 18); ctx.fill();
    rect(ctx, 18, 28, 12, 12, darken(wallC, 0.3));
    rect(ctx, 12, 22, 8, 6, '#87ceeb');
    rect(ctx, 28, 22, 8, 6, '#87ceeb');
  }
}

// ─── VEHICLE (48×32) ──────────────────────
function genVehicle(ctx, w, h, opts) {
  const variant = opts.variant || pick(['car','truck','tank','spaceship','boat','motorcycle','helicopter','sub','mech','train']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const bodyC = pal[0], accC = pal[1];

  ctx.clearRect(0,0,w,h);

  if (variant === 'car') {
    rect(ctx, 4, 16, 40, 12, bodyC);
    rect(ctx, 14, 8, 20, 10, bodyC);
    rect(ctx, 16, 10, 7, 6, '#87ceeb');
    rect(ctx, 25, 10, 7, 6, '#87ceeb');
    circle(ctx, 12, 28, 5, '#333'); circle(ctx, 12, 28, 3, '#666');
    circle(ctx, 36, 28, 5, '#333'); circle(ctx, 36, 28, 3, '#666');
    circle(ctx, 43, 18, 2, '#ffd700'); circle(ctx, 4, 18, 2, '#ff3838');

  } else if (variant === 'tank') {
    rect(ctx, 2, 20, 44, 10, '#555');
    for(let i=0;i<5;i++) circle(ctx, 7+i*9, 25, 3, '#888');
    rect(ctx, 6, 12, 36, 10, bodyC);
    rect(ctx, 14, 6, 18, 8, darken(bodyC, 0.1));
    rect(ctx, 30, 8, 16, 3, '#555');

  } else if (variant === 'spaceship') {
    ctx.fillStyle = bodyC;
    ctx.beginPath();
    ctx.moveTo(4, 16); ctx.quadraticCurveTo(4, 6, 24, 4);
    ctx.quadraticCurveTo(44, 6, 44, 16); ctx.quadraticCurveTo(44, 24, 24, 28);
    ctx.quadraticCurveTo(4, 24, 4, 16); ctx.fill();
    ellipse(ctx, 24, 12, 8, 5, '#87ceeb');
    circle(ctx, 24, 26, 4, '#ffd700'); circle(ctx, 24, 26, 2, '#fff');

  } else if (variant === 'helicopter') {
    ellipse(ctx, 20, 18, 14, 8, bodyC);
    ellipse(ctx, 30, 16, 6, 5, '#87ceeb');
    rect(ctx, 2, 14, 10, 4, darken(bodyC, 0.1));
    rect(ctx, 4, 8, 34, 2, '#555');
    circle(ctx, 20, 9, 3, '#666');
    rect(ctx, 12, 26, 16, 2, '#555');

  } else {
    rect(ctx, 4, 12, 40, 16, bodyC);
    rect(ctx, 5, 13, 38, 14, lighten(bodyC, 0.1));
    circle(ctx, 12, 28, 5, '#333'); circle(ctx, 36, 28, 5, '#333');
  }
}

// ─── PLANT (32×48) ────────────────────────
function genPlant(ctx, w, h, opts) {
  const variant = opts.variant || pick(['tree','pine','palm','flower','bush','cactus','mushroom','vine','seaweed','crystal']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const mainC = pal[0], accC = pal[1];

  ctx.clearRect(0,0,w,h);

  if (variant === 'tree') {
    rect(ctx, 12, 24, 8, 22, '#8b4513');
    circle(ctx, 16, 14, 12, mainC);
    circle(ctx, 10, 18, 8, darken(mainC, 0.1));
    circle(ctx, 22, 16, 9, lighten(mainC, 0.1));
    circle(ctx, 12, 10, 3, lighten(mainC, 0.2));

  } else if (variant === 'pine') {
    rect(ctx, 14, 34, 4, 12, '#8b4513');
    for(let i=0;i<3;i++){
      ctx.fillStyle = darken(mainC, i*0.08);
      ctx.beginPath(); ctx.moveTo(16, 6+i*10);
      ctx.lineTo(16-12-i*3, 18+i*10); ctx.lineTo(16+12+i*3, 18+i*10); ctx.fill();
    }

  } else if (variant === 'flower') {
    rect(ctx, 15, 20, 2, 26, '#27ae60');
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath(); ctx.ellipse(10, 30, 6, 3, -0.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, 26, 6, 3, 0.5, 0, Math.PI*2); ctx.fill();
    for(let i=0;i<6;i++){
      const a = i*Math.PI/3;
      circle(ctx, 16+Math.cos(a)*7, 14+Math.sin(a)*7, 4, mainC);
    }
    circle(ctx, 16, 14, 4, accC);
    circle(ctx, 16, 14, 2, '#ffd700');

  } else if (variant === 'cactus') {
    rect(ctx, 12, 10, 8, 34, mainC);
    rect(ctx, 4, 16, 8, 5, mainC); rect(ctx, 4, 10, 5, 10, mainC);
    rect(ctx, 20, 22, 8, 5, mainC); rect(ctx, 23, 16, 5, 10, mainC);

  } else {
    circle(ctx, 16, 26, 12, mainC);
    circle(ctx, 10, 22, 8, darken(mainC, 0.1));
    circle(ctx, 22, 20, 9, lighten(mainC, 0.1));
  }
}

// ─── ITEM (24×24) ─────────────────────────
function genItem(ctx, w, h, opts) {
  const variant = opts.variant || pick(['sword','axe','bow','staff','shield','potion','gem','key','ring','scroll','coin','heart']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const mainC = pal[0], accC = pal[1];

  ctx.clearRect(0,0,w,h);

  if (variant === 'sword') {
    ctx.fillStyle = '#ccc';
    ctx.beginPath(); ctx.moveTo(12, 1); ctx.lineTo(14, 1); ctx.lineTo(14, 15); ctx.lineTo(12, 15); ctx.fill();
    rect(ctx, 8, 15, 8, 2, accC);
    rect(ctx, 11, 17, 2, 5, '#8b4513');
    circle(ctx, 12, 23, 2, accC);

  } else if (variant === 'potion') {
    rect(ctx, 8, 10, 8, 12, mainC);
    rect(ctx, 10, 6, 4, 6, '#888');
    rect(ctx, 9, 4, 6, 3, '#8b4513');

  } else if (variant === 'gem') {
    ctx.fillStyle = mainC;
    ctx.beginPath(); ctx.moveTo(12, 2); ctx.lineTo(20, 8); ctx.lineTo(12, 22); ctx.lineTo(4, 8); ctx.fill();
    ctx.fillStyle = lighten(mainC, 0.3);
    ctx.beginPath(); ctx.moveTo(12, 2); ctx.lineTo(16, 8); ctx.lineTo(12, 14); ctx.lineTo(8, 8); ctx.fill();

  } else if (variant === 'heart') {
    ctx.fillStyle = mainC;
    ctx.beginPath();
    ctx.moveTo(12, 20);
    ctx.bezierCurveTo(2, 14, 0, 8, 6, 4);
    ctx.bezierCurveTo(10, 2, 12, 6, 12, 8);
    ctx.bezierCurveTo(12, 6, 14, 2, 18, 4);
    ctx.bezierCurveTo(24, 8, 22, 14, 12, 20);
    ctx.fill();

  } else if (variant === 'coin') {
    circle(ctx, 12, 12, 9, '#ffd700');
    circle(ctx, 12, 12, 7, '#ffed4a');
    ctx.fillStyle = '#b8860b'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('$', 12, 16);

  } else {
    rect(ctx, 4, 4, 16, 16, mainC);
    rect(ctx, 5, 5, 14, 14, lighten(mainC, 0.1));
    circle(ctx, 12, 12, 4, accC);
  }
}

// ─── PROP (32×32) ─────────────────────────
function genProp(ctx, w, h, opts) {
  const variant = opts.variant || pick(['chest','barrel','crate','torch','fence','sign','rock','well','campfire','tombstone']);
  const pal = opts.palette || [pickColor(), pickColor()];
  const mainC = pal[0], accC = pal[1];

  ctx.clearRect(0,0,w,h);

  if (variant === 'chest') {
    rect(ctx, 4, 12, 24, 14, '#8b4513');
    ctx.fillStyle = '#8b4513';
    ctx.beginPath(); ctx.moveTo(4, 14); ctx.quadraticCurveTo(16, 4, 28, 14); ctx.fill();
    rect(ctx, 13, 14, 6, 6, '#ffd700');
    circle(ctx, 16, 17, 2, '#b8860b');

  } else if (variant === 'barrel') {
    ellipse(ctx, 16, 16, 11, 13, '#8b4513');
    ellipse(ctx, 16, 16, 10, 12, '#a0522d');
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(16, 8, 10, 2, 0, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(16, 24, 10, 2, 0, 0, Math.PI*2); ctx.stroke();

  } else if (variant === 'torch') {
    rect(ctx, 14, 14, 4, 16, '#8b4513');
    ctx.fillStyle = '#ff6348';
    ctx.beginPath(); ctx.moveTo(16, 2); ctx.quadraticCurveTo(22, 6, 20, 10);
    ctx.quadraticCurveTo(18, 14, 16, 14); ctx.quadraticCurveTo(14, 14, 12, 10);
    ctx.quadraticCurveTo(10, 6, 16, 2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.moveTo(16, 6); ctx.quadraticCurveTo(20, 8, 18, 12);
    ctx.quadraticCurveTo(16, 14, 14, 12); ctx.quadraticCurveTo(12, 8, 16, 6); ctx.fill();

  } else if (variant === 'campfire') {
    ctx.fillStyle = '#5a3a1a';
    ctx.save(); ctx.translate(16, 26); ctx.rotate(-0.3); ctx.fillRect(-10, -2, 20, 4); ctx.restore();
    ctx.save(); ctx.translate(16, 26); ctx.rotate(0.3); ctx.fillRect(-10, -2, 20, 4); ctx.restore();
    for(let i=0;i<6;i++){ const a=i*Math.PI/3; circle(ctx, 16+Math.cos(a)*10, 26+Math.sin(a)*5, 3, '#666'); }
    ctx.fillStyle = '#ff6348';
    ctx.beginPath(); ctx.moveTo(16, 8); ctx.quadraticCurveTo(22, 14, 20, 20);
    ctx.quadraticCurveTo(16, 22, 12, 20); ctx.quadraticCurveTo(10, 14, 16, 8); ctx.fill();

  } else {
    rect(ctx, 4, 6, 24, 22, mainC);
    rect(ctx, 5, 7, 20, 20, lighten(mainC, 0.1));
  }
}

// ═══════════════════════════════════════════
// SPRITE SPECS REGISTRY
// ═══════════════════════════════════════════
const SPECS = {
  char_side:    { fn: genCharSide,    size: [32,48], variants: ['warrior','wizard','archer','ninja','robot','alien','viking','pirate','knight','cyborg'] },
  char_top:     { fn: genCharTop,     size: [32,32], variants: ['adventurer','mage','ranger','thief','cleric','merchant','noble','farmer','bard','monk'] },
  monster_side: { fn: genMonsterSide, size: [40,40], variants: ['slime','dragon','skeleton','goblin','ghost','spider','bat','golem','demon','plant'] },
  monster_top:  { fn: genMonsterTop,  size: [40,40], variants: ['blob','spider','hydra','serpent','mushroom','crab','wasp','worm','eye','fungus'] },
  building:     { fn: genBuilding,    size: [48,48], variants: ['house','castle','tower','shop','barn','temple','hut','windmill','lighthouse','factory'] },
  vehicle:      { fn: genVehicle,     size: [48,32], variants: ['car','truck','tank','spaceship','boat','motorcycle','helicopter','sub','mech','train'] },
  plant:        { fn: genPlant,       size: [32,48], variants: ['tree','pine','palm','flower','bush','cactus','mushroom','vine','seaweed','crystal'] },
  item:         { fn: genItem,        size: [24,24], variants: ['sword','axe','bow','staff','shield','potion','gem','key','ring','scroll','coin','heart'] },
  prop:         { fn: genProp,        size: [32,32], variants: ['chest','barrel','crate','torch','fence','sign','rock','well','campfire','tombstone'] },
};

// ═══════════════════════════════════════════
// MAIN CLASS
// ═══════════════════════════════════════════
class SpriteGen {
  constructor() {
    this.specs = SPECS;
    this.palettes = PALETTES;
    this._cache = {};
  }

  /**
   * Generate a single sprite canvas
   * @param {string} category - e.g. 'char_side', 'monster_top', 'building'
   * @param {object} opts - { variant, palette, skin, frame, totalFrames }
   * @returns {HTMLCanvasElement}
   */
  generate(category, opts = {}) {
    const spec = this.specs[category];
    if (!spec) throw new Error(`Unknown category: ${category}. Available: ${Object.keys(this.specs).join(', ')}`);
    const [w, h] = spec.size;
    const cvs = createCanvas(w, h);
    const ctx = cvs.getContext('2d');
    spec.fn(ctx, w, h, opts);
    return cvs;
  }

  /**
   * Generate multiple sprites
   * @param {string} category
   * @param {number} count
   * @param {object} opts
   * @returns {HTMLCanvasElement[]}
   */
  generateBatch(category, count = 1, opts = {}) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(this.generate(category, opts));
    }
    return results;
  }

  /**
   * Generate animation frames for a sprite
   * @param {string} category
   * @param {object} opts - { variant, frames: 4, ... }
   * @returns {HTMLCanvasElement[]}
   */
  generateAnimFrames(category, opts = {}) {
    const frames = opts.frames || 4;
    const results = [];
    for (let i = 0; i < frames; i++) {
      results.push(this.generate(category, { ...opts, frame: i, totalFrames: frames }));
    }
    return results;
  }

  /**
   * Create a spritesheet canvas from animation frames
   * @param {HTMLCanvasElement[]} frames
   * @param {number} padding - pixels between frames
   * @returns {HTMLCanvasElement}
   */
  createSpritesheet(frames, padding = 0) {
    if (!frames.length) throw new Error('No frames provided');
    const fw = frames[0].width;
    const fh = frames[0].height;
    const sheet = createCanvas((fw + padding) * frames.length, fh);
    const ctx = sheet.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    frames.forEach((f, i) => {
      ctx.drawImage(f, i * (fw + padding), 0);
    });
    return sheet;
  }

  /**
   * Add sprite as Phaser texture
   * @param {Phaser.Scene} scene
   * @param {string} key - texture key
   * @param {string} category
   * @param {object} opts
   * @returns {string} texture key
   */
  toPhaserTexture(scene, key, category, opts = {}) {
    const canvas = this.generate(category, opts);
    scene.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Create a Phaser sprite directly
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} category
   * @param {object} opts
   * @returns {Phaser.GameObjects.Sprite}
   */
  toPhaserSprite(scene, x, y, category, opts = {}) {
    const key = `spritegen_${category}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    this.toPhaserTexture(scene, key, category, opts);
    return scene.add.sprite(x, y, key);
  }

  /**
   * Create animated Phaser spritesheet texture
   * @param {Phaser.Scene} scene
   * @param {string} key
   * @param {string} category
   * @param {object} opts - { variant, frames: 4, frameWidth, frameHeight }
   * @returns {string} texture key
   */
  toPhaserAnimSheet(scene, key, category, opts = {}) {
    const frameCanvases = this.generateAnimFrames(category, opts);
    const sheet = this.createSpritesheet(frameCanvases);
    scene.textures.addSpriteSheet(key, sheet, {
      frameWidth: frameCanvases[0].width,
      frameHeight: frameCanvases[0].height,
    });
    // Create animation
    const animKey = `${key}_walk`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(key, { start: 0, end: frameCanvases.length - 1 }),
        frameRate: opts.frameRate || 8,
        repeat: -1,
      });
    }
    return key;
  }

  /**
   * Get list of available categories
   * @returns {string[]}
   */
  categories() {
    return Object.keys(this.specs);
  }

  /**
   * Get variants for a category
   * @param {string} category
   * @returns {string[]}
   */
  variants(category) {
    return this.specs[category]?.variants || [];
  }

  /**
   * Get sprite size for a category
   * @param {string} category
   * @returns {[number, number]}
   */
  size(category) {
    return this.specs[category]?.size || [0, 0];
  }
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════
// ES Module
export { SpriteGen, SPECS, PALETTES };

// UMD / global
if (typeof window !== 'undefined') {
  window.SpriteGen = SpriteGen;
  window.SPECS = SPECS;
  window.PALETTES = PALETTES;
}
