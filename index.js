/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const RECT_SIZE = 15;
let dx = 1000;

noise.seed(Math.random());

const layers = [
  {
    speed: 0.15,
    freqX: 0.0012,
    amplitude: 0.3,
    baseY: 0.4,
    hue: 250,
    chroma: 0.008,
    lBase: 0.65,
    lRange: 0.05,
  },
  {
    speed: 0.3,
    freqX: 0.002,
    amplitude: 0.28,
    baseY: 0.48,
    hue: 250,
    chroma: 0.006,
    lBase: 0.55,
    lRange: 0.06,
  },
  {
    speed: 0.55,
    freqX: 0.003,
    amplitude: 0.25,
    baseY: 0.55,
    hue: 250,
    chroma: 0.005,
    lBase: 0.45,
    lRange: 0.07,
  },
  {
    speed: 0.8,
    freqX: 0.004,
    amplitude: 0.22,
    baseY: 0.63,
    hue: 250,
    chroma: 0.004,
    lBase: 0.35,
    lRange: 0.07,
  },
  {
    speed: 1.0,
    freqX: 0.005,
    amplitude: 0.18,
    baseY: 0.72,
    hue: 250,
    chroma: 0.003,
    lBase: 0.28,
    lRange: 0.06,
  },
];

for (const layer of layers) {
  layer.freqX *= 1.5;
}

const cloudLayers = [
  {
    speed: 0.08,
    freqX: 0.0015,
    freqY: 0.006,
    threshold: 0.18,
    baseY: 0.05,
    height: 0.18,
    L: 0.92,
    alpha: 0.95,
  },
  {
    speed: 0.14,
    freqX: 0.002,
    freqY: 0.008,
    threshold: 0.15,
    baseY: 0.1,
    height: 0.22,
    L: 0.88,
    alpha: 0.5,
  },
  {
    speed: 0.22,
    freqX: 0.003,
    freqY: 0.01,
    threshold: 0.2,
    baseY: 0.08,
    height: 0.16,
    L: 0.95,
    alpha: 0.3,
  },
];

function drawClouds(delta) {
  for (const cl of cloudLayers) {
    const offset = dx * cl.speed;
    const yStart =
      Math.floor((canvas.height * cl.baseY) / RECT_SIZE) * RECT_SIZE;
    const yEnd = yStart + canvas.height * cl.height;

    for (let x = 0; x < canvas.width; x += RECT_SIZE) {
      for (let y = yStart; y < yEnd; y += RECT_SIZE) {
        const nx = (x + offset) * cl.freqX;
        const ny = y * cl.freqY;
        const val =
          noise.perlin2(nx, ny) + noise.perlin2(nx * 2.2, ny * 2.2) * 0.4;
        if (val > cl.threshold) {
          const intensity = (val - cl.threshold) / (1.0 - cl.threshold);
          const a = cl.alpha * Math.min(intensity * 2.5, 1.0);
          ctx.fillStyle = `oklch(${cl.L} 0.005 250 / ${a})`;
          ctx.fillRect(x, y, RECT_SIZE, RECT_SIZE);
        }
      }
    }
  }
}

function drawMountains(delta) {
  for (const layer of layers) {
    const offset = dx * layer.speed;

    for (let x = 0; x < canvas.width; x += RECT_SIZE) {
      const nx = (x + offset) * layer.freqX;
      let minY =
        noise.perlin2(nx, 0.5) * layer.amplitude * canvas.height +
        noise.perlin2(nx * 2.5, 1.5) * layer.amplitude * canvas.height * 0.3 +
        canvas.height * layer.baseY;
      minY -= minY % RECT_SIZE;

      for (let y = minY; y < canvas.height; y += RECT_SIZE) {
        const depth = (y - minY) / (canvas.height - minY + 1);
        const L = layer.lBase - depth * layer.lRange;
        ctx.fillStyle = `oklch(${L} ${layer.chroma} ${layer.hue})`;
        ctx.fillRect(x, y, RECT_SIZE, RECT_SIZE);
      }
    }
  }
}

function draw(delta) {
  ctx.fillStyle = "oklch(0.75 0.06 250)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawClouds(delta);
  drawMountains(delta);

  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "oklch(0.8 0.1 250)";
  ctx.font = "16px sans-serif";
  ctx.fillText(Math.round(1 / delta), canvas.width - 10, canvas.height - 10);

  dx += delta * 100;
}

function setSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
setSize();
window.addEventListener("resize", setSize);

let lastTime = 0;
function loop(t) {
  const delta = t - lastTime;
  lastTime = t;
  draw(delta / 1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
