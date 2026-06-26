import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

window.VM = window.VM || {};

const VM = window.VM;

VM.scene = null;
VM.camera = null;
VM.renderer = null;
VM.controls = null;
VM.mainLight = null;
VM.grid = null;
VM.axisHelper = null;
VM.clipPlane = null;
VM.clipEnabled = false;
VM.modelHeight = 100;
VM.animationId = null;

var container;
var loadingEl, loadingText, loadingSub, progressFill, errorEl;

function initDOM() {
  container = document.getElementById('container');
  loadingEl = document.getElementById('loading');
  loadingText = document.getElementById('loading-text');
  loadingSub = document.getElementById('loading-sub');
  progressFill = document.getElementById('progress-fill');
  errorEl = document.getElementById('error');
  
  VM.loadingSub = loadingSub;
  VM.loadingText = loadingText;
}

VM.showLoading = function(text, sub) {
  loadingEl.classList.remove('hidden');
  if (text) loadingText.textContent = text;
  loadingSub.textContent = sub || '';
  progressFill.style.width = '0%';
};

VM.hideLoading = function() {
  loadingEl.classList.add('hidden');
};

VM.updateProgress = function(pct) {
  progressFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
};

VM.showError = function(msg) {
  errorEl.style.display = 'block';
  errorEl.textContent = msg;
};

VM.toggleClass = function(el, className, force) {
  if (force === undefined) {
    if (el.classList.contains(className)) {
      el.classList.remove(className);
    } else {
      el.classList.add(className);
    }
  } else if (force) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
};

VM.init = function() {
  initDOM();

  VM.scene = new THREE.Scene();
  VM.scene.background = new THREE.Color(0xEEEEEE);

  VM.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 5000);
  VM.camera.position.set(10, 10, 10);

  VM.renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
    stencil: false
  });
  VM.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  VM.renderer.setSize(container.clientWidth, container.clientHeight);
  VM.renderer.outputColorSpace = THREE.SRGBColorSpace;
  VM.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  VM.renderer.toneMappingExposure = 1.5;
  VM.renderer.shadowMap.enabled = false;
  VM.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  VM.renderer.localClippingEnabled = true;
  container.appendChild(VM.renderer.domElement);

  VM.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), VM.modelHeight);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x909090, 1.0);
  VM.scene.add(hemi);

  VM.mainLight = new THREE.DirectionalLight(0xedfaff, 1.3);
  VM.mainLight.position.set(50, 80, 50);
  VM.mainLight.castShadow = false;
  VM.mainLight.shadow.mapSize.width = 1024;
  VM.mainLight.shadow.mapSize.height = 1024;
  VM.mainLight.shadow.camera.near = 0.1;
  VM.mainLight.shadow.camera.far = 6000;
  VM.mainLight.shadow.camera.left = -500;
  VM.mainLight.shadow.camera.right = 500;
  VM.mainLight.shadow.camera.top = 500;
  VM.mainLight.shadow.camera.bottom = -500;
  VM.scene.add(VM.mainLight);

  const dir2 = new THREE.DirectionalLight(0xffddaa, 0.6);
  dir2.position.set(-50, 30, -50);
  VM.scene.add(dir2);

  const gridSize = Math.max(VM.modelHeight, 200);
  VM.grid = new THREE.GridHelper(gridSize, gridSize / 5, 0x808080, 0xcccccc);
  VM.grid.position.y = 0;
  VM.grid.material.opacity = 0.5;
  VM.grid.material.transparent = true;
  VM.scene.add(VM.grid);

  const axisSize = Math.max(VM.modelHeight, 200) / 2;
  VM.axisHelper = new THREE.AxesHelper(axisSize);
  VM.axisHelper.position.y = 0.01;
  VM.scene.add(VM.axisHelper);

  VM.controls = new OrbitControls(VM.camera, VM.renderer.domElement);
  VM.controls.enableDamping = true;
  VM.controls.dampingFactor = 0.08;
  VM.controls.screenSpacePanning = true;
  VM.controls.zoomSpeed = 1;

  VM.controls.addEventListener('start', function() {
    if (Math.abs(VM.camera.position.x) < 1 && Math.abs(VM.camera.position.z) < 1 && VM.camera.position.y > 0) {
      if (Math.abs(VM.camera.up.y) < 0.5) {
        VM.camera.up.set(0, 1, 0);
      }
    }
  });

  window.addEventListener('resize', onResize);

  animate();
};

function onResize() {
  VM.updateOrthoCamera(VM.camera);

  VM.camera.aspect = container.clientWidth / container.clientHeight;
  VM.camera.updateProjectionMatrix();
  VM.renderer.setSize(container.clientWidth, container.clientHeight);
}

var lastRenderTime = 0;
var minRenderInterval = 16;

function animate() {
  VM.animationId = requestAnimationFrame(animate);

  var now = performance.now();
  var delta = now - lastRenderTime;

  if (delta >= minRenderInterval) {
    lastRenderTime = now;
    VM.controls.update();
    VM.renderer.render(VM.scene, VM.camera);
  }
}