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

let clicked = false;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const explanation = document.querySelector(".explanation");
const nextQuestionBtn = document.querySelector(".explanation button");
const question = document.querySelector(".questions p");

const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");

const option1Symbol = document.getElementById("a1-symbol");
const option2Symbol = document.getElementById("a2-symbol");
const option3Symbol = document.getElementById("a3-symbol");

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
    )
    .to(
      question,
      {
        autoAlpha: 1,
        duration: 0.2,
      },
      "+=0.7"
    )
    .to(
      option1,
      {
        rotateX: 0,
        duration: 0.2,
      },
      "+=2.4"
    )
    .to(
      option2,
      {
        rotateX: 0,
        duration: 0.2,
      },
      "+=2.5"
    )
    .to(
      option3,
      {
        rotateX: 0,
        duration: 0.2,
      },
      "+=2.5"
    );
});

loader.load("./assets/arrow.glb", (glb) => {
  const model = glb.scene;

  function createArrow(position, yRotation = 0) {
    const arrow = SkeletonUtils.clone(model);
    arrow.position.copy(position);
    arrow.rotation.y = yRotation;
    scene.add(arrow);
  }

  createArrow(new THREE.Vector3(5.91, 2, 125.92), Math.PI);
  createArrow(new THREE.Vector3(6.21, 2, 30.19), 0.5 * Math.PI);
  createArrow(new THREE.Vector3(93.03, 2, 24.5), Math.PI);
  createArrow(new THREE.Vector3(102.5, 2, -66), -0.5 * Math.PI);
  createArrow(new THREE.Vector3(11.86, 2, -75.86), Math.PI);
  createArrow(new THREE.Vector3(5.97, 2, -161.04), -0.5 * Math.PI);
  createArrow(new THREE.Vector3(-82.82, 2, -171.17), -Math.PI / 2);

  //Arrows for red cars
  createArrow(new THREE.Vector3(1.38, 2, 109.32), 0.5 * Math.PI);
  createArrow(new THREE.Vector3(1.13, 2, 14.01), 0.5 * Math.PI);
  createArrow(new THREE.Vector3(107.5, 2, 20.33), Math.PI);
  createArrow(new THREE.Vector3(97.45, 2, -81.35));
  createArrow(new THREE.Vector3(-3.55, 2, -71.24), Math.PI);
  createArrow(new THREE.Vector3(1.45, 2, -175.84), -0.5 * Math.PI);
  createArrow(new THREE.Vector3(-98.74, 2, -166.74), Math.PI / 2);

  //Arrows for blue cars
  createArrow(new THREE.Vector3(-3.55, 2, 119.5), 0.5 * Math.PI);
  createArrow(new THREE.Vector3(-4.08, 2, 24.64), 0.5 * Math.PI);
  createArrow(new THREE.Vector3(98.08, 2, 14.95));
  createArrow(new THREE.Vector3(93.599, 2, -70.83), Math.PI);
  createArrow(new THREE.Vector3(-88.88, 2, -160.78), Math.PI);
});

function showAnswerSymbol(opt1, opt2, opt3) {
  option1Symbol.style.backgroundImage = `url('./assets/symbols/${opt1}.png')`;
  option2Symbol.style.backgroundImage = `url('./assets/symbols/${opt2}.png')`;
  option3Symbol.style.backgroundImage = `url('./assets/symbols/${opt3}.png')`;
}

function chooseAnswer(option) {
  if (!clicked) {
    showAnswerSymbol("correct", "incorrect", "incorrect");
    option.style.backgroundColor = "white";
    option.style.color = "black";

    gsap.to(explanation, {
      autoAlpha: 1,
      y: "-=10",
      duration: 0.5,
    });
    clicked = true;
  }
}

option1.addEventListener("click", chooseAnswer.bind(null, option1));
option2.addEventListener("click", chooseAnswer.bind(null, option2));
option3.addEventListener("click", chooseAnswer.bind(null, option3));

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
