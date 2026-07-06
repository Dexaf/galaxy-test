import * as THREE from 'three'

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createStarsParticles, starsUniforms } from './create-stars';
import { degToRad } from 'three/src/math/MathUtils.js';
import { createGalaxy, galaxyUniforms } from './create-galaxy';
import { setupGUI } from './setup-gui';
import { Raycaster, Vector2, Vector3 } from 'three';
import { cameraRaycastSingle } from './raycast';

export const DEGREE_180 = Math.PI;
export const DEGREE_90 = DEGREE_180 / 2;

//SCENE HTML CANVAS
const sceneHtmlCanvas = document.getElementById("three-scene-canvas") as HTMLCanvasElement;

if (sceneHtmlCanvas) {
  //SCENE
  const scene = new THREE.Scene();

  //CAMERA
  const wrapperAspectRatio = sceneHtmlCanvas.clientWidth / sceneHtmlCanvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(
    30,                 // FOV - FIELD OF VIEW
    wrapperAspectRatio  // ASPECT RATIO
  );
  camera.far = 100;
  camera.position.set(0, 10, -10);
  scene.add(camera);

  //MESH 
  const obj = createGalaxy();
  obj.rotateX(-DEGREE_90);
  obj.renderOrder = 1;
  scene.add(obj);

  //STARS
  let starsParticles = createStarsParticles();
  starsParticles.renderOrder = 2;
  scene.add(starsParticles);

  //CONTROLS
  const controls = new OrbitControls(camera, sceneHtmlCanvas)
  controls.enableDamping = true;

  //RENDERER
  const renderer = new THREE.WebGLRenderer({
    canvas: sceneHtmlCanvas,
    antialias: true
  })
  renderer.setSize(sceneHtmlCanvas.clientWidth, sceneHtmlCanvas.clientHeight);
  //render e' come se facesse uno screenshot della scena 3D attiva
  renderer.render(scene, camera);
  renderer.setClearColor("#35155a");
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  //RESIZING CANVAS AND CAMERA
  window.addEventListener('resize', () => {
    camera.aspect = sceneHtmlCanvas.clientWidth / sceneHtmlCanvas.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(sceneHtmlCanvas.clientWidth, sceneHtmlCanvas.clientHeight);
  })

  //vectors used to target 
  const hitCurrent = new Vector3(0, -50, 0);
  const hitTarget = new Vector3(0, -50, 0);
  let pointerPos = new Vector2(0, 0);
  const raycaster = new Raycaster();

  let rect = renderer.domElement.getBoundingClientRect();

  const pointerMoveRef = (event: PointerEvent) => {
    event.preventDefault();

    rect = renderer.domElement.getBoundingClientRect();
    pointerPos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerPos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  sceneHtmlCanvas.addEventListener('pointermove', pointerMoveRef, { passive: false })

  //RENDERING
  const runLogic = (_: number) => {

    if (pointerPos) {
      const hit = cameraRaycastSingle(camera, pointerPos, raycaster, starsParticles)
      if (hit && hit[0])
        hitTarget.set(hit[0].point.x, hit[0].point.y, hit[0].point.z);

      hitCurrent.lerp(hitTarget, 0.075);

      starsUniforms.u_hitPos.value.copy(hitCurrent);
    }

    /////////////////////////////////////////
    const timeElapsed = timer.getElapsed();
    galaxyUniforms.u_time.value = timeElapsed;

    starsUniforms.u_time.value = timeElapsed;
    starsParticles.rotateY(degToRad(-0.025));
  }

  function rebuildStars() {

    scene.remove(starsParticles);

    starsParticles.geometry.dispose();

    const material = starsParticles.material;

    if (Array.isArray(material)) {
      material.forEach(m => m.dispose());
    } else {
      material.dispose();
    }

    starsParticles = createStarsParticles();
    starsParticles.renderOrder = 2;

    scene.add(starsParticles);

  }

  setupGUI({
    rebuildStars
  });

  //NOTE: function to handle animations
  const runAnimations = (_: number) => {
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));

  const timer = new THREE.Timer();
  const stats = new Stats()
  stats.showPanel(2);
  document.body.appendChild(stats.dom)
  const animate = () => {
    stats.begin()

    timer.update();
    controls.update();

    const deltaTime = timer.getDelta();

    runLogic(deltaTime);
    runAnimations(deltaTime);

    renderer.render(scene, camera);

    stats.end()

    requestAnimationFrame(animate);
  }

  animate();

  //UTILS
  let isFullscreenOn = false;
  const toggleFullScreen = () => {
    if (isFullscreenOn)
      sceneHtmlCanvas.requestFullscreen();
    else
      document.exitFullscreen();

    isFullscreenOn = !isFullscreenOn;
  }
  sceneHtmlCanvas.addEventListener('dblclick', toggleFullScreen);
} else {
  alert("MANCA IL WRAPPER PER LA SCENA");
}
