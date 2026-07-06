import * as THREE from 'three'

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createStarsParticles, starsUniforms } from './create-stars';
import { degToRad } from 'three/src/math/MathUtils.js';
import { createGalaxy, galaxyUniforms } from './create-galaxy';
import { setupGUI } from './setup-gui';
import { Raycaster, Vector2, Vector3 } from 'three';
import { cameraRaycastMultiple, cameraRaycastSingle } from './raycast';
import gsap from 'gsap';

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

  let pointerPos = new Vector2(-200, -200);
  const raycaster = new Raycaster();

  let rect = renderer.domElement.getBoundingClientRect();

  const pointerMoveRef = (event: PointerEvent) => {
    event.preventDefault();

    rect = renderer.domElement.getBoundingClientRect();
    pointerPos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerPos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  sceneHtmlCanvas.addEventListener('pointermove', pointerMoveRef, { passive: false })


  //SECTION - TL ANIMATION
  const tl = gsap.timeline({ paused: true });
  tl.to(starsUniforms.u_posPerc, {
    value: 1,
    ease: 'circ.inOut',
    duration: 3,
    onUpdate: () => {

    }
  }, 0).to(galaxyUniforms.u_posPerc, {
    value: 1,
    ease: 'circ.inOut',
    duration: 4
  }, 0);
  let start = false;
  const minSpeed = 0.025;
  const maxSpeed = 4.0;
  //!SECTION - TL ANIMATION

  //vectors used to target 
  const hitCurrentGl = new Vector3(0, -50, 0);
  const hitTargetGl = new Vector3(0, -50, 0);

  const hitCurrentSt = new Vector3(0, -50, 0);
  const hitTargetSt = new Vector3(0, -50, 0);

  //RENDERING
  const runLogic = (_deltaTime: number) => {
    const timeElapsed = timer.getElapsed();

    if (!start) {
      tl.play();
      start = true;
    } else if (tl.progress() < 1) {
      tl.time(tl.time() + _deltaTime);
    }

    //lerping the speed using the animation progress
    const speed = maxSpeed + (minSpeed - maxSpeed) * tl.progress();
    starsUniforms.u_time.value = timeElapsed;
    starsParticles.rotateY(-degToRad(speed));

    if (pointerPos) {
      let hit = cameraRaycastMultiple(camera, pointerPos, raycaster, [starsParticles, obj])
      for (let i = 0; i < hit.length; i++) {
        const h = hit[i];
        if (h.object == obj) {
          hitTargetGl.set(h.point.x, h.point.y, h.point.z);
        }
        if (h.object == starsParticles) {
          hitTargetSt.set(h.point.x, h.point.y, h.point.z);
        }
      }

      hitCurrentSt.lerp(hitTargetSt, 0.075);
      hitCurrentGl.lerp(hitTargetGl, 0.075);

      starsUniforms.u_hitPos.value.copy(hitCurrentSt);
      galaxyUniforms.u_hitPos.value.copy(hitCurrentGl);
    }

    /////////////////////////////////////////
    galaxyUniforms.u_time.value = timeElapsed;
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
