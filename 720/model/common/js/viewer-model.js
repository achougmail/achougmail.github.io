import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';

window.VM = window.VM || {};

const VM = window.VM;

VM.currentModel = null;
VM.edgeLines = [];

VM.clearCurrentModel = function() {
  if (!VM.currentModel) return;

  VM.scene.remove(VM.currentModel);
  VM.currentModel.traverse(function(obj) {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(function(m) { if (m) m.dispose(); });
    }
  });

  VM.edgeLines.forEach(function(line) {
    if (line.geometry) line.geometry.dispose();
    if (line.material) line.material.dispose();
  });
  VM.edgeLines.length = 0;

  VM.currentModel = null;
};

VM.frameAndCenter = function(object) {
  var box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  var size = box.getSize(new THREE.Vector3());
  var center = box.getCenter(new THREE.Vector3());

  object.position.x = -center.x;
  object.position.y = -box.min.y;
  object.position.z = -center.z;

  var maxDim = Math.max(size.x, size.y, size.z);
  var fov = VM.camera.fov * (Math.PI / 180);
  var distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 0.5;

  VM.camera.position.set(distance, distance * 0.7, distance);
  VM.camera.near = maxDim / 1000;
  VM.camera.far = maxDim * 100;
  VM.camera.updateProjectionMatrix();

  VM.controls.target.set(0, size.y / 2, 0);
  VM.controls.maxDistance = maxDim * 2.0;
  VM.controls.minDistance = distance / 5;
  VM.controls.maxPolarAngle = Math.PI / 2;
  VM.controls.update();

  VM.modelHeight = size.y;

  VM.updateGridAndAxis();

  const clipSlider = document.getElementById('clipSlider');
  if (clipSlider) {
    clipSlider.min = 0;
    clipSlider.max = 100;
    clipSlider.value = 0;
    clipSlider.style.setProperty('--val', '0%');
    VM.clipPlane.constant = VM.modelHeight;
  }

  window.viewDistance = distance;
};

VM.updateOrthoCamera = function(camera) {
  if (!camera.isOrthographicCamera || !VM.currentModel) return;
  var box = new THREE.Box3().setFromObject(VM.currentModel);
  if (box.isEmpty()) return;
  var size = box.getSize(new THREE.Vector3());
  var maxDim = Math.max(size.x, size.y, size.z);
  var aspect = window.innerWidth / window.innerHeight;
  var zoom = 0.8;
  camera.left = -maxDim * aspect * zoom;
  camera.right = maxDim * aspect * zoom;
  camera.top = maxDim * zoom;
  camera.bottom = -maxDim * zoom;
  camera.updateProjectionMatrix();
};

VM.updateGridAndAxis = function() {
  if (!VM.grid || !VM.axisHelper) return;

  const size = Math.max(VM.modelHeight, 200);

  VM.scene.remove(VM.grid);
  VM.grid.geometry.dispose();
  VM.grid.material.dispose();
  VM.grid = new THREE.GridHelper(size, size / 5, 0x808080, 0xcccccc);
  VM.grid.position.y = 0;
  VM.grid.material.opacity = 0.5;
  VM.grid.material.transparent = true;
  VM.grid.visible = document.getElementById('gridToggle')?.checked !== false;
  VM.scene.add(VM.grid);

  VM.scene.remove(VM.axisHelper);
  VM.axisHelper.geometry.dispose();
  VM.axisHelper.material.dispose();
  VM.axisHelper = new THREE.AxesHelper(size / 2);
  VM.axisHelper.position.y = 0.01;
  VM.axisHelper.visible = document.getElementById('axisToggle')?.checked !== false;
  VM.scene.add(VM.axisHelper);
};

VM.calculateDistance = function() {
  if (!VM.currentModel) return window.viewDistance || 10;
  var box = new THREE.Box3().setFromObject(VM.currentModel);
  if (box.isEmpty()) return window.viewDistance || 10;
  var size = box.getSize(new THREE.Vector3());
  var maxDim = Math.max(size.x, size.y, size.z);

  if (VM.camera.isOrthographicCamera) {
    return maxDim * 2;
  }

  var fov = VM.camera.fov * (Math.PI / 180);
  var aspect = window.innerWidth / window.innerHeight;
  var distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 0.5;

  if (aspect > 1.5) {
    distance *= 1;
  } else if (aspect < 1) {
    distance *= 3.0;
  }

  return distance;
};

VM.setTopView = function() {
  VM.updateOrthoCamera(VM.camera);
  var distance = VM.calculateDistance();
  VM.camera.position.set(0, distance, 0);
  VM.camera.up.set(0, 0, -1);
  VM.controls.target.set(0, VM.modelHeight / 2, 0);
  VM.controls.update();
};

