import * as THREE from "three";
import * as YUKA from "yuka";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {
  YELLOWVEHICLESPATHS,
  BLUEVEHICLESPATHS,
  REDVEHICLESPATHS,
} from "./constants";

const entityManager = new YUKA.EntityManager();
const progressBar = document.getElementById("progress-bar");
const progressBarContainer = document.querySelector(".progress-bar-container");
const loadingManager = new THREE.LoadingManager();

const startButton = document.querySelector(".header button");
const title = document.querySelector(".header h1");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x94d8fb);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const ambientLight = new THREE.AmbientLight(0xe1e1e1, 0.3);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x94d8fb, 0x9cff2e, 0.3);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
scene.add(directionalLight);

renderer.outputColorSpace = THREE.SRGBColorSpace;

loadingManager.onProgress = (url, loaded, total) => {
  progressBar.value = (loaded / total) * 100;
};

loadingManager.onLoad = () => {
  progressBarContainer.style.display = "none";
};

const loader = new GLTFLoader(loadingManager);
const dLoader = new DRACOLoader();
dLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);
dLoader.setDecoderConfig({ type: "js" });
loader.setDRACOLoader(dLoader);

loader.load("./assets/terrain.glb", (glb) => {
  const model = glb.scene;
  scene.add(model);
});

// Camera positioning
camera.position.set(3, 10, 218);
camera.lookAt(scene.position);

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

function createCarV(model, path, entityManager, yRotation) {
  const group = new THREE.Group();
  scene.add(group);
  group.matrixAutoUpdate = false;

  const car = SkeletonUtils.clone(model);
  group.add(car);

  const v = new YUKA.Vehicle();
  v.setRenderComponent(group, sync);

  entityManager.add(v);

  const followPathBehavior = new YUKA.FollowPathBehavior(path, 2);
  const onPathBehavior = new YUKA.OnPathBehavior(path);
  onPathBehavior.radius - 0.1;

  v.position.copy(path.current());
  v.maxSpeed = 5;
  v.steering.add(onPathBehavior);
  v.steering.add(followPathBehavior);

  followPathBehavior.active = false;

  v.rotation.fromEuler(0, yRotation, 0);

  const vehicleAll = {
    vehicle: v,
    modelGroup: car,
  };

  return vehicleAll;
}

loader.load("./assets/SUV.glb", (glb) => {
  const model = glb.scene;
  const v1 = createCarV(model, YELLOWVEHICLESPATHS[0], entityManager, Math.PI);
  const v2 = createCarV(model, YELLOWVEHICLESPATHS[1], entityManager, Math.PI);
  const v3 = createCarV(
    model,
    YELLOWVEHICLESPATHS[2],
    entityManager,
    Math.PI / 2
  );
  const v4 = createCarV(model, YELLOWVEHICLESPATHS[3], entityManager, Math.PI);
  const v5 = createCarV(
    model,
    YELLOWVEHICLESPATHS[4],
    entityManager,
    -Math.PI / 2
  );
  const v6 = createCarV(model, YELLOWVEHICLESPATHS[5], entityManager, Math.PI);
  const v7 = createCarV(
    model,
    YELLOWVEHICLESPATHS[6],
    entityManager,
    -Math.PI / 2
  );
});

loader.load("./assets/red.glb", (glb) => {
  const model = glb.scene;
  const v1 = createCarV(model, REDVEHICLESPATHS[0], entityManager, 0);
  const v2 = createCarV(model, REDVEHICLESPATHS[1], entityManager, 0);
  const v3 = createCarV(
    model,
    REDVEHICLESPATHS[2],
    entityManager,
    -Math.PI / 2
  );
  const v4 = createCarV(model, REDVEHICLESPATHS[3], entityManager, 0);
  const v5 = createCarV(model, REDVEHICLESPATHS[4], entityManager, Math.PI / 2);
  const v6 = createCarV(model, REDVEHICLESPATHS[5], entityManager, 0);
  const v7 = createCarV(model, REDVEHICLESPATHS[6], entityManager, Math.PI / 2);
});
loader.load("./assets/blue.glb", (glb) => {
  const model = glb.scene;
  const v1 = createCarV(
    model,
    BLUEVEHICLESPATHS[0],
    entityManager,
    Math.PI / 2
  );
  const v2 = createCarV(
    model,
    BLUEVEHICLESPATHS[1],
    entityManager,
    Math.PI / 2
  );
  const v3 = createCarV(model, BLUEVEHICLESPATHS[2], entityManager, 0);
  const v4 = createCarV(
    model,
    BLUEVEHICLESPATHS[3],
    entityManager,
    Math.PI / 2
  );
  const v7 = createCarV(model, BLUEVEHICLESPATHS[4], entityManager, Math.PI);
});

startButton.addEventListener("mousedown", () => {
  const tl = gsap.timeline();

  tl.to(startButton, {
    autoAlpha: 0,
    y: "-=20",
    duration: 0.5,
  })
    .to(
      title,
      {
        autoAlpha: 0,
        y: "-=20",
        duration: 1,
      },
      0
    )
    .to(camera.position, {
      z: 144,
      duration: 4,
    })
    .to(
      camera.rotation,
      {
        x: -0.4,
        duration: 4,
      },
      0
    );
});

const time = new YUKA.Time();

function animate() {
  const delta = time.update().getDelta();
  entityManager.update(delta);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
