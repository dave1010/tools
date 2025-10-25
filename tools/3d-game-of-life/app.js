document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

const container = document.body;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04110a);

const gridSize = 64;
const cellSize = 1;
const spacing = 1.1;
const maxHeight = 2.0;
const transitionSpeed = 0.05;

const aliveColor = new THREE.Color(0x00ff88);
const deadColor = new THREE.Color(0x001a0d);
const ambientColor = new THREE.Color(0x1f2937);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.display = 'block';
canvas.style.touchAction = 'none';
container.appendChild(canvas);

const resizeRenderer = () => {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

resizeRenderer();

window.addEventListener('resize', resizeRenderer);

const ambientLight = new THREE.AmbientLight(ambientColor, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(5, 8, 5);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xff0055, 0.8);
directionalLight2.position.set(-5, 15, 5);
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0x3355ff, 0.6);
directionalLight3.position.set(-5, 4, -5);
scene.add(directionalLight3);

const cellMeshes = [];
const cells = [];
const gridOffset = ((gridSize - 1) * spacing) / 2;

class Cell {
  constructor(x, z) {
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
    const material = new THREE.MeshPhongMaterial({
      color: deadColor.clone(),
      specular: 0x444444,
      shininess: 30,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x * spacing - gridOffset, 0, z * spacing - gridOffset);
    this.mesh.scale.y = 0.12;
    this.mesh.position.y = this.mesh.scale.y / 2;
    this.mesh.userData = { x, z };

    this.targetHeight = 0.12;
    this.alive = false;

    scene.add(this.mesh);
    cellMeshes.push(this.mesh);
  }

  setAlive(alive) {
    this.alive = alive;
    this.targetHeight = alive ? maxHeight : 0.12;
  }

  update() {
    const currentHeight = this.mesh.scale.y;
    const heightDiff = this.targetHeight - currentHeight;
    this.mesh.scale.y += heightDiff * transitionSpeed;
    this.mesh.position.y = this.mesh.scale.y / 2;

    const targetColor = this.alive ? aliveColor : deadColor;
    this.mesh.material.color.lerp(targetColor, 0.1);
  }
}

for (let x = 0; x < gridSize; x += 1) {
  cells[x] = [];
  for (let z = 0; z < gridSize; z += 1) {
    const cell = new Cell(x, z);
    cells[x][z] = cell;

    if (Math.random() < 0.3) {
      cell.setAlive(true);
    }
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const countNeighbors = (x, z) => {
  let count = 0;
  for (let i = -1; i <= 1; i += 1) {
    for (let j = -1; j <= 1; j += 1) {
      if (i === 0 && j === 0) continue;
      const newX = (x + i + gridSize) % gridSize;
      const newZ = (z + j + gridSize) % gridSize;
      if (cells[newX][newZ].alive) count += 1;
    }
  }
  return count;
};

const updateGrid = () => {
  const newStates = [];
  for (let x = 0; x < gridSize; x += 1) {
    newStates[x] = [];
    for (let z = 0; z < gridSize; z += 1) {
      const neighbors = countNeighbors(x, z);
      const cell = cells[x][z];
      if (cell.alive) {
        newStates[x][z] = neighbors === 2 || neighbors === 3;
      } else {
        newStates[x][z] = neighbors === 3;
      }
    }
  }

  for (let x = 0; x < gridSize; x += 1) {
    for (let z = 0; z < gridSize; z += 1) {
      cells[x][z].setAlive(newStates[x][z]);
    }
  }
};

const normalizePointer = (clientX, clientY) => {
  const rect = canvas.getBoundingClientRect();
  if (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  ) {
    return null;
  }
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  return pointer;
};

const activateCellAt = (clientX, clientY) => {
  const normalizedPointer = normalizePointer(clientX, clientY);
  if (!normalizedPointer) return;

  raycaster.setFromCamera(normalizedPointer, camera);
  const intersects = raycaster.intersectObjects(cellMeshes, false);
  if (!intersects.length) return;

  const { x, z } = intersects[0].object.userData;
  if (x == null || z == null) return;

  cells[x][z].setAlive(true);
  isCameraMoving = false;
};

let isCameraMoving = true;
let isDrawing = false;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const pointerDown = (event) => {
  isDrawing = true;
  if (!event.touches) {
    event.preventDefault();
  }
  const point = event.touches ? event.touches[0] : event;
  activateCellAt(point.clientX, point.clientY);
};

const pointerMove = (event) => {
  if (!isDrawing && !isTouchDevice) return;
  if (!event.touches) {
    event.preventDefault();
  }
  const point = event.touches ? event.touches[0] : event;
  activateCellAt(point.clientX, point.clientY);
};

const pointerUp = () => {
  isDrawing = false;
};

canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseleave', pointerUp);
window.addEventListener('mouseup', pointerUp);
window.addEventListener('blur', pointerUp);

canvas.addEventListener(
  'touchstart',
  (event) => {
    event.preventDefault();
    pointerDown(event);
  },
  { passive: false }
);
canvas.addEventListener(
  'touchmove',
  (event) => {
    event.preventDefault();
    pointerMove(event);
  },
  { passive: false }
);
window.addEventListener('touchend', pointerUp);
window.addEventListener('touchcancel', pointerUp);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    isCameraMoving = !isCameraMoving;
  }
});

let lastUpdate = 0;
let previousTimestamp = 0;
let movingTime = 0;
const updateInterval = 300;

const baseCameraRadius = gridSize * spacing * 0.35;
const baseCameraHeight = gridSize * spacing * 0.25;

camera.position.set(baseCameraRadius, baseCameraHeight, baseCameraRadius);
camera.lookAt(0, 0, 0);

const animate = (timestamp) => {
  if (!previousTimestamp) {
    previousTimestamp = timestamp;
  }

  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  if (timestamp - lastUpdate >= updateInterval) {
    updateGrid();
    lastUpdate = timestamp;
  }

  for (let x = 0; x < gridSize; x += 1) {
    for (let z = 0; z < gridSize; z += 1) {
      cells[x][z].update();
    }
  }

  if (isCameraMoving) {
    movingTime += delta;
    const rotationSpeed = 0.00015;
    const radius = (Math.cos(movingTime * 0.00025) * 0.35 + 1.2) * baseCameraRadius;
    camera.position.x = Math.cos(movingTime * rotationSpeed) * radius;
    camera.position.z = Math.sin(movingTime * rotationSpeed * 1.15) * radius;
  }

  camera.position.y = baseCameraHeight;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

requestAnimationFrame(animate);