VM.setIsoView = function() {
  VM.updateOrthoCamera(VM.camera);
  var distance = VM.calculateDistance();
  VM.camera.position.set(distance, distance * 0.7, distance);
  VM.camera.up.set(0, 1, 0);
  VM.controls.target.set(0, VM.modelHeight / 2, 0);
  VM.controls.update();
};

VM.setFrontView = function() {
  VM.updateOrthoCamera(VM.camera);
  var distance = VM.calculateDistance();
  VM.camera.position.set(0, distance * 0.7, distance);
  VM.camera.up.set(0, 1, 0);
  VM.controls.target.set(0, VM.modelHeight / 2, 0);
  VM.controls.update();
};

function onProgress(xhr) {
  if (xhr.lengthComputable) {
    var pct = (xhr.loaded / xhr.total) * 100;
    VM.updateProgress(pct);
    VM.loadingSub.textContent = (xhr.loaded / 1024 / 1024).toFixed(2) + ' MB / ' + (xhr.total / 1024 / 1024).toFixed(2) + ' MB (' + pct.toFixed(0) + '%)';
  } else {
    VM.loadingSub.textContent = (xhr.loaded / 1024 / 1024).toFixed(2) + ' MB 已加载';
  }
}

function detectFormat(url) {
  var u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.glb') || u.endsWith('.gltf')) return 'glb';
  if (u.endsWith('.obj')) return 'obj';
  if (u.endsWith('.ply')) return 'ply';
  return 'glb';
}

VM.enableClip = function(object) {
  object.traverse(function(child) {
    if (child.isMesh && child.material) {
      var materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(function(m) {
        m.clippingPlanes = VM.clipEnabled ? [VM.clipPlane] : [];
      });
    }
  });
};

function addEdges(object) {
  VM.edgeLines.length = 0;
  object.traverse(function(child) {
    if (child.isMesh) {
      var edges = new THREE.EdgesGeometry(child.geometry, 15);
      var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 }));
      child.add(line);
      VM.edgeLines.push(line);
    }
  });
}

function makeMatte(object) {
  object.traverse(function(child) {
    if (child.isMesh && child.material) {
      var materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(function(m) {
        if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
          m.roughness = 0.95;
          m.metalness = 0;
        }
      });
    }
  });
}

function enableShadow(object) {
  object.traverse(function(child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

VM.loadFromURL = function(url, fallbackName) {
  VM.clearCurrentModel();
  var errorEl = document.getElementById('error');
  errorEl.style.display = 'none';
  VM.showLoading('加载中，请稍候…', fallbackName || url);

  var format = detectFormat(url);

  function onLoadModel(object) {
    VM.currentModel = object;
    makeMatte(object);
    enableShadow(object);
    VM.enableClip(object);
    addEdges(object);
    VM.scene.add(object);
    VM.frameAndCenter(object);

    var toolbarEl = document.getElementById('toolbar');
    if (toolbarEl) toolbarEl.style.display = 'none';

    VM.hideLoading();

    var edgeToggleBar = document.getElementById('edgeToggleBar');
    var edgeToggle = document.getElementById('edgeToggle');
    if (edgeToggleBar && edgeToggle) {
      VM.toggleClass(edgeToggleBar, 'active', edgeToggle.checked);
    }
  }

  function onError(err) {
    console.error(err);
    VM.hideLoading();
    VM.showError('模型加载失败：' + (err && err.message ? err.message : '请检查文件路径或格式。'));
  }

  try {
    if (format === 'glb') {
      const loader = new GLTFLoader();
      loader.load(url, (gltf) => onLoadModel(gltf.scene || gltf.scenes[0]), onProgress, onError);
    } else if (format === 'obj') {
      const loader = new OBJLoader();
      loader.load(url, (obj) => {
        obj.traverse(child => {
          if (child.isMesh && !child.material) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.95, metalness: 0 });
          }
        });
        onLoadModel(obj);
      }, onProgress, onError);
    } else if (format === 'ply') {
      const loader = new PLYLoader();
      loader.load(url, (geometry) => {
        geometry.computeVertexNormals();
        const hasColor = !!geometry.getAttribute('color');
        const material = new THREE.MeshStandardMaterial({
          color: hasColor ? 0xffffff : 0xcccccc,
          vertexColors: hasColor,
          roughness: 0.95,
          metalness: 0,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        onLoadModel(mesh);
      }, onProgress, onError);
    }
  } catch (e) {
    onError(e);
  }
};

VM.loadFromFile = function(file) {
  if (!file) return;
  var url = URL.createObjectURL(file);
  var fakeUrl = url + '#' + file.name;
  VM.loadFromURL(fakeUrl, file.name);
};