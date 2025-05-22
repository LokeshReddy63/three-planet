import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  8,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.set(0, 100, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.minDistance = 3;
controls.maxDistance = 20;

// Load HDR background
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader().load("/static/space.hdr", (hdrTexture) => {
  const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

  scene.background = envMap;
  scene.environment = envMap;

  hdrTexture.dispose();
  pmremGenerator.dispose();
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x222222, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffeeee, 2.1);
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
scene.add(directionalLightHelper);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;
scene.add(directionalLight);

// Planet textures
const loader = new THREE.TextureLoader();
const colorMap = loader.load("/static/mars_color.jpg");
const bumpMap = loader.load("/static/mars_bump.jpg");
const normalMap = loader.load("/static/mars_normal.jpg");

const planetGeometry = new THREE.SphereGeometry(2, 128, 128);
const planetMaterial = new THREE.MeshLambertMaterial({
  map: colorMap,
  bumpMap: bumpMap,
  bumpScale: 30,
  // normalMap: normalMap,
  metalness: 2.0,
  roughness: 1.0,
  emissive: 0x000000,
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.castShadow = false;
planet.receiveShadow = true;
planet.position.y = -1.7;
scene.add(planet);

// Asteroids
const asteroidGeometry = new THREE.IcosahedronGeometry(0.022, 0);
for (let i = 0; i < asteroidGeometry.attributes.position.count; i++) {
  const offset = (Math.random() - 0.5) * 0.05;
  asteroidGeometry.attributes.position.setXYZ(
    i,
    asteroidGeometry.attributes.position.getX(i) + offset,
    asteroidGeometry.attributes.position.getY(i) + offset,
    asteroidGeometry.attributes.position.getZ(i) + offset
  );
}
asteroidGeometry.attributes.position.needsUpdate = true;
asteroidGeometry.computeVertexNormals();

const asteroidMaterial = new THREE.MeshStandardMaterial({
  color: 0x888888,
  roughness: 0.8,
  metalness: 0.1,
  emissive: 8,
});

const asteroids = [];
const ASTEROID_COUNT = 500;

for (let i = 0; i < ASTEROID_COUNT; i++) {
  const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
  asteroid.castShadow = true;
  asteroid.receiveShadow = true;

  asteroid.userData = {
    angle: Math.random() * Math.PI * 2,
    radius: 2.7 + Math.random() * 0.2,
    speed: 0.002 + Math.random() * 0.008,
    yOffset: (Math.random() - 0.5) * 1.2,
  };

  asteroid.position.set(
    asteroid.userData.yOffset,
    -1.7 + Math.cos(asteroid.userData.angle) * asteroid.userData.radius,
    Math.sin(asteroid.userData.angle) * asteroid.userData.radius
  );

  scene.add(asteroid);
  asteroids.push(asteroid);
}

function animate() {
  requestAnimationFrame(animate);

  planet.rotation.y += 0.001;
  planet.rotation.z += 0.001;

  for (const asteroid of asteroids) {
    asteroid.userData.angle += asteroid.userData.speed;

    asteroid.position.y =
      -1.7 + Math.cos(asteroid.userData.angle) * asteroid.userData.radius;
    asteroid.position.x =
      Math.sin(asteroid.userData.angle) * asteroid.userData.radius;
    asteroid.position.z =
      asteroid.userData.yOffset +
      Math.sin(asteroid.userData.angle * 7) * Math.random() * 0.005;

    asteroid.rotation.x += 0.04 * Math.random();
    asteroid.rotation.y += 0.04 * Math.random();
    asteroid.rotation.z += 0.04 * Math.random();
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
